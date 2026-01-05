import React, { useEffect, useState } from "react";
import { getUserRequests } from "../../services/maintenanceService";
import MaintenanceCard from "../../components/cards/MaintenanceCard";
import Header from "../../components/common/Header";

function MaintenanceHistory() {
  const [requests, setRequests] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) return;
    getUserRequests().then(res => setRequests(res));
  }, [user]);

  return (
    <>
      <Header />
      <div className="container">
        <h2>Request History</h2>
        {requests.map(r => (
          <MaintenanceCard key={r.id} request={r} />
        ))}
      </div>
    </>
  );
}

export default MaintenanceHistory;
