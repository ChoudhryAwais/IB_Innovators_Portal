"use client"

import React, { useContext, useEffect, useState } from "react"
import { MyContext } from "../../Context/MyContext"
import { useNavigate } from "react-router-dom"
import { db } from "../../firebase"
import {
  collection,
  doc,
  onSnapshot,
  deleteDoc,
  orderBy,
  query,
} from "firebase/firestore"
import { ChevronRightIcon } from "@heroicons/react/24/outline"
import { toast } from "react-hot-toast"
import { Button, ListItemButton } from "@mui/material"
import CustomModal from "../../Components/CustomModal/CustomModal"


const ProcessedRequestCoursesForm = () => {
  const [contactUsSubmissions, setContactUsSubmissions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const ordersRef = collection(db, "adminPanel")
    const customDocRef = doc(ordersRef, "processedRequestCourseForm")
    const orderCollectionRef = collection(customDocRef, "processedRequestCourseForm")

    const orderedQuery = query(orderCollectionRef, orderBy("processedAt", "desc"))

    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = []
        querySnapshot.forEach((doc) => {
          fetchedData.push({ id: doc.id, ...doc.data() })
        })
        fetchedData.sort((a, b) => b.submittedAt.toDate() - a.submittedAt.toDate())
        setContactUsSubmissions(fetchedData)
      },
      () => {
        toast.error("Error fetching data")
      },
    )

    return () => unsubscribe()
  }

  const handleDeleteClick = async (student) => {
    try {
      setLoading(true)
      const prevOrdersRef = collection(db, "adminPanel")
      const prevCustomDocRef = doc(prevOrdersRef, "processedRequestCourseForm")
      const prevOrderCollectionRef = collection(prevCustomDocRef, "processedRequestCourseForm")

      const studentDocRef = doc(prevOrderCollectionRef, student.id)
      await deleteDoc(studentDocRef)

      setShowModal(false)
      toast.success("Deleted successfully")
    } catch (error) {
      toast.error("Error deleting form")
      console.error("Error deleting form: ", error)
    } finally {
      setLoading(false)
    }
  }

  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedSessions = contactUsSubmissions?.slice(startIndex, endIndex)

  function formatDateTime(timestampData) {
    if (!timestampData) return "N/A"
    const dateObject = new Date(
      timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000,
    )
    const formattedTime = dateObject.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    const formattedDate = dateObject.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    return `${formattedTime} - ${formattedDate}`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 ">
      <div className="mb-6 pb-2 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-[#16151C]">Processed Forms</h2>
        <span className="text-sm text-[#16151C]">
          {String(contactUsSubmissions?.length).padStart(2, "0")} Forms
        </span>
      </div>

      <div className="space-y-3">
        {displayedSessions.map((item, index) => (
          <ListItemButton
            key={index}
            onClick={() => {
              setSelectedLink(item)
              setShowModal(true)
            }}
            sx={{
              borderRadius: "8px",
              p: 1,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#F9FAFB",
              },
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="flex flex-col">
              <span className="font-medium text-[#16151C]">
                {item.userDetails?.firstName} {item.userDetails?.lastName}
              </span>
              <span className="text-sm text-[#16151C]">{item.userDetails?.email}</span>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-[#16151C]" />
          </ListItemButton>
        ))}
      </div>

      {contactUsSubmissions?.length === 0 && (
        <div className="text-center text-[#16151C] pb-4 mb-2">No Processed Forms</div>
      )}

      {showModal && selectedLink && (
        <CustomModal
          open={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedLink(null)
          }}
          PaperProps={{
            sx: {
              width: "90vw",
              maxWidth: "1080px",
              height: "auto",
              maxHeight: "90vh",
              overflow: "hidden",
              borderRadius: "20px",
              padding: 0,
            },
          }}
        >
          <div className="h-full overflow-auto p-6" style={{ boxSizing: "border-box" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#16151C]">
                Processed Form{" "}
                <span className="font-light text-lg">(Request Course)</span>
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="text"
                  size="small"
                  sx={{
                    color: "#16151C",
                    textTransform: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    minWidth: "unset",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    width="16"
                    height="18"
                    viewBox="0 0 16 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: "#16151C" }}
                  >
                    <path
                      d="M11 3H11.75C13.4069 3 14.75 4.34315 14.75 6V13.5C14.75 15.1569 13.4069 16.5 11.75 16.5H4.25C2.59315 16.5 1.25 15.1569 1.25 13.5V6C1.25 4.34315 2.59315 3 4.25 3H5M11 3C11 3.82843 10.3284 4.5 9.5 4.5H6.5C5.67157 4.5 5 3.82843 5 3M11 3C11 2.17157 10.3284 1.5 9.5 1.5H6.5C5.67157 1.5 5 2.17157 5 3M5 7.5H11M5 10.5H11M5 13.5H8"
                      stroke="#16151C"
                      strokeWidth="1.125"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-light text-xs">Copy Text</span>
                </Button>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg
                    className="w-5 h-5 text-[#16151C]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <span className="text-[#16151C]">Submitted By:</span>
                  <span className="font-semibold text-[#16151C]">
                    {selectedLink?.userType || "Student"}
                  </span>

                  <span className="text-[#16151C]">Time Zone:</span>
                  <span className="font-semibold text-[#16151C]">
                    {selectedLink?.timeZone || "N/A"}
                  </span>

                  <span className="text-[#16151C]">Objective:</span>
                  <div className="font-semibold text-[#16151C] space-y-1">
                    {selectedLink?.objective?.map((obj, i) => (
                      <div key={i}>{obj}</div>
                    ))}
                  </div>

                  <span className="text-[#16151C]">Seeking Tutoring For:</span>
                  <div className="font-semibold text-[#16151C] space-y-1">
                    {selectedLink?.seekingTutoringFor?.map((subj, i) => (
                      <div key={i}>{subj}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-2">
                <div className="font-semibold text-[#16151C]">
                  Desired Course Attributes
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <span className="text-[#16151C]">Start Date & Time:</span>
                  <span className="font-semibold text-[#16151C]">
                    {formatDateTime(selectedLink?.startDateAndTime)}
                  </span>

                  <span className="text-[#16151C]">End Date & Time:</span>
                  <span className="font-semibold text-[#16151C]">
                    {formatDateTime(selectedLink?.endDateAndTime)}
                  </span>

                  <span className="text-[#16151C]">Final Exam Date:</span>
                  <span className="font-semibold text-[#16151C]">
                    {selectedLink?.finalExamDate || "N/A"}
                  </span>

                  <div className="col-span-2 h-2"></div>

                  <span className="text-[#16151C]">Hours:</span>
                  <span className="font-semibold text-[#16151C]">
                    {selectedLink?.desiredCourse?.courseHours || "N/A"}
                  </span>

                  <span className="text-[#16151C]">Price:</span>
                  <span className="font-semibold text-[#16151C]">
                    £ {selectedLink?.desiredCourse?.price || "N/A"}
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <div className="font-semibold text-[#16151C] mb-2">
                  How Often to Take Lessons
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {selectedLink?.howOftenToTakeLesson?.map((freq, i) => {
                    const [day, time] = freq.split("-").map((s) => s.trim())
                    return (
                      <React.Fragment key={i}>
                        <span className="text-[#16151C]">{day}:</span>
                        <span className=" text-[#16151C]">{time}</span>
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Guidance & Support */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-sm">
              <h3 className="font-bold text-[#16151C] mb-4">
                Guidance & Support Details:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-2">
                  {selectedLink?.wantGuidanceAndSupport === "no" && (
                    <div className="flex">
                      <span className="text-[#16151C] w-44">Need Support:</span>
                      <span className=" text-[#16151C]">No</span>
                    </div>
                  )}

                  {selectedLink?.wantGuidanceAndSupport === "yes" && (
                    <>
                      <div className="flex mb-4">
                        <span className="text-[#16151C] w-44">Subjects:</span>
                        <div className="font-semibold text-[#16151C] space-y-1">
                          {selectedLink?.guidanceAndSupportSubjects?.map((sub, index) => (
                            <div key={index} className="flex items-center">
                              <span className="w-1 h-1 bg-gray-900 rounded-full mr-2"></span>
                              {sub}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex">
                        <span className="text-[#16151C] w-44">Objective:</span>
                        <span className="font-semibold text-[#16151C]">
                          {selectedLink?.guidanceObjectiveTitle || "N/A"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Right column */}
                {selectedLink?.wantGuidanceAndSupport === "yes" && (
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-[#16151C] w-44">Need Support:</span>
                      <span className="font-semibold text-[#16151C]">Yes</span>
                    </div>
                    <div className="flex">
                      <span className="text-[#16151C] w-44">Tutor Level:</span>
                      <span className="font-semibold text-[#16151C]">
                        {selectedLink?.guidanceObjective?.level || "N/A"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-[#16151C] w-44">Tutor Support Type:</span>
                      <span className="font-semibold text-[#16151C]">
                        {selectedLink?.guidanceObjective?.diploma || "N/A"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-[#16151C] w-44">Price:</span>
                      <span className="font-semibold text-[#16151C]">
                        £ {selectedLink?.guidancePrice || "N/A"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Student & Parent Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-[#16151C] mb-4">Student Info:</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[#16151C]">Name: </span>
                      <span className="text-[#16151C]">
                        {selectedLink?.userDetails?.firstName}{" "}
                        {selectedLink?.userDetails?.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]">Email: </span>
                      <span className="text-[#16151C]">
                        {selectedLink?.userDetails?.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]">Contact No: </span>
                      <span className="text-[#16151C]">
                        {selectedLink?.userDetails?.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]">Address: </span>
                      <span className="text-[#16151C]">
                        {selectedLink?.userDetails?.address || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]">City: </span>
                      <span className="text-[#16151C]">
                        {selectedLink?.userDetails?.city || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]">ZIP: </span>
                      <span className="text-[#16151C]">
                        {selectedLink?.userDetails?.zip || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]">Country: </span>
                      <span className="text-[#16151C]">
                        {selectedLink?.userDetails?.country?.label || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]">GMT: </span>
                      <span className="text-[#16151C]">
                        {selectedLink?.userDetails?.gmtTimezone || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#16151C] mb-4">Parent Info:</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[#16151C]">Name: </span>
                      <span className="text-[#16151C]">
                        {selectedLink?.userDetails?.parentFirstName}{" "}
                        {selectedLink?.userDetails?.parentLastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]">Email: </span>
                      <span className="text-[#16151C]">
                        {selectedLink?.userDetails?.parentEmail}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]">Contact No: </span>
                      <span className="text-[#16151C]">
                        {selectedLink?.userDetails?.parentPhone}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]">Relationship: </span>
                      <span className="text-[#16151C]">
                        {selectedLink?.userDetails?.relation || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setShowModal(false)}
                variant="outlined"
                sx={{
                  width: 166,
                  height: 50,
                  borderRadius: "8px",
                  borderColor: "#D1D5DB",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#374151",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#9CA3AF",
                    backgroundColor: "#F9FAFB",
                  },
                }}
              >
                Back
              </Button>
              <Button
                disabled={loading}
                color="error"
                variant="outlined"
                sx={{
                  width: 166,
                  height: 50,
                  borderRadius: "8px",
                  backgroundColor: "#A81E1E0D",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#A81E1E",
                  borderColor: "#A81E1E",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#A81E1E0D" },
                  "&:disabled": { backgroundColor: "#9CA3AF" },
                }}
                onClick={() => handleDeleteClick(selectedLink)}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </CustomModal>
      )}

    </div>
  )
}

export default ProcessedRequestCoursesForm
