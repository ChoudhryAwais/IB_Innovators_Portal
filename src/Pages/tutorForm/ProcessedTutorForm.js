import React, { useEffect, useState } from "react"
import { db } from "../../firebase"
import { collection, doc, onSnapshot, deleteDoc, orderBy, query } from "firebase/firestore"
import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"
import Slide from "@mui/material/Slide"
import { Button } from "@mui/material"
import { toast } from "react-hot-toast"

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const ProcessedTutorForm = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState({})
  const [loading, setLoading] = useState(false)
  const [tutors, setTutors] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const ordersRef = collection(db, "adminPanel")
    const customDocRef = doc(ordersRef, "processedTutorForm")
    const orderCollectionRef = collection(customDocRef, "processedTutorForm")

    const orderedQuery = query(orderCollectionRef, orderBy("processedAt", "desc"))

    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = []
        querySnapshot.forEach((doc) => {
          fetchedData.push({ ...doc.data(), id: doc.id })
        })
        setTutors(fetchedData)
      },
      () => {
        toast.error("Error fetching data")
      },
    )

    return () => {
      unsubscribe()
    }
  }

  const handleDeleteClick = async (student) => {
    try {
      setLoading(true)
      const prevOrdersRef = collection(db, "adminPanel")
      const prevCustomDocRef = doc(prevOrdersRef, "processedTutorForm")
      const prevOrderCollectionRef = collection(prevCustomDocRef, "processedTutorForm")

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
  const displayedSessions = tutors?.slice(startIndex, endIndex)

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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Processed Forms</h2>
        <span className="text-sm text-gray-500">
          {String(tutors?.length || 0).padStart(2, "0")} Forms
        </span>
      </div>

      <div className="space-y-3">
        {displayedSessions.map((tutor, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <Accordion className="shadow-none">
              <AccordionSummary
                expandIcon={<ExpandMoreIcon className="text-gray-400" />}
                className="hover:bg-gray-50"
              >
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-medium text-gray-900">
                    {tutor.firstName} {tutor.lastName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {tutor?.submittedOn && formatDateTime(tutor?.submittedOn)}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails className="border-t border-gray-100">
                <div className="space-y-2 text-gray-700">
                  <div>
                    <strong>City:</strong> {tutor.city}
                  </div>
                  <div>
                    <strong>State:</strong> {tutor.state}
                  </div>
                  <div>
                    <strong>Zip:</strong> {tutor.zip}
                  </div>
                  <div>
                    <strong>Email:</strong> {tutor.email || "Not provided"}
                  </div>
                  <div>
                    <strong>Programmes:</strong> {tutor.programmes.join(", ")}
                  </div>
                  <div>
                    <strong>Subjects:</strong> {tutor.subjects.join(", ")}
                  </div>
                  <div>
                    <strong>Assignments:</strong> {tutor.assignments.join(", ")}
                  </div>
                  <div>
                    <strong>Curricula:</strong> {tutor.curricula.join(", ")}
                  </div>
                  <div>
                    <strong>Resume:</strong>{" "}
                    {tutor.resume ? (
                      <a
                        href={tutor.resume}
                        download
                        className="text-blue-600 underline"
                      >
                        Download Resume
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      setShowModal(true)
                      setSelectedLink(tutor)
                    }}
                    variant="outlined"
                    color="error"
                    className="w-full mt-4"
                  >
                    Delete
                  </Button>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        ))}
      </div>

      {tutors?.length > itemsPerPage && (
        <div className="flex justify-center mt-6">
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(tutors?.length / itemsPerPage)}
              page={currentPage}
              onChange={handleChangePage}
            />
          </Stack>
        </div>
      )}

      {tutors?.length === 0 && (
        <div className="text-center text-gray-400 py-12 text-lg">
          No Processed Forms
        </div>
      )}

      <Dialog
        open={showModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          setShowModal(false)
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Please confirm to delete this form."}</DialogTitle>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setShowModal(false)
            }}
          >
            Cancel
          </Button>
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

export default ProcessedTutorForm
