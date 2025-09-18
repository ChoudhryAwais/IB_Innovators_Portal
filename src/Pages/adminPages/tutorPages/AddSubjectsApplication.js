"use client"

import React, { useState, useContext } from "react"
import { db } from "../../../firebase"
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore"

import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"
import Slide from "@mui/material/Slide"
import Button from "@mui/material/Button"
import { Modal } from "@mui/material"

import LoadingButton from "@mui/lab/LoadingButton"
import SaveIcon from "@mui/icons-material/Save"
import { MyContext } from "../../../Context/MyContext"
import toast from "react-hot-toast"
import Checkbox from "@mui/material/Checkbox";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export function AddSubjectsApplication({ userDetails, userId }) {
  const { subjectsArray } = useContext(MyContext)

  const [showModal, setShowModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState({})
  const [subjectsToTeach, setSubjectsToTeach] = useState(userDetails?.subjects ? userDetails?.subjects : {})

  const [deleteSessionModal, setDeleteSessionModal] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState([])

  const [currentTier, setCurrentTier] = useState(userDetails?.tutorTier || "")
  const [hourlyRate, setHourlyRate] = useState(userDetails?.hourlyRate || "")

  const [tierSubmitting, setTierSubmitting] = useState(false)
  const [enrolledSubmitting, setEnrolledSubmitting] = useState(false)

  async function savingTierInformationChanges() {
    setTierSubmitting(true)
    try {
      const userListRef = collection(db, "userList")
      const q = query(userListRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        const userData = querySnapshot.docs[0].data()

        let details = {}
        if (hourlyRate !== 0 && currentTier !== "") {
          details = { hourlyRate: hourlyRate, tutorTier: currentTier }
        } else if (hourlyRate !== 0) {
          details = { hourlyRate: hourlyRate }
        } else if (currentTier !== "") {
          details = { tutorTier: currentTier }
        }

        await updateDoc(docRef, details)
        toast.success("Info Updated!")
      }
    } catch (e) {
      toast.error("Error updating information")
    } finally {
      setTierSubmitting(false)
      setHourlyRate(0)
      setCurrentTier("")
    }
  }

  async function savingChanges() {
    setSubmitting(true)
    try {
      const formattedSubjects = {}
      selectedSubjects.forEach((subject) => {
        formattedSubjects[subject] = true
      })

      const userListRef = collection(db, "userList")
      const q = query(userListRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        const userData = querySnapshot.docs[0].data()

        const mergedSubjects = {
          ...userData.subjects,
          ...formattedSubjects,
        }

        const details = { subjects: mergedSubjects }

        await updateDoc(docRef, details)
        setShowModal(false)
        toast.success("Subjects added")
      }
    } catch (e) {
      toast.error("Error adding subjects")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (subject) => {
    setSubjectsToTeach((prevState) => ({
      ...prevState,
      [subject]: !prevState[subject],
    }))
  }

  const handleDelete = (subject) => {
    const { [subject]: omit, ...rest } = subjectsToTeach
    setSubjectsToTeach(rest)
  }

  const renderElement = () => {
    return (
      <>
        <div>
          <select
            className="w-full p-2.5 flex-1 outline-none border border-gray-300 rounded-md"
            onChange={(e) => setSelectedSubjects([...selectedSubjects, e.target.value])}
            aria-label=".form-select-sm example"
          >
            <option value="">Select</option>
            {subjectsArray.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          {selectedSubjects.map((item, index) => (
            <button
              key={index}
              className="m-2 bg-[#292929] text-white px-4 py-1 rounded-full transition-colors duration-300 hover:bg-red-800"
              onClick={() => setSelectedSubjects(selectedSubjects.filter((e) => e !== item))}
            >
              {item}
            </button>
          ))}
        </div>
      </>
    )
  }

  async function saveEnrolledSubjects() {
    setEnrolledSubmitting(true)
    try {
      const userListRef = collection(db, "userList")
      const q = query(userListRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref

        const details = { subjects: subjectsToTeach }

        await updateDoc(docRef, details)
        toast.success("Changes saved")
      }
    } catch (e) {
      toast.error("Error saving enrolled subjects")
    } finally {
      setEnrolledSubmitting(false)
    }
  }

  async function deleteItemHandler(notificationId) {
    setSubmitting(true)
    try {
      const userListRef = collection(db, "userList")
      const q = query(userListRef, where("userId", "==", userId))
      const userDocSnapshot = await getDocs(q)

      if (!userDocSnapshot.empty) {
        const userDoc = userDocSnapshot.docs[0]
        const userData = userDoc.data()
        const updatedNotifications = userData.teacherSubjectApplication.filter(
          (notification) => notification.id !== notificationId,
        )
        await updateDoc(doc(db, "userList", userDoc.id), {
          teacherSubjectApplication: updatedNotifications,
        })

        toast.success("Application Deleted")
        setDeleteSessionModal(false)
      } else {
        toast.error("User document not found")
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error("Failed to delete notification")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Approved Subjects */}
      <div className="bg-white rounded-lg">
        <div className="text-left text-2xl font-bold mb-6">Subjects</div>

        <div className="w-full">
          <div className="grid grid-cols-2">
            {Object.keys(userDetails?.subjects ? userDetails?.subjects : {})
              .sort((a, b) => a.localeCompare(b))
              .map((subject, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 hover:bg-gray-50"
                >
                  <label className="flex items-center cursor-pointer">
                    <Checkbox
              checked={subjectsToTeach[subject]}
              onChange={() => handleChange(subject)}
              sx={{

                color: "#A2A1A833",              // unchecked border color
                "&.Mui-checked": {
                  color: "#4071B6",            // checked color
                },
                "& .MuiSvgIcon-root": {        // ensures icon is 20x20
                  fontSize: 26,
                },
              }}
            />
                    <span className="text-gray-900 ml-2">{subject}</span>
                  </label>
                  {/* <button onClick={() => handleDelete(subject)} className="text-red-500 hover:text-red-700 p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button> */}
                </div>
              ))}
          </div>

          <div className="flex justify-end items-center gap-3 mt-6">
            {enrolledSubmitting ? (
              <Button
                variant="contained"
                disabled
                sx={{
                  backgroundColor: "#4071B6",
                  color: "#fff",
                  width: "152px",
                  height: "50px",
                  "&.Mui-disabled": {
                    backgroundColor: "#4071B6",
                    color: "#fff",
                    opacity: 0.5,
                  },
                }}
              >
                SAVING...
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={saveEnrolledSubjects}
                sx={{
                  backgroundColor: "#4071B6",
                  color: "#fff",
                  width: "152px",
                  height: "50px",
                  "&:hover": {
                    backgroundColor: "#305a91",
                  },
                }}
              >
                SAVE
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* New Subject Applications */}
      {userDetails?.teacherSubjectApplication?.length > 0 && (
        <div className="bg-white p-6 rounded-lg mt-6">
          <div className="text-left text-2xl font-bold mb-6">New Subject Applications</div>

          <div className="space-y-4">
            {userDetails?.teacherSubjectApplication?.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="text-lg font-semibold text-gray-900 mb-3">{item.subjectsToBeClearedFor}</div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <b>Subject To Be Cleared For:</b> {item.subjectsToBeClearedFor}
                  </div>
                  <div>
                    <b>Tutor Name:</b> {item.tutorName}
                  </div>
                  <div>
                    <b>Previous Experience:</b> {item.describePreviousExperience}
                  </div>
                  <div>
                    <b>Proof of Grade:</b>{" "}
                    <a href={item.proofOfGrade} download className="text-blue-600 hover:underline">
                      Download
                    </a>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-3 mt-4">
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{
                      backgroundColor: "#4071B6",
                    }}
                    onClick={() => {
                      setSelectedLink(item)
                      setDeleteSessionModal(true)
                    }}
                  >
                    DELETE
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      backgroundColor: "#4071B6",
                    }}
                    onClick={() => {
                      setShowModal(true)
                      setSelectedLink(item)
                    }}
                  >
                    ADD SUBJECT
                  </Button>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteSessionModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setDeleteSessionModal(false)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Are you sure you want to delete this application?"}</DialogTitle>

        <DialogActions>
          <Button variant="outlined" color="error" onClick={() => setDeleteSessionModal(false)}>
            NO
          </Button>
          {!submitting ? (
            <Button variant="contained" color="success" onClick={() => deleteItemHandler(selectedLink.id)}>
              YES
            </Button>
          ) : (
            <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined">
              DELETING
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>

      {/* Add subject modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center">
          <div className="flex flex-col min-w-[70%] max-w-[1000px] max-h-[90vh] overflow-hidden shadow-lg bg-white/60 backdrop-blur-md rounded-lg">
            <div className="p-5 flex-1 overflow-auto">
              <h2 className="text-left text-xl font-semibold">Add Subjects</h2>
              <div className="mt-5 p-2.5">
                <div className="p-2.5 flex flex-col justify-center items-center bg-white/50 rounded-lg shadow-md">
                  {renderElement()}
                </div>
              </div>

              <div className="flex flex-wrap justify-end items-center gap-3 w-full mt-5">
                <Button variant="outlined" color="error" onClick={() => setShowModal(false)}>
                  CANCEL
                </Button>
                {submitting ? (
                  <LoadingButton loading loadingPosition="start" startIcon={<SaveIcon />} variant="outlined">
                    ADDING
                  </LoadingButton>
                ) : (
                  <Button onClick={savingChanges} variant="contained" color="success">
                    ADD
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
