import React from "react";
import "./MobileApp.css";
import { assets } from "../../assets/assets.js";

/**
 * MobileApp Component
 *
 * This component renders a section for downloading the school app from the App Store and Play Store.
 *
 * @component
 */
function MobileApp() {
  return (
    <div className="app-download" id="app-download">
      <p>
        For Better Experince Download <br />
        School App
      </p>
      <div className="app-download-platforms">
        <img src={assets.app_store} alt="" />
        <img src={assets.play_store} alt="" />
      </div>
    </div>
  );
}

export default MobileApp;
