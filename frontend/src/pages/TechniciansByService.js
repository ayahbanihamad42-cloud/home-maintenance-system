import React, { useEffect, useState } from "react"; 
import { useParams } from "react-router-dom";
import TechnicianCard from "../components/TechnicianCard";
import { getTechniciansByService } from "../services/technicianService";
import { getStoreServices } from "../services/storeService"; // import جديد
import { getTechnicianServices } from "../services/technicianService"; // import جديد

function TechniciansByService() {
  const { service } = useParams();
  const [technicians, setTechnicians] = useState([]);
  const [filter, setFilter] = useState("all"); // store | technician | all
  const [storeServices, setStoreServices] = useState([]);
  const [technicianServices, setTechnicianServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const techs = await getTechniciansByService(service);
        setTechnicians(techs);

        const store = await getStoreServices(service);
        setStoreServices(store);

        const techServices = await getTechnicianServices(service);
        setTechnicianServices(techServices);

      } catch (error) {
        alert(error.message);
      }
    };
    fetchData();
  }, [service]);

  const filteredTechnicians = () => {
    if(filter === "store") return storeServices;
    if(filter === "technician") return technicianServices;
    return technicians;
  }

  return (
    <div>
      <h2>Technicians & Services for {service}</h2>

      <div>
        <label>Filter: </label>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="store">Store Services</option>
          <option value="technician">Technician Services</option>
        </select>
      </div>

      <div>
        {filteredTechnicians().map(item => (
          <TechnicianCard key={item.id} technician={item} />
        ))}
      </div>
    </div>
  );
}

export default TechniciansByService;
