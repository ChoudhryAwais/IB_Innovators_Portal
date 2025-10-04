"use client"

import React, { useContext, useEffect, useState } from "react"
import { MyContext } from "../../Context/MyContext"
import { useNavigate } from "react-router-dom"
import { db } from "../../firebase"
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  deleteDoc,
  orderBy,
  query,
} from "firebase/firestore"
import { ChevronRightIcon } from "@heroicons/react/24/outline"
import ProcessedRequestCoursesForm from "./ProcessedRequestCoursesForm"
import { toast } from "react-hot-toast"
import { Button, ListItemButton } from "@mui/material"
import CustomModal from "../../Components/CustomModal/CustomModal"
import Stack from "@mui/material/Stack";


const RequestCoursesForm = () => {
  const { isUserLoggedIn, setIsUserLoggedIn, setUserType, setUserDetails, userType } =
    useContext(MyContext)
  const navigate = useNavigate()
  const [contactUsSubmissions, setContactUsSubmissions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const ordersRef = collection(db, "adminPanel")
    const customDocRef = doc(ordersRef, "requestCourseForm")
    const orderCollectionRef = collection(customDocRef, "requestCourseForm")
    const orderedQuery = query(orderCollectionRef, orderBy("submittedAt", "desc"))

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

  const handleProcessedClick = async (item) => {
    try {
      setLoading(true)
      const ordersRef = collection(db, "adminPanel")
      const customDocRef = doc(ordersRef, "processedRequestCourseForm")
      const orderCollectionRef = collection(customDocRef, "processedRequestCourseForm")

      await addDoc(orderCollectionRef, { ...item, processedAt: new Date() })

      const prevOrdersRef = collection(db, "adminPanel")
      const prevCustomDocRef = doc(prevOrdersRef, "requestCourseForm")
      const prevOrderCollectionRef = collection(prevCustomDocRef, "requestCourseForm")

      const docToDelete = doc(prevOrderCollectionRef, item.id)
      await deleteDoc(docToDelete)

      setShowModal(false)
      toast.success("Marked as processed")
    } catch (error) {
      toast.error("Error processing teacher form")
      console.error("Error processing teacher form: ", error)
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


  const getVisiblePages = (currentPage, totalPages, maxVisible = 4) => {
    let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxVisible + 1, 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages(currentPage, Math.ceil(contactUsSubmissions?.length / itemsPerPage));


  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Pending Forms Column */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6 pb-2 border-b border-gray-200 ">
            <h2 className="text-[20px] font-semibold text-[#16151C]">Pending Forms</h2>
            <span className="text-[14px] font-light text-[#A2A1A8]">
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
                  p: 0,
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
                  <span className="font-light text-[16px] text-[#16151C]">
                    {item.userDetails?.firstName} {item.userDetails?.lastName}
                  </span>
                  <span className="text-[12px] font-light text-[#A2A1A8]">{item.userDetails?.email}</span>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-[#16151C]" />
              </ListItemButton>
            ))}
          </div>

          {contactUsSubmissions?.length === 0 && (
            <div className="text-center text-[#16151C] pb-4 mb-2">No Pending Forms</div>
          )}
        </div>

        {contactUsSubmissions?.length > itemsPerPage && (
          <div className="mt-6 flex items-center justify-center px-4 py-3 bg-white">
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Previous button */}
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                sx={{ minWidth: '32px', padding: '4px' }}
              >
                <svg
                  width="6"
                  height="12"
                  viewBox="0 0 6 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.46849 11.5856C5.79194 11.3269 5.84438 10.8549 5.58562 10.5315L1.96044 5.99997L5.58562 1.46849C5.84438 1.14505 5.79194 0.673077 5.46849 0.41432C5.14505 0.155562 4.67308 0.208004 4.41432 0.53145L0.414321 5.53145C0.19519 5.80536 0.19519 6.19458 0.414321 6.46849L4.41432 11.4685C4.67308 11.7919 5.14505 11.8444 5.46849 11.5856Z"
                    fill="#16151C"
                  />
                </svg>
              </Button>

              {/* Page numbers */}
              {visiblePages.map((page) => (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  sx={{
                    width: page === currentPage ? 35 : 32,
                    minWidth: 'unset',
                    height: 36,
                    borderRadius: page === currentPage ? '8px' : '50px',
                    padding: '7px 12px',
                    gap: '10px',
                    borderWidth: page === currentPage ? 1 : 0,
                    border: page === currentPage ? '1px solid #4071B6' : 'none',
                    background: '#FFFFFF',
                    color: page === currentPage ? '#4071B6' : '#16151C',
                    fontWeight: page === currentPage ? 600 : 300,
                    fontSize: '14px',
                  }}
                >
                  {page}
                </Button>
              ))}

              {/* Next button */}
              <Button
                disabled={currentPage === Math.ceil(contactUsSubmissions?.length / itemsPerPage)}
                onClick={() => setCurrentPage(currentPage + 1)}
                sx={{ minWidth: '32px', padding: '4px' }}
              >
                <svg
                  width="6"
                  height="12"
                  viewBox="0 0 6 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.531506 11.5856C0.20806 11.3269 0.155619 10.8549 0.414376 10.5315L4.03956 5.99997L0.414376 1.46849C0.155618 1.14505 0.208059 0.673077 0.531506 0.41432C0.854952 0.155562 1.32692 0.208004 1.58568 0.53145L5.58568 5.53145C5.80481 5.80536 5.80481 6.19458 5.58568 6.46849L1.58568 11.4685C1.32692 11.7919 0.854953 11.8444 0.531506 11.5856Z"
                    fill="#16151C"
                  />
                </svg>
              </Button>
            </Stack>
          </div>
        )}

        <ProcessedRequestCoursesForm />
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
          <div
            className="h-full overflow-auto p-6"
            style={{ boxSizing: "border-box" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#16151C]">
                Pending Forms{" "}
                <span className="font-light text-lg">(Request Course Forms)</span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[14px]">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <span className="text-[#16151C] font-light">Submitted By:</span>
                  <span className="font-medium text-[#16151C]">
                    {selectedLink?.userType || "Student"}
                  </span>

                  <span className="text-[#16151C] font-light">Time Zone:</span>
                  <span className="font-medium text-[#16151C]">
                    {selectedLink?.timeZone || "N/A"}
                  </span>

                  <span className="text-[#16151C] font-light">Objective:</span>
                  <div className="font-medium text-[#16151C] space-y-1">
                    {selectedLink?.objective?.map((obj, i) => (
                      <div key={i}>{obj}</div>
                    ))}
                  </div>

                  <span className="text-[#16151C] font-light">Seeking Tutoring For:</span>
                  <div className="font-medium text-[#16151C] space-y-1">
                    {selectedLink?.seekingTutoringFor?.map(
                      (subj, index) => (
                        <div key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-gray-900 rounded-full mr-2"></span>
                          {subj}
                        </div>
                      ),
                    )}

                  </div>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-2 -mr-8">
                <div className="font-medium text-[#16151C]">
                  Desired Course Attributes
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <span className="text-[#16151C] font-light">Start Date & Time:</span>
                  <span className="font-medium text-[#16151C]">
                    {formatDateTime(selectedLink?.startDateAndTime)}
                  </span>

                  <span className="text-[#16151C] font-light">End Date & Time:</span>
                  <span className="font-medium text-[#16151C]">
                    {formatDateTime(selectedLink?.endDateAndTime)}
                  </span>

                  <span className="text-[#16151C] font-light">Final Exam Date:</span>
                  <span className="font-medium text-[#16151C]">
                    {selectedLink?.finalExamDate || "N/A"}
                  </span>

                  <div className="col-span-2 h-4"></div>

                  <span className="text-[#16151C] font-light">Hours:</span>
                  <span className="font-medium text-[#16151C]">
                    {selectedLink?.desiredCourse?.courseHours || "N/A"}
                  </span>

                  <span className="text-[#16151C] font-light">Price:</span>
                  <span className="font-medium text-[#16151C]">
                    £ {selectedLink?.desiredCourse?.price || "N/A"}
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-2 pl-12">
                <div className="font-medium text-[#16151C] mb-2">
                  How Often to Take Lessons
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {selectedLink?.howOftenToTakeLesson?.map((freq, i) => {
                    const [day, time] = freq.split("-").map((s) => s.trim())
                    return (
                      <React.Fragment key={i}>
                        <span className="text-[#16151C]  font-light">{day}:</span>
                        <span className=" text-[#16151C] font-light">{time}</span>
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Guidance & Support */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-sm">
              <h3 className="font-medium text-[#16151C] mb-4">
                Guidance & Support Details:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-[#16151C] w-44 font-light">Need Support:</span>
                    <span className="font-medium text-[#16151C]">
                      {selectedLink?.wantGuidanceAndSupport === "yes" ? "Yes" : "No"}
                    </span>
                  </div>
                  {selectedLink?.wantGuidanceAndSupport === "yes" && (
                    <>
                      <div className="flex">
                        <span className="text-[#16151C] w-44 font-light">Subjects:</span>
                        <div className="font-medium text-[#16151C] space-y-1">
                          {selectedLink?.guidanceAndSupportSubjects?.map(
                            (sub, index) => (
                              <div key={index} className="flex items-center">
                                <span className="w-1 h-1 bg-gray-900 rounded-full mr-2"></span>
                                {sub}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                      <div className="flex">
                        <span className="text-[#16151C] w-44 font-light">Objective:</span>
                        <span className="font-medium text-[#16151C]">
                          {selectedLink?.guidanceObjectiveTitle || "N/A"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {selectedLink?.wantGuidanceAndSupport === "yes" && (
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-[#16151C] w-44 font-light">Tutor Level:</span>
                      <span className="font-medium text-[#16151C]">
                        {selectedLink?.guidanceObjective?.level || "N/A"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-[#16151C] w-44 font-light">Tutor Support Type:</span>
                      <span className="font-medium text-[#16151C]">
                        {selectedLink?.guidanceObjective?.diploma || "N/A"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-[#16151C] w-44 font-light">Price:</span>
                      <span className="font-medium text-[#16151C]">
                        £ {selectedLink?.guidancePrice || "N/A"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Student & Parent Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium text-[#16151C] mb-4">
                    Student Info:
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[#16151C] font-light">Name: </span>
                      <span className="text-[#16151C] font-light">
                        {selectedLink?.userDetails?.firstName}{" "}
                        {selectedLink?.userDetails?.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]  font-light">Email: </span>
                      <span className="text-[#16151C]  font-light">
                        {selectedLink?.userDetails?.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]  font-light">Contact No: </span>
                      <span className="text-[#16151C]  font-light">
                        {selectedLink?.userDetails?.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]  font-light">Address: </span>
                      <span className="text-[#16151C]  font-light">
                        {selectedLink?.userDetails?.address || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]  font-light">City: </span>
                      <span className="text-[#16151C]  font-light">
                        {selectedLink?.userDetails?.city || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]  font-light">ZIP: </span>
                      <span className="text-[#16151C]  font-light">
                        {selectedLink?.userDetails?.zip || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]  font-light">Country: </span>
                      <span className="text-[#16151C]  font-light">
                        {selectedLink?.userDetails?.country?.label || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]  font-light">GMT: </span>
                      <span className="text-[#16151C]  font-light">
                        {selectedLink?.userDetails?.gmtTimezone || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-[#16151C] mb-4">Parent Info:</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[#16151C]  font-light">Name: </span>
                      <span className="text-[#16151C]  font-light">
                        {selectedLink?.userDetails?.parentFirstName}{" "}
                        {selectedLink?.userDetails?.parentLastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]  font-light">Email: </span>
                      <span className="text-[#16151C]  font-light">
                        {selectedLink?.userDetails?.parentEmail}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]  font-light">Contact No: </span>
                      <span className="text-[#16151C]  font-light">
                        {selectedLink?.userDetails?.parentPhone}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#16151C]  font-light">Relation: </span>
                      <span className="text-[#16151C]  font-light">
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
                  borderColor: "#A2A1A833",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#16151C",
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
                variant="contained"
                sx={{
                  width: 166,
                  height: 50,
                  borderRadius: "8px",
                  backgroundColor: "#4071B6",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  textTransform: "none",
                  padding: 0,
                  "&:hover": { backgroundColor: "#4071B6" },
                  "&:disabled": { backgroundColor: "#9CA3AF" },
                }}
                onClick={() => handleProcessedClick(selectedLink)}
              >
                {loading ? "Processing..." : "Mark as Processed"}
              </Button>
            </div>
          </div>
        </CustomModal>
      )}
    </div>
  )
}

export default RequestCoursesForm
