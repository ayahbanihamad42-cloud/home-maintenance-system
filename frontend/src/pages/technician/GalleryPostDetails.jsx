import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../components/common/Header";

function GalleryPostDetails() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const storedPost = sessionStorage.getItem("selectedGalleryPost");
  const post =
    location.state?.post || (storedPost ? JSON.parse(storedPost) : null);

  const images = useMemo(() => {
    if (!post) return [];

    if (Array.isArray(post.images)) {
      return post.images.filter(Boolean);
    }

    if (typeof post.images === "string") {
      try {
        const parsed = JSON.parse(post.images);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        return post.images
          .split(",")
          .map((img) => img.trim())
          .filter(Boolean);
      }
    }

    if (post.image_url) return [post.image_url];
    if (post.image) return [post.image];

    return [];
  }, [post]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const activeImage = images[selectedImageIndex] || images[0] || "";

  const goPrev = () => {
    if (!images.length) return;

    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    if (!images.length) return;

    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  if (!post) {
    return (
      <>
        <Header />

        <div className="container">
          <h2>{t("galleryPost.title")}</h2>
          <p>{t("galleryPost.notFound")}</p>

          <button className="primary" onClick={() => navigate("/profile")}>
            {t("galleryPost.back")}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="gallery-details-page">
        <button className="back-post-btn" onClick={() => navigate(-1)}>
          {t("galleryPost.backArrow")}
        </button>

        <div className="gallery-details-card">
          <div className="gallery-details-image image-slider-box">
            {activeImage ? (
              <img src={activeImage} alt="work post" />
            ) : (
              <div className="empty-gallery-card">{t("galleryPost.noImage")}</div>
            )}

            {images.length > 1 && (
              <>
                <button className="slider-arrow left" onClick={goPrev}>
                  ‹
                </button>

                <button className="slider-arrow right" onClick={goNext}>
                  ›
                </button>

                <div className="image-counter">
                  {selectedImageIndex + 1} / {images.length}
                </div>

                <div className="details-thumbs">
                  {images.map((img, index) => (
                    <button
                      type="button"
                      key={`${img}-${index}`}
                      className={selectedImageIndex === index ? "active" : ""}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img src={img} alt="thumbnail" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="gallery-details-text">
            <h2>{t("galleryPost.workDetails")}</h2>
            <p>{post.description || post.caption || t("galleryPost.noDescription")}</p>

            {post.location_note && (
              <p>
                <b>{t("galleryPost.locationLabel")}</b> {post.location_note}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default GalleryPostDetails;