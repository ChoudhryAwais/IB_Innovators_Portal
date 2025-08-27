import React from "react";
import { MyContext } from "../../../Context/MyContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MySubscriptions.module.css";
import { StudentUpcomingAndCanceledSessions } from "../../home/StudentDashboardPages/StudentUpcomingAndCanceledSessions";
import { MySubscriptionBlogs } from "./MySubscriptionBlogs";
import ActiveAndDeactiveStudents from "./ActiveAndDeactiveStudents";
import TopHeading from "../../../Components/TopHeading/TopHeading";

const MySubscriptions = () => {



  return (
    <React.Fragment>
      
      <TopHeading>My Subscriptions</TopHeading>

        <MySubscriptionBlogs />

      <div className={styles.dashboardContainer} >

        <ActiveAndDeactiveStudents />

      <StudentUpcomingAndCanceledSessions />

      </div>





    </React.Fragment>
  );
};

export default MySubscriptions;
