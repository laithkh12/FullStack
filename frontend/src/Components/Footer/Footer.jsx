import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";

/**
 * Footer Component
 *
 * This component represents the footer section of the website.
 * It includes company information, customer support details, social media icons,
 * and navigation links.
 *
 * @component
 */
function Footer() {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo2} alt="" />
          <p>
            Customer Support: support@support.com
            <br /> Call Us: +97254674734
            <br />
            Live Chat Available
          </p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.twitter_icon} alt="" />
            <img src={assets.linkedin_icon} alt="" />
          </div>
        </div>

        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="footer-content-right">
          <h2>Get in Touch</h2>
          <ul>
            <li>+9725480483</li>
            <li>contact@school.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2024-2025 © - All Rights Reserved
      </p>
    </div>
  );
}

export default Footer;
