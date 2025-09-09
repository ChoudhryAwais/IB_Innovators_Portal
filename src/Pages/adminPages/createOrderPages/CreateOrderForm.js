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
      const docId = docRef.id;
      await updateDoc(doc(db, "orders", docId), { id: docId });
      await deleteDoc(doc(db, "studentRequests", item?.id));

      handleClose(false);

      const checkTeacherEligibility = (teacher) => {
        const filteredSubjects = Object.entries(teacher.subjects)
          .filter(([_, value]) => value === true)
          .map(([subject]) => subject);

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
        );

        const emailParams = {
          from_name: "IBInnovators",
          to_name: "",
          send_to: e.email,
          subject: `IB Innovators ${item?.subject} Opening (${item?.gmt})`,
          message: emailTemplate,
        };

        emailjs.send(serviceId, templateId, emailParams, userId).catch((err) =>
          console.error("Error sending email:", err)
        );
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
      <div className="flex-1">
        <h2 className="text-xl font-semibold">ORDER SUBMISSION FORM</h2>

        {/* STUDENT INFO */}
        <div>
          <div className="text-gray-600 font-bold text-base">Student</div>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <FontAwesomeIcon
                className="ml-2 text-2xl"
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
        <div className="flex-1 mt-8 overflow-auto">
          <h2 className="text-left mb-2 text-lg font-semibold">
            Slot(s) Required
          </h2>

          <div className="flex gap-2 justify-between min-w-[600px]">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center min-h-10 p-1 text-center"></div>
              {timePeriods.map((time) => (
                <div
                  key={time}
                  className="flex items-center min-h-10 p-1 text-center"
                >
                  {time}
                </div>
              ))}
            </div>

            {days.map((day) => (
              <div key={day} className="flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-center min-h-10 p-1 text-center">
                  {day.slice(0, 3)}
                </div>
                {timePeriods.map((time) => (
                  <div
                    key={time}
                    className={`flex items-center min-h-10 p-1 text-center select-none transition-all duration-500 ${
                      isSelected(day, time)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300"
                    }`}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* DETAILS */}
        <div className="flex-1 mt-12">
          {[
            ["Requested Subject", item?.subject],
            ["Country", item?.country],
            ["GMT", item?.gmt],
            ["Year of Graduation", item?.yearOfGraduation],
            ["Session", item?.session],
            ["Requested Tutor Tier", item?.tutorTier],
            ["Requested Hours", item?.requestedHours],
            [
              "Starting Date",
              item?.startDate !== "Other"
                ? item?.startDate
                : item?.customStartDate,
            ],
          ].map(([label, value], idx) => (
            <div
              key={idx}
              className="flex justify-between items-end border-b border-gray-300 pb-2 mt-2"
            >
              <div>{label}</div>
              <div>{value}</div>
            </div>
          ))}
        </div>

        <TextField
          type="number"
          label="Tutor Hourly Rate (USD)"
          value={tutorHourlyRate}
          onChange={(e) => setTutorHourlyRate(e.target.value)}
          fullWidth
          required
          className="mt-5"
        />

        <TextField
          type="number"
          label="Hourly Price charged to Student (USD)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          fullWidth
          required
          className="mt-3 mb-5"
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end mt-5 gap-3">
        <Button
          disabled={submitting}
          variant="outlined"
          color="error"
          onClick={() => handleClose(false)}
        >
          CANCEL
        </Button>
        <Button disabled={submitting} variant="contained" onClick={submittingForm}>
          {submitting ? "Submitting" : "SUBMIT"}
        </Button>
      </div>
    </CustomModal>
  );
}
