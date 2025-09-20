"use client"

import { useState, useContext } from "react"
import { MyContext } from "../../../Context/MyContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGraduationCap, faTimes } from "@fortawesome/free-solid-svg-icons"
import { db } from "../../../firebase"
import { collection, doc, updateDoc, setDoc, addDoc, deleteDoc } from "firebase/firestore"
import toast from "react-hot-toast"
import emailjs from "emailjs-com"
import getJobNotApprovedEmailTemplate from "../../../Components/getEmailTemplate/getJobNotApprovedEmailTemplate"
import getTutorSelectedForStudentEmailTemplate from "../../../Components/getEmailTemplate/getTutorSelectedForStudentEmailTemplate"
import getJobApprovedEmailTemplate from "../../../Components/getEmailTemplate/getJobApprovedEmailTemplate"
import CustomModal from "../../../Components/CustomModal/CustomModal"
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, IconButton } from "@mui/material"

export default function ViewApplicants({ tutor, order, open, onClose }) {
  const { userDetails } = useContext(MyContext)
  const [loading, setLoading] = useState(false)
  // const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const tutorApplicants = order?.applicants?.map(app => app?.tutorDetails?.email) || []
  const generatingLink = async () => {
    try {
      setLoading(true)
      const linkedRef = collection(db, "Linked")

      const linkId = await addDoc(linkedRef, {
        studentId: order?.studentInformation?.userId,
        studentName: order?.studentInformation?.userName,
        studentEmail: order?.studentInformation?.email,
        teacherId: tutor?.submittedBy,
        subject: order?.subject,
        teacherName: tutor?.tutorDetails?.userName,
        teacherEmail: tutor?.tutorDetails?.email,
        orderId: order?.id,
        startDate: new Date(),
        studentInfo: order?.studentInformation,
        price: order?.price,
        tutorHourlyRate: order?.tutorHourlyRate,
      })

      const docRef = doc(linkedRef, linkId.id)
      await updateDoc(docRef, {
        id: linkId.id,
      })

      const processedOrderCollectionRef = collection(db, "processedOrders")
      const processedData = {
        ...order,
        selectedTeacher: tutor?.submittedBy,
      }
      const processedOrderDocRef = doc(processedOrderCollectionRef, order?.id)
      await setDoc(processedOrderDocRef, processedData)

      const orderCollectionRef = collection(db, "orders")
      const orderDocRef = doc(orderCollectionRef, order?.id)
      await deleteDoc(orderDocRef)

      const serviceId = process.env.REACT_APP_EMAILSERVICEID
      const templateId = process.env.REACT_APP_EMAILTEMPLATEID
      const userId = process.env.REACT_APP_EMAILUSERID

      const emailTemplateToStudent = getTutorSelectedForStudentEmailTemplate(
        order?.studentInformation?.userName,
        order?.requestedHours,
        order?.subject,
        tutor?.tutorDetails?.userName,
      )

      const tutorAndParentEmail = [
        tutor?.tutorDetails?.email,
        order?.studentInformation?.otherInformation?.userDetails?.parentEmail,
      ]

      const studentAndTeacherEmailParams = {
        from_name: "IBInnovators",
        to_name: "",
        send_to: order?.studentInformation?.email,
        cc_to: tutorAndParentEmail?.join(", "),
        subject: `Introducing your new ${order?.subject} tutor`,
        message: emailTemplateToStudent,
      }

      const emailTemplateForSelectedTeacher = getJobApprovedEmailTemplate(
        tutor?.tutorDetails?.userName,
        order?.studentInformation?.userName,
        order?.subject,
      )
      const selectedTutorEmailParams = {
        from_name: "IBInnovators",
        to_name: "",
        send_to: tutor?.tutorDetails?.email,
        subject: `Job Approved with ${order?.studentInformation?.userName} for ${order?.subject}`,
        message: emailTemplateForSelectedTeacher,
      }

      // UNSELECTED TUTORS ONLY
      const emailTemplateForNotApprovedTeacher = getJobNotApprovedEmailTemplate(tutor?.tutorDetails?.userName)

      const unselectedTutorEmails = tutorApplicants.filter(email => email !== tutor?.tutorDetails?.email)

      const unselectedTeacherEmailParams = {
        from_name: "IBInnovators",
        to_name: "",
        send_to: unselectedTutorEmails?.join(", "),
        subject: "Job Application Status Update",
        message: emailTemplateForNotApprovedTeacher,
      }

      await emailjs.send(serviceId, templateId, studentAndTeacherEmailParams, userId)
      await emailjs.send(serviceId, templateId, selectedTutorEmailParams, userId)

      if (unselectedTutorEmails.length > 0) {
        await emailjs.send(serviceId, templateId, unselectedTeacherEmailParams, userId)
      }

      toast.success("Link created successfully")
      onClose()
    } catch (error) {
      toast.error("Error processing order")
      console.error("Error processing order:", error)
    } finally {
      setLoading(false)
      // setShowConfirmDialog(false)
    }
  }

  const timePeriods = ["Before 12PM", "12PM - 3PM", "3PM - 6PM", "After 6PM"]
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const isSelected = (day, time) => tutor?.slotAvailable?.includes(`${day}-${time}`)
  const isRequired = (day, time) => order?.slotRequired?.includes(`${day}-${time}`)

  return (
    <>
      <CustomModal
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: "90vw",
            maxWidth: "1000px",
            height: "auto",
            maxHeight: "90vh",
            overflow: "hidden",
            borderRadius: "10px",
            padding: 0,
          },
        }}
      >
        <div className="h-full overflow-auto p-6" // ✅ scrollbar inside modal
          style={{
            boxSizing: "border-box",
          }}
        >
          <div className="flex flex-col mb-2 pb-4">
            {/* Heading stays left */}
            <h2 className="text-2xl font-bold text-gray-900">View Applicants Details</h2>

            {/* Centered content */}
            <div className="mt-4 flex flex-col items-center">
              <p className="text-[18px] font-semibold  mb-1">
                Order ID: <span>{order?.id}</span>
              </p>
              <h3 className="text-[30px] font-light">{order?.subject}</h3>
            </div>
          </div>


          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Applicants</h4>

            <div className="space-y-6">
              {/* Student Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon className="text-gray-600 text-lg" icon={faGraduationCap} />
                </div>

                <div className="grid grid-cols-2 gap-y-1 gap-x-16">
                  <div className="text-gray-600">Student Name:</div>
                  <div className="font-semibold text-gray-900">{order?.studentInformation?.userName}</div>

                  <div className="text-gray-600">Year of Graduation:</div>
                  <div className="font-semibold text-gray-900">{order?.yearOfGraduation}</div>

                  <div className="text-gray-600">Time Zone:</div>
                  <div className="font-semibold text-gray-900">{order?.timeZone}</div>
                </div>
              </div>

              {/* Tutor Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon className="text-gray-600 text-lg" icon={faGraduationCap} />
                </div>

                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                  <div className="text-gray-600">Tutor Name:</div>
                  <div className="font-semibold text-gray-900">{tutor?.tutorDetails?.userName}</div>

                  <div className="text-gray-600">Email:</div>
                  <div className="text-gray-900">{tutor?.tutorDetails?.email}</div>
                </div>
              </div>
            </div>

          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Time Available</h4>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Selected by Tutor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">Selected by Student</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-gray-600">Tutor and student selected same slot</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden bg-[#A2A1A80D]">
              {/* Header row */}
              <div className="grid grid-cols-8">
                <div className="p-3 font-semibold text-gray-700 text-left">Time & Day</div>
                {days.map((day) => (
                  <div
                    key={day}
                    className="p-3 font-semibold text-gray-700 text-center"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Time slots */}
              {timePeriods.map((time) => (
                <div key={time} className="grid grid-cols-8">
                  {/* Time label */}
                  <div className="p-3 text-gray-700 text-left">
                    {time.replace("PM", " pm").replace("AM", " am")}
                  </div>

                  {/* Slots per day */}
                  {days.map((day) => (
                    <div
                      key={day}
                      className="p-2 flex justify-center items-center"
                    >
                      <div
                        className={`w-6 h-6 border-2 rounded transition-all duration-200
              ${isSelected(day, time) && isRequired(day, time)
                            ? "bg-cyan-500 border-cyan-500"
                            : isSelected(day, time)
                              ? "bg-green-500 border-green-500"
                              : isRequired(day, time)
                                ? "bg-orange-500 border-orange-500"
                                : "bg-white hover:border-gray-400 border-gray-300"
                          }`}
                      >
                        {(isSelected(day, time) || isRequired(day, time)) && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {tutor?.supportingInformation && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Supporting Information</h4>
              <div className="border rounded-lg p-4">
                <p className="text-gray-700">{tutor?.supportingInformation}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 ">
            <Button
              variant="outlined"
              onClick={onClose}
              className="px-8 py-3 text-gray-600 border-gray-300 hover:bg-gray-50 rounded-lg"
              sx={{
                width: '166px',
                height: '50px',
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 500,
                borderRadius: "8px",
                padding: "12px 32px",
                color: "#16151C",
                borderColor: "#D1D5DB",
                "&:hover": {
                  backgroundColor: "#F9FAFB",
                  borderColor: "#D1D5DB",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={generatingLink}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
              sx={{
                width: '166px',
                height: '50px',
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 500,
                borderRadius: "8px",
                padding: "12px 32px",
                backgroundColor: "#2563eb",
                "&:hover": {
                  backgroundColor: "#1d4ed8",
                },
                "&:disabled": {
                  opacity: 0.5,
                },
              }}
            >
              {loading ? "Creating Link..." : "Create Link"}
            </Button>

          </div>
        </div>
      </CustomModal>
    </>
  )
}
