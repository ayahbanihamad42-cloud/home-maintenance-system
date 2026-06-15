import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../components/common/Header";
import API from "../../services/api.jsx";
import {
  getTechnicians,
  smartSearchTechnicians,
} from "../../services/technicianService.jsx";

const jordanCities = [
  "Amman",
  "Irbid",
  "Zarqa",
  "Russeifa",
  "Salt",
  "Madaba",
  "Aqaba",
  "Jerash",
  "Ajloun",
  "Mafraq",
  "Karak",
  "Tafilah",
  "Ma'an",
  "Ramtha",
  "Sahab",
  "Fuheis",
  "Mahis",
  "Balqa",
  "Wadi Musa",
  "Kufranjah",
  "Karak City",
  "Taybeh",
  "Shobak",
  "Southern Shuna",
  "Northern Shuna",
  "Deir Alla",
];

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getRating(tech) {
  return Number(tech.rating || tech.average_rating || tech.avg_rating || 0);
}

function getPrice(tech) {
  return Number(tech.price_per_hour || 0);
}

function getTechnicianId(tech) {
  return tech.technicianId || tech.technician_id || tech.tech_id || tech.id;
}

function CommentsBox({ technicianId }) {
  const { t } = useTranslation();
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
    <div className="comments-box">
      <button className="secondary-btn" type="button" onClick={loadComments}>
        {open ? t("techByService.hideComments") : t("techByService.viewComments")}
      </button>

      {open && (
        <div className="comments-list">
          {loading ? (
            <p>{t("techByService.loadingComments")}</p>
          ) : comments.length === 0 ? (
            <p>{t("techByService.noComments")}</p>
          ) : (
            comments.map((item, index) => (
              <div className="comment-card" key={item.id || index}>
                <strong>{item.user_name || "User"} ⭐ {item.rating}</strong>
                <p>{item.comment || "-"}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function TechniciansByService() {
  const { t } = useTranslation();
  const { service } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const decodedService = decodeURIComponent(service || "");

  const [technicians, setTechnicians] = useState([]);
  const [smartResults, setSmartResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [smartLoading, setSmartLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [resultType, setResultType] = useState("technicians");
  const [priceFilter, setPriceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("recommended");

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      setSmartResults(null);
      const data = await getTechnicians(decodedService);
      setTechnicians(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("technicians by service error:", err);
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, [decodedService]);

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
          service: decodedService,
          userCity: currentUser?.city || "",
        });

        setSmartResults(Array.isArray(data?.technicians) ? data.technicians : []);
      } catch (err) {
        console.error("smart search error:", err);
        setSmartResults(null);
      } finally {
        setSmartLoading(false);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [search, decodedService, currentUser?.city]);

  const filteredTechnicians = useMemo(() => {
    if (resultType !== "technicians") return [];

    let result =
      search.trim() && Array.isArray(smartResults)
        ? [...smartResults]
        : [...technicians];

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

    if (sortFilter === "rating") {
      result.sort((a, b) => getRating(b) - getRating(a));
    }

    if (sortFilter === "price_low") {
      result.sort((a, b) => getPrice(a) - getPrice(b));
    }

    if (sortFilter === "price_high") {
      result.sort((a, b) => getPrice(b) - getPrice(a));
    }

    if (sortFilter === "experience") {
      result.sort((a, b) => Number(b.experience || 0) - Number(a.experience || 0));
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
    sortFilter,
  ]);

  const clearFilters = () => {
    setSearch("");
    setResultType("technicians");
    setPriceFilter("all");
    setLocationFilter("all");
    setRatingFilter("all");
    setSortFilter("recommended");
    setSmartResults(null);
  };

  return (
    <>
      <Header />

      <main className="technicians-container">
        <section className="page-hero">
          <h1>{decodedService} {t("techByService.title")}</h1>
          <p>{t("techByService.subtitle")}</p>
        </section>

        <section className="request-filters">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("techByService.searchPlaceholder")}
          />

          <select value={resultType} onChange={(e) => setResultType(e.target.value)}>
            <option value="technicians">{t("techByService.technicians")}</option>
            <option value="stores">{t("techByService.stores")}</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="all">{t("techByService.allCities")}</option>
            {jordanCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
            <option value="all">{t("techByService.allPrices")}</option>
            <option value="low">{t("techByService.priceLow")}</option>
            <option value="mid">{t("techByService.priceMedium")}</option>
            <option value="high">{t("techByService.priceHigh")}</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="all">{t("techByService.allRatings")}</option>
            <option value="5">5+</option>
            <option value="4">4+</option>
            <option value="3">3+</option>
          </select>

          <select value={sortFilter} onChange={(e) => setSortFilter(e.target.value)}>
            <option value="recommended">{t("techByService.recommended")}</option>
            <option value="rating">{t("techByService.bestRating")}</option>
            <option value="experience">{t("techByService.mostExperience")}</option>
            <option value="price_low">{t("techByService.lowestPrice")}</option>
            <option value="price_high">{t("techByService.highestPrice")}</option>
          </select>

          <button className="clear-filter-btn" type="button" onClick={clearFilters}>
            {t("techByService.clearFilters")}
          </button>
        </section>

        {search.trim() && (
          <div className="auth-success">
            {t("techByService.assistantSearch")} {search} {smartLoading ? "..." : ""}
          </div>
        )}

        {loading ? (
          <section className="card">
            <h3>{t("techByService.loading")}</h3>
            <p>{t("techByService.loadingTechnicians")}</p>
          </section>
        ) : resultType === "stores" ? (
          <section className="card">
            <h3>{t("techByService.storesTab")}</h3>
            <p>{t("techByService.storesComingSoon")}</p>
          </section>
        ) : smartLoading ? (
          <section className="card">
            <h3>{t("techByService.assistantSearchTitle")}</h3>
            <p>{t("techByService.searching")}</p>
          </section>
        ) : filteredTechnicians.length === 0 ? (
          <section className="card">
            <h3>{t("techByService.noResults")}</h3>
            <p>{t("techByService.noTechnicians")}</p>
          </section>
        ) : (
          <section className="technicians-grid">
            {filteredTechnicians.map((tech) => {
              const technicianId = getTechnicianId(tech);

              return (
                <article className="technician-card" key={technicianId}>
                  <div className="technician-card-header">
                    <div className="avatar-placeholder">
                      {String(tech.name || "T").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h2>{tech.name || "Technician"}</h2>
                      <span className="status-badge">
                        {tech.service || decodedService}
                      </span>
                    </div>
                  </div>

                  <div className="request-details-grid">
                    <p><strong>{t("techByService.ratingLabel")}</strong> ⭐ {getRating(tech).toFixed(1)}</p>
                    <p><strong>{t("techByService.cityLabel")}</strong> {tech.city || "-"}</p>
                    <p><strong>{t("techByService.phoneLabel")}</strong> {tech.phone || "-"}</p>
                    <p><strong>{t("techByService.experienceLabel")}</strong> {tech.experience || 0} {t("techByService.yearsUnit")}</p>
                    <p><strong>{t("techByService.priceLabel")}</strong> {getPrice(tech).toFixed(2)} {t("techByService.jodHour")}</p>
                    <p>
                      <strong>{t("techByService.reviewsLabel")}</strong>{" "}
                      {tech.review_count ? `${tech.review_count} ${t("techByService.reviewsUnit")}` : t("techByService.noReviews")}
                    </p>
                  </div>

                  <div className="request-actions">
                    <button
                      className="primary"
                      type="button"
                      onClick={() => navigate(`/technician/${technicianId}`)}
                    >
                      {t("techByService.viewProfile")}
                    </button>

                    <button
                      className="secondary-btn"
                      type="button"
                      onClick={() =>
                        navigate(`/request/${technicianId}`, {
                          state: {
                            technicianId,
                            technician: tech,
                            service: tech.service || decodedService,
                            technicianName: tech.name || "",
                            price_per_hour: tech.price_per_hour || 0,
                          },
                        })
                      }
                    >
                      {t("techByService.bookNow")}
                    </button>
                  </div>

                  <CommentsBox technicianId={technicianId} />
                </article>
              );
            })}
          </section>
        )}
      </main>
    </>
  );
}