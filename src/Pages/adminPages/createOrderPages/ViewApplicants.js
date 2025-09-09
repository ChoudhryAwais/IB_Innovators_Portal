import React, { useState, useContext, useEffect } from "react";
import { MyContext } from "../../../Context/MyContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { db } from "../../../firebase";
import {
  collection,
  doc,
  updateDoc,
  setDoc,
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

  const [selectedTutor, setSelectedTutor] = useState(null);
  const [tutorApplicants, setTutorApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const generatingLink = async (tutor) => {
    try {
      setLoading(true);
      const linkedRef = collection(db, "Linked");

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

      const docRef = doc(linkedRef, linkId.id);
      await updateDoc(docRef, {
        id: linkId.id,
      });

      const processedOrderCollectionRef = collection(db, "processedOrders");
      const processedData = {
        ...item,
        selectedTeacher: tutor?.submittedBy,
      };
      const processedOrderDocRef = doc(processedOrderCollectionRef, item?.id);
      await setDoc(processedOrderDocRef, processedData);

      const orderCollectionRef = collection(db, "orders");
      const orderDocRef = doc(orderCollectionRef, item?.id);
      await deleteDoc(orderDocRef);

      const serviceId = process.env.REACT_APP_EMAILSERVICEID;
      const templateId = process.env.REACT_APP_EMAILTEMPLATEID;
      const userId = process.env.REACT_APP_EMAILUSERID;

      const emailTemplateToStudent =
        getTutorSelectedForStudentEmailTemplate(
          item?.studentInformation?.userName,
          item?.requestedHours,
          item?.subject,
          tutor?.tutorDetails?.userName
        );

      const tutorAndParentEmail = [
        tutor?.tutorDetails?.email,
        item?.studentInformation?.otherInformation?.userDetails?.parentEmail,
      ];

      const studentAndTeacherEmailParams = {
        from_name: "IBInnovators",
        to_name: "",
        send_to: item?.studentInformation?.email,
        cc_to: tutorAndParentEmail?.join(", "),
        subject: `Introducing your new ${item?.subject} tutor`,
        message: emailTemplateToStudent,
      };

      const emailTemplateForSelectedTeacher = getJobApprovedEmailTemplate(
        tutor?.tutorDetails?.userName,
        item?.studentInformation?.userName,
        item?.subject
      );
      const selectedTutorEmailParams = {
        from_name: "IBInnovators",
        to_name: "",
        send_to: tutor?.tutorDetails?.email,
        subject: `Job Approved with ${item?.studentInformation?.userName} for ${item?.subject}`,
        message: emailTemplateForSelectedTeacher,
      };

      const emailTemplateForNotApprovedTeacher =
        getJobNotApprovedEmailTemplate(tutor?.tutorDetails?.userName);
      const unselectedTeacherEmailParams = {
        from_name: "IBInnovators",
        to_name: "",
        send_to: tutorApplicants
          ?.filter((item) => item !== tutor?.tutorDetails?.email)
          ?.join(", "),
        subject: `Job Application Status Update`,
        message: emailTemplateForNotApprovedTeacher,
      };

      await emailjs.send(serviceId, templateId, studentAndTeacherEmailParams, userId);
      await emailjs.send(serviceId, templateId, selectedTutorEmailParams, userId);

      if (
        tutorApplicants?.filter((item) => item !== tutor?.tutorDetails?.email)
          ?.length > 1
      ) {
        await emailjs.send(serviceId, templateId, unselectedTeacherEmailParams, userId);
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
    "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
  ];

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
          <h2 className="text-left">{item?.subject}</h2>

          <div className="text-base font-bold text-gray-400">Student</div>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <FontAwesomeIcon className="ml-2 text-2xl" icon={faGraduationCap} />
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

        <h2 className="text-left mt-8 mb-2">Applicants</h2>

        {displayedSessions?.length === 0 ? (
          <div className="flex-1 text-center text-gray-400 text-2xl">
            No Applicants Yet
          </div>
        ) : (
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
                    <div className="flex flex-1 justify-between font-bold text-lg">
                      <div>{e?.tutorDetails?.userName}</div>
                      <div>{e?.tutorDetails?.email}</div>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="flex-1">
                      {/* TIME TABLE */}
                      <div className="flex-1 mt-5 overflow-x-auto overflow-y-hidden">
                        <h2>Time Available</h2>
                        <div className="flex gap-2 justify-between min-w-[600px]">
                          <div className="flex flex-col gap-2 flex-1">
                            <div className="flex-1 min-h-10 p-1 flex items-center justify-center"></div>
                            {timePeriods.map((time) => (
                              <div
                                key={time}
                                className="flex-1 min-h-10 p-1 text-center flex items-center justify-center"
                              >
                                {time}
                              </div>
                            ))}
                          </div>

                          {days.map((day) => (
                            <div key={day} className="flex flex-col gap-2 flex-1">
                              <div className="flex-1 min-h-10 p-1 flex items-center justify-center">
                                {day.slice(0, 3)}
                              </div>
                              {timePeriods.map((time) => (
                                <div
                                  key={time}
                                  className={`flex-1 min-h-10 p-1 flex items-center transition-all duration-500 ease-in-out select-none border ${
                                    isRequired(day, time)
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } ${
                                    isSelected(day, time)
                                      ? "bg-blue-600"
                                      : "bg-gray-300"
                                  }`}
                                ></div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>

                      <p className="flex-1 text-center text-2xl mt-5">
                        Blue = Selected by Teacher | Red = Required by Student
                      </p>

                      {/* SUPPORTING INFORMATION */}
                      {e?.supportingInformation && (
                        <div className="flex-1 mt-5">
                          <div className="text-black font-bold">
                            Supporting Information
                          </div>
                          <div className="flex-1 mt-1 border border-gray-300 rounded p-2">
                            {e?.supportingInformation}
                          </div>
                        </div>
                      )}

                      {/* GENERATE LINK BUTTON */}
                      <div className="flex-1 mt-8">
                        <Button
                          className="w-full"
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
              <div className="flex-1 flex items-center justify-center mt-4">
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
        )}

        <div className="flex justify-end mt-5 gap-2">
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
