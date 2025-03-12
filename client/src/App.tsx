import { ThemeProvider } from "next-themes";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "@/pages/Login";
import IngestPage from "@/pages/Ingest";
import SearchPage from "@/pages/Search";
import GoogleCallbackPage from "@/pages/GoogleCallback";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("google_access_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    toast({
      title: "Authentication successful",
      description: "You are now logged in with Google",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("google_access_token");
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/ingest" />
              ) : (
                <LoginPage onAuthSuccess={handleAuthSuccess} />
              )
            }
          />
          <Route
            path="/ingest"
            element={
              isAuthenticated ? (
                <IngestPage onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/search"
            element={
              isAuthenticated ? (
                <SearchPage onLogout={handleLogout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          {/* ✅ Handle Google OAuth callback */}
          <Route
            path="/google/callback"
            element={<GoogleCallbackPage onAuthSuccess={handleAuthSuccess} />}
          />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}
