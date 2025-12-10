res.json({
  status: matchFound || similarity > 80 ? "Original" : "Fake",
  fileName: req.file.originalname,
  similarity: similarity + "%",
  visualComparison: visualDiff,
  blurScore: blurScore,
  blurSuspicious: blurScore !== null ? blurScore < 500 : null,
  fileUrl: `http://localhost:5000/uploads/${req.body.username || "guest"}/verify/${req.file.filename}`, // ✅ FIXED
});
