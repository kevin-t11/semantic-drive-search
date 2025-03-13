import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface GoogleCallbackPageProps {
  onAuthSuccess: () => void;
}

export default function GoogleCallbackPage({ onAuthSuccess }: GoogleCallbackPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token) {
        localStorage.setItem("google_access_token", token);

        // Call onAuthSuccess to update state
        onAuthSuccess();

        navigate("/ingest");
      } else {
        console.error("Failed to get token from callback");
      }
    }

    handleCallback();
  }, [navigate, onAuthSuccess]);

  return <div>Processing Google authentication...</div>;
}
