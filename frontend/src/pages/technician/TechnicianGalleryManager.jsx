import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  createTechnicianGalleryPost,
  deleteTechnicianGalleryPost,
  getMyTechnicianGallery,
  updateTechnicianGalleryPost,
} from "../../services/technicianService";

function TechnicianGalleryManager() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const [editingPostId, setEditingPostId] = useState(null);
  const [description, setDescription] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [images, setImages] = useState([]);

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const isEditing = useMemo(() => Boolean(editingPostId), [editingPostId]);

  const parseImages = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  };

  const getPostLocation = (post) => {
    if (post.location_note) return post.location_note;

    const text = post.description || "";
    const match = text.match(/Location:\s*(.+)$/i);
    return match ? match[1].trim() : "";
  };

  const cleanDescription = (post) => {
    const text = post.description || "";
    return text.replace(/\n\nLocation:\s*.+$/i, "").trim();
  };

  const loadPosts = async () => {
    try {
      const data = await getMyTechnicianGallery();

      const fixed = (data || []).map((post) => ({
        ...post,
        images: parseImages(post.images),
      }));

      setPosts(fixed);
    } catch (err) {
      console.log("FRONT gallery load error:", err?.response?.data || err.message);
      setPosts([]);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const img = new Image();

      reader.onload = () => {
        img.src = reader.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 900;
        const scale = Math.min(maxWidth / img.width, 1);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };

      reader.onerror = reject;
      img.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  const handleImages = async (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    try {
      const compressed = await Promise.all(files.map(compressImage));

      setImages((prev) => [...prev, ...compressed].slice(0, 6));
      setMessage("");
    } catch {
      setMessage(t("techGallery.failedToReadImages"));
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setEditingPostId(null);
    setDescription("");
    setLocationNote("");
    setImages([]);
    setShowCreate(false);
    setOpenMenuId(null);
    setMessage("");
  };

  const startCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setDescription(cleanDescription(post));
    setLocationNote(getPostLocation(post));
    setImages(parseImages(post.images));
    setShowCreate(true);
    setOpenMenuId(null);
    setMessage("");
  };

  const submitPost = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setMessage(t("techGallery.writeCaptionFirst"));
      return;
    }

    if (!images.length) {
      setMessage(t("techGallery.chooseImage"));
      return;
    }

    try {
      setSaving(true);

      const payload = {
        description: description.trim(),
        location_note: locationNote.trim(),
        images,
      };

      if (isEditing) {
        await updateTechnicianGalleryPost(editingPostId, payload);
      } else {
        await createTechnicianGalleryPost(payload);
      }

      resetForm();
      await loadPosts();
    } catch (err) {
      setMessage(err?.response?.data?.message || t("techGallery.failedToSave"));
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (postId) => {
    const ok = window.confirm(t("techGallery.confirmDelete"));
    if (!ok) return;

    try {
      await deleteTechnicianGalleryPost(postId);

      if (editingPostId === postId) {
        resetForm();
      }

      await loadPosts();
    } catch (err) {
      setMessage(err?.response?.data?.message || t("techGallery.failedToDelete"));
    }
  };

  const openPost = (post) => {
    sessionStorage.setItem("selectedGalleryPost", JSON.stringify(post));
    navigate(`/technician/gallery/post/${post.id}`, { state: { post } });
  };

  return (
    <div className="profile-gallery-wrapper">
      <div className="gallery-divider">
        <span></span>

        <button
          type="button"
          className="gallery-plus-circle"
          onClick={startCreate}
        >
          +
        </button>

        <span></span>
      </div>

      <h3 className="profile-gallery-title">{t("techGallery.title")}</h3>

      {message ? <div className="mini-error">{message}</div> : null}

      {showCreate ? (
        <div className="create-post-card">
          <h3>{isEditing ? t("techGallery.editPost") : t("techGallery.createPost")}</h3>

          <form onSubmit={submitPost}>
            <label>{t("techGallery.images")}</label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
            />

            {images.length > 0 ? (
              <div className="create-preview-grid">
                {images.map((img, index) => (
                  <div
                    key={`${index}-${img.slice(0, 15)}`}
                    style={{ position: "relative" }}
                  >
                    <img src={img} alt={`preview ${index + 1}`} />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: "none",
                        background: "#b00020",
                        color: "#fff",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <label>{t("techGallery.caption")}</label>

            <textarea
              placeholder={t("techGallery.captionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label>{t("techGallery.locationLabel")}</label>

            <input
              type="text"
              placeholder={t("techGallery.locationPlaceholder")}
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
            />

            <div className="create-post-actions">
              <button type="submit" disabled={saving}>
                {saving ? t("techGallery.saving") : isEditing ? t("techGallery.updatePost") : t("techGallery.post")}
              </button>

              <button type="button" onClick={resetForm}>
                {t("techGallery.cancel")}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {posts.length === 0 ? (
        <div className="gallery-empty-text">{t("techGallery.noPosts")}</div>
      ) : (
        <div className="pinterest-gallery">
          {posts.map((post) => {
            const postImages = parseImages(post.images);
            const firstImage = postImages[0];

            return (
              <div
                key={post.id}
                className="pinterest-post"
                style={{ position: "relative" }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenuId((prev) => (prev === post.id ? null : post.id))
                  }
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 5,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "none",
                    background: "#111",
                    color: "#fff",
                    fontSize: 24,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  ⋮
                </button>

                {openMenuId === post.id ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 52,
                      right: 10,
                      zIndex: 6,
                      background: "#fff9f3",
                      border: "1px solid #d8c8b8",
                      borderRadius: 12,
                      overflow: "hidden",
                      minWidth: 140,
                      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => startEdit(post)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 14px",
                        border: "none",
                        background: "transparent",
                        textAlign: "left",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {t("techGallery.edit")}
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePost(post.id)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 14px",
                        border: "none",
                        background: "transparent",
                        textAlign: "left",
                        fontWeight: 800,
                        color: "#b00020",
                        cursor: "pointer",
                      }}
                    >
                      {t("techGallery.delete")}
                    </button>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => openPost(post)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    width: "100%",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {firstImage ? (
                    <img src={firstImage} alt="work post" />
                  ) : (
                    <div className="gallery-empty-text">{t("techProfile.noImage")}</div>
                  )}

                  <div className="pinterest-caption">
                    {cleanDescription(post)}

                    {getPostLocation(post) ? (
                      <div style={{ marginTop: 8, color: "#555" }}>
                        📍 {getPostLocation(post)}
                      </div>
                    ) : null}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TechnicianGalleryManager;