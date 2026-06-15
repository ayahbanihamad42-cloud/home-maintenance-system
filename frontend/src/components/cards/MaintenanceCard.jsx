   //React library
import React from "react";
import { useTranslation } from "react-i18next";

// Hook for page navigation
import { useNavigate } from "react-router-dom";

// Card component to display maintenance request info
function MaintenanceCard({ request, rating }) {

   // Initialize navigation
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="card">
      {/* Service name */}
      <h3 style={{color: 'var(--text-blue)'}}>{request.service}</h3>

      {/* Request status */}
      <div style={{ margin: '15px 0', fontWeight: 'bold' }}>
         {t("cards.status")} <span style={{color: request.status === 'completed' ? 'green' : 'orange'}}>{request.status}</span>
      </div>

       {/* Rating display */}
      {rating ? (
        <p><b>{t("cards.rating")}</b> {rating.rating} ⭐</p>
      ) : (
        <p><b>{t("cards.rating")}</b> {t("cards.notSubmitted")}</p>
      )}

        {/* Navigate to review details */}
      <button className="primary" onClick={() => navigate(`/review/${request.id}`)}>
        {t("cards.viewDetails")}
      </button>
    </div>
  );
}
   // Export component
export default MaintenanceCard;
