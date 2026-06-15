   // React library
import React from "react";
import { useTranslation } from "react-i18next";

   // Hook for page navigation
import { useNavigate } from "react-router-dom";

   // Card component to display technician information
function TechnicianCard({ technician }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="card">
        {/* Technician name */}
      <h3>{technician.name}</h3>
        {/* Technician service */}
      <p>{technician.service}</p>
       {/* Technician experience */}
      <p>{technician.experience} {t("cards.years")}</p>

      {/* Navigate to booking request page */}
      <button
        className="primary"
        onClick={() => navigate(`/request/${technician.technicianId}`)}
      >
        {t("cards.booking")}
      </button>

      {/* Navigate to technician profile page */}
      <button
        className="secondary"
        onClick={() => navigate(`/technician/${technician.technicianId}`)}
      >
        {t("cards.viewProfile")}
      </button>
    </div>
  );
}
   // Export component
export default TechnicianCard;
