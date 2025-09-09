"use client"

import React from "react"
import { MyContext } from "../../Context/MyContext"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../../firebase"
import { collection, doc, onSnapshot, addDoc, query, deleteDoc, orderBy } from "firebase/firestore"

import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"
import Slide from "@mui/material/Slide"
import ProcessedContactUsForm from "./ProcessedContactUsForm"
import { toast } from "react-hot-toast"
import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const ContactUsForm = () => {
  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("Contact Us")
    setSecondMessage("Show all Contact Us Forms")
  }, [setFirstMessage, setSecondMessage])

  const { isUserLoggedIn, setIsUserLoggedIn, setUserType, setUserDetails, userType } = useContext(MyContext)
  const navigate = useNavigate()
  const [contactUsSubmissions, setContactUsSubmissions] = useState([])
  const [expanded, setExpanded] = useState(null)

  const [createAccountModal, setCreateAccountModal] = useState(false)
  const [selectedTutor, setSelectedTutor] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const ordersRef = collection(db, "adminPanel")
    const customDocRef = doc(ordersRef, "contactUsForm")
    const orderCollectionRef = collection(customDocRef, "contactUsForm")

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
        alert("Error fetching data: ", error)
      },
    )

    return () => {
      unsubscribe()
    }
  }

  const handleProcessedClick = async (item) => {
    try {
      setLoading(true)
      const ordersRef = collection(db, "adminPanel")
      const customDocRef = doc(ordersRef, "processedContactUsForm")
      const orderCollectionRef = collection(customDocRef, "processedContactUsForm")

      await addDoc(orderCollectionRef, { ...item, processedAt: new Date() })

      const prevOrdersRef = collection(db, "adminPanel")
      const prevCustomDocRef = doc(prevOrdersRef, "contactUsForm")
      const prevOrderCollectionRef = collection(prevCustomDocRef, "contactUsForm")

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

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage)
  }

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

    return { date: formattedDate, time: formattedTime }
  }

  return (
    <TopHeadingProvider>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Contact Us Forms ({contactUsSubmissions?.length || 0})
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Forms Column */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Pending Forms</h2>
                <span className="text-sm text-gray-500">
                  {String(contactUsSubmissions?.length || 0).padStart(2, "0")}
                  Forms
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
                        <div className="mb-4 mr-4 ml-4">
                          <div>
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
                        </div>

                        <div className="flex justify-end items-center">
                          <Button
                            variant="contained"
                            onClick={() => {
                              setShowModal(true)
                              setSelectedLink(item)
                            }}
                          >
                            Mark as Processed
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
                <div className="text-center text-gray-400 py-12">No Pending Forms</div>
              )}

              {/* Dialog for confirmation */}
              <Dialog
                open={showModal}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => {
                  setShowModal(false)
                }}
                aria-describedby="alert-dialog-slide-description"
              >
                <DialogTitle>{"Please confirm to mark this as processed"}</DialogTitle>

                <DialogActions>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowModal(false)
                    }}
                  >
                    No
                  </Button>
                  <Button disabled={loading} variant="contained" onClick={() => handleProcessedClick(selectedLink)}>
                    {loading ? "Submitting" : "Confirm"}
                  </Button>
                </DialogActions>
              </Dialog>
            </div>

            <ProcessedContactUsForm />
          </div>
        </div>
      </div>
    </TopHeadingProvider>
  )
}

export default ContactUsForm
