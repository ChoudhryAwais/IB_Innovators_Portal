import React, { useContext, useState } from "react";
import styles from "./NewCourses.module.css";
import { JobBlogs } from "./JobBlogs";
import { JobList } from "./JobList";
import CoursesEnrolled from "./CoursesEnrolled";
import TopHeading from "../../../Components/TopHeading/TopHeading";
import { Button, Modal } from "@mui/material";
import { MyContext } from "../../../Context/MyContext";
import { CreateOrderForm } from "../../adminPages/createOrderPages/CreateOrderForm";
import { StudentRequestSubmissionForm } from "./StudentRequestSubmissionForm";

const NewCourses = () => {
  const { userDetails } = useContext(MyContext);
  const [showModal, setShowModal] = useState(false);

  function closingModal(e) {
    setShowModal(e);
  }

  return (
    <React.Fragment>
      <TopHeading>Courses & Requests</TopHeading>

      <JobBlogs />

      <div className={styles.dashboardContainer}>
        <JobList />

        <div style={{ flex: 1 }}>
          <div
            className="shadowAndBorder"
            style={{
              padding: "0.5rem",
              marginTop: "0px",
              flex: 1,
              height: "max-content",
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
              background: "rgba(255,255,255, 0.5)",
              backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
              WebkitBackdropFilter: "blur(4px)", // For Safari support,
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            <h2 style={{ textAlign: "left" }}>Request New Course</h2>
            <Button
              onClick={() => {
                setShowModal(true);
              }}
              style={{ width: "100%", marginTop: "20px" }}
              variant="outlined"
            >
              Generate Course Request
            </Button>
          </div>

          <div
            className="shadowAndBorder"
            style={{
              padding: "0.5rem",
              marginTop: "10px",
              flex: 1,
              height: "max-content",
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
              background: "rgba(255,255,255, 0.5)",
              backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
              WebkitBackdropFilter: "blur(4px)", // For Safari support,
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            <CoursesEnrolled />
          </div>
        </div>

        <Modal
          open={showModal}
          aria-labelledby="parent-modal-title"
          aria-describedby="parent-modal-description"
        >
          <StudentRequestSubmissionForm item={userDetails} handleClose={closingModal} />
        </Modal>

        {/* <TeacherSubjects /> */}
      </div>
    </React.Fragment>
  );
};

export default NewCourses;
