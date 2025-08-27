import React from "react";
import { MyContext } from "../../Context/MyContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MyStudents.module.css";
import { TeacherUpcomingAndCanceledSessions } from "./TeacherUpcomingAndCanceledSessions";
import ActiveAndDeactiveStudents from "./ActiveAndDeactiveStudents";
import { MyStudentBlogs } from "./MyStudentBlogs";
import { UpcomingAndCanceledSessions } from "../home/UpcomingAndCanceledSessions";
import TopHeading from "../../Components/TopHeading/TopHeading";

const MyStudents = () => {

  return (
    <React.Fragment>
      
      <TopHeading>My Students</TopHeading>

        <MyStudentBlogs />

      <div className={styles.dashboardContainer} >

      

        <ActiveAndDeactiveStudents />

      <UpcomingAndCanceledSessions />

      </div>





    </React.Fragment>
  );
};

export default MyStudents;
