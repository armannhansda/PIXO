"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { api } from "@/lib/trpc";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: number;
    name: string;
    username?: string | null;
    bio?: string | null;
    location?: string | null;
    profileImage?: string | null;
    coverImage?: string | null;
    isPublic?: boolean | null;
  };
  onSuccess: () => void;
}

async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Upload failed");
  }
  const data = await res.json();
  return data.url;
}

export function EditProfileModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditProfileModalProps) {
  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [location, setLocation] = useState(user.location || "");
  const [isPublic, setIsPublic] = useState(user.isPublic !== false);
  const [profileImage, setProfileImage] = useState(user.profileImage || "");
  const [coverImage, setCoverImage] = useState(user.coverImage || "");
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const updateUser = api.users.update.useMutation();

  const handleProfileImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProfile(true);
    try {
      const url = await uploadImage(file);
      setProfileImage(url);
    } catch {
      setError("Failed to upload profile image");
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadImage(file);
      setCoverImage(url);
    } catch {
      setError("Failed to upload cover image");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateUser.mutateAsync({
        id: user.id,
        name: name.trim(),
        username: username.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        isPublic,
        profileImage: profileImage || null,
        coverImage: coverImage || null,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const isUploading = uploadingProfile || uploadingCover;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Cover Image */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Cover Image
            </Label>
            <div
              className="relative h-32 rounded-xl overflow-hidden bg-muted border border-border cursor-pointer group"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverImage ? (
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Click to upload cover image
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadingCover ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
              {coverImage && (
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCoverImage("");
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverImage}
            />
          </div>

          {/* Profile Image */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Profile Image
            </Label>
            <div className="flex items-center gap-4">
              <div
                className="relative w-20 h-20 rounded-full overflow-hidden bg-muted border border-border cursor-pointer group shrink-0"
                onClick={() => profileInputRef.current?.click()}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent text-white text-2xl font-bold">
                    {name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingProfile ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
              {profileImage && (
                <button
                  type="button"
                  className="text-sm text-red-500 hover:text-red-600"
                  onClick={() => setProfileImage("")}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImage}
            />
          </div>

          {/* Name */}
          <div>
            <Label
              htmlFor="edit-name"
              className="text-sm font-medium mb-1.5 block"
            >
              Name
            </Label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="Your name"
            />
          </div>

          {/* Username */}
          <div>
            <Label
              htmlFor="edit-username"
              className="text-sm font-medium mb-1.5 block"
            >
              Username
            </Label>
            <input
              id="edit-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="@username"
            />
          </div>

          {/* Bio */}
          <div>
            <Label
              htmlFor="edit-bio"
              className="text-sm font-medium mb-1.5 block"
            >
              Bio
            </Label>
            <textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
              placeholder="Tell us about yourself"
            />
          </div>

          {/* Location */}
          <div>
            <Label
              htmlFor="edit-location"
              className="text-sm font-medium mb-1.5 block"
            >
              Location
            </Label>
            <input
              id="edit-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              placeholder="City, Country"
            />
          </div>

          {/* Show/Hide Profile Toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <Label className="text-sm font-medium">Public Profile</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isPublic
                  ? "Your profile is visible to everyone"
                  : "Your profile is hidden from others"}
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isUploading}
              className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
