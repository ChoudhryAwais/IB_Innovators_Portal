import React from "react";
import { MyContext } from "../../../Context/MyContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfileAndFinance.module.css";
import { Profile } from "./Profile";
import TeacherInvoices from "./TeacherInvoices";
import TopHeading from "../../../Components/TopHeading/TopHeading";

const ProfileAndFinance = () => {

  return (
    <React.Fragment>
      
      <TopHeading>Profile & Finance</TopHeading>



      <div className={styles.dashboardContainer} >

      <Profile />


      <TeacherInvoices /> 
      </div>
      <div id="recaptcha-container"></div>

    </React.Fragment>
  );
};

export default ProfileAndFinance;
