import React, { useEffect, useState } from "react";
import { getUserRequests } from "../../services/maintenanceService";
import MaintenanceCard from "../../components/cards/MaintenanceCard";

function MaintenanceHistory() {
  const [requests, setRequests] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    getUserRequests(user.id).then(res => setRequests(res.data));
  }, [user.id]);

  return (
    <div className="container">
      <h2>Request History</h2>
      {requests.map(r => (
        <MaintenanceCard key={r.id} request={r} />
      ))}
    </div>
  );
}

export default MaintenanceHistory;
