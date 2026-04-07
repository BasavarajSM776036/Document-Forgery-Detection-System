import difflib
import os
import re
import tempfile
from pathlib import Path
from typing import List, Optional, Tuple

from flask import Flask, jsonify, request
from pdfminer.high_level import extract_text as extract_pdf_text
from PIL import Image
import pytesseract
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

TEXT_EXTENSIONS = {
    ".txt",
    ".md",
    ".rtf",
    ".csv",
    ".json",
}
IMAGE_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".bmp",
    ".tiff",
    ".tif",
    ".gif",
}
MAX_LINE_RESULTS = 120


def save_temp_file(file_storage) -> str:
    suffix = Path(file_storage.filename or "document").suffix or ".tmp"
    fd, temp_path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    file_storage.save(temp_path)
    return temp_path


def extract_text_from_path(path: str) -> str:
    ext = Path(path).suffix.lower()
    try:
        if ext in TEXT_EXTENSIONS:
            with open(path, "r", encoding="utf-8", errors="ignore") as handle:
                return handle.read()
        if ext == ".pdf":
            return extract_pdf_text(path) or ""
        if ext in IMAGE_EXTENSIONS:
            image = Image.open(path)
            try:
                return pytesseract.image_to_string(image, lang="eng")
            finally:
                image.close()
    except Exception as exc:
        print(f"[text-extract] failed for {path}: {exc}")

    # Fallback: try UTF-8 decode
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as handle:
            return handle.read()
    except Exception:
        return ""


def is_meaningful_text(text: str) -> bool:
    """Filter out binary data, OCR noise, and meaningless strings."""
    if not text or len(text.strip()) < 3:
        return False
    
    
    printable_ratio = sum(1 for c in text if c.isprintable() or c.isspace()) / len(text)
    if printable_ratio < 0.7:
        return False
    
 
    special_char_ratio = sum(1 for c in text if not (c.isalnum() or c.isspace() or c in ".,!?;:-'\"()[]{}")) / len(text)
    if special_char_ratio > 0.6:
        return False
    
   
    control_chars = sum(1 for c in text if ord(c) < 32 and c not in "\n\r\t")
    if control_chars > len(text) * 0.1:
        return False
    
   
    if not any(c.isalpha() for c in text):
        return False
    
    return True


def normalize_lines(text: str) -> List[str]:
    cleaned = re.sub(r"\r\n?", "\n", text or "")
    lines: List[str] = []
    for raw in cleaned.split("\n"):
        normalized = re.sub(r"\s+", " ", raw).strip()
     
        if normalized and is_meaningful_text(normalized):
            lines.append(normalized)
    return lines


def compute_similarity(text_a: str, text_b: str) -> float:
    if not text_a.strip() and not text_b.strip():
        return 0.0
    vectorizer = TfidfVectorizer(analyzer="word", ngram_range=(1, 2))
    tfidf = vectorizer.fit_transform([text_a, text_b])
    similarity_matrix = cosine_similarity(tfidf[0:1], tfidf[1:2])
    value = float(similarity_matrix[0][0])
    return max(0.0, min(1.0, value))


def word_differences(original: str, target: str) -> Optional[dict]:
    original_words = original.split()
    target_words = target.split()
    if not original_words and not target_words:
        return None

    matcher = difflib.SequenceMatcher(None, original_words, target_words)
    removed, added = [], []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag in {"delete", "replace"} and i2 > i1:
            removed.append(" ".join(original_words[i1:i2]))
        if tag in {"insert", "replace"} and j2 > j1:
            added.append(" ".join(target_words[j1:j2]))

    if not removed and not added:
        return None

    return {
        "removed": removed[:5],
        "added": added[:5],
    }


def build_line_analysis(
    original_lines: List[str], verify_lines: List[str]
) -> Tuple[List[dict], dict]:
    matcher = difflib.SequenceMatcher(None, original_lines, verify_lines)
    results: List[dict] = []
    summary = {"matches": 0, "modified": 0, "removed": 0, "added": 0}

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            summary["matches"] += i2 - i1
            for idx in range(i2 - i1):
                if len(results) >= MAX_LINE_RESULTS:
                    break
                results.append(
                    {
                        "type": "match",
                        "originalLine": i1 + idx + 1,
                        "verifyLine": j1 + idx + 1,
                        "originalText": original_lines[i1 + idx],
                        "verifyText": verify_lines[j1 + idx],
                    }
                )
        elif tag == "replace":
            summary["modified"] += max(i2 - i1, j2 - j1)
            span = max(i2 - i1, j2 - j1)
            for idx in range(span):
                if len(results) >= MAX_LINE_RESULTS:
                    break
                original_text = original_lines[i1 + idx] if (i1 + idx) < i2 else ""
                verify_text = verify_lines[j1 + idx] if (j1 + idx) < j2 else ""
                results.append(
                    {
                        "type": "modified",
                        "originalLine": (i1 + idx + 1) if (i1 + idx) < i2 else None,
                        "verifyLine": (j1 + idx + 1) if (j1 + idx) < j2 else None,
                        "originalText": original_text,
                        "verifyText": verify_text,
                        "wordDiff": word_differences(original_text, verify_text),
                    }
                )
        elif tag == "delete":
            summary["removed"] += i2 - i1
            for idx in range(i2 - i1):
                if len(results) >= MAX_LINE_RESULTS:
                    break
                results.append(
                    {
                        "type": "removed",
                        "originalLine": i1 + idx + 1,
                        "verifyLine": None,
                        "originalText": original_lines[i1 + idx],
                        "verifyText": "",
                        "wordDiff": None,
                    }
                )
        elif tag == "insert":
            summary["added"] += j2 - j1
            for idx in range(j2 - j1):
                if len(results) >= MAX_LINE_RESULTS:
                    break
                results.append(
                    {
                        "type": "added",
                        "originalLine": None,
                        "verifyLine": j1 + idx + 1,
                        "originalText": "",
                        "verifyText": verify_lines[j1 + idx],
                        "wordDiff": None,
                    }
                )

    return results, summary


def analyze_documents(text_a: str, text_b: str) -> dict:
    original_lines = normalize_lines(text_a)
    verify_lines = normalize_lines(text_b)
    similarity = compute_similarity(text_a, text_b)
    line_analysis, summary = build_line_analysis(original_lines, verify_lines)

    text_stats = {
        "originalCharacters": len(text_a),
        "verifyCharacters": len(text_b),
        "originalLines": len(original_lines),
        "verifyLines": len(verify_lines),
    }

    result = {
        "similarity": round(similarity * 100, 2),
        "summary": {
            **summary,
            "totalOriginalLines": len(original_lines),
            "totalVerifyLines": len(verify_lines),
        },
        "textStats": text_stats,
        "lineAnalysis": line_analysis,
        "truncated": len(line_analysis) >= MAX_LINE_RESULTS,
        "model": "tfidf-cosine",
    }
    return result


@app.route("/compare", methods=["POST"])
def compare_route():
    if "file1" not in request.files or "file2" not in request.files:
        return jsonify({"error": "Missing files. Expect file1 and file2."}), 400

    file1 = request.files["file1"]
    file2 = request.files["file2"]

    temp_paths = []
    try:
        path1 = save_temp_file(file1)
        path2 = save_temp_file(file2)
        temp_paths.extend([path1, path2])

        text_a = extract_text_from_path(path1)
        text_b = extract_text_from_path(path2)

        if not text_a.strip() and not text_b.strip():
            return jsonify({"error": "Unable to extract text from both documents."}), 422

        analysis = analyze_documents(text_a, text_b)
        return jsonify(analysis)
    finally:
        for tmp in temp_paths:
            if tmp and os.path.exists(tmp):
                try:
                    os.remove(tmp)
                except OSError:
                    pass


@app.route("/health", methods=["GET"])
def health_route():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(port=5001)
