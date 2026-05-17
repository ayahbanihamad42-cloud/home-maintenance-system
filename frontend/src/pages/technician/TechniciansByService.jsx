import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/common/Header";
import { getTechnicians } from "../../services/technicianService";

function TechniciansByService() {
  const { service } = useParams();
  const navigate = useNavigate();

  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  const [resultType, setResultType] = useState("technicians");
  const [priceFilter, setPriceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    setLoading(true);

    getTechnicians(service)
      .then((data) => setTechnicians(data || []))
      .catch((err) => {
        console.error("getTechnicians error:", err);
        setTechnicians([]);
      })
      .finally(() => setLoading(false));
  }, [service]);

  const cities = useMemo(() => {
    const result = [];

    technicians.forEach((tech) => {
      if (tech.city && !result.includes(tech.city)) {
        result.push(tech.city);
      }
    });

    return result;
  }, [technicians]);

  const filteredTechnicians = useMemo(() => {
    if (resultType === "stores") return [];

    let result = [...technicians];

    if (priceFilter === "low") {
      result = result.filter((t) => Number(t.price_per_hour || 0) <= 10);
    }

    if (priceFilter === "mid") {
      result = result.filter(
        (t) =>
          Number(t.price_per_hour || 0) > 10 &&
          Number(t.price_per_hour || 0) <= 25
      );
    }

    if (priceFilter === "high") {
      result = result.filter((t) => Number(t.price_per_hour || 0) > 25);
    }

    if (locationFilter !== "all") {
      result = result.filter((t) => t.city === locationFilter);
    }

    if (ratingFilter !== "all") {
      result = result.filter(
        (t) => Number(t.rating || 0) >= Number(ratingFilter)
      );
    }

    return result;
  }, [technicians, resultType, priceFilter, locationFilter, ratingFilter]);

  return (
    <>
      <Header />

      <div className="container technicians-service-page">
        <h2>{service} Technicians</h2>

        <div className="tiny-filter-box">
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

        {loading ? (
          <p>Loading...</p>
        ) : resultType === "stores" ? (
          <p className="history-empty">Store results will be connected later.</p>
        ) : filteredTechnicians.length === 0 ? (
          <p className="history-empty">No technicians found.</p>
        ) : (
          <div className="cards-grid">
            {filteredTechnicians.map((tech) => (
              <div
                className="card technician-service-card"
                key={tech.technicianId}
              >
                <h3>{tech.name}</h3>

                <p>{tech.service}</p>

                <p>
                  Experience: {tech.experience} years
                  <br />
                  Location: {tech.city || "Not provided"}
                  <br />
                  Price: {Number(tech.price_per_hour || 0).toFixed(2)} JOD/hr
                  <br />
                  Rating: ⭐ {Number(tech.rating || 0).toFixed(1)}
                </p>

                <div className="technician-card-actions">
                  <button
                    className="primary"
                    onClick={() => navigate(`/technician/${tech.technicianId}`)}
                  >
                    View Profile
                  </button>

                  <button
                    className="primary"
                    onClick={() => navigate(`/request/${tech.technicianId}`)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default TechniciansByService;