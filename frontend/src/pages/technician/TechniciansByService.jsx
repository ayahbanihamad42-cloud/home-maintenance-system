import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TechnicianCard from "../../components/cards/TechnicianCard";
import StoreCard from "../../components/cards/StoreCard";
import { getTechnicians } from "../../services/technicianService";
import { getStoresByService } from "../../services/storeService";
import Header from "../../components/common/Header";

function TechniciansByService() {
  const { service } = useParams();
  const [technicians, setTechnicians] = useState([]);
  const [stores, setStores] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTechnicians(service),
      getStoresByService(service)
    ])
      .then(([techs, storeList]) => {
        console.log("Technicians:", techs);
        console.log("Stores:", storeList);
        setTechnicians(techs);
        setStores(storeList);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setTechnicians([]);
        setStores([]);
      })
      .finally(() => setLoading(false));
  }, [service]);

  const list =
    filter === "store"
      ? stores
      : filter === "technician"
      ? technicians
      : [...technicians, ...stores];

  return (
    <>
      <Header />
      <div className="container">
        <h2>{service} Options</h2>

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="technician">Technicians</option>
          <option value="store">Stores</option>
        </select>

        {loading ? (
          <p>Loading {service} options...</p>
        ) : list.length === 0 ? (
          <p>No {service} options found.</p>
        ) : (
          <div className="cards-grid">
            {list.map((item) =>
              "technicianId" in item ? (
                <TechnicianCard key={item.technicianId} technician={item} />
              ) : (
                <StoreCard key={item.storeId} store={item} />
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default TechniciansByService;
