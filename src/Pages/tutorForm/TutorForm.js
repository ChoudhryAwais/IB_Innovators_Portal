"use client"

import React from "react"
import { MyContext } from "../../Context/MyContext"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../../firebase"
import { collection, doc, onSnapshot, addDoc, deleteDoc, orderBy, query } from "firebase/firestore"
import SignupForm from "./SignupForm"
import { Modal } from "@mui/material"

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
import ProcessedTutorForm from "./ProcessedTutorForm"
import CustomModal from "../../Components/CustomModal/CustomModal"
import { toast } from "react-hot-toast"
import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const TutorForm = () => {
  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("Tutor Resume")
    setSecondMessage("Show all Tutor Forms")
  }, [setFirstMessage, setSecondMessage])

  const { setIsUserLoggedIn, setUserType, setUserDetails } = useContext(MyContext)
  const navigate = useNavigate()
  const [tutors, setTutors] = useState([])
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
    const customDocRef = doc(ordersRef, "teacherForm")
    const orderCollectionRef = collection(customDocRef, "teacherForm")

    const orderedQuery = query(orderCollectionRef, orderBy("submittedAt", "desc"))

    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = []
        querySnapshot.forEach((doc) => {
          fetchedData.push({ ...doc.data(), id: doc.id })
        })
        setTutors(fetchedData)
      },
      (error) => {
        alert("Error fetching data: ", error)
      },
    )

    return () => {
      unsubscribe()
    }
  }

  const handleProcessedClick = async (tutor) => {
    try {
      setLoading(true)
      const ordersRef = collection(db, "adminPanel")
      const customDocRef = doc(ordersRef, "processedTutorForm")
      const orderCollectionRef = collection(customDocRef, "processedTutorForm")

      await addDoc(orderCollectionRef, { ...tutor, processedAt: new Date() })

      const prevOrdersRef = collection(db, "adminPanel")
      const prevCustomDocRef = doc(prevOrdersRef, "teacherForm")
      const prevOrderCollectionRef = collection(prevCustomDocRef, "teacherForm")

      const studentDocRef = doc(prevOrderCollectionRef, tutor.id)
      await deleteDoc(studentDocRef)

      setShowModal(false)
      toast.success("Marked as processed")
    } catch (error) {
      toast.error("Error processing teacher form")
      console.error("Error processing teacher form: ", error)
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
    <TopHeadingProvider>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Tutors Forms ({tutors?.length || 0})</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Forms Column */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Pending Forms</h2>
                <span className="text-sm text-gray-500">{String(tutors?.length || 0).padStart(2, "0")} Forms</span>
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
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {tutor.firstName} {tutor.lastName}
                            </span>
                            <span className="text-sm text-gray-500">{tutor.email}</span>
                          </div>
                          <div>{tutor?.submittedOn && formatDateTime(tutor?.submittedOn)}</div>
                        </div>
                      </AccordionSummary>
                      <AccordionDetails className="border-t border-gray-100">
                        <div className="mb-4 mr-4 ml-4 overflow-hidden">
                          <div>
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
                                <a href={tutor.resume} download>
                                  Download Resume
                                </a>
                              ) : (
                                "Not provided"
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-wrap items-center justify-end">
                          <Button
                            variant="outlined"
                            className="mr-2"
                            onClick={() => {
                              setShowModal(true)
                              setSelectedLink(tutor)
                            }}
                          >
                            Mark as Processed
                          </Button>

                          <Button
                            variant="contained"
                            onClick={() => {
                              setCreateAccountModal(true)
                              setSelectedTutor(tutor)
                            }}
                          >
                            Create Account
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

              {tutors?.length === 0 && <div className="text-center text-gray-400 py-12">No Pending Forms</div>}

              <Modal
                open={createAccountModal}
                onClose={() => {
                  setCreateAccountModal(false)
                }}
              >
                <CustomModal>
                  <SignupForm setCreateAccountModal={setCreateAccountModal} tutor={selectedTutor} />
                </CustomModal>
              </Modal>

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
                    color="error"
                    onClick={() => {
                      setShowModal(false)
                    }}
                  >
                    No
                  </Button>
                  <Button disabled={loading} variant="contained" onClick={() => handleProcessedClick(selectedLink)}>
                    {loading ? "Confirming" : "Confirm"}
                  </Button>
                </DialogActions>
              </Dialog>
            </div>

            <ProcessedTutorForm />
          </div>
        </div>
      </div>
    </TopHeadingProvider>
  )
}

export default TutorForm
