import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";

function GalleryPostDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedPost = sessionStorage.getItem("selectedGalleryPost");
  const post =
    location.state?.post || (storedPost ? JSON.parse(storedPost) : null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const activeImage = useMemo(() => {
    if (!post?.images?.length) return "";
    return post.images[selectedImageIndex] || post.images[0];
  }, [post, selectedImageIndex]);

  const goPrev = () => {
    if (!post?.images?.length) return;

    setSelectedImageIndex((prev) =>
      prev === 0 ? post.images.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    if (!post?.images?.length) return;

    setSelectedImageIndex((prev) =>
      prev === post.images.length - 1 ? 0 : prev + 1
    );
  };

  if (!post) {
    return (
      <>
        <Header />

        <div className="container">
          <h2>Post Details</h2>
          <p>Post not found.</p>

          <button className="primary" onClick={() => navigate("/profile")}>
            Back
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
          ← Back
        </button>

        <div className="gallery-details-card">
          <div className="gallery-details-image image-slider-box">
            <img src={activeImage} alt="work post" />

            {post.images?.length > 1 ? (
              <>
                <button className="slider-arrow left" onClick={goPrev}>
                  ‹
                </button>

                <button className="slider-arrow right" onClick={goNext}>
                  ›
                </button>

                <div className="image-counter">
                  {selectedImageIndex + 1} / {post.images.length}
                </div>
              </>
            ) : null}

            {post.images?.length > 1 ? (
              <div className="details-thumbs">
                {post.images.map((img, index) => (
                  <button
                    type="button"
                    key={index}
                    className={selectedImageIndex === index ? "active" : ""}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={img} alt="thumbnail" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="gallery-details-text">
            <h2>Work Details</h2>
            <p>{post.description}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default GalleryPostDetails;