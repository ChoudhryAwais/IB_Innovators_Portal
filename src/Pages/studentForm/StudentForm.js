"use client"

import React, { useState, useEffect } from "react"
import { db } from "../../firebase"
import { collection, doc, addDoc, deleteDoc, query, onSnapshot, orderBy } from "firebase/firestore"
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
import ProcessedStudentForm from "./ProcessedStudentForm"
import { toast } from "react-hot-toast"
import CustomModal from "../../Components/CustomModal/CustomModal"
import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const StudentForm = () => {
  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("1-1 Student Inquiry")
    setSecondMessage("Show all Student Forms")
  }, [setFirstMessage, setSecondMessage])

  const [studentData, setStudentData] = useState([])
  const [expanded, setExpanded] = useState(null)

  const [createAccountModal, setCreateAccountModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState({})

  const [showModal, setShowModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    const ordersRef = collection(db, "adminPanel")
    const customDocRef = doc(ordersRef, "studentForm")
    const orderCollectionRef = collection(customDocRef, "studentForm")

    const orderedQuery = query(orderCollectionRef, orderBy("submittedAt", "desc"))

    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = []
        querySnapshot.forEach((doc) => {
          fetchedData.push({ ...doc.data(), id: doc.id })
        })

        fetchedData.sort((a, b) => new Date(b.submittedOn) - new Date(a.submittedOn))

        setStudentData(fetchedData)
      },
      (error) => {
        toast.error("Error fetching data")
      },
    )

    return () => {
      unsubscribe()
    }
  }

  const handleProcessedClick = async (student) => {
    try {
      setLoading(true)
      const ordersRef = collection(db, "adminPanel")
      const customDocRef = doc(ordersRef, "processedStudentForm")
      const orderCollectionRef = collection(customDocRef, "processedStudentForm")

      await addDoc(orderCollectionRef, { ...student, processedAt: new Date() })

      const prevOrdersRef = collection(db, "adminPanel")
      const prevCustomDocRef = doc(prevOrdersRef, "studentForm")
      const prevOrderCollectionRef = collection(prevCustomDocRef, "studentForm")

      const studentDocRef = doc(prevOrderCollectionRef, student.id)
      await deleteDoc(studentDocRef)

      setShowModal(false)
      toast.success("Marked as processed")
    } catch (error) {
      toast.error("Error processing student form")
      console.error("Error processing student form: ", error)
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
      <div className=" min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Students Forms ({studentData?.length || 0})</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Forms Column */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Pending Forms</h2>
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
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {student?.userDetails?.firstName} {student?.userDetails?.lastName}
                            </span>
                            <span className="text-sm text-gray-500">{student?.userDetails?.email}</span>
                          </div>
                        </div>
                      </AccordionSummary>
                      <AccordionDetails className="border-t border-gray-100">
                        <div>
                          {student?.type === "new" ? (
                            <div className="p-4 font-sans leading-relaxed">
                              <div className="text-center mb-6">
                                <h3>Inquiry Form</h3>
                              </div>

                              <div>
                                <strong>Program:</strong> {student.program || "N/A"}
                              </div>
                              <div>
                                <strong>Class:</strong> {student.class || "N/A"}
                              </div>
                              <div>
                                <strong>Selected Subjects:</strong>{" "}
                                {student.selectedSubjects.length ? student.selectedSubjects.join(", ") : "None"}
                              </div>
                              <div>
                                <strong>Tutoring Support:</strong> {student.tutoringSupport || "N/A"}
                              </div>
                              <div>
                                <strong>Package:</strong> {student.package || "N/A"}
                              </div>
                              <div>
                                <strong>Hours Requested:</strong> {student.hours}
                              </div>
                              <div>
                                <strong>Lesson Dates:</strong>
                                <ul className="list-disc ml-6">
                                  {student.lessonDates?.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <strong>Time Zone:</strong> {student.timeZone || "N/A"}
                              </div>
                              <div>
                                <strong>Support Needed:</strong> {student.guidanceAndSupport?.needed ? "Yes" : "No"}
                              </div>
                              <div>
                                <strong>Total Cost:</strong> £{student.totalCost}
                              </div>
                              <div>
                                <strong>Total Cost After Support:</strong> £{student.totalCostAfterGuidanceAndSupport}
                              </div>

                              {student.guidanceAndSupport?.needed && (
                                <div className="border-t border-gray-300 mt-4 pt-4">
                                  <strong>Guidance & Support Details:</strong>
                                  <br />
                                  <div>
                                    <strong>Assignment Type(s):</strong>{" "}
                                    {student.guidanceAndSupport.assignmentType.length
                                      ? student.guidanceAndSupport.assignmentType.join(", ")
                                      : "None"}
                                  </div>
                                  <div>
                                    <strong>Query:</strong> {student.guidanceAndSupport.query || "N/A"}
                                  </div>
                                  <div>
                                    <strong>Requested Hours:</strong> {student.guidanceAndSupport.hours}
                                  </div>
                                </div>
                              )}

                              <div className="border-t border-gray-300 mt-4 pt-4">
                                <strong>Student Info:</strong>
                                <br />
                                {student?.userDetails?.firstName} {student?.userDetails?.lastName}
                                <br />
                                Email: {student?.userDetails?.email}
                              </div>

                              <div className="border-t border-gray-300 mt-4 pt-4">
                                <strong>Parent Info:</strong>
                                <br />
                                {student?.userDetails?.parentFirstName} {student?.userDetails?.parentLastName}
                                <br />
                                Email: {student?.userDetails?.parentEmail}
                                <br />
                                Relation: {student?.userDetails?.relation}
                              </div>

                              <div className="border-t border-gray-300 mt-4 pt-4">
                                <strong>Billing Info:</strong>
                                <br />
                                Name: {student?.billingInfo?.fullName}
                                <br />
                                Email: {student?.billingInfo?.email}
                                <br />
                                Contact No: {student?.billingInfo?.contactNo}
                              </div>
                            </div>
                          ) : (
                            <div>
                              {student?.chosenPricingPlan === "Other Plans" ? (
                                <div className="flex-1 text-center">
                                  <h3>Inquiry Form:</h3>
                                </div>
                              ) : (
                                <div className="flex-1 text-center">
                                  <h3>Guidance and Support Form:</h3>
                                </div>
                              )}

                              <div>
                                <strong>Submission User Type:</strong> {student?.userType}
                              </div>
                              <div>
                                <strong>Submission Date:</strong> {formatDateTime(student?.submittedAt)?.date}
                              </div>
                              <div>
                                <strong>Submission Time:</strong> {formatDateTime(student?.submittedAt)?.time}
                              </div>
                              <div>
                                <strong>User TimeZone:</strong> {student?.timeZone}
                              </div>

                              <div className="border-b border-gray-300 mb-4">
                                <strong>How often to take lessons:</strong>
                                <ul className="list-disc ml-6">
                                  {student?.howOftenToTakeLesson?.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <strong>Final Exams:</strong> {student?.finalExamDate}
                              </div>
                              <div className="border-b border-gray-300 mb-4 pb-4">
                                <strong>What Course To Pursue:</strong> {student?.whatCourseToPursue}
                              </div>

                              {/* Other Pricing Plan */}
                              {student?.chosenPricingPlan === "Other Plans" ? (
                                <>
                                  <div className="border-b border-gray-300 mb-4 pb-4">
                                    <div>
                                      <strong>Seeking Tutor For:</strong>
                                      <ul className="list-disc ml-6">
                                        {student.seekingTutoringFor?.map((item, i) => (
                                          <li key={i}>{item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <strong>Tutoring objective:</strong> {student?.objective?.select}
                                    </div>
                                    <div>
                                      <strong>Tutoring Plan:</strong> {student?.tutoringPlanTitle}
                                    </div>
                                    <div>
                                      <strong>Tutor Level:</strong> {student?.objective?.level}
                                    </div>
                                    <div>
                                      <strong>Tutor Support Type:</strong> {student?.objective?.diploma}
                                    </div>
                                    <div>
                                      <strong>Price:</strong> £{student?.price}
                                    </div>
                                  </div>

                                  <div className="border-b border-gray-300 mb-4 pb-4">
                                    <div>
                                      <strong>Want Guidance and Support:</strong> {student?.wantGuidanceAndSupport}
                                    </div>
                                    {student?.wantGuidanceAndSupport === "yes" && (
                                      <>
                                        <div>
                                          <strong>Guidance & Support Subjects:</strong>
                                          <ul className="list-disc ml-6">
                                            {student?.guidanceAndSupportSubjects?.map((item, i) => (
                                              <li key={i}>{item}</li>
                                            ))}
                                          </ul>
                                        </div>
                                        <div>
                                          <strong>Guidance and Support Objective:</strong>{" "}
                                          {student?.guidanceObjectiveTitle}
                                        </div>
                                        <div>
                                          <strong>Tutor Level:</strong> {student?.guidanceObjective?.level}
                                        </div>
                                        <div>
                                          <strong>Tutor Support Type:</strong> {student?.guidanceObjective?.diploma}
                                        </div>
                                        <div>
                                          <strong>Price:</strong> £{student?.guidancePrice}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div className="border-b border-gray-300 mb-4 pb-4">
                                  <div>
                                    <strong>Guidance & Support Subjects:</strong>
                                    <ul className="list-disc ml-6">
                                      {student.seekingTutoringFor?.map((item, i) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <strong>Guidance and Support Objective:</strong> {student?.guidanceObjectiveTitle}
                                  </div>
                                  <div>
                                    <strong>Tutor Level:</strong> {student?.guidanceObjective?.level}
                                  </div>
                                  <div>
                                    <strong>Tutor Support Type:</strong> {student?.guidanceObjective?.diploma}
                                  </div>
                                  <div>
                                    <strong>Price:</strong> £{student?.guidancePrice}
                                  </div>
                                </div>
                              )}

                              {/* Student Info */}
                              <div>
                                <strong>Student's Information:</strong>
                              </div>
                              <div>
                                <strong>First Name:</strong> {student?.userDetails?.firstName}
                              </div>
                              <div>
                                <strong>Last Name:</strong> {student?.userDetails?.lastName}
                              </div>
                              <div>
                                <strong>Email:</strong> {student?.userDetails?.email}
                              </div>
                              <div>
                                <strong>Phone:</strong> {student?.userDetails?.phone}
                              </div>
                              <div>
                                <strong>Address:</strong> {student?.userDetails?.address || "N/A"}
                              </div>
                              <div>
                                <strong>City:</strong> {student?.userDetails?.city || "N/A"}
                              </div>
                              <div>
                                <strong>ZIP:</strong> {student?.userDetails?.zip || "N/A"}
                              </div>
                              <div>
                                <strong>Country:</strong> {student?.userDetails?.country?.label || "N/A"}
                              </div>
                              <div>
                                <strong>GMT:</strong> {student?.userDetails?.gmtTimezone || "N/A"}
                              </div>

                              <br />
                              <div>
                                <strong>Parent's Information:</strong>
                              </div>
                              <div>
                                <strong>First Name:</strong> {student?.userDetails?.parentFirstName}
                              </div>
                              <div>
                                <strong>Last Name:</strong> {student?.userDetails?.parentLastName}
                              </div>
                              <div>
                                <strong>Email:</strong> {student?.userDetails?.parentEmail}
                              </div>
                              <div>
                                <strong>Phone:</strong> {student?.userDetails?.parentPhone}
                              </div>
                              <div>
                                <strong>Relation:</strong> {student?.userDetails?.relation}
                              </div>
                            </div>
                          )}

                          <br />
                          <div className="flex flex-row items-center justify-end w-full">
                            <Button
                              variant="outlined"
                              className="mr-2"
                              onClick={() => {
                                setShowModal(true)
                                setSelectedLink(student)
                              }}
                            >
                              Mark as Processed
                            </Button>

                            <Button
                              variant="contained"
                              onClick={() => {
                                setCreateAccountModal(true)
                                setSelectedStudent(student)
                              }}
                            >
                              Create Account
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

              {studentData?.length === 0 && <div className="text-center text-gray-400 py-12">No Pending Forms</div>}

              <Modal
                open={createAccountModal}
                onClose={() => {
                  setCreateAccountModal(false)
                }}
              >
                <CustomModal>
                  <SignupForm setCreateAccountModal={setCreateAccountModal} student={selectedStudent} />
                </CustomModal>
              </Modal>

              <Dialog
                open={showModal}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => {
                  setShowModal(false)
                }}
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

            <ProcessedStudentForm />
          </div>
        </div>
      </div>
    </TopHeadingProvider>
  )
}

export default StudentForm
