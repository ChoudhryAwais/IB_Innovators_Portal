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

const ProcessedRevisionCoursesForm = () => {
  const { isUserLoggedIn, setIsUserLoggedIn, setUserType, setUserDetails, userType } =
    useContext(MyContext)
  const navigate = useNavigate()
  const [contactUsSubmissions, setContactUsSubmissions] = useState([])
  const [showModal, setShowModal] = useState(false) // For custom modal if needed
  const [selectedLink, setSelectedLink] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const ordersRef = collection(db, "adminPanel")
    const customDocRef = doc(ordersRef, "processedRevisionCoursesForm")
    const orderCollectionRef = collection(customDocRef, "processedRevisionCoursesForm")

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
      (error) => {
        toast.error("Error fetching data: ", error)
      },
    )

    return () => unsubscribe()
  }

  const handleDeleteClick = async (item) => {
    try {
      setLoading(true)
      const prevOrdersRef = collection(db, "adminPanel")
      const prevCustomDocRef = doc(prevOrdersRef, "processedRevisionCoursesForm")
      const prevOrderCollectionRef = collection(prevCustomDocRef, "processedRevisionCoursesForm")

      const docToDelete = doc(prevOrderCollectionRef, item.id)
      await deleteDoc(docToDelete)

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
    <div className="min-h-screen">
      <div className="grid grid-cols-1 gap-6">
        {/* Processed Forms Column */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
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
                  setShowModal(true) // 🔹 Add your custom modal here
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
        </div>
      </div>

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
                Processed Forms{" "}
                <span className="font-light text-lg">(Revision Courses Forms)</span>
              </h2>
              <div className="flex items-center gap-2">
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
                   {selectedLink?.seekingTutoringFor?.map(
                            (subj, index) => (
                              <div key={index} className="flex items-center">
                                <span className="w-1 h-1 bg-gray-900 rounded-full mr-2"></span>
                                {subj}
                              </div>
                            )
                          )}
                  </div>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                   <span className="text-[#16151C]">Tutor Support Type:</span>
                  <span className="font-semibold text-[#16151C]">
                    {selectedLink?.tutorSupportType || "Certified IB Examiner"}
                  </span>

                  <span className="text-[#16151C]">Course Type:</span>
                  <span className="font-semibold text-[#16151C]">
                    {selectedLink?.selectedCourse?.title || "N/A"}
                  </span>

                  <span className="text-[#16151C]">Final Exam Date:</span>
                  <span className="font-semibold text-[#16151C]">
                    {selectedLink?.finalExamDate || "N/A"}
                  </span>

                  <div className="col-span-2 h-2"></div>

                  <span className="text-[#16151C]">Total Teaching Hours:</span>
                  <span className="font-semibold text-[#16151C]">
                    {selectedLink?.selectedCourse?.hours *
                      (selectedLink?.seekingTutoringFor?.length || 0)}
                  </span>

                  <span className="text-[#16151C]">Price:</span>
                  <span className="font-semibold text-[#16151C]">
                    £ {selectedLink?.quotedPrice || "N/A"}
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
                        <span className="text-[#16151C]">{time}</span>
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
              {selectedLink?.wantGuidanceAndSupport === "yes" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-[#16151C] w-44">Subjects:</span>
                      <div className="font-semibold text-[#16151C] space-y-1">
                        {selectedLink?.guidanceAndSupportSubjects?.map((sub, index) => (
                          <div key={index}>{sub}</div>
                        ))}
                      </div>
                    </div>
                    <div className="flex">
                      <span className="text-[#16151C] w-44">Objective:</span>
                      <span className="font-semibold text-[#16151C]">
                        {selectedLink?.guidanceObjectiveTitle || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-[#16151C] w-44">Tutor Level:</span>
                      <span className="font-semibold text-[#16151C]">
                        {selectedLink?.guidanceObjective?.level || "N/A"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-[#16151C] w-44">Support Type:</span>
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
                </div>
              ) : (
                 <div className="flex">
                      <span className="text-[#16151C] w-44">Need Support:</span>
                      <span className="font-semibold text-[#16151C]">
                        {selectedLink?.wantGuidanceAndSupport}
                      </span>
                    </div>
              )}
            </div>

            {/* Student & Parent Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-[#16151C] mb-4">
                    Student Info:
                  </h3>
                  <div className="space-y-3">
                    <div>First Name: {selectedLink?.userDetails?.firstName} {selectedLink?.userDetails?.lastName}</div>
                    <div>Email: {selectedLink?.userDetails?.email}</div>
                    <div>Phone: {selectedLink?.userDetails?.phone}</div>
                    <div>Address: {selectedLink?.userDetails?.address || "N/A"}</div>
                    <div>City: {selectedLink?.userDetails?.city || "N/A"}</div>
                    <div>ZIP: {selectedLink?.userDetails?.zip || "N/A"}</div>
                    <div>Country: {selectedLink?.userDetails?.country?.label || "N/A"}</div>
                    <div>GMT: {selectedLink?.userDetails?.gmtTimezone || "N/A"}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#16151C] mb-4">Parent Info:</h3>
                  <div className="space-y-3">
                    <div>First Name: {selectedLink?.userDetails?.parentFirstName} {selectedLink?.userDetails?.parentLastName}</div>
                    <div>Email: {selectedLink?.userDetails?.parentEmail}</div>
                    <div>Phone: {selectedLink?.userDetails?.parentPhone}</div>
                    <div>Relationship: {selectedLink?.userDetails?.relation || "N/A"}</div>
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
                  fontSize: "16px",
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
                variant="outlined"
                color="error"
                sx={{
                  width: 166,
                  height: 50,
                  borderRadius: "8px",
                  backgroundColor: "#A81E1E0D",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#A81E1E",
                  borderColor: "#A81E1E",
                  textTransform: "none",
                  padding: 0,
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

export default ProcessedRevisionCoursesForm
