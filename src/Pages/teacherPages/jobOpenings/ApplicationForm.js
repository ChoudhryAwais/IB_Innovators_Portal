import React, { useState, useContext } from "react";
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
} from "firebase/firestore";

import Button from "@mui/material/Button";

import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import CircularProgress from "@mui/material/CircularProgress";

import toast from "react-hot-toast";
import { TextField } from "@mui/material";

export function ApplicationForm({ item, handleClose }) {
  const [additionalInfoShow, setAdditionalInfoShow] = useState(false);
  const [supportingInformation, setSupportingInformation] = useState("");

  const { userDetails, adminAddNotification, addNotification } =
    useContext(MyContext);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePolicies, setAgreePolicies] = useState(false);
  const [slotAvailable, setSlotAvailable] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  const handleSlotClick = (day, time) => {
    const slot = `${day}-${time}`;
    setSlotAvailable((prevSelectedSlots) =>
      prevSelectedSlots.includes(slot)
        ? prevSelectedSlots.filter((s) => s !== slot)
        : [...prevSelectedSlots, slot]
    );
  };

  const isRequired = (day, time) =>
    item?.slotRequired?.includes(`${day}-${time}`);
  const isSelected = (day, time) => slotAvailable.includes(`${day}-${time}`);

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
    if (Object.values(slotAvailable).length === 0) {
      toast("Please choose time.");
    } else if (!supportingInformation || supportingInformation === "") {
      toast("Please fill supporting information.");
    } else if (!agreeTerms) {
      toast("Please agree to Terms in order to proceed.");
    } else if (!agreePolicies) {
      toast("Please agree to Policies in order to proceed.");
    } else {
      const details = {
        tutorDetails: userDetails,
        slotAvailable,
        supportingInformation,
        submittedOn: new Date(),
        submittedBy: userDetails?.userId,
      };

      setSubmitting(true);
      try {
        const userListRef = collection(db, "orders");
        const docRef = doc(userListRef, item.id);

        await runTransaction(db, async (transaction) => {
          const docSnapshot = await transaction.get(docRef);

          if (docSnapshot.exists()) {
            // Document exists, check if applicants array exists
            const data = docSnapshot.data();
            const applicants = data.applicants || [];

            // Append the new details to the applicants array
            applicants.push(details);

            // Update the document with the modified applicants array
            transaction.update(docRef, { applicants });
          } else {
            // Document does not exist, create a new one with the applicants array
            transaction.set(docRef, { applicants: [details] });
          }
        });
        await addNotification(
          `You submitted job application for ${item?.studentName} in ${item?.subject}.`,
          userDetails.userId
        );
        await adminAddNotification(
          `${userDetails?.userName} submitted job application for ${item?.id}.`,
          userDetails.userId
        );

        toast.success("Application submitted");
        handleClose(false);
      } catch (e) {
        toast.error("Failed to submit application");
      } finally {
        setSubmitting(false);
      }
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center", // center the modal content vertically and horizontally
      }}
    >
      <div
        style={{
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          minWidth: "70%",
          maxWidth: "1000px",
          maxHeight: "90vh",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          background: "#eee",
          borderRadius: "5px",
          overflow: "fixed",
          border: "5px solid #fff",
        }}
      >
        <div
          style={{
            overflow: "auto",
            flex: 1,
            padding: "5px",
          }}
        >
          {/* STUDENT INFO */}
          <div>
            <h2 style={{ textAlign: "left" }}>{item?.subject}</h2>

            <div style={{ fontSize: "medium", fontWeight: "bold" }}>
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

          {/* TIME TABLE */}
          <div style={{ flex: 1, marginTop: "20px", overflow: "auto" }}>
            <h2>Apply for Times you can support {item?.studentName}</h2>
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
                        cursor: "pointer",
                        border: isRequired(day, time)
                          ? "2px solid red"
                          : "2px solid #ccc",
                        background: isSelected(day, time) ? "#007bff" : "#ccc",
                      }}
                      onClick={() => handleSlotClick(day, time)}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ADDITIONAL INFO */}
          <div style={{ flex: 1, marginTop: "20px" }}>
            <span>Additional Information</span>{" "}
            {additionalInfoShow ? (
              <Button
                variant="outlined"
                onClick={() => {
                  setAdditionalInfoShow(false);
                }}
              >
                Hide
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={() => {
                  setAdditionalInfoShow(true);
                }}
              >
                Show
              </Button>
            )}
            {additionalInfoShow && (
              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "10px",
                  marginTop: "1rem",
                }}
              >
                <div>
                  A student, {item?.studentName} has requested for assistance
                  with <b>{item?.subject}</b>.
                </div>
                <div>
                  The student would like to have{" "}
                  <b>{item?.requestedHours} Hours</b> with a{" "}
                  <b>{item?.tutorTier}</b> tutor.
                </div>
                {/* <div>
                  The student predicted a grade of <b>{item?.gradePredicted}</b>
                  , and is aiming for <b>{item?.gradeAimed}</b>.
                </div> */}
                <br />
                <div>Details</div>
                <div>
                  Session: <b>{item?.session || "N/A"}</b>
                </div>
                <div>
                  Year of Graduation: <b>{item?.yearOfGraduation}</b>
                </div>
                <div>
                  Country: <b>{item?.country}</b>
                </div>
                <div>
                  GMT: <b>{item?.gmt}</b>
                </div>
                <div>
                  Start Date: <b>{item?.startDate}</b>
                </div>
                <div>
                  Hourly Rate (USD): <b>${item?.tutorHourlyRate}</b>
                </div>
                {/* <br />
                <div>If you are available please apply for this position.</div>
                <div>
                  Thank you, <br />
                  IB INNOVATORS
                </div> */}
              </div>
            )}
          </div>

          {/* SUPPORTING INFORMATION */}
          <div style={{ flex: 1, marginTop: "20px" }}>
            <TextField
              label="Supporting Information"
              required
              value={supportingInformation}
              maxLength={200}
              multiline
              rows={3}
              fullWidth
              onChange={(e) => {
                setSupportingInformation(e.target.value);
              }}
            />
            <div
              style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}
            >
              <p>{supportingInformation?.length}/200</p>
            </div>
          </div>

          {/* TERMS AND CONDITIONS */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: "10px", fontWeight: "normal" }}>
              <label>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms(!agreeTerms)}
                  style={{ transform: "scale(1.3)", marginRight: "10px" }}
                />
                Agree to Terms and Conditions
              </label>
            </div>

            {/* POLICIES */}
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={agreePolicies}
                  onChange={() => setAgreePolicies(!agreePolicies)}
                  style={{ transform: "scale(1.3)", marginRight: "10px" }}
                />
                Agree to Policies
              </label>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            marginTop: "20px",
          }}
        >
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              handleClose(false);
            }}
          >
            CANCEL
          </Button>
          {submitting ? (
            <LoadingButton
              loading
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="outlined"
            >
              SUBMITTING
            </LoadingButton>
          ) : (
            <Button
              onClick={submittingForm}
              variant="contained"
              color="success"
            >
              SUBMIT
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
