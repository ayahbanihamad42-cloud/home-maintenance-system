import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TechnicianCard from "../../components/cards/TechnicianCard";
import StoreCard from "../../components/cards/StoreCard";
import { getTechniciansByService } from "../../services/technicianService";
import { getStoreServices } from "../../services/storeService";

function TechniciansByService() {
  const { service } = useParams();
  const [technicians, setTechnicians] = useState([]);
  const [stores, setStores] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getTechniciansByService(service).then(setTechnicians);
    getStoreServices(service).then(setStores);
  }, [service]);

  const list =
    filter === "store" ? stores :
    filter === "technician" ? technicians :
    [...technicians, ...stores];

  return (
    <div className="container">
      <h2>{service} Options</h2>

      <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="technician">Technicians</option>
        <option value="store">Stores</option>
      </select>

      <div className="cards-grid">
        {list.map(item =>
          "technicianId" in item ? (
            <TechnicianCard key={item.technicianId} technician={item} />
          ) : (
            <StoreCard key={item.storeId} store={item} />
          )
        )}
      </div>
    </div>
  );
}

export default TechniciansByService;
