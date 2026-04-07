import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import axios from "axios";
import FormData from "form-data";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const SERVER_URL = `http://localhost:${PORT}`;


const uploadsDir = path.join(__dirname, "uploads");
const dataDir = path.join(__dirname, "data");
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

app.use("/uploads", express.static(uploadsDir));


function safeName(str) {
  return String(str || "guest").replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

function createStorage(type) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const username = safeName(req.body.username || "guest");
      const folder = path.join(uploadsDir, username, type);
      fs.mkdirSync(folder, { recursive: true });
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
}

const uploadOriginal = multer({ storage: createStorage("originals") });
const uploadVerify = multer({ storage: createStorage("verify") });

async function runTextComparison(originalPath, verifyPath) {
  try {
    const formData = new FormData();
    formData.append("file1", fs.createReadStream(originalPath));
    formData.append("file2", fs.createReadStream(verifyPath));

    const response = await axios.post("http://127.0.0.1:5001/compare", formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || error.message;
    console.error("Text compare error:", message);
    return null;
  }
}

function getFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

function ensureUserDataDir(safe) {
  const dir = path.join(dataDir, "users", safe);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function migrateLegacyUserFiles(safe, historyFile, hashFile) {
  const legacyHistory = path.join(dataDir, `${safe}_history.json`);
  const legacyHashes = path.join(dataDir, `${safe}_originals.json`);

  if (fs.existsSync(legacyHistory) && !fs.existsSync(historyFile)) {
    fs.mkdirSync(path.dirname(historyFile), { recursive: true });
    fs.renameSync(legacyHistory, historyFile);
  }

  if (fs.existsSync(legacyHashes) && !fs.existsSync(hashFile)) {
    fs.mkdirSync(path.dirname(hashFile), { recursive: true });
    fs.renameSync(legacyHashes, hashFile);
  }
}

function getUserFiles(username) {
  const safe = safeName(username);
  const userDir = ensureUserDataDir(safe);
  const historyFile = path.join(userDir, "history.json");
  const hashFile = path.join(userDir, "originals.json");
  migrateLegacyUserFiles(safe, historyFile, hashFile);
  return { historyFile, hashFile };
}

function loadJSON(file, fallback) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {}
  return fallback;
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function saveUserHistory(username, record) {
  const { historyFile } = getUserFiles(username);
  const history = loadJSON(historyFile, []);
  history.push(record);
  saveJSON(historyFile, history);
}

function saveUserHash(username, storedFileName, hash) {
  const { hashFile } = getUserFiles(username);
  const hashes = loadJSON(hashFile, {});
  hashes[storedFileName] = hash;
  saveJSON(hashFile, hashes);
}




app.post("/upload-original", (req, res) => {
  const upload = uploadOriginal.single("file");
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const username = req.body.username || "guest";
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
      const filePath = req.file.path;
      const hash = await getFileHash(filePath);
      saveUserHash(username, req.file.filename, hash);

      const safeUser = safeName(username);
      const fileUrl = `${SERVER_URL}/uploads/${safeUser}/originals/${encodeURIComponent(req.file.filename)}`;

      const record = {
        type: "upload",
        user: username,
        fileName: req.file.originalname,
        storedAs: req.file.filename,
        hash,
        url: fileUrl,
        date: new Date().toISOString(),
      };

      saveUserHistory(username, record);
      res.json({ message: "✅ Original document uploaded", ...record });
    } catch (e) {
      res.status(500).json({ error: "Failed to upload file" });
    }
  });
});



app.post("/verify", (req, res) => {
  const upload = uploadVerify.single("file");
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ error: err.message });

    const username = req.body.username || "guest";
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
      const { hashFile } = getUserFiles(username);
      const verifyPath = req.file.path;
      const verifyHash = await getFileHash(verifyPath);
      const hashes = loadJSON(hashFile, {});

      let matchedFile = null;
      let bestScore = 0;
      let matchedUrl = null;
      let bestAnalysis = null;
      const safeUser = safeName(username);
      const originalsFolder = path.join(uploadsDir, safeUser, "originals");

      
      for (const [name, h] of Object.entries(hashes)) {
        if (h !== verifyHash) continue;

        matchedFile = name;
        bestScore = 100;
        matchedUrl = `${SERVER_URL}/uploads/${safeUser}/originals/${encodeURIComponent(name)}`;

        const originalPath = path.join(originalsFolder, name);
        if (fs.existsSync(originalPath)) {
          bestAnalysis = await runTextComparison(originalPath, verifyPath);
        }
        break;
      }

     
      if (!matchedFile) {
        for (const origName of Object.keys(hashes)) {
          const origPath = path.join(originalsFolder, origName);
          if (!fs.existsSync(origPath)) continue;

          const analysis = await runTextComparison(origPath, verifyPath);
          if (!analysis) continue;

          const score = Number(analysis.similarity) || 0;
          if (score > bestScore) {
            bestScore = score;
            matchedFile = origName;
            matchedUrl = `${SERVER_URL}/uploads/${safeUser}/originals/${encodeURIComponent(origName)}`;
            bestAnalysis = analysis;
          }
        }
      }

      if (matchedFile && !bestAnalysis) {
        const targetPath = path.join(originalsFolder, matchedFile);
        if (fs.existsSync(targetPath)) {
          bestAnalysis = await runTextComparison(targetPath, verifyPath);
        }
      }

      
      let status = "Fake";
      if (bestScore >= 95) status = "Original";
      else if (bestScore >= 70) status = "Modified";

      const verifyUrl = `${SERVER_URL}/uploads/${safeUser}/verify/${encodeURIComponent(req.file.filename)}`;
      const similarityScore =
        typeof bestAnalysis?.similarity === "number" ? bestAnalysis.similarity : bestScore;

      const result = {
        type: "verify",
        user: username,
        fileName: req.file.originalname,
        storedAs: req.file.filename,
        url: verifyUrl,
        status,
        similarity: `${Number(similarityScore).toFixed(2)}%`,
        matchedOriginal: matchedUrl,
        analysis: bestAnalysis,
        date: new Date().toISOString(),
      };

      saveUserHistory(username, result);
      res.json(result);
    } catch (e) {
      console.error("Verification failed:", e);
      res.status(500).json({ error: "Verification failed" });
    }
  });
});




app.get("/history", (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "Missing username" });

  const { historyFile } = getUserFiles(username);
  const history = loadJSON(historyFile, []);
  res.json(history.reverse());
});




app.listen(PORT, () => {
  console.log(`✅ Server running on ${SERVER_URL}`);
  console.log(`📁 Uploads stored at: ${uploadsDir}`);
});
