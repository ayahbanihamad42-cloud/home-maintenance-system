import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createTechnicianGalleryPost,
  getMyTechnicianGallery,
} from "../../services/technicianService";

function TechnicianGalleryManager() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");

  const loadPosts = () => {
    getMyTechnicianGallery()
      .then((data) => setPosts(data || []))
      .catch(() => setPosts([]));
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
    const files = Array.from(e.target.files || []).slice(0, 6);

    try {
      const compressed = await Promise.all(files.map(compressImage));
      setImages(compressed);
      setMessage("");
    } catch {
      setMessage("Failed to read images.");
    }
  };

  const submitPost = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      setMessage("Choose at least one image.");
      return;
    }

    if (!description.trim()) {
      setMessage("Write a caption first.");
      return;
    }

    const finalDescription = locationText.trim()
      ? `${description.trim()}\n\nLocation: ${locationText.trim()}`
      : description.trim();

    try {
      await createTechnicianGalleryPost({
        description: finalDescription,
        images,
      });

      setImages([]);
      setDescription("");
      setLocationText("");
      setShowCreate(false);
      setMessage("");
      loadPosts();
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to add post.");
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
          onClick={() => setShowCreate(true)}
        >
          +
        </button>

        <span></span>
      </div>

      <h3 className="profile-gallery-title">Work Gallery</h3>

      {message ? <div className="mini-error">{message}</div> : null}

      {showCreate ? (
        <div className="create-post-card">
          <h3>Create New Work Post</h3>

          <form onSubmit={submitPost}>
            <label>Images</label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImages}
            />

            {images.length > 0 ? (
              <div className="create-preview-grid">
                {images.map((img, index) => (
                  <img key={index} src={img} alt={`preview ${index + 1}`} />
                ))}
              </div>
            ) : null}

            <label>Caption</label>

            <textarea
              placeholder="Write caption / work details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label>Location / Office / Work place</label>

            <input
              type="text"
              placeholder="Example: Irbid, customer house, office..."
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
            />

            <div className="create-post-actions">
              <button type="submit">Post</button>

              <button type="button" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {posts.length === 0 ? (
        <div className="gallery-empty-text">No posts yet.</div>
      ) : (
        <div className="pinterest-gallery">
          {posts.map((post) => (
            <button
              type="button"
              className="pinterest-post"
              key={post.id}
              onClick={() => openPost(post)}
            >
              <img src={post.images?.[0]} alt="work post" />

              <div className="pinterest-caption">{post.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default TechnicianGalleryManager;