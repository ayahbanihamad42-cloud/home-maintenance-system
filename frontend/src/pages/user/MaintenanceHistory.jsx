// Import React and required hooks
import React, { useEffect, useState } from "react";

// Import services to fetch maintenance requests and ratings
import { getUserRequests } from "../../services/maintenanceService";
import { getRatingByRequest } from "../../services/ratingService";

// Import maintenance card component
import MaintenanceCard from "../../components/cards/MaintenanceCard";

// Import common header
import Header from "../../components/common/Header";

// Component to display user's maintenance request history
function MaintenanceHistory() {
  // State to store maintenance requests
  const [requests, setRequests] = useState([]);

  // State to store ratings mapped by request ID
  const [ratingsByRequest, setRatingsByRequest] = useState({});

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch user's maintenance requests when component mounts
  useEffect(() => {
    if (!user) return;

    // Get all requests created by the user
    getUserRequests()
      .then((data) => setRequests(data || []))
      .catch(() => setRequests([]));
  }, [user]);

  // Fetch ratings for each maintenance request
  useEffect(() => {
    if (!requests.length) return;

    // Fetch ratings for all requests in parallel
    Promise.all(
      requests.map((request) =>
        getRatingByRequest(request.id)
          .then((rating) => ({
            requestId: request.id,
            rating
          }))
          .catch(() => ({
            requestId: request.id,
            rating: null
          }))
      )
    ).then((results) => {
      // Build an object mapping requestId -> rating
      const nextRatings = {};
      results.forEach(({ requestId, rating }) => {
        nextRatings[requestId] = rating;
      });

      // Update ratings state
      setRatingsByRequest(nextRatings);
    });
  }, [requests]);

  return (
    <>
      {/* Page header */}
      <Header />

      <div className="container">
        {/* Page title */}
        <h2>Request History</h2>

        {/* Render maintenance cards with their ratings */}
        {requests.map((r) => (
          <MaintenanceCard
            key={r.id}
            request={r}
            rating={ratingsByRequest[r.id]}
          />
        ))}
      </div>
    </>
  );
}

// Export component
export default MaintenanceHistory;
