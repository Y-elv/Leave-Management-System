import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ToastContainer, { useToast } from "../components/ToastContainer";
import { API_BASE, saveAuthAndRedirect } from "../utils/auth";
import type { User } from "../types/user";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get("token");
      const role = searchParams.get("role");
      const error = searchParams.get("error");

      if (error) {
        addToast(error, "error");
        setTimeout(() => navigate("/login", { replace: true }), 3000);
        return;
      }

      if (!token || !role) {
        addToast("Invalid authentication response", "error");
        setTimeout(() => navigate("/login", { replace: true }), 3000);
        return;
      }

      try {
        // Store raw token temporarily so we can fetch the full user profile
        localStorage.setItem("token", token);

        const response = await fetch(`${API_BASE}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const user = (await response.json()) as User;

        // Save token + user and redirect to role-specific dashboard
        addToast("Login successful!", "success");
        saveAuthAndRedirect(token, user);
      } catch (error) {
        console.error("OAuth callback error:", error);
        addToast("An error occurred during login", "error");
        setTimeout(() => navigate("/login", { replace: true }), 3000);
      }
    };

    void handleOAuthCallback();
  }, [navigate, searchParams, addToast]);

  return (
    <div className="oauth-callback">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <LoadingSpinner />
    </div>
  );
};

export default OAuthCallback;
