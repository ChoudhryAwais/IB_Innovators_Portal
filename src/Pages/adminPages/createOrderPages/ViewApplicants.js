import React, { useState, useContext, useEffect } from "react";
import { MyContext } from "../../../Context/MyContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { db } from "../../../firebase";
import {
  getDocs,
  collection,
  where,
  query,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  runTransaction,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { Button } from "@mui/material";
import CustomModal from "../../../Components/CustomModal/CustomModal";
import toast from "react-hot-toast";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import emailjs from "emailjs-com";
import getTutorSelectedForStudentEmailTemplate from "../../../Components/getEmailTemplate/getTutorSelectedForStudentEmailTemplate";
import getJobApprovedEmailTemplate from "../../../Components/getEmailTemplate/getJobApprovedEmailTemplate";
import getJobNotApprovedEmailTemplate from "../../../Components/getEmailTemplate/getJobNotApprovedEmailTemplate";


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function ViewApplicants({ item, handleClose }) {
  const { userDetails } = useContext(MyContext);

  const [enterPriceAndPlan, setEnterPriceAndPlan] = useState("");

  const [selectedTutor, setSelectedTutor] = useState(null);
  const [tutorApplicants, setTutorApplicants] = useState([]);

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);


  const generatingLink = async (tutor) => {
    try {
      setLoading(true);
      const linkedRef = collection(db, "Linked");

      // First, add the document and get its ID
      const linkId = await addDoc(linkedRef, {
        studentId: item?.studentInformation?.userId,
        studentName: item?.studentInformation?.userName,
        studentEmail: item?.studentInformation?.email,
        teacherId: tutor?.submittedBy,
        subject: item?.subject,
        teacherName: tutor?.tutorDetails?.userName,
        teacherEmail: tutor?.tutorDetails?.email,
        orderId: item?.id,
        startDate: new Date(),
        studentInfo: item?.studentInformation,
        price: item?.price,
        tutorHourlyRate: item?.tutorHourlyRate,
      });

      // Update the document to include the ID
      const docRef = doc(linkedRef, linkId.id);
      await updateDoc(docRef, {
        id: linkId.id,
      });

      // Add to processed orders
      const processedOrderCollectionRef = collection(db, "processedOrders");

      const processedData = {
        ...item,
        selectedTeacher: tutor?.submittedBy,
      };

      const processedOrderDocRef = doc(processedOrderCollectionRef, item?.id); // Create a doc reference with order.id
      await setDoc(processedOrderDocRef, processedData); // Set the document data

      // Delete from orders
      const orderCollectionRef = collection(db, "orders");
      const orderDocRef = doc(orderCollectionRef, item?.id); // Assuming order.id is the document id
      await deleteDoc(orderDocRef);

      // STUDENT AND TEACHER EMAIL
      const serviceId = process.env.REACT_APP_EMAILSERVICEID;
      const templateId = process.env.REACT_APP_EMAILTEMPLATEID;
      const userId = process.env.REACT_APP_EMAILUSERID;
      const emailTemplateToStudent = getTutorSelectedForStudentEmailTemplate(
        item?.studentInformation?.userName,
        item?.requestedHours,
        item?.subject,
        tutor?.tutorDetails?.userName
      )

      const tutorAndParentEmail = [tutor?.tutorDetails?.email, item?.studentInformation?.otherInformation?.userDetails?.parentEmail]

      const studentAndTeacherEmailParams = {
        from_name: "IBInnovators",
        to_name: "",
        send_to: item?.studentInformation?.email,
        cc_to: tutorAndParentEmail?.join(", "),
        subject: `Introducing your new ${item?.subject} tutor`,
        message: emailTemplateToStudent,
      };
      

      // SELECTED TEACHER ONLY
      const emailTemplateForSelectedTeacher = getJobApprovedEmailTemplate(
        tutor?.tutorDetails?.userName,
        item?.studentInformation?.userName,
        item?.subject
      )
      const selectedTutorEmailParams = {
        from_name: "IBInnovators",
        to_name: "", // Change this to the appropriate name field
        send_to: tutor?.tutorDetails?.email,
        subject: `Job Approved with ${item?.studentInformation?.userName} for ${item?.subject}`,
        message: emailTemplateForSelectedTeacher,
      };

      // UN-SELECTED TEACHER ONLY
      const emailTemplateForNotApprovedTeacher = getJobNotApprovedEmailTemplate(tutor?.tutorDetails?.userName)
      const unselectedTeacherEmailParams = {
        from_name: "IBInnovators",
        to_name: "", // Change this to the appropriate name field
        send_to: tutorApplicants
          ?.filter((item) => item !== tutor?.tutorDetails?.email)
          ?.join(", "),
        subject: `Job Application Status Update`,
        message: emailTemplateForNotApprovedTeacher,
      };

      await emailjs
        .send(serviceId, templateId, studentAndTeacherEmailParams, userId)
        .then((response) => {})
        .catch((error) => {
          console.error("Error sending email:", error);
        });

        await emailjs
        .send(serviceId, templateId, selectedTutorEmailParams, userId)
        .then((response) => {})
        .catch((error) => {
          console.error("Error sending email:", error);
        });

      if (
        tutorApplicants?.filter((item) => item !== tutor?.tutorDetails?.email)
          ?.length > 1
      ) {
        await emailjs
          .send(serviceId, templateId, unselectedTeacherEmailParams, userId)
          .then((response) => {})
          .catch((error) => {
            console.error("Error sending email:", error);
          });
      }

      toast.success("Link created successfully");

      handleClose(false);
    } catch (error) {
      toast.error("Error processing order", error);
      console.error("Error processing order:", error);
    } finally {
      setLoading(false);
    }
  };

  const timePeriods = ["Before 12PM", "12PM - 3PM", "3PM - 6PM", "After 6PM"];
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  //   PAGINAGTION

  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = item?.applicants
    ? item.applicants?.slice(startIndex, endIndex)
    : [];

  useEffect(() => {
    if (displayedSessions) {
      const newTutorApplicants = displayedSessions.map(
        (e) => e?.tutorDetails?.email
      );
      setTutorApplicants(newTutorApplicants);
    }
  }, [displayedSessions?.length]);

  return (
    <>
      <CustomModal>
        {/* STUDENT INFO */}
        <div>
          <h2>Order ID: {item?.id}</h2>
          <h2 style={{ textAlign: "left" }}>{item?.subject}</h2>

          <div
            style={{ fontSize: "medium", fontWeight: "bold", color: "#ccc" }}
          >
            Student
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div>
              <FontAwesomeIcon
                style={{ marginLeft: "10px", fontSize: "2rem" }}
                icon={faGraduationCap}
              />
            </div>
            <div>
              <b>{item?.studentName}</b>
              <br />
              Year of Graduation: {item?.yearOfGraduation}
              <br />
              Timezone: {item?.timeZone}
            </div>
          </div>
        </div>

        <h2
          style={{ textAlign: "left", marginTop: "30px", marginBottom: "10px" }}
        >
          Applicants
        </h2>

        {displayedSessions?.length === 0 ? (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: "#ccc",
              fontSize: "1.5rem",
            }}
          >
            No Applicants Yet
          </div>
        )
      :
      <>

        {displayedSessions?.map((e, index) => {
          const isSelected = (day, time) =>
            e?.slotAvailable?.includes(`${day}-${time}`);
          const isRequired = (day, time) =>
            item?.slotRequired?.includes(`${day}-${time}`);

          return (
            <Accordion key={index}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <div
                  style={{
                    flex: 1,
                    justifyContent: "space-between",
                    display: "flex",
                    fontSize: "large",
                    fontWeight: "bold",
                  }}
                >
                  <div>{e?.tutorDetails?.userName}</div>

                  <div>{e?.tutorDetails?.email}</div>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div style={{ flex: 1 }}>
                  {/* TIME TABLE */}
                  <div
                    style={{
                      flex: 1,
                      marginTop: "20px",
                      overflowX: "auto",
                      overflowY: "hidden",
                    }}
                  >
                    <h2>Time Available</h2>

                    {/* TIME TABLE */}
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "space-between",
                        flex: 1,
                        minWidth: "600px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          gap: "10px",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            minHeight: "40px",
                            padding: "5px",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                          }}
                        ></div>
                        {timePeriods.map((time) => (
                          <div
                            key={time}
                            style={{
                              flex: 1,
                              minHeight: "40px",
                              padding: "5px",
                              textAlign: "center",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {time}
                          </div>
                        ))}
                      </div>

                      {days.map((day) => (
                        <div
                          key={day}
                          style={{
                            flex: 1,
                            gap: "10px",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              minHeight: "40px",
                              padding: "5px",
                              textAlign: "center",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {day.slice(0, 3)}
                          </div>
                          {timePeriods.map((time) => (
                            <div
                              key={time}
                              style={{
                                flex: 1,
                                minHeight: "40px",
                                padding: "5px",
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                userSelect: "none",
                                transition: "all 0.5s ease-in-out",
                                border: isRequired(day, time)
                                  ? "2px solid red"
                                  : "2px solid #ccc",
                                background: isSelected(day, time)
                                  ? "#007bff"
                                  : "#ccc",
                              }}
                            ></div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  <p
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: "1.5rem",
                      marginTop: "20px",
                    }}
                  >
                    Blue = Selected by Teacher | Red = Required by Student
                  </p>

                  {/* SUPPORTING INFORMATION */}
                  {e?.supportingInformation && (
                    <div style={{ flex: 1, marginTop: "20px" }}>
                      <div style={{ color: "#000", fontWeight: "bold" }}>
                        Supporting Information
                      </div>
                      <div
                        style={{
                          flex: 1,
                          borderRadius: "3px",
                          marginTop: "5px",
                          border: "1px solid #ccc",
                          borderRadius: "5px",
                          padding: "10px",
                        }}
                      >
                        {e?.supportingInformation}
                      </div>
                    </div>
                  )}

                  {/* GENERATE LINK BUTTON */}
                  <div style={{ flex: 1, marginTop: "30px" }}>
                    <Button
                      style={{
                        width: "100%",
                      }}
                      variant="outlined"
                      onClick={() => {
                        setSelectedTutor(e);
                        setShowModal(true);
                      }}
                    >
                      CREATE LINK
                    </Button>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          );
        })}

        {displayedSessions?.length && (
          <div
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              marginTop: '1rem'
            }}
          >
            <Stack spacing={2}>
              <Pagination
                count={Math.ceil(item.applicants?.length / itemsPerPage)}
                page={currentPage}
                onChange={handleChangePage}
              />
            </Stack>
          </div>
        )}

</>
      }

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
            gap: "10px",
          }}
        >
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleClose(false);
            }}
          >
            CLOSE
          </Button>
        </div>
      </CustomModal>

      <Dialog
        open={showModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          setShowModal(false);
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Please confirm to create link"}</DialogTitle>

        <DialogActions>
          <Button
            variant="outlined"
            disabled={loading}
            onClick={() => {
              setShowModal(false);
            }}
          >
            CANCEL
          </Button>

          <Button
            disabled={loading}
            variant="contained"
            color="success"
            onClick={() => {
              generatingLink(selectedTutor);
            }}
          >
            {loading ? "CREATING LINK" : "CREATE LINK"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
