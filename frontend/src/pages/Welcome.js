import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const nav = useNavigate();
  return (
    <div className="page">
      <h1>Welcome</h1>
      <Button text="Login" onClick={() => nav("/login")} />
      <Button text="Register" onClick={() => nav("/register")} />
    </div>
  );
};

export default Welcome;
