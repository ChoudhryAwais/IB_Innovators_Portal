import React from "react";
import styles from "./JobOpening.module.css";
import { JobBlogs } from "./JobBlogs";
import { JobList } from "./JobList";
import { TeacherSubjects } from "./TeacherSubjects";
import TopHeading from "../../../Components/TopHeading/TopHeading";

const JobOpening = () => {

  return (
    <React.Fragment>
      
      <TopHeading>Job Openings</TopHeading>


        <JobBlogs />

      <div className={styles.dashboardContainer} >

      

        <JobList />
      <TeacherSubjects />

      </div>

    </React.Fragment>
  );
};

export default JobOpening;
