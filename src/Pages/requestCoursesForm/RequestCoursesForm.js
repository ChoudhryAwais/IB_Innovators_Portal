"use client"

import React from "react"
import { MyContext } from "../../Context/MyContext"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../../firebase"
import { collection, doc, onSnapshot, addDoc, deleteDoc, orderBy, query } from "firebase/firestore"
import { ChevronRightIcon } from "@heroicons/react/24/outline"
import ProcessedRequestCoursesForm from "./ProcessedRequestCoursesForm"
import { toast } from "react-hot-toast"

const RequestCoursesForm = () => {
  const { setIsUserLoggedIn, setUserType, setUserDetails } = useContext(MyContext)
  const navigate = useNavigate()
  const [contactUsSubmissions, setContactUsSubmissions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState({})
  const [loading, setLoading] = useState(false)
  const [expandedItem, setExpandedItem] = useState(null)

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
  const [currentPage, setCurrentPage] = React.useState(1)
  const handleChangePage = (event, newPage) => setCurrentPage(newPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedSessions = contactUsSubmissions?.slice(startIndex, endIndex)

  function formatDateTime(timestampData) {
    const dateObject = new Date(timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000)
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
    <div className=" min-h-screen p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Forms Column */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Pending Forms</h2>
            <span className="text-sm text-gray-500">{String(contactUsSubmissions?.length).padStart(2, "0")} Forms</span>
          </div>

          <div className="space-y-3">
            {displayedSessions.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {item.userDetails?.firstName} {item.userDetails?.lastName}
                    </span>
                    <span className="text-sm text-gray-500">{item.userDetails?.email}</span>
                  </div>
                  <ChevronRightIcon
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedItem === index ? "rotate-90" : ""}`}
                  />
                </div>

                {expandedItem === index && (
                  <div className="border-t border-gray-100 p-4">
                    <div className="mb-4">
                      <div className="border-b border-gray-300 pb-4 mb-4">
                        <div className="mb-2">
                          <strong>Submitted By UserType:</strong> {item?.userType}
                        </div>
                        <div className="mb-2">
                          <strong>User Timezone:</strong> {item?.timeZone}
                        </div>
                        <div className="mb-2">
                          <strong>Desired Course Attributes:</strong>
                          <ul className="list-disc list-inside ml-4">
                            <li>Hours: {item?.desiredCourse?.courseHours}</li>
                            <li>Price: £ {item?.desiredCourse?.price}</li>
                          </ul>
                        </div>
                        <div className="mb-2">
                          <strong>End Date & Time:</strong> {formatDateTime(item?.endDateAndTime)}
                        </div>
                        <div className="mb-2">
                          <strong>Start Date & Time:</strong> {formatDateTime(item?.startDateAndTime)}
                        </div>
                        <div className="mb-2">
                          <strong>Final Exam Date:</strong> {item?.finalExamDate}
                        </div>
                        <div className="mb-2">
                          <strong>Objective:</strong>
                          <ul className="list-disc list-inside ml-4">
                            {item.objective?.map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mb-2">
                          <strong>Seeking Tutoring For:</strong>
                          <ul className="list-disc list-inside ml-4">
                            {item.seekingTutoringFor?.map((subj, i) => (
                              <li key={i}>{subj}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mb-2">
                          <strong>How often to take lessons:</strong>
                          <ul className="list-disc list-inside ml-4">
                            {item?.howOftenToTakeLesson?.map((freq, i) => (
                              <li key={i}>{freq}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="border-b border-gray-300 pb-4 mb-4">
                        <div className="mb-2">
                          <strong>Want Guidance and Support:</strong> {item?.wantGuidanceAndSupport}
                        </div>
                        {item?.wantGuidanceAndSupport === "yes" && (
                          <>
                            <div className="mb-2">
                              <strong>Guidance & Support Subjects:</strong>
                              <ul className="list-disc list-inside ml-4">
                                {item?.guidanceAndSupportSubjects?.map((sub, index) => (
                                  <li key={index}>{sub}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="mb-2">
                              <strong>Guidance and Support Objective:</strong> {item?.guidanceObjectiveTitle}
                            </div>
                            <div className="mb-2">
                              <strong>Tutor Level:</strong> {item?.guidanceObjective?.level}
                            </div>
                            <div className="mb-2">
                              <strong>Tutor Support Type:</strong> {item?.guidanceObjective?.diploma}
                            </div>
                            <div className="mb-2">
                              <strong>Price:</strong> £ {item?.guidancePrice}
                            </div>
                          </>
                        )}
                      </div>

                      <div>
                        <div className="mb-2">
                          <strong>Student's Information:</strong>
                        </div>
                        <div className="mb-1">
                          <strong>First Name:</strong> {item?.userDetails?.firstName}
                        </div>
                        <div className="mb-1">
                          <strong>Last Name:</strong> {item?.userDetails?.lastName}
                        </div>
                        <div className="mb-1">
                          <strong>Email:</strong> {item?.userDetails?.email}
                        </div>
                        <div className="mb-1">
                          <strong>Phone:</strong> {item?.userDetails?.phone}
                        </div>
                        <div className="mb-1">
                          <strong>Address:</strong> {item?.userDetails?.address || "N/A"}
                        </div>
                        <div className="mb-1">
                          <strong>City:</strong> {item?.userDetails?.city || "N/A"}
                        </div>
                        <div className="mb-1">
                          <strong>ZIP:</strong> {item?.userDetails?.zip || "N/A"}
                        </div>
                        <div className="mb-1">
                          <strong>Country:</strong> {item?.userDetails?.country?.label || "N/A"}
                        </div>
                        <div className="mb-4">
                          <strong>GMT:</strong> {item?.userDetails?.gmtTimezone || "N/A"}
                        </div>

                        <div className="mb-2">
                          <strong>Parent's Information:</strong>
                        </div>
                        <div className="mb-1">
                          <strong>First Name:</strong> {item?.userDetails?.parentFirstName}
                        </div>
                        <div className="mb-1">
                          <strong>Last Name:</strong> {item?.userDetails?.parentLastName}
                        </div>
                        <div className="mb-1">
                          <strong>Email:</strong> {item?.userDetails?.parentEmail}
                        </div>
                        <div className="mb-1">
                          <strong>Phone:</strong> {item?.userDetails?.parentPhone}
                        </div>
                        <div className="mb-1">
                          <strong>Relation:</strong> {item?.userDetails?.relation}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => {
                          setShowModal(true)
                          setSelectedLink(item)
                        }}
                      >
                        Mark as Processed
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {contactUsSubmissions?.length === 0 && (
            <div className="text-center text-gray-400 py-12">No Pending Forms</div>
          )}

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Please confirm to mark this as processed</h3>
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    onClick={() => setShowModal(false)}
                  >
                    No
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                    onClick={() => handleProcessedClick(selectedLink)}
                  >
                    {loading ? "Confirming" : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <ProcessedRequestCoursesForm />
      </div>
    </div>
  )
}

export default RequestCoursesForm
