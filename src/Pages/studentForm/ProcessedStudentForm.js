import React, { useState, useEffect } from "react"
import { db } from "../../firebase"
import { collection, doc, deleteDoc, query, onSnapshot, orderBy } from "firebase/firestore"
import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { Button } from "@mui/material"
import { toast } from "react-hot-toast"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"
import Slide from "@mui/material/Slide"

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const ProcessedStudentForm = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState({})
  const [loading, setLoading] = useState(false)
  const [studentData, setStudentData] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    const ordersRef = collection(db, "adminPanel")
    const customDocRef = doc(ordersRef, "processedStudentForm")
    const orderCollectionRef = collection(customDocRef, "processedStudentForm")

    const orderedQuery = query(orderCollectionRef, orderBy("processedAt", "desc"))

    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = []
        querySnapshot.forEach((doc) => {
          fetchedData.push({ ...doc.data(), id: doc.id })
        })
        setStudentData(fetchedData)
      },
      () => {
        toast.error("Error fetching data")
      }
    )

    return () => {
      unsubscribe()
    }
  }

  const handleDeleteClick = async (student) => {
    try {
      setLoading(true)
      const prevOrdersRef = collection(db, "adminPanel")
      const prevCustomDocRef = doc(prevOrdersRef, "processedStudentForm")
      const prevOrderCollectionRef = collection(prevCustomDocRef, "processedStudentForm")

      const studentDocRef = doc(prevOrderCollectionRef, student.id)
      await deleteDoc(studentDocRef)

      setShowModal(false)
      toast.success("Deleted successfully")
    } catch (error) {
      toast.error("Error deleting student form")
      console.error("Error deleting student form: ", error)
    } finally {
      setLoading(false)
    }
  }

  const itemsPerPage = 5
  const [currentPage, setCurrentPage] = React.useState(1)

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedSessions = studentData?.slice(startIndex, endIndex)

  function formatDateTime(timestampData) {
    const dateObject = new Date(
      timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000
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

    return { date: formattedDate, time: formattedTime }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Processed Forms</h2>
        <span className="text-sm text-gray-500">{String(studentData?.length || 0).padStart(2, "0")} Forms</span>
      </div>

      <div className="space-y-3">
        {displayedSessions.map((student, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <Accordion className="shadow-none">
              <AccordionSummary
                expandIcon={<ExpandMoreIcon className="text-gray-400" />}
                className="hover:bg-gray-50"
              >
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="text-sm text-gray-700">{student?.userDetails?.email}</span>
                </div>
              </AccordionSummary>
              <AccordionDetails className="border-t border-gray-100">
                <div className="text-sm leading-relaxed text-gray-700">
                  {student?.type === "new" ? (
                    <div className="p-4">
                      <div className="text-center mb-4">
                        <h3 className="font-medium text-gray-900">Inquiry Form</h3>
                      </div>
                      <div><strong>Program:</strong> {student.program || "N/A"}</div>
                      <div><strong>Class:</strong> {student.class || "N/A"}</div>
                      <div>
                        <strong>Selected Subjects:</strong>{" "}
                        {student.selectedSubjects.length ? student.selectedSubjects.join(", ") : "None"}
                      </div>
                      <div><strong>Tutoring Support:</strong> {student.tutoringSupport || "N/A"}</div>
                      <div><strong>Package:</strong> {student.package || "N/A"}</div>
                      <div><strong>Hours Requested:</strong> {student.hours}</div>
                      <div>
                        <strong>Lesson Dates:</strong>
                        <ul className="list-disc ml-6">
                          {student.lessonDates?.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div><strong>Time Zone:</strong> {student.timeZone || "N/A"}</div>
                      <div><strong>Support Needed:</strong> {student.guidanceAndSupport?.needed ? "Yes" : "No"}</div>
                      <div><strong>Total Cost:</strong> £{student.totalCost}</div>
                      <div><strong>Total Cost After Support:</strong> £{student.totalCostAfterGuidanceAndSupport}</div>
                    </div>
                  ) : (
                    <div className="p-4">
                      {student?.chosenPricingPlan === "Other Plans" ? (
                        <h3 className="font-medium text-gray-900 mb-2">Inquiry Form:</h3>
                      ) : (
                        <h3 className="font-medium text-gray-900 mb-2">Guidance and Support Form:</h3>
                      )}
                      <div><strong>Submission Date:</strong> {formatDateTime(student?.submittedAt)?.date}</div>
                      <div><strong>Submission Time:</strong> {formatDateTime(student?.submittedAt)?.time}</div>
                      <div><strong>User TimeZone:</strong> {student?.timeZone}</div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setShowModal(true)
                        setSelectedLink(student)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        ))}
      </div>

      {studentData?.length > itemsPerPage && (
        <div className="flex justify-center mt-6">
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(studentData?.length / itemsPerPage)}
              page={currentPage}
              onChange={handleChangePage}
            />
          </Stack>
        </div>
      )}

      {studentData?.length === 0 && (
        <div className="text-center text-gray-400 py-12">No Processed Forms</div>
      )}

      <Dialog
        open={showModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => setShowModal(false)}
      >
        <DialogTitle>{"Please confirm to delete this form."}</DialogTitle>
        <DialogActions>
          <Button variant="outlined" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            disabled={loading}
            color="error"
            variant="contained"
            onClick={() => handleDeleteClick(selectedLink)}
          >
            {loading ? "Deleting" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ProcessedStudentForm
