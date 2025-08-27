import React from "react";
import "./home.css";
import { MyContext } from "../../Context/MyContext";
import { useContext } from "react";
import styles from "./TeacherDashboard.module.css";
import { StudentUpcomingAndCanceledSessions } from "./StudentDashboardPages/StudentUpcomingAndCanceledSessions";
import StudentMyTeachers from "./StudentDashboardPages/StudentMyTeachers";
import TopHeading from "../../Components/TopHeading/TopHeading";

const StudentDashboard = () => {
  const {
    userDetails
  } = useContext(MyContext);


  return (
    <React.Fragment>
      <TopHeading>Welcome back, {userDetails?.userName}!</TopHeading>

      <div className={styles.dashboardContainer} >

        <StudentMyTeachers />
      <StudentUpcomingAndCanceledSessions />

      </div>





    </React.Fragment>
  );
};

export default StudentDashboard;
