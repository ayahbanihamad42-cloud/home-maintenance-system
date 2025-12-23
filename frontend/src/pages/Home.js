import { useNavigate } from "react-router-dom";

const Home = () => {
  const nav = useNavigate();

  return (
    <div className="page">
      <h2>Select Service</h2>
      <div className="service-grid">
        <button onClick={() => nav("/technicians/1")}>Electricity</button>
        <button onClick={() => nav("/technicians/2")}>Plumbing</button>
        <button onClick={() => nav("/technicians/3")}>Painting</button>
        <button onClick={() => nav("/technicians/4")}>Decoration</button>
      </div>
    </div>
  );
};

export default Home;
