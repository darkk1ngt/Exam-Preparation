import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";

function Profile(props) {
  const { setMessage } = props;
  const { isLoggedIn, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setMessage("Please login to view your profile.", "error");
      navigate("/login");
      return;
    }

    // Fetch user profile information
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (response.ok) {
          setUserInfo(data.user);
        } else {
          setMessage(data.message, "error");
          navigate("/login");
        }
      } catch (error) {
        setMessage("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn, navigate, setMessage]);

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message, "success");
        await checkAuthStatus();
        navigate("/");
      } else {
        setMessage(data.message, "error");
      }
    } catch (error) {
      setMessage("Failed to delete account", "error");
    }
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="profile-container">
        <h1>My Profile</h1>

        {userInfo && (
          <div className="profile-info">
            <div className="info-section">
              <h2>Account Information</h2>
              <div className="info-item">
                <label>User ID:</label>
                <span>{userInfo.id}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{userInfo.email}</span>
              </div>
            </div>

            <div className="danger-zone">
              <h2>Danger Zone</h2>
              <p className="danger-warning">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-danger"
                >
                  Delete Account
                </button>
              ) : (
                <div className="delete-confirmation">
                  <p className="confirm-message">
                    Are you absolutely sure? This action cannot be undone.
                  </p>
                  <div className="confirm-buttons">
                    <button
                      onClick={handleDeleteAccount}
                      className="btn btn-danger"
                    >
                      Yes, Delete My Account
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
