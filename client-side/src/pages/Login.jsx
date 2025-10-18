import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Login(props) {
  const { setMessage } = props;
  const { checkAuthStatus } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: event.target.email.value,
        password: event.target.password.value,
      }),
    });
    const data = await response.json();
    console.log(data);

    if (response.ok) {
      setMessage(data.message, "success");
      await checkAuthStatus();
      navigate("/");
    } else {
      setMessage(data.message, "error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>
        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="off"
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit">
            Sign In
          </button>
        </form>
        <div className="auth-links">
          <Link to="/register" className="auth-link">
            Don't have an account? <span>Register here</span>
          </Link>
          <Link to="/forgot" className="auth-link">
            <span>Forgot your password?</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
