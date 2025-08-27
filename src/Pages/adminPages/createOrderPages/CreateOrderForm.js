import React, { useState, useContext } from "react";
import { MyContext } from "../../../Context/MyContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import emailjs from "emailjs-com";
import toast from "react-hot-toast";
import CustomModal from "../../../Components/CustomModal/CustomModal";

import { Button, TextField } from "@mui/material";
import getCourseRequestedEmailTemplate from "../../../Components/getEmailTemplate/getCourseRequestedEmailTemplate";

export function CreateOrderForm({ item, handleClose }) {
  const { userDetails, addNotification, adminAddNotification } =
    useContext(MyContext);

  const [submitting, setSubmitting] = useState(false);
  const [tutorHourlyRate, setTutorHourlyRate] = useState(null);
  const [price, setPrice] = useState(null);

  const isSelected = (day, time) =>
    item?.slotRequired.includes(`${day}-${time}`);

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

  async function submittingForm() {
    if (!tutorHourlyRate || tutorHourlyRate <= 0 || !price || price <= 0) {
      toast("Please Enter Tutor Hourly Rate");
      return;
    }

    try {
      setSubmitting(true);
      const details = {
        subject: item?.subject,
        studentName: item?.studentInformation?.userName,
        country: item?.country,
        credits: item?.credits || 0,
        yearOfGraduation: item?.yearOfGraduation,
        timeZone: item?.timeZone,
        slotRequired: item?.slotRequired,
        requestedHours: item?.requestedHours,
        startDate: item?.startDate,
        studentInformation: item?.studentInformation,
        tutorHourlyRate,
        session: item?.session,
        gmt: item?.gmt,
        price,
        createdOn: new Date(),
      };

      const userListRef = collection(db, "orders");
      const docRef = await addDoc(userListRef, details);

      // Retrieve the newly created document ID
      const docId = docRef.id;

      // Update the document with the new field 'id'
      await updateDoc(doc(db, "orders", docId), { id: docId });

      await deleteDoc(doc(db, "studentRequests", item?.id));

      handleClose(false);

      const checkTeacherEligibility = (teacher) => {
        const filteredSubjects = Object.entries(teacher.subjects)
          .filter(([_, value]) => value === true)
          .map(([subject]) => subject);

        // Check if any of the teacher's subjects match the order subjects
        return filteredSubjects.includes(item?.subject);
      };

      const userListRefSecond = collection(db, "userList");
      const q = query(userListRefSecond, where("type", "==", "teacher"));

      const querySnapshot = await getDocs(q);
      const teachersData = querySnapshot.docs.map((doc) => doc.data());
      const eligibleTeacherEmails = teachersData
        .filter((teacher) => checkTeacherEligibility(teacher, item?.subject))
        .map(({ email, userId }) => ({ email, userId }));

      const serviceId = process.env.REACT_APP_EMAILSERVICEID;
      const templateId = process.env.REACT_APP_EMAILTEMPLATEID;
      const userId = process.env.REACT_APP_EMAILUSERID;

      eligibleTeacherEmails.forEach((e) => {
        
      const emailTemplate = getCourseRequestedEmailTemplate(
        item?.studentInformation?.userName,
        item?.subject,
        item?.yearOfGraduation,
        item?.country,
        item?.startDate,
        `https://portal.ibinnovators.com/jobOpenings/${docId}?gimeg02j0i3jrg03i43g0n=${e.userId}`
      )
      
        const emailParams = {
          from_name: "IBInnovators",
          to_name: "", // Change this to the appropriate name field
          send_to: e.email,
          subject: `IB Innovators ${item?.subject} Opening (${item?.gmt})`,
          message: emailTemplate,
        };

        emailjs
          .send(serviceId, templateId, emailParams, userId)
          .then((response) => {})
          .catch((error) => {
            console.error("Error sending email:", error);
          });
      });

      addNotification(
        `You created a job for ${item?.subject}.`,
        userDetails?.userId
      );
      adminAddNotification(
        `${userDetails?.userName} created a job for ${item?.subject}.`
      );

      toast.success("Job created successfully");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error Submitting Form");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CustomModal>
      <div style={{ flex: 1 }}>
        <h2>ORDER SUBMISSION FORM</h2>
        {/* STUDENT INFO */}
        <div>
          <div
            style={{ fontSize: "medium", fontWeight: "bold", color: "#6e6e6e" }}
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
              <b>{item?.studentInformation?.userName}</b>
              <br />
              {item?.studentInformation?.email}
            </div>
          </div>
        </div>

        {/* TIME TABLE */}
        <div style={{ flex: 1, marginTop: "30px", overflow: "auto" }}>
          <h2 style={{ textAlign: "left", marginBottom: "10px" }}>
            Slot(s) Required
          </h2>

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
                      // cursor: "pointer",
                      background: isSelected(day, time) ? "#007bff" : "#ccc",
                    }}
                    // onClick={() => handleSlotClick(day, time)}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, marginTop: "50px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid #ccc",
              marginTop: "0.5rem",
            }}
          >
            <div>Requested Subject</div>
            <div>{item?.subject}</div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid #ccc",
              marginTop: "0.5rem",
            }}
          >
            <div>Country</div>
            <div>{item?.country}</div>
          </div>
          
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid #ccc",
              marginTop: "0.5rem",
            }}
          >
            <div>GMT</div>
            <div>{item?.gmt}</div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid #ccc",
              marginTop: "0.5rem",
            }}
          >
            <div>Year of Graduation</div>
            <div>{item?.yearOfGraduation}</div>
          </div>
          
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid #ccc",
              marginTop: "0.5rem",
            }}
          >
            <div>Session</div>
            <div>{item?.session}</div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid #ccc",
              marginTop: "0.5rem",
            }}
          >
            <div>Requested Tutor Tier</div>
            <div>{item?.tutorTier}</div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid #ccc",
              marginTop: "0.5rem",
            }}
          >
            <div>Requested Hours</div>
            <div>{item?.requestedHours}</div>
          </div>

          {/* <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid #ccc",
              marginTop: "0.5rem",
            }}
          >
            <div>Grade Predicted</div>
            <div>{item?.gradePredicted}</div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid #ccc",
              marginTop: "0.5rem",
            }}
          >
            <div>Grade Aimed</div>
            <div>{item?.gradeAimed}</div>
          </div> */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid #ccc",
              marginTop: "0.5rem",
            }}
          >
            <div>Starting Date</div>
            <div>
              {item?.startDate !== "Other"
                ? item?.startDate
                : item?.customStartDate}
            </div>
          </div>
        </div>

        <TextField
          type="number"
          label="Tutor Hourly Rate (USD)"
          value={tutorHourlyRate}
          onChange={(e) => {
            setTutorHourlyRate(e.target.value);
          }}
          fullWidth
          required
          style={{ marginTop: "20px" }}
        />

        <TextField
          type="number"
          label="Hourly Price charged to Student (USD)"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
          }}
          fullWidth
          required
          style={{ marginTop: "10px", marginBottom: "20px" }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
          gap: "10px",
        }}
      >
        <Button
          disabled={submitting}
          variant="outlined"
          color="error"
          onClick={() => {
            handleClose(false);
          }}
        >
          CANCEL
        </Button>
        <Button
          disabled={submitting}
          variant="contained"
          onClick={submittingForm}
        >
          {submitting ? "Submitting" : "SUBMIT"}
        </Button>
      </div>
    </CustomModal>
  );
}
