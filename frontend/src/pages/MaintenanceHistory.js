import React, { useEffect, useState } from "react";
import { getUserRequests } from "../services/maintenanceService";
import MaintenanceCard from "../components/MaintenanceCard";

function MaintenanceHistory() {
  const [requests, setRequests] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getUserRequests(user.id);
        setRequests(data);
      } catch (error) {
        alert(error.message);
      }
    };
    fetchRequests();
  }, [user.id]);

  return (
    <div className="container">
      <h2>Your Requests</h2>
      {requests.map(req => <MaintenanceCard key={req.id} request={req} />)}
    </div>
  );
}

export default MaintenanceHistory;
