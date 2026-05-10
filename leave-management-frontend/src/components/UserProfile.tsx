import React, { useEffect, useState } from "react";
import ToastContainer, { useToast } from "./ToastContainer";
import { API_BASE_URL } from "../config/api";
import { getAuth, saveAuth } from "../utils/auth";
import type { User } from "../types/user";

interface ProfileReadOnly {
  name: string;
  fullName: string;
  email: string;
  role: string;
  employmentType: string;
  leaveBalance: number;
  profilePictureUrl: string;
}

interface UserProfileProps {
  /** Page title (e.g. Supervisor profile) */
  title?: string;
  subtitle?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({
  title = "My Profile",
  subtitle = "Manage your personal information.",
}) => {
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [fullNameEdit, setFullNameEdit] = useState("");
  const [readOnly, setReadOnly] = useState<ProfileReadOnly>({
    name: "",
    fullName: "",
    email: "",
    role: "",
    employmentType: "",
    leaveBalance: 0,
    profilePictureUrl: "",
  });

  const mapUserToReadOnly = (user: Record<string, unknown> | null | undefined): ProfileReadOnly => {
    if (!user) {
      return {
        name: "",
        fullName: "",
        email: "",
        role: "",
        employmentType: "",
        leaveBalance: 0,
        profilePictureUrl: "",
      };
    }
    const full = String(user.fullName ?? "");
    const nameVal = String(user.name ?? full);
    return {
      name: nameVal,
      fullName: full || nameVal,
      email: String(user.email ?? ""),
      role: String(user.role ?? ""),
      employmentType: String(user.employmentType ?? ""),
      leaveBalance: Number(user.leaveBalance ?? 0),
      profilePictureUrl: String(user.profilePictureUrl ?? ""),
    };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const savedUser = getAuth()?.user as Record<string, unknown> | undefined;
      if (savedUser) {
        const ro = mapUserToReadOnly(savedUser);
        setReadOnly(ro);
        setFullNameEdit(ro.fullName || ro.name);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch profile");

        const payload = await response.json();
        const user = payload?.data ?? payload?.user ?? payload;
        const ro = mapUserToReadOnly(user as Record<string, unknown>);
        setReadOnly(ro);
        setFullNameEdit(ro.fullName || ro.name);
      } catch {
        addToast("Could not refresh profile from server.", "error");
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, []);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const authUser = getAuth()?.user as { id?: string } | undefined;
    const userId = authUser?.id;
    if (!token) {
      addToast("No active session. Please login again.", "error");
      return;
    }
    if (!userId) {
      addToast("Missing user id. Please login again.", "error");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", fullNameEdit);
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const payload = await response.json();
      const updatedUser = (payload?.data ?? payload?.user ?? payload) as Record<string, unknown>;
      saveAuth(token, updatedUser as unknown as User);
      const ro = mapUserToReadOnly(updatedUser);
      setReadOnly(ro);
      setFullNameEdit(ro.fullName || ro.name);
      setSelectedImage(null);
      addToast("Profile updated successfully.", "success");
      window.dispatchEvent(new CustomEvent("slm-auth-updated"));
    } catch {
      addToast("Profile update failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading profile...</div>;
  }

  return (
    <div className="profile-card">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <h2>{title}</h2>
      <p className="profile-subtitle">{subtitle}</p>

      <div className="profile-readonly-section">
        <h3 className="profile-section-title">Account details</h3>
        <div className="profile-grid profile-readonly-grid">
          <ReadOnlyField label="Name" value={readOnly.name || "—"} />
          <ReadOnlyField label="Full name" value={readOnly.fullName || "—"} />
          <ReadOnlyField label="Email" value={readOnly.email || "—"} />
          <ReadOnlyField label="Role" value={readOnly.role || "—"} />
          <ReadOnlyField label="Employment type" value={readOnly.employmentType || "—"} />
          <ReadOnlyField label="Leave balance" value={`${readOnly.leaveBalance} days`} />
        </div>
      </div>

      <div className="profile-editable-section">
        <h3 className="profile-section-title">Edit profile</h3>
        <div className="profile-grid">
          <label>
            Full name
            <input
              value={fullNameEdit}
              onChange={(e) => setFullNameEdit(e.target.value)}
              placeholder="Your full name"
            />
          </label>

          <label>
            Profile picture
            <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
          </label>

          {(selectedImage || readOnly.profilePictureUrl) && (
            <div style={{ gridColumn: "1 / -1" }}>
              <p style={{ margin: "4px 0 8px", color: "#6b7280", fontSize: 13 }}>Preview</p>
              <img
                src={previewUrl || readOnly.profilePictureUrl}
                alt="Profile preview"
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #e5e7eb",
                }}
              />
            </div>
          )}
        </div>
      </div>

      <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
};

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <div className="profile-readonly-field">
    <span className="profile-readonly-label">{label}</span>
    <span className="profile-readonly-value">{value}</span>
  </div>
);

export default UserProfile;
