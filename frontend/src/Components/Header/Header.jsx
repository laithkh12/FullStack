import React from "react";
import "./Header.css";

/**
 * Header Component
 *
 * This component represents the header section of the website.
 * It provides a welcoming message and brief introduction to the school management system.
 *
 * @component
 */
function Header() {
  return (
    <div className="header">
      <div className="header-content">
        <h2>Unlock your teaching potential with our system.</h2>
        <p>
          Welcome to our school management system for teachers! We are thrilled
          to introduce this platform designed to streamline and enhance your
          teaching experience.
        </p>
      </div>
    </div>
  );
}

export default Header;
