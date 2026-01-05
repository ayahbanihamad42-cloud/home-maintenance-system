/**
 * TechnicianRequests Page
 * Displays assigned maintenance requests
 */

import { useEffect, useState } from "react";
import API from "../../services/api";

function TechnicianRequests() {
  const [requests, setRequests] = useState([]);
  const techId = JSON.parse(localStorage.getItem("user")).id;

  useEffect(() => {
    API.get(`/technicians/${techId}/requests`)
      .then(res => setRequests(res.data));
  }, []);

  return (
    <div className="container">
      <h2>Assigned Requests</h2>

      {requests.map(r => (
        <div key={r.id} className="card">
          <p><b>Service:</b> {r.service}</p>
          <p><b>Status:</b> {r.status}</p>
        </div>
      ))}
    </div>
  );
}

export default TechnicianRequests;
