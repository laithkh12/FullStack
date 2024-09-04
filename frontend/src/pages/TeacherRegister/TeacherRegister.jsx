import React from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherRegister.css";
import Sidebar from "../../Components/Sidebar/Sidebar";

/**
 * TeacherRegister Component
 *
 * This component represents a teacher-specific page with a welcome message,
 * a sidebar for navigation, and a logout button.
 *
 */
function TeacherRegister() {
  const navigate = useNavigate();

  /**
   * Retrieve first name from local storage
   */
  const email = localStorage.getItem("email") || "there";

  /**
   * Function to handle logout
   */
  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();
    // Navigate to the home page
    navigate("/");
  };

  return (
    <div className="teacher-page">
      <div className="welcome-message">{`Hi, ${email}`}</div>
      <Sidebar />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default TeacherRegister;
