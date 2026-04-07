import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import LearnMore from "./pages/LearnMore";  // ✅ NEW
import { AuthProvider, useAuth } from "./context/AuthContext";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        ⚠ Please Login to access this page.
      </h2>
    );
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar /> {/* Always visible */}
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/learn-more" element={<LearnMore />} />   {/* ✅ Added */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
