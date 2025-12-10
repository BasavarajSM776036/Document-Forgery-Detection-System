// src/context/AnalysisContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AnalysisContext = createContext();

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
};

// Mock analysis results
const mockAnalysisHistory = [
  {
    id: "1",
    fileName: "contract_agreement.pdf",
    fileType: "PDF",
    fileSize: "2.4 MB",
    uploadDate: "2025-04-10T14:32:00Z",
    status: "authentic",
    confidenceScore: 0.94,
    detectionDetails: [
      {
        type: "Signature Analysis",
        area: "Page 3, Bottom",
        confidence: 0.95,
        description:
          "Signature shows consistent stroke patterns and pressure points.",
      },
      {
        type: "Text Analysis",
        area: "Full Document",
        confidence: 0.98,
        description: "Text formatting is consistent throughout the document.",
      },
    ],
    imageUrl:
      "https://images.pexels.com/photos/6120214/pexels-photo-6120214.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "2",
    fileName: "passport_scan.jpg",
    fileType: "JPEG",
    fileSize: "1.7 MB",
    uploadDate: "2025-04-09T10:15:00Z",
    status: "suspicious",
    confidenceScore: 0.72,
    detectionDetails: [
      {
        type: "Image Tampering",
        area: "Photo Area",
        confidence: 0.68,
        description:
          "Possible manipulation detected in the photo area. Inconsistent pixel patterns observed.",
      },
      {
        type: "Security Feature Analysis",
        area: "Watermark",
        confidence: 0.75,
        description:
          "Watermark appears inconsistent with standard patterns.",
      },
    ],
    imageUrl:
      "https://images.pexels.com/photos/9353870/pexels-photo-9353870.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    heatmapUrl:
      "https://images.pexels.com/photos/9353870/pexels-photo-9353870.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: "3",
    fileName: "check_payment.png",
    fileType: "PNG",
    fileSize: "0.9 MB",
    uploadDate: "2025-04-08T16:45:00Z",
    status: "forged",
    confidenceScore: 0.32,
    detectionDetails: [
      {
        type: "Signature Analysis",
        area: "Bottom Right",
        confidence: 0.92,
        description:
          "Signature shows signs of tracing with irregular pen pressure and hesitation marks.",
      },
      {
        type: "Document Authenticity",
        area: "Full Document",
        confidence: 0.89,
        description:
          "Paper quality and printing patterns inconsistent with standard check documents.",
      },
    ],
    imageUrl:
      "https://images.pexels.com/photos/6694543/pexels-photo-6694543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    heatmapUrl:
      "https://images.pexels.com/photos/6694543/pexels-photo-6694543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
];

export const AnalysisProvider = ({ children }) => {
  const [analysisHistory, setAnalysisHistory] = useState(mockAnalysisHistory);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load history from localStorage on initial load
  useEffect(() => {
    const savedHistory = localStorage.getItem("analysisHistory");
    if (savedHistory) {
      try {
        setAnalysisHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error("Failed to parse analysis history", err);
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("analysisHistory", JSON.stringify(analysisHistory));
  }, [analysisHistory]);

  // Simulates starting a new analysis
  const startAnalysis = async (file) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const confidenceScore = Math.random() * 0.65 + 0.3;

      let status;
      if (confidenceScore > 0.8) status = "authentic";
      else if (confidenceScore > 0.5) status = "suspicious";
      else status = "forged";

      const newAnalysis = {
        id: Date.now().toString(),
        fileName: file.name,
        fileType: file.type.split("/")[1].toUpperCase(),
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date().toISOString(),
        status,
        confidenceScore,
        detectionDetails: [
          {
            type: "Image Analysis",
            area: "Full Document",
            confidence: confidenceScore,
            description:
              status === "authentic"
                ? "No signs of manipulation detected."
                : "Possible manipulation detected in multiple areas.",
          },
          {
            type: status === "authentic" ? "Document Verification" : "Forgery Detection",
            area: status === "authentic" ? "Security Features" : "Critical Sections",
            confidence: confidenceScore,
            description:
              status === "authentic"
                ? "Security features verified successfully."
                : "Inconsistencies detected in critical document sections.",
          },
        ],
        imageUrl:
          "https://images.pexels.com/photos/6120190/pexels-photo-6120190.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        heatmapUrl:
          status !== "authentic"
            ? "https://images.pexels.com/photos/6120190/pexels-photo-6120190.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            : undefined,
      };

      setCurrentAnalysis(newAnalysis);
      setAnalysisHistory((prev) => [newAnalysis, ...prev]);

      return newAnalysis.id;
    } catch (err) {
      setError("Failed to analyze document. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisById = (id) => {
    return analysisHistory.find((analysis) => analysis.id === id);
  };

  const clearCurrentAnalysis = () => {
    setCurrentAnalysis(null);
  };

  return (
    <AnalysisContext.Provider
      value={{
        analysisHistory,
        currentAnalysis,
        loading,
        error,
        startAnalysis,
        getAnalysisById,
        clearCurrentAnalysis,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};
