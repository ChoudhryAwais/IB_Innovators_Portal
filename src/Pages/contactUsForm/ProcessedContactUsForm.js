import React, { useEffect, useState } from "react"
import { db } from "../../firebase"
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
} from "firebase/firestore"

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

const ProcessedContactUsForm = () => {
  const [contactUsSubmissions, setContactUsSubmissions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const ordersRef = collection(db, "adminPanel")
    const customDocRef = doc(ordersRef, "processedContactUsForm")
    const orderCollectionRef = collection(customDocRef, "processedContactUsForm")

    const orderedQuery = query(orderCollectionRef, orderBy("processedAt", "desc"))

    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = []
        querySnapshot.forEach((doc) => {
          fetchedData.push({ ...doc.data(), id: doc.id })
        })

        fetchedData.sort((a, b) => b.submittedAt.toDate() - a.submittedAt.toDate())
        setContactUsSubmissions(fetchedData)
      },
      (error) => {
        alert("Error fetching data: ", error)
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
      const prevCustomDocRef = doc(prevOrdersRef, "processedContactUsForm")
      const prevOrderCollectionRef = collection(prevCustomDocRef, "processedContactUsForm")

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

  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedSessions = contactUsSubmissions?.slice(startIndex, endIndex)

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
        <span className="text-sm text-gray-500">
          {String(contactUsSubmissions?.length || 0).padStart(2, "0")} Forms
        </span>
      </div>

      <div className="space-y-3">
        {displayedSessions.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <Accordion className="shadow-none">
              <AccordionSummary
                expandIcon={<ExpandMoreIcon className="text-gray-400" />}
                className="hover:bg-gray-50"
              >
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {item?.firstName} {item?.lastName}
                    </span>
                    <span className="text-sm text-gray-500">{item?.email}</span>
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails className="border-t border-gray-100">
                <div className="mb-4 mr-4 ml-4 space-y-1">
                  <div>
                    <strong>Submission Date:</strong> {formatDateTime(item?.submittedAt)?.date}
                  </div>
                  <div>
                    <strong>Submission Time:</strong> {formatDateTime(item?.submittedAt)?.time}
                  </div>
                  <div>
                    <strong>Email:</strong> {item?.email || "N/A"}
                  </div>
                  <div>
                    <strong>Phone:</strong> {item.phone}
                  </div>
                  <div>
                    <strong>Country:</strong> {item?.country?.label}
                  </div>
                  <div>
                    <strong>Graduation Year:</strong> {item?.graduationYear}
                  </div>
                  <div>
                    <strong>Message:</strong> {item.howCanWeSupport}
                  </div>
                </div>

                <div className="flex justify-end items-center">
                  <Button
                    onClick={() => {
                      setShowModal(true)
                      setSelectedLink(item)
                    }}
                    variant="outlined"
                    color="error"
                  >
                    Delete
                  </Button>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
        ))}
      </div>

      {contactUsSubmissions?.length > itemsPerPage && (
        <div className="flex justify-center mt-6">
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(contactUsSubmissions?.length / itemsPerPage)}
              page={currentPage}
              onChange={handleChangePage}
            />
          </Stack>
        </div>
      )}

      {contactUsSubmissions?.length === 0 && (
        <div className="text-center text-gray-400 py-12">No Processed Forms</div>
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

export default ProcessedContactUsForm
