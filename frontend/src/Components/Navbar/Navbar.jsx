import React from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets.js";
import { Link, useLocation } from "react-router-dom";

/**
 * Navbar Component
 *
 * This component renders a navigation bar with links based on the current route.
 *
 * @component
 * @param {Object} setShowLogin - Function to set the state of showing the login popup.
 */
function Navbar({ setShowLogin }) {
  const location = useLocation();

  /**
   * Function to determine whether to show the "Home" link.
   * The link is hidden on specific routes.
   *
   * @returns {boolean} Whether to show the "Home" link.
   */
  const showHomeLink = () => {
    // Check if the current path is neither "/student" nor "/teacher"
    return (
      location.pathname !== "/student" &&
      location.pathname !== "/teacher" &&
      location.pathname !== "/addClass" &&
      location.pathname !== "/addStudent" &&
      location.pathname !== "/attendanceCheck" &&
      location.pathname !== "/addHomeWork" &&
      location.pathname !== "/classGrades" &&
      location.pathname !== "/homeWorks" &&
      location.pathname !== "/studentGrades" &&
      location.pathname !== "/editGrades" &&
      location.pathname !== "/graph"
    );
  };

  return (
    <div className="navbar">
      <img src={assets.logo} alt="" className="logo" />
      <ul className="navbar-menu">
        {showHomeLink() && <Link to="/">Home</Link>}
        {/* <a href="/student">Student</a>
        <a href="/teacher">Teacher</a> */}
      </ul>
      {/* Conditionally render the sign in button */}
      {showHomeLink() && (
        <button onClick={() => setShowLogin(true)}>Sign in</button>
      )}
    </div>
  );
}

export default Navbar;
