import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/common/Header";
import API from "../../services/api.jsx";
import {
  getTechnicians,
  smartSearchTechnicians,
} from "../../services/technicianService.jsx";

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getRating(tech) {
  return Number(tech.rating || tech.average_rating || 0);
}

function getPrice(tech) {
  return Number(tech.price_per_hour || 0);
}

function getTechnicianId(tech) {
  return tech.technicianId || tech.technician_id || tech.tech_id || tech.id;
}

function CommentsBox({ technicianId }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);
    setLoading(true);

    try {
      const res = await API.get(`/ratings/technician/${technicianId}`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("comments error:", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="technician-comments-section">
      <button type="button" className="comments-link" onClick={loadComments}>
        {open ? "Hide comments" : "View comments"}
      </button>

      {open && (
        <div className="comments-list-box">
          {loading ? (
            <div className="comment-row">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="comment-row">No comments yet.</div>
          ) : (
            comments.map((item) => (
              <div className="comment-row" key={item.id}>
                <div className="comment-top">
                  <b>{item.user_name || "User"}</b>
                  <span>⭐ {item.rating}</span>
                </div>
                <div className="comment-text">{item.comment}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function TechniciansByService() {
  const { service } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [technicians, setTechnicians] = useState([]);
  const [smartResults, setSmartResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [smartLoading, setSmartLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [resultType, setResultType] = useState("technicians");
  const [priceFilter, setPriceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    setSmartResults(null);

    getTechnicians(service)
      .then((data) => {
        setTechnicians(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("technicians by service error:", err);
        setTechnicians([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [service]);

  useEffect(() => {
    const value = search.trim();

    if (!value) {
      setSmartResults(null);
      setSmartLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSmartLoading(true);

        const data = await smartSearchTechnicians({
          searchText: value,
          service: decodeURIComponent(service || ""),
          userCity: currentUser?.city || "",
        });

        setSmartResults(Array.isArray(data?.technicians) ? data.technicians : []);
      } catch (err) {
        console.error("smart search error:", err);
        setSmartResults(null);
      } finally {
        setSmartLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [search, service, currentUser?.city]);

  const cities = useMemo(() => {
    const result = [];

    technicians.forEach((tech) => {
      const city = String(tech.city || "").trim();
      if (city && !result.includes(city)) result.push(city);
    });

    return result;
  }, [technicians]);

  const filteredTechnicians = useMemo(() => {
    if (resultType !== "technicians") return [];

    let result = search.trim() && Array.isArray(smartResults) ? smartResults : [...technicians];

    if (priceFilter === "low") {
      result = result.filter((tech) => getPrice(tech) <= 10);
    }

    if (priceFilter === "mid") {
      result = result.filter(
        (tech) => getPrice(tech) > 10 && getPrice(tech) <= 25
      );
    }

    if (priceFilter === "high") {
      result = result.filter((tech) => getPrice(tech) > 25);
    }

    if (locationFilter !== "all") {
      result = result.filter(
        (tech) => normalizeText(tech.city) === normalizeText(locationFilter)
      );
    }

    if (ratingFilter !== "all") {
      result = result.filter((tech) => getRating(tech) >= Number(ratingFilter));
    }

    return result;
  }, [
    technicians,
    smartResults,
    search,
    resultType,
    priceFilter,
    locationFilter,
    ratingFilter,
  ]);

  return (
    <>
      <Header />

      <div className="technicians-page">
        <div className="technicians-panel">
          <h1>{decodeURIComponent(service || "")} Technicians</h1>

          <input
            className="technician-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ask or search: name, city, cheapest, best technician..."
          />

          <div className="technician-filters-grid">
            <select
              value={resultType}
              onChange={(e) => setResultType(e.target.value)}
            >
              <option value="technicians">Technicians</option>
              <option value="stores">Stores</option>
            </select>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="all">All prices</option>
              <option value="low">Low</option>
              <option value="mid">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All locations</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">All ratings</option>
              <option value="5">5+</option>
              <option value="4">4+</option>
              <option value="3">3+</option>
            </select>
          </div>

          {search.trim() ? (
            <div className="smart-search-hint">
              Assistant search: <b>{search}</b>
              {smartLoading ? " ..." : ""}
            </div>
          ) : null}

          {loading ? (
            <div className="message-box-card">
              <div className="message-box-title">Loading</div>
              <div className="message-box-body">Loading technicians...</div>
            </div>
          ) : resultType === "stores" ? (
            <div className="message-box-card">
              <div className="message-box-title">Stores</div>
              <div className="message-box-body">
                Store results will be connected later.
              </div>
            </div>
          ) : smartLoading ? (
            <div className="message-box-card">
              <div className="message-box-title">Assistant Search</div>
              <div className="message-box-body">Searching...</div>
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="message-box-card">
              <div className="message-box-title">No results</div>
              <div className="message-box-body">No technicians found.</div>
            </div>
          ) : (
            <div className="technician-list">
              {filteredTechnicians.map((tech) => {
                const technicianId = getTechnicianId(tech);

                return (
                  <div className="technician-card" key={technicianId}>
                    <h2>{tech.name || "Technician"}</h2>
                    <p className="technician-service">{tech.service || service}</p>

                    <p>
                      <b>City:</b> {tech.city || "-"}
                    </p>
                    <p>
                      <b>Phone:</b> {tech.phone || "-"}
                    </p>
                    <p>
                      <b>Experience:</b> {tech.experience || 0} years
                    </p>
                    <p>
                      <b>Price:</b> {getPrice(tech).toFixed(2)} JOD/hour
                    </p>
                    <p>
                      <b>Rating:</b> ⭐ {getRating(tech).toFixed(1)}
                      {tech.review_count ? ` (${tech.review_count} reviews)` : ""}
                    </p>

                    <CommentsBox technicianId={technicianId} />

                    <div className="technician-card-actions">
                      <button
                        className="primary"
                        type="button"
                        onClick={() => navigate(`/technician/${technicianId}`)}
                      >
                        View Profile
                      </button>

                      <button
                        className="primary"
                        type="button"
                        onClick={() =>
                          navigate(`/request/${technicianId}`, {
                            state: {
                              technician: tech,
                              service: tech.service || service,
                            },
                          })
                        }
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}