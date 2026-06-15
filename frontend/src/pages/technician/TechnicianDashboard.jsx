import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../components/common/Header";

function TechnicianDashboard() {
  const { t } = useTranslation();

  return (
    <>
      <Header />

      <main className="dashboard-container technician-dashboard">
        <section className="page-hero">
          <h1>{t("techDashboard.title")}</h1>
          <p>{t("techDashboard.subtitle")}</p>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-card">
            <div className="dashboard-icon">📋</div>
            <div>
              <h3>{t("techDashboard.assignedRequests")}</h3>
              <p>{t("techDashboard.assignedRequestsDesc")}</p>
              <Link className="primary dashboard-link" to="/technician/requests">
                {t("techDashboard.viewRequests")}
              </Link>
            </div>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-icon">🕒</div>
            <div>
              <h3>{t("techDashboard.availability")}</h3>
              <p>{t("techDashboard.availabilityDesc")}</p>
              <Link className="primary dashboard-link" to="/technician/availability">
                {t("techDashboard.setAvailability")}
              </Link>
            </div>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-icon">🖼️</div>
            <div>
              <h3>{t("techDashboard.workGallery")}</h3>
              <p>{t("techDashboard.workGalleryDesc")}</p>
              <Link className="primary dashboard-link" to="/profile">
                {t("techDashboard.manageGallery")}
              </Link>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}

export default TechnicianDashboard;