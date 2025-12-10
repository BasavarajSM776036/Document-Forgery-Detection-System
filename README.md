
# Document Forgery Detection

Full-stack project that lets users upload trusted originals, then verify later versions using cryptographic hashes plus machine-learning text analysis.

## What's inside

- **React + Vite** front-end (`src/`) with Auth context and dual upload cards.
- **Node/Express** API (`server/index.js`) for storing originals, hashing, history, and verification orchestration.
- **Python Flask ML service** (`server/ml_verify.py`) that extracts text from PDFs/images/text files (OCR via Tesseract + `pdfminer`) and compares them using TF‑IDF cosine similarity with line and word level diffs.

## Getting started

1. **Install dependencies**
   ```bash
   cd document-forgery
   npm install
   cd server
   npm install
   python -m pip install -r requirements.txt  # create this from the notes below if it doesn't exist yet
   ```

   Python service needs `flask`, `pytesseract`, `pdfminer.six`, `Pillow`, and `scikit-learn`. Make sure the Tesseract OCR engine is installed locally and accessible on your PATH (the repo already includes `eng.traineddata`).

2. **Run the ML service**
   ```bash
   cd server
   python ml_verify.py
   ```
   This hosts `POST /compare` on `http://127.0.0.1:5001` which the Node API calls for line-by-line analysis.

3. **Start the Node API**
   ```bash
   cd server
   npm run dev
   ```

4. **Start the Vite dev server**
   ```bash
   cd document-forgery
   npm run dev
   ```

Point your browser to the Vite URL (usually `http://localhost:5173`). Upload an original document, then upload a version to verify—results now show ML-driven similarity plus line/word level insights without adding extra UI buttons.  

# Document-Forgery-Detection-System
A full-stack application that detects whether a document is genuine or forged by comparing the uploaded file with the original. Built using React (frontend), Node.js/Express (backend), and Python (OpenCV-based ML) for pixel-level document comparison.

