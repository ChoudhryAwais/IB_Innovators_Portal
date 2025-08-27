import React from "react";
import "./home.css";
import MainImage from "../../Components/PlainHeroSection/MainImage";
import { MyContext } from "../../Context/MyContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  onSnapshot,
  where
} from "firebase/firestore";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";

const Home = () => {
  const {
    userType
  } = useContext(MyContext);


  return (
    <React.Fragment>
      {userType === "admin" && <AdminDashboard />}
      {userType === "student" && <StudentDashboard />}
      {userType === "parent" && <StudentDashboard />}
      {userType === "teacher" && <TeacherDashboard />}
    </React.Fragment>
  );
};

export default Home;
