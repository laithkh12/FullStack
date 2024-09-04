import React, { useState } from "react";
import Navbar from "./Components/Navbar/Navbar";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import StudentRegister from "./pages/StudentRegister/StudentRegister";
import TeacherRegister from "./pages/TeacherRegister/TeacherRegister";
import Footer from "./Components/Footer/Footer";
import LoginPopup from "./Components/LoginPopup/LoginPopup";
import AddClass from "./Components/AddClass/AddClass";
import AddStudent from "./Components/AddStudent/AddStudent";
import AttendanceCheck from "./Components/AttendanceCheck/AttendanceCheck";
import AddHomeWork from "./Components/AddHomeWork/AddHomeWork";
import ClassGrades from "./Components/ClassGrades/ClassGrades";
import StudentHomeWorks from "./Components/StudentHomeWorks/StudentHomeWorks";
import StudentGrades from "./Components/StudentGrades/StudentGrades";
import EditGrades from "./Components/EditGrades/EditGrades";
import GraphGrades from "./Components/GraphGrades/GraphGrades";
import { ToastContainer } from "react-toastify";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className="app">
        {/* Navbar component with setShowLogin prop */}
        <Navbar setShowLogin={setShowLogin} />
        <ToastContainer theme="dark" />
        {/* Routes for different pages */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student" element={<StudentRegister />} />
          <Route path="/teacher" element={<TeacherRegister />} />
          <Route path="/addClass" element={<AddClass />} />
          <Route path="/addStudent" element={<AddStudent />} />
          <Route path="/attendanceCheck" element={<AttendanceCheck />} />
          <Route path="/addHomeWork" element={<AddHomeWork />} />
          <Route path="/classGrades" element={<ClassGrades />} />
          <Route path="homeWorks" element={<StudentHomeWorks />} />
          <Route path="/studentGrades" element={<StudentGrades />} />
          <Route path="/editGrades" element={<EditGrades />} />
          <Route path="/graph" element={<GraphGrades />} />
        </Routes>
      </div>
      {/* Footer component */}
      <Footer />
    </>
  );
}

export default App;
