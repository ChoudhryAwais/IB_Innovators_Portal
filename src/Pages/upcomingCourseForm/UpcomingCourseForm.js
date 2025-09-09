import React, { useEffect, useState } from "react"
import { db } from "../../firebase"
import { collection, doc, onSnapshot, addDoc, deleteDoc, orderBy, query } from "firebase/firestore"
import { ChevronRightIcon } from "@heroicons/react/24/outline"
import ProcessedRevisionCoursesForm from "./ProcessedRevisionCoursesForm"
import { toast } from "react-hot-toast"

const UpcomingCourseForm = () => {
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
    const customDocRef = doc(ordersRef, "upcomingCoursesForm")
    const orderCollectionRef = collection(customDocRef, "upcomingCoursesForm")

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
      const customDocRef = doc(ordersRef, "processedUpcomingCoursesForm")
      const orderCollectionRef = collection(customDocRef, "processedUpcomingCoursesForm")

      await addDoc(orderCollectionRef, { ...item, processedAt: new Date() })

      const prevOrdersRef = collection(db, "adminPanel")
      const prevCustomDocRef = doc(prevOrdersRef, "upcomingCoursesForm")
      const prevOrderCollectionRef = collection(prevCustomDocRef, "upcomingCoursesForm")

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
  const handleChangePage = (event, newPage) => setCurrentPage(newPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedSessions = contactUsSubmissions?.slice(startIndex, endIndex)

  function formatDateTime(timestampData) {
    const dateObject = new Date(timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000)
    const formattedTime = dateObject.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
    const formattedDate = dateObject.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
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
                    <div className="mb-4 space-y-2">
                      <div><strong>Course Heading:</strong> {item.courseData?.heading}</div>
                      <div><strong>Course Tagline:</strong> {item.courseData?.tagline}</div>
                      <div><strong>Submitted By UserType:</strong> {item?.userType}</div>
                      <div><strong>User Timezone:</strong> {item?.timeZone}</div>
                      <div><strong>Objective:</strong>
                        <ul className="list-disc list-inside ml-4">{item.objective?.map((o, i) => <li key={i}>{o}</li>)}</ul>
                      </div>
                      <div><strong>Seeking Tutoring For:</strong>
                        <ul className="list-disc list-inside ml-4">{item.seekingTutoringFor?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                      </div>
                      <div><strong>How often to take lessons:</strong>
                        <ul className="list-disc list-inside ml-4">{item?.howOftenToTakeLesson?.map((f, i) => <li key={i}>{f}</li>)}</ul>
                      </div>
                      <div><strong>Course Type:</strong> {item?.selectedCourse?.title}</div>
                      <div><strong>Total Teaching Hours:</strong> {item?.selectedCourse?.hours * item?.seekingTutoringFor?.length}</div>
                      <div><strong>Price:</strong> £ {item?.quotedPrice}</div>
                      <div><strong>Want Guidance and Support:</strong> {item?.wantGuidanceAndSupport}</div>
                      {item?.wantGuidanceAndSupport === "yes" && (
                        <>
                          <div><strong>Guidance & Support Subjects:</strong>
                            <ul className="list-disc list-inside ml-4">{item?.guidanceAndSupportSubjects?.map((g, i) => <li key={i}>{g}</li>)}</ul>
                          </div>
                          <div><strong>Guidance and Support Objective:</strong> {item?.guidanceObjectiveTitle}</div>
                          <div><strong>Tutor Level:</strong> {item?.guidanceObjective?.level}</div>
                          <div><strong>Tutor Support Type:</strong> {item?.guidanceObjective?.diploma}</div>
                          <div><strong>Price:</strong> £ {item?.guidancePrice}</div>
                        </>
                      )}
                      <div><strong>Student&apos;s Information:</strong></div>
                      <div><strong>First Name:</strong> {item?.userDetails?.firstName}</div>
                      <div><strong>Last Name:</strong> {item?.userDetails?.lastName}</div>
                      <div><strong>Email:</strong> {item?.userDetails?.email}</div>
                      <div><strong>Phone:</strong> {item?.userDetails?.phone}</div>
                      <div><strong>Address:</strong> {item?.userDetails?.address || "N/A"}</div>
                      <div><strong>City:</strong> {item?.userDetails?.city || "N/A"}</div>
                      <div><strong>ZIP:</strong> {item?.userDetails?.zip || "N/A"}</div>
                      <div><strong>Country:</strong> {item?.userDetails?.country?.label || "N/A"}</div>
                      <div><strong>GMT:</strong> {item?.userDetails?.gmtTimezone || "N/A"}</div>
                      <div className="mt-4"><strong>Parent&apos;s Information:</strong></div>
                      <div><strong>First Name:</strong> {item?.userDetails?.parentFirstName}</div>
                      <div><strong>Last Name:</strong> {item?.userDetails?.parentLastName}</div>
                      <div><strong>Email:</strong> {item?.userDetails?.parentEmail}</div>
                      <div><strong>Phone:</strong> {item?.userDetails?.parentPhone}</div>
                      <div><strong>Relation:</strong> {item?.userDetails?.relation}</div>
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

        <ProcessedRevisionCoursesForm />
      </div>
    </div>
  )
}

export default UpcomingCourseForm
