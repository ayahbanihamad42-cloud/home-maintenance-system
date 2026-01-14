// Import React and required hooks
import React, { useEffect, useState } from "react";

// Import hook to read URL parameters
import { useParams } from "react-router-dom";

// Import technician and store card components
import TechnicianCard from "../../components/cards/TechnicianCard";
import StoreCard from "../../components/cards/StoreCard";

// Import API services
import { getTechnicians } from "../../services/technicianService";
import { getStoresByService } from "../../services/storeService";

// Import common header
import Header from "../../components/common/Header";

// Component to display technicians and stores by service
function TechniciansByService() {

  // Get service name from URL
  const { service } = useParams();

  // State to store technicians list
  const [technicians, setTechnicians] = useState([]);

  // State to store stores list
  const [stores, setStores] = useState([]);

  // State to control filter type (all, technician, store)
  const [filter, setFilter] = useState("all");

  // State to control loading indicator
  const [loading, setLoading] = useState(true);

  // Fetch technicians and stores when service changes
  useEffect(() => {

    // Enable loading state
    setLoading(true);

    // Fetch technicians and stores in parallel
    Promise.all([
      getTechnicians(service),
      getStoresByService(service)
    ])
      .then(([techs, storeList]) => {

        // Log fetched data for debugging
        console.log("Technicians:", techs);
        console.log("Stores:", storeList);

        // Update state with fetched data
        setTechnicians(techs);
        setStores(storeList);
      })
      .catch((err) => {

        // Handle API errors
        console.error("Error fetching data:", err);
        setTechnicians([]);
        setStores([]);
      })
      .finally(() => setLoading(false)); // Stop loading

  }, [service]);

  // Build list based on selected filter
  const list =
    filter === "store"
      ? stores
      : filter === "technician"
      ? technicians
      : [...technicians, ...stores];

  return (
    <>
      {/* Page header */}
      <Header />

      <div className="container">

        {/* Page title */}
        <h2>{service} Options</h2>

        {/* Filter dropdown */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="technician">Technicians</option>
          <option value="store">Stores</option>
        </select>

        {/* Conditional rendering based on loading and results */}
        {loading ? (
          <p>Loading {service} options...</p>
        ) : list.length === 0 ? (
          <p>No {service} options found.</p>
        ) : (
          <div className="cards-grid">

            {/* Render technician or store cards */}
            {list.map((item) =>
              "technicianId" in item ? (
                <TechnicianCard
                  key={item.technicianId}
                  technician={item}
                />
              ) : (
                <StoreCard
                  key={item.storeId}
                  store={item}
                />
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Export component
export default TechniciansByService;

