import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../components/common/Header";
import {
  getMyTechnicianRequests,
  updateTechnicianRequestStatus,
} from "../../services/technicianService.jsx";

const requestStatuses = [
  "all",
  "pending",
  "accepted",
  "on_the_way",
  "in_progress",
  "completed",
  "rejected",
  "cancelled",
];

function TechnicianRequests() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("newest");
  const [updatingId, setUpdatingId] = useState(null);

  const formatDateOnly = (value) => (value ? String(value).slice(0, 10) : "-");
  const formatTimeOnly = (value) => (value ? String(value).slice(0, 8) : "-");

  const getUserLocation = (item) => {
    const lat = Number(item?.user_location_lat);
    const lng = Number(item?.user_location_lng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }

    return null;
  };

  const getTechnicianLocation = (item) => {
    const lat = Number(
      item?.technician_location_lat ||
        item?.technician_lat ||
        item?.current_lat ||
        item?.latitude
    );

    const lng = Number(
      item?.technician_location_lng ||
        item?.technician_lng ||
        item?.current_lng ||
        item?.longitude
    );

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }

    return null;
  };

  const getStaticMapSrc = (loc) =>
    `https://www.google.com/maps?q=${loc.lat},${loc.lng}&z=17&output=embed`;

  const loadRequests = async () => {
    try {
      setMessage(null);

      const data = await getMyTechnicianRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setRequests([]);
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || t("techRequests.failedToLoad"),
      });
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => resolve(null),
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );
    });
  };

  const updateStatus = async (requestId, status) => {
    try {
      setUpdatingId(requestId);
      setMessage(null);

      const cleanStatus = String(status || "").toLowerCase();
      let payload = { status: cleanStatus };

      if (cleanStatus === "on_the_way") {
        const loc = await getBrowserLocation();

        if (!loc) {
          setMessage({
            type: "error",
            title: t("techRequests.locationRequired"),
            body: t("techRequests.allowLocationAccess"),
          });

          return;
        }

        payload = {
          status: cleanStatus,
          technician_location_lat: loc.lat,
          technician_location_lng: loc.lng,
        };
      }

      /*
        مهم:
        technicianService عندك يستقبل argumentين فقط.
        لذلك لازم نبعت status + location بنفس object واحد.
      */
      await updateTechnicianRequestStatus(requestId, payload);

      setMessage({
        type: "success",
        title: t("techRequests.updated"),
        body:
          cleanStatus === "on_the_way"
            ? t("techRequests.statusUpdatedLocation")
            : t("techRequests.statusUpdated"),
      });

      await loadRequests();
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body:
          err?.response?.data?.message ||
          t("techRequests.failedToUpdate"),
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (statusFilter !== "all") {
      result = result.filter(
        (item) => String(item.status || "").toLowerCase() === statusFilter
      );
    }

    if (dateFilter) {
      result = result.filter(
        (item) => formatDateOnly(item.scheduled_date) === dateFilter
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter((item) =>
        [
          item.service,
          item.status,
          item.user_name,
          item.customer_name,
          item.user_phone,
          item.city,
          item.location_note,
          item.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    result.sort((a, b) =>
      sortFilter === "oldest"
        ? Number(a.id || 0) - Number(b.id || 0)
        : Number(b.id || 0) - Number(a.id || 0)
    );

    return result;
  }, [requests, statusFilter, dateFilter, search, sortFilter]);

  const nextButton = (item) => {
    const status = String(item.status || "").toLowerCase();
    const disabled = updatingId === item.id;

    if (status === "pending") {
      return (
        <div className="request-actions">
          <button
            className="primary"
            disabled={disabled}
            onClick={() => updateStatus(item.id, "accepted")}
          >
            {disabled ? "..." : t("techRequests.accept")}
          </button>

          <button
            className="danger-btn"
            disabled={disabled}
            onClick={() => updateStatus(item.id, "rejected")}
          >
            {t("techRequests.reject")}
          </button>
        </div>
      );
    }

    if (status === "accepted" || status === "confirmed") {
      return (
        <button
          className="primary"
          disabled={disabled}
          onClick={() => updateStatus(item.id, "on_the_way")}
        >
          {disabled ? t("techRequests.gettingLocation") : t("techRequests.onTheWay")}
        </button>
      );
    }

    if (status === "on_the_way") {
      return (
        <button
          className="primary"
          disabled={disabled}
          onClick={() => updateStatus(item.id, "in_progress")}
        >
          {t("techRequests.inProgress")}
        </button>
      );
    }

    if (status === "in_progress") {
      return (
        <button
          className="primary"
          disabled={disabled}
          onClick={() => updateStatus(item.id, "completed")}
        >
          {t("techRequests.completed")}
        </button>
      );
    }

    return null;
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFilter("");
    setSortFilter("newest");
  };

  return (
    <>
      <Header />

      <main className="requests-container" style={{ paddingTop: "135px" }}>
        <section className="page-hero">
          <h1>{t("techRequests.title")}</h1>
          <p>{t("techRequests.subtitle")}</p>
        </section>

        <section className="request-filters">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("techRequests.searchPlaceholder")}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {requestStatuses.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? t("techRequests.allStatuses") : status.replaceAll("_", " ")}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />

          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
          >
            <option value="newest">{t("techRequests.newest")}</option>
            <option value="oldest">{t("techRequests.oldest")}</option>
          </select>

          <button className="clear-filter-btn" onClick={clearFilters}>
            {t("techRequests.clearFilters")}
          </button>
        </section>

        {message && (
          <section
            className={message.type === "error" ? "auth-error" : "auth-success"}
          >
            <strong>{message.title}</strong>
            <div>{message.body}</div>
          </section>
        )}

        {filteredRequests.length === 0 ? (
          <section className="card">
            <h3>{t("techRequests.noRequests")}</h3>
          </section>
        ) : (
          <section className="request-list">
            {filteredRequests.map((item) => {
              const userLoc = getUserLocation(item);
              const techLoc = getTechnicianLocation(item);
              const status = String(item.status || "").toLowerCase();

              return (
                <article className="request-card" key={item.id}>
                  <div className="request-card-header">
                    <h3>{item.service || "-"}</h3>
                    <span className="status-badge">
                      {String(item.status || "-").replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="request-details-grid">
                    <p>
                      <strong>{t("techRequests.userLabel")}</strong>{" "}
                      {item.user_name || item.customer_name || "-"}
                    </p>

                    <p>
                      <strong>{t("techRequests.phoneLabel")}</strong> {item.user_phone || "-"}
                    </p>

                    <p>
                      <strong>{t("techRequests.dateLabel")}</strong>{" "}
                      {formatDateOnly(item.scheduled_date)}
                    </p>

                    <p>
                      <strong>{t("techRequests.timeLabel")}</strong>{" "}
                      {formatTimeOnly(item.scheduled_time)}
                    </p>

                    <p>
                      <strong>{t("techRequests.createdLabel")}</strong>{" "}
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "-"}
                    </p>

                    <p>
                      <strong>{t("techRequests.noteLabel")}</strong>{" "}
                      {item.location_note || item.city || "-"}
                    </p>

                    <p>
                      <strong>{t("techRequests.paymentLabel")}</strong> {item.payment_method || "-"}
                    </p>

                    <p>
                      <strong>{t("techRequests.totalLabel")}</strong>{" "}
                      {Number(item.total_price || item.amount || 0).toFixed(2)}{" "}
                      JOD
                    </p>
                  </div>

                  {userLoc && (
                    <div className="map-card">
                      <h3>{t("techRequests.customerLocation")}</h3>
                      <iframe
                        title={`customer-location-${item.id}`}
                        src={getStaticMapSrc(userLoc)}
                        width="100%"
                        height="230"
                        style={{ border: 0 }}
                        loading="lazy"
                      />
                    </div>
                  )}

                  {status === "on_the_way" && techLoc && (
                    <div className="map-card">
                      <h3>{t("techRequests.liveLocation")}</h3>
                      <iframe
                        title={`technician-location-${item.id}`}
                        src={getStaticMapSrc(techLoc)}
                        width="100%"
                        height="230"
                        style={{ border: 0 }}
                        loading="lazy"
                      />
                    </div>
                  )}

                  {status === "accepted" && (
                    <div className="auth-success">
                      {t("techRequests.liveLocationNote")}
                    </div>
                  )}

                  <p className="request-description">
                    {item.description || "-"}
                  </p>

                  {nextButton(item)}
                </article>
              );
            })}
          </section>
        )}
      </main>
    </>
  );
}

export default TechnicianRequests;