import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Logout(props) {
  const { setMessage } = props;
  const { checkAuthStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message, "success");
        await checkAuthStatus();
      } else {
        setMessage(data.message, "error");
      }
      navigate("/");
    };

    doLogout();
  }, [checkAuthStatus, navigate, setMessage]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Logging out...</h1>
      </div>
    </div>
  );
}

export default Logout;
