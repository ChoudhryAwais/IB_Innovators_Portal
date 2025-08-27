import React, { useState, useEffect } from "react";
import "./ProcessedForms.css"; // make sure to create this file
import { MyContext } from "../../Context/MyContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  where,
  deleteDoc,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Button } from "@mui/material";
import { toast } from "react-hot-toast";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProcessedStudentForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState({});
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "processedStudentForm");
    const orderCollectionRef = collection(customDocRef, "processedStudentForm");

    const orderedQuery = query(
      orderCollectionRef,
      orderBy("processedAt", "desc")
    );

    // Listen for real-time updates
    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = [];
        querySnapshot.forEach((doc) => {
          fetchedData.push({ ...doc.data(), id: doc.id });
        });
        setStudentData(fetchedData);
      },
      (error) => {
        toast.error("Error fetching data");
      }
    );

    // Don't forget to unsubscribe when the component unmounts
    return () => {
      unsubscribe();
    };
  };

  const handleDeleteClick = async (student) => {
    try {
      setLoading(true);
      const prevOrdersRef = collection(db, "adminPanel");
      const prevCustomDocRef = doc(prevOrdersRef, "processedStudentForm");
      const prevOrderCollectionRef = collection(
        prevCustomDocRef,
        "processedStudentForm"
      );

      const studentDocRef = doc(prevOrderCollectionRef, student.id); // Get the document reference with the student.id
      await deleteDoc(studentDocRef); // Delete the document

      setShowModal(false);
      toast.success("Deleted successfully");
    } catch (error) {
      toast.error("Error deleting student form");
      console.error("Error deleting student form: ", error);
    } finally {
      setLoading(false);
    }
  };

  // PAST LESSONS PAGINATION
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = studentData?.slice(startIndex, endIndex);

  function formatDateTime(timestampData) {
    // Convert Firestore timestamp to JavaScript Date object
    const dateObject = new Date(
      timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000
    );

    // Format time as "hh:mm A"
    const formattedTime = dateObject.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Format date as "DD/MM/YYYY"
    const formattedDate = dateObject.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Combine formatted time and date
    // const formattedDateTime = `${formattedTime} - ${formattedDate}`;

    return { date: formattedDate, time: formattedTime };
  }
  return (
    <div
      className="shadowAndBorder"
      style={{
        marginTop: "0px",
        flex: 1,
        height: "max-content",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
        background: "rgba(255,255,255, 0.5)",
        backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
        WebkitBackdropFilter: "blur(4px)", // For Safari support,
        padding: "10px",
        borderRadius: "10px",
        marginBottom: "10px",
      }}
    >
      <h2 style={{ textAlign: "left" }}>Processed Forms</h2>
      {displayedSessions.map((student, index) => (
        <Accordion key={index}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <div
              style={{
                flex: 1,
                height: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>{student?.userDetails?.email}</div>
            </div>
          </AccordionSummary>
          <AccordionDetails>
          {student?.type === "new" ? 
              <div
                style={{
                  padding: "1rem",
                  fontFamily: "Arial, sans-serif",
                  lineHeight: 1.6,
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <h3>Inquiry Form</h3>
                </div>

                <div>
                  <strong>Program:</strong> {student.program || "N/A"}
                </div>
                <div>
                  <strong>Class:</strong> {student.class || "N/A"}
                </div>
                <div>
                  <strong>Selected Subjects:</strong>{" "}
                  {student.selectedSubjects.length
                    ? student.selectedSubjects.join(", ")
                    : "None"}
                </div>
                <div>
                  <strong>Tutoring Support:</strong>{" "}
                  {student.tutoringSupport || "N/A"}
                </div>
                <div>
                  <strong>Package:</strong> {student.package || "N/A"}
                </div>
                <div>
                  <strong>Hours Requested:</strong> {student.hours}
                </div>
                <div>
                  <strong>Lesson Dates:</strong> <br />
                  <ul>
                    {student.lessonDates?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Time Zone:</strong> {student.timeZone || "N/A"}
                </div>
                <div>
                  <strong>Support Needed:</strong>{" "}
                  {student.guidanceAndSupport?.needed ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Total Cost:</strong> £{student.totalCost}
                </div>
                <div>
                  <strong>Total Cost After Support:</strong> £
                  {student.totalCostAfterGuidanceAndSupport}
                </div>

                {student.guidanceAndSupport?.needed && (
                  <div
                    style={{
                      borderTop: "1px solid #ccc",
                      marginTop: "1rem",
                      paddingTop: "1rem",
                    }}
                  >
                    <strong>Guidance & Support Details:</strong>
                    <br />
                    <div>
                      <strong>Assignment Type(s):</strong>{" "}
                      {student.guidanceAndSupport.assignmentType.length
                        ? student.guidanceAndSupport.assignmentType.join(", ")
                        : "None"}
                    </div>
                    <div>
                      <strong>Query:</strong>{" "}
                      {student.guidanceAndSupport.query || "N/A"}
                    </div>
                    <div>
                      <strong>Requested Hours:</strong>{" "}
                      {student.guidanceAndSupport.hours}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    borderTop: "1px solid #ccc",
                    marginTop: "1rem",
                    paddingTop: "1rem",
                  }}
                >
                  <strong>Student Info:</strong>
                  <br />
                  {student?.userDetails?.firstName}{" "}
                  {student?.userDetails?.lastName}
                  <br />
                  Email: {student?.userDetails?.email}
                </div>

                <div
                  style={{
                    borderTop: "1px solid #ccc",
                    marginTop: "1rem",
                    paddingTop: "1rem",
                  }}
                >
                  <strong>Parent Info:</strong>
                  <br />
                  {student?.userDetails?.parentFirstName}{" "}
                  {student?.userDetails?.parentLastName}
                  <br />
                  Email: {student?.userDetails?.parentEmail}
                  <br />
                  Relation: {student?.userDetails?.relation}
                </div>

                <div
                  style={{
                    borderTop: "1px solid #ccc",
                    marginTop: "1rem",
                    paddingTop: "1rem",
                  }}
                >
                  <strong>Billing Info:</strong>
                  <br />
                  Name: {student?.billingInfo?.fullName}
                  <br />
                  Email: {student?.billingInfo?.email}
                  <br />
                  Contact No: {student?.billingInfo?.contactNo}
                </div>
              </div>
              :
              <div>
                {student?.chosenPricingPlan === "Other Plans" ? (
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <h3>Inquiry Form:</h3>
                  </div>
                ) : (
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <h3>Guidance and Support Form:</h3>
                  </div>
                )}
                <div>
                  <strong>Submission User Type:</strong> {student?.userType}
                </div>
                <div>
                  <strong>Submission Date:</strong>{" "}
                  {formatDateTime(student?.submittedAt)?.date}
                </div>
                <div>
                  <strong>Submission Time:</strong>{" "}
                  {formatDateTime(student?.submittedAt)?.time}
                </div>
                <div>
                  <strong>User TimeZone:</strong> {student?.timeZone}
                </div>

                <div
                  style={{
                    borderBottom: "1px solid #ccc",
                    marginBottom: "1rem",
                  }}
                >
                  <strong>How often to take lessons:</strong>{" "}
                  <ul>
                    {student?.howOftenToTakeLesson?.map((item) => (
                      <li>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* General Details */}

                <div>
                  <strong>Final Exams:</strong> {student?.finalExamDate}
                </div>
                <div
                  style={{
                    borderBottom: "1px solid #ccc",
                    marginBottom: "1rem",
                    paddingBottom: "1rem",
                  }}
                >
                  <strong>What Course To Pursue:</strong>{" "}
                  {student?.whatCourseToPursue}
                </div>
                <>
                  {/* Other Pricing Plan */}
                  {student?.chosenPricingPlan === "Other Plans" ? (
                    <>
                      <div
                        style={{
                          borderBottom: "1px solid #ccc",
                          marginBottom: "1rem",
                          paddingBottom: "1rem",
                        }}
                      >
                        <div>
                          <strong>Seeking Tutor For:</strong>
                          <ul>
                            {student.seekingTutoringFor?.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <strong>Tutoring objective:</strong>{" "}
                          {student?.objective?.select}
                        </div>

                        <div>
                          <strong>Tutoring Plan:</strong>{" "}
                          {student?.tutoringPlanTitle}
                        </div>

                        <div>
                          <strong>Tutor Level:</strong>{" "}
                          {student?.objective?.level}
                        </div>

                        <div>
                          <strong>Tutor Support Type:</strong>{" "}
                          {student?.objective?.diploma}
                        </div>

                        <div>
                          <strong>Price:</strong> £ {student?.price}
                        </div>
                      </div>

                      {/* GUIDANCE AND SUPPORT */}
                      <div
                        style={{
                          borderBottom: "1px solid #ccc",
                          marginBottom: "1rem",
                          paddingBottom: "1rem",
                        }}
                      >
                        <div>
                          <strong>Want Guidance and Support:</strong>{" "}
                          {student?.wantGuidanceAndSupport}
                        </div>
                        {student?.wantGuidanceAndSupport === "yes" && (
                          <>
                            <div>
                              <strong>Guidance & Support Subjects:</strong>
                              <ul>
                                {student?.guidanceAndSupportSubjects?.map(
                                  (item, index) => (
                                    <li key={index}>{item}</li>
                                  )
                                )}
                              </ul>
                            </div>

                            <div>
                              <strong>Guidance and Support Objective:</strong>{" "}
                              {student?.guidanceObjectiveTitle}
                            </div>

                            <div>
                              <strong>Tutor Level:</strong>{" "}
                              {student?.guidanceObjective?.level}
                            </div>

                            <div>
                              <strong>Tutor Support Type:</strong>{" "}
                              {student?.guidanceObjective?.diploma}
                            </div>

                            <div>
                              <strong>Price:</strong> £ {student?.guidancePrice}
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          borderBottom: "1px solid #ccc",
                          marginBottom: "1rem",
                          paddingBottom: "1rem",
                        }}
                      >
                        <>
                          <div>
                            <strong>Guidance & Support Subjects:</strong>
                            <ul>
                              {student.seekingTutoringFor?.map(
                                (item, index) => (
                                  <li key={index}>{item}</li>
                                )
                              )}
                            </ul>
                          </div>

                          <div>
                            <strong>Guidance and Support Objective:</strong>{" "}
                            {student?.guidanceObjectiveTitle}
                          </div>

                          <div>
                            <strong>Tutor Level:</strong>{" "}
                            {student?.guidanceObjective?.level}
                          </div>

                          <div>
                            <strong>Tutor Support Type:</strong>{" "}
                            {student?.guidanceObjective?.diploma}
                          </div>

                          <div>
                            <strong>Price:</strong> £ {student?.guidancePrice}
                          </div>
                        </>
                      </div>
                    </>
                  )}

                  <>
                    {/* Student Information */}
                    <div>
                      <strong>Student's Information:</strong>
                    </div>
                    <div>
                      <strong>First Name:</strong>{" "}
                      {student?.userDetails?.firstName}
                    </div>
                    <div>
                      <strong>Last Name:</strong>{" "}
                      {student?.userDetails?.lastName}
                    </div>
                    <div>
                      <strong>Email:</strong> {student?.userDetails?.email}
                    </div>
                    <div>
                      <strong>Phone:</strong> {student?.userDetails?.phone}
                    </div>
                    <div>
                      <strong>Address:</strong>{" "}
                      {student?.userDetails?.address || "N/A"}
                    </div>
                    <div>
                      <strong>City:</strong>{" "}
                      {student?.userDetails?.city || "N/A"}
                    </div>
                    <div>
                      <strong>ZIP:</strong> {student?.userDetails?.zip || "N/A"}
                    </div>
                    <div>
                      <strong>Country:</strong>{" "}
                      {student?.userDetails?.country?.label || "N/A"}
                    </div>
                    <div>
                      <strong>GMT:</strong>{" "}
                      {student?.userDetails?.gmtTimezone || "N/A"}
                    </div>
                    <br />
                    {/* Parent Information */}
                    <div>
                      <strong>Parent's Information:</strong>
                    </div>
                    <div>
                      <strong>First Name:</strong>{" "}
                      {student?.userDetails?.parentFirstName}
                    </div>
                    <div>
                      <strong>Last Name:</strong>{" "}
                      {student?.userDetails?.parentLastName}
                    </div>
                    <div>
                      <strong>Email:</strong>{" "}
                      {student?.userDetails?.parentEmail}
                    </div>
                    <div>
                      <strong>Phone:</strong>{" "}
                      {student?.userDetails?.parentPhone}
                    </div>
                    <div>
                      <strong>Relation:</strong>{" "}
                      {student?.userDetails?.relation}
                    </div>
                  </>
                </>
              </div>
      }
              <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setShowModal(true);
                      setSelectedLink(student);
                    }}
                    style={{ marginTop: "1rem" }}
                    fullWidth
                  >
                    Delete
                  </Button>
          </AccordionDetails>
        </Accordion>
      ))}

      {studentData?.length > itemsPerPage && (
        <div
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            marginTop: "20px",
          }}
        >
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(studentData?.length / itemsPerPage)}
              page={currentPage}
              onChange={handleChangePage}
            />
          </Stack>
        </div>
      )}

      {studentData?.length === 0 && (
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: "#ccc",
            fontSize: "1.5rem",
          }}
        >
          No Processed Forms
        </div>
      )}

      <Dialog
        open={showModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          setShowModal(false);
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Please confirm to delete this form."}</DialogTitle>

        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setShowModal(false);
            }}
          >
            cancel
          </Button>
          <Button
            disabled={loading}
            color="error"
            variant="contained"
            onClick={() => handleDeleteClick(selectedLink)}
          >
            {loading ? "Deleting" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProcessedStudentForm;
