import React from "react";
import styles from "./ProfileAndFinance.module.css";
import { Profile } from "./Profile";
import Balance from "./Balance";
import TopHeading from "../../../Components/TopHeading/TopHeading";

const ProfileAndFinanceStudent = () => {


  return (
    <React.Fragment>
      
      <TopHeading>Profile & Credit</TopHeading>



      <div className={styles.dashboardContainer} >

      <Profile />

        <Balance />
        
      </div>

      <div id="recaptcha-container"></div>
    </React.Fragment>
  );
};

export default ProfileAndFinanceStudent;
