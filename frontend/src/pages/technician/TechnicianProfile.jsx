import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import Header from "../../components/common/Header";

function TechnicianProfile() {
  const { technicianId } = useParams();
  const navigate = useNavigate();

  const [tech, setTech] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loadingTech, setLoadingTech] = useState(true);
  const [loadingReq, setLoadingReq] = useState(true);
  const [error, setError] = useState("");

  const requestEndpoints = useMemo(
    () => [
      `/technicians/${technicianId}/requests`,
      `/technician/${technicianId}/requests`,
      `/requests/technician/${technicianId}`,
      `/requests?technicianId=${technicianId}`,
    ],
    [technicianId]
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchTechAndRequests() {
      setError("");

      // 1) Technician profile
      try {
        setLoadingTech(true);
        const resTech = await API.get(`/technicians/${technicianId}`);
        if (!cancelled) setTech(resTech.data);
      } catch (e) {
        if (!cancelled) {
          setError(
            e?.response?.data?.message ||
              "Failed to load technician profile. Check API route."
          );
        }
      } finally {
        if (!cancelled) setLoadingTech(false);
      }

      // 2) Assigned requests (try multiple endpoints to match your backend)
      try {
        setLoadingReq(true);

        let reqData = null;
        let lastErr = null;

        for (const url of requestEndpoints) {
          try {
            const resReq = await API.get(url);
            reqData = resReq.data;
            break;
          } catch (err) {
            lastErr = err;
          }
        }

        if (reqData === null) {
          throw lastErr || new Error("No endpoint matched for requests");
        }

        // Normalize: some APIs return { data: [...] } or { requests: [...] }
        const list =
          Array.isArray(reqData)
            ? reqData
            : Array.isArray(reqData?.data)
            ? reqData.data
            : Array.isArray(reqData?.requests)
            ? reqData.requests
            : [];

        if (!cancelled) setRequests(list);
      } catch (e) {
        if (!cancelled) {
          setError((prev) =>
            prev
              ? prev
              : e?.response?.data?.message ||
                "Failed to load assigned requests. Check backend endpoint."
          );
          setRequests([]);
        }
      } finally {
        if (!cancelled) setLoadingReq(false);
      }
    }

    if (technicianId) fetchTechAndRequests();

    return () => {
      cancelled = true;
    };
  }, [technicianId, requestEndpoints]);

  const loading = loadingTech || loadingReq;

  if (loading) {
    return (
      <>
        <Header />
        <div className="profile-container">
          <div className="loader">Loading...</div>
        </div>
      </>
    );
  }

  if (!tech) {
    return (
      <>
        <Header />
        <div className="profile-container">
          <p style={{ marginTop: 16 }}>
            Technician not found.{" "}
            <button onClick={() => navigate(-1)}>Go Back</button>
          </p>
          {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="profile-container">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>{tech.name}</h2>
            <p style={{ marginTop: 0, opacity: 0.8 }}>
              {tech.city ? `City: ${tech.city}` : ""}
              {tech.phone ? ` | Phone: ${tech.phone}` : ""}
            </p>
          </div>

          <button onClick={() => navigate(-1)} style={{ height: 40 }}>
            Back
          </button>
        </div>

        <h2 className="section-title" style={{ marginTop: 18 }}>
          Assigned Requests
        </h2>

        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

        <div className="panel">
          {requests.length === 0 ? (
            <p>No assigned requests.</p>
          ) : (
            requests.map((r) => (
              <div key={r.id || r.request_id} className="card">
                <p>
                  <b>Service:</b> {r.service || r.service_name || "-"}
                </p>
                <p>
                  <b>Status:</b> {r.status || "-"}
                </p>
                <p>
                  <b>Date:</b> {r.scheduled_date || r.date || "-"}
                </p>
                <p>
                  <b>Time:</b> {r.scheduled_time || r.time || "-"}
                </p>

                {/* إذا بدك زر يفتح تفاصيل الطلب */}
                {/* <button onClick={() => navigate(`/request/${r.id}`)}>View</button> */}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default TechnicianProfile;
