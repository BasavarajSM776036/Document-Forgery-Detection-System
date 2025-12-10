res.json({
  message: "✅ Original document uploaded",
  fileName: req.file.originalname,
  storedAs: req.file.filename,
  hash: fileHash,
  textPreview: textContent.slice(0, 100) + "...",
  fileUrl: `http://localhost:5000/uploads/${
    req.body.username || "guest"
  }/originals/${req.file.filename}`, // ✅ FIXED
});
