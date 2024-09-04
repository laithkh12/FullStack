import React from "react";
import "./StudentRegister.css";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../Components/StudentSidebar/StudentSidebar";

/**
 * StudentRegister Component
 *
 * This component represents a student-specific page with a welcome message,
 * a sidebar for navigation, and a logout button.
 *
 */
function StudentRegister() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email") || "there";

  /**
   * function to handle logout
   */
  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();
    // Navigate to the home page
    navigate("/");
  };
  return (
    <div className="student-page">
      <div className="welcome-message">{`Hi, ${email}`}</div>
      <StudentSidebar />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default StudentRegister;
