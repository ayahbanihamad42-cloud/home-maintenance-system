import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TechnicianCard from "../components/TechnicianCard";
import { getTechniciansByService } from "../services/technicianService";
import { getStoreServices } from "../services/storeService";
import { getTechnicianServices } from "../services/technicianService";

function TechniciansByService() {
  const { service } = useParams();
  const [technicians, setTechnicians] = useState([]);
  const [filter, setFilter] = useState("all");
  const [storeServices, setStoreServices] = useState([]);
  const [technicianServices, setTechnicianServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setTechnicians(await getTechniciansByService(service));
      setStoreServices(await getStoreServices(service));
      setTechnicianServices(await getTechnicianServices(service));
    };
    fetchData();
  }, [service]);

  const filtered = () => {
    if(filter === "store") return storeServices;
    if(filter === "technician") return technicianServices;
    return technicians;
  };

  return (
    <div className="container">
      <h2>{service} Technicians</h2>

      <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="store">Store</option>
        <option value="technician">Technician</option>
      </select>

      {filtered().map(t => (
        <TechnicianCard key={t.id} technician={t} />
      ))}
    </div>
  );
}

export default TechniciansByService;
