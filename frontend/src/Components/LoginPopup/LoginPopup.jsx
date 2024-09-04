import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import axios from "axios";

/**
 * LoginPopup Component
 *
 * This component renders a popup for user login and registration.
 * It allows users to either log in with existing credentials or register a new account.
 * Depending on the user's choice, it redirects to the appropriate dashboard (student or teacher).
 *
 * @component
 * @param {Object} props - The props object containing setShowLogin function to control visibility of the popup.
 */
function LoginPopup({ setShowLogin }) {
  const [currState, setCurrState] = useState("Login");
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    password: "",
    role: "Student",
  });
  const navigate = useNavigate();

  /**
   * Handles form input change
   *
   * @param {Event} e - The event object
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handles user registration
   *
   * @param {Event} e - The event object
   */
  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8081/register",
        formData
      );
      console.log(response.data);
      localStorage.setItem("email", formData.email);
      setShowLogin(false); // Close the popup on successful registration
      // Redirect to suitable page after successful registration
      navigate(formData.role === "Student" ? "/student" : "/teacher");
    } catch (error) {
      console.error("Error during registration:", error.response.data);
      alert(error.response.data.Error); // Display error message in alert
    }
  };

  /**
   * Handles user login
   *
   * @param {Event} e - The event object
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get("http://localhost:8081/login", {
        params: {
          email: formData.email,
          password: formData.password,
        },
      });
      console.log(response.data);
      // Save email to localStorage
      localStorage.setItem("email", formData.email);
      // Close the login popup
      setShowLogin(false);
      // Redirect to appropriate page based on the role
      navigate(response.data.role === "Student" ? "/student" : "/teacher");
    } catch (error) {
      console.error("Error during login:", error.response.data);
      alert(error.response.data.message); // Display error message in alert
    }
  };

  /**
   * Handles form submission based on current state (Login or Sign up)
   *
   * @param {Event} e - The event object
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (currState === "Sign up") {
      handleRegistration(e);
    } else {
      handleLogin(e);
    }
  };

  return (
    <div className="login-popup">
      <form className="login-popup-container" onSubmit={handleSubmit}>
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt=""
          />
        </div>
        <div className="login-popup-input">
          {currState === "Login" ? (
            <>
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Your Password"
                required
                onChange={handleChange}
              />
            </>
          ) : (
            <>
              <input
                type="text"
                name="fname"
                placeholder="First Name"
                required
                onChange={handleChange}
              />
              <input
                type="text"
                name="lname"
                placeholder="Last Name"
                required
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                onChange={handleChange}
              />
              <input
                type="text"
                name="phone"
                placeholder="Your Phone Number"
                required
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Your Password"
                required
                onChange={handleChange}
              />
              <select name="role" onChange={handleChange}>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
              </select>
            </>
          )}
        </div>

        <button type="submit">
          {currState === "Sign up" ? "Create Account" : "Login"}
        </button>
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, you agree to the terms of use & privacy policy</p>
        </div>
        {currState === "Login" ? (
          <p>
            Create a new account?
            <span onClick={() => setCurrState("Sign up")}> Click Here!</span>
          </p>
        ) : (
          <p>
            Already have an account?
            <span onClick={() => setCurrState("Login")}> Click Here!</span>
          </p>
        )}
      </form>
    </div>
  );
}

export default LoginPopup;
