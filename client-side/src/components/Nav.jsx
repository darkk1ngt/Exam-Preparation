import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Nav(props) {
  const { isLoggedIn } = useAuth();

  return (
    <nav>
      <h2>
        <Link to="/">Express Restaurant</Link>
      </h2>
      <div id="right-nav">
        {isLoggedIn ? (
          <Link to="/logout">Logout</Link>
        ) : (
          <Link to="/login">Login</Link>
        )}
        <Link to="/profile">Profile</Link>
      </div>
    </nav>
  );
}

export default Nav;
