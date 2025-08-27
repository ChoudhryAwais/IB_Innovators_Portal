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
import styles from "./TeacherDashboard.module.css";
import { TeacherFillingForm } from "./TeacherFillingForm";
import { UpcomingAndCanceledSessions } from "./UpcomingAndCanceledSessions";
import TeacherMyStudents from "./TeacherMyStudents";
import TopHeading from "../../Components/TopHeading/TopHeading";

const TeacherDashboard = () => {
  const {
    userDetails
  } = useContext(MyContext);


  return (
    <React.Fragment>
      <TopHeading>Welcome back, {userDetails?.userName}!</TopHeading>

      <div className={styles.dashboardContainer} >


        <TeacherMyStudents />

      <UpcomingAndCanceledSessions />

      </div>





    </React.Fragment>
  );
};

export default TeacherDashboard;
