import React, { useEffect, useState } from "react";
import { getUserRequests } from "../../services/maintenanceService";
import { getRatingByRequest } from "../../services/ratingService";
import MaintenanceCard from "../../components/cards/MaintenanceCard";
import Header from "../../components/common/Header";

function MaintenanceHistory() {
  const [requests, setRequests] = useState([]);
  const [ratingsByRequest, setRatingsByRequest] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) return;
    getUserRequests().then(res => setRequests(res));
  }, [user]);

  useEffect(() => {
    if (!requests.length) return;
    Promise.all(
      requests.map((request) =>
        getRatingByRequest(request.id)
          .then((rating) => ({ requestId: request.id, rating }))
          .catch(() => ({ requestId: request.id, rating: null }))
      )
    ).then((results) => {
      const nextRatings = {};
      results.forEach(({ requestId, rating }) => {
        nextRatings[requestId] = rating;
      });
      setRatingsByRequest(nextRatings);
    });
  }, [requests]);

  return (
    <>
      <Header />
      <div className="container">
        <h2>Request History</h2>
        {requests.map(r => (
          <MaintenanceCard key={r.id} request={r} rating={ratingsByRequest[r.id]} />
        ))}
      </div>
    </>
  );
}

export default MaintenanceHistory;
