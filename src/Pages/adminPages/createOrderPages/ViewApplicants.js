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
            sx: {
              width: "1000px",    // override only here
              height: "auto",
              maxWidth: "95vw",  // responsive
              maxHeight: "90vh", // scroll if needed
              overflow: "hidden",
              borderRadius: "10px",
              padding: 0,
            },
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
            <h2 className="text-[20px] font-semibold text-[#16151C]">View Applicants Details</h2>

            {/* Centered content */}
            <div className="mt-4 flex flex-col items-center">
              <p className="font-semibold text-[18px] text-[#16151C]  mb-1">
                Order ID: <span>{order?.id}</span>
              </p>
              <h3 className="text-[30px] font-light">{order?.subject}</h3>
            </div>
          </div>


          <div className="mb-8">
            <h4 className="text-[20px] font-semibold text-[#16151C] mb-4">Applicants</h4>

            <div className="space-y-6">
              {/* Student Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon className="text-gray-600 text-lg" icon={faGraduationCap} />
                </div>

                <div className="grid grid-cols-2 gap-y-1 gap-x-16">
                  <div className="font-light text-[14px] text-[#16151C]">Student Name:</div>
                  <div className="font-medium text-text-[14px] text-[#16151C]">{order?.studentInformation?.userName}</div>

                  <div className="font-light text-[14px] text-[#16151C]">Year of Graduation:</div>
                  <div className="font-medium text-text-[14px] text-[#16151C]">{order?.yearOfGraduation}</div>

                  <div className="font-light text-[14px] text-[#16151C]">Time Zone:</div>
                  <div className="font-medium text-text-[14px] text-[#16151C]">{order?.timeZone}</div>
                </div>
              </div>

              {/* Tutor Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon className="text-gray-600 text-lg" icon={faGraduationCap} />
                </div>

                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                  <div className="font-light text-[14px] text-[#16151C]">Tutor Name:</div>
                  <div className="font-medium text-text-[14px] text-[#16151C]">{tutor?.tutorDetails?.userName}</div>

                  <div className="font-light text-[14px] text-[#16151C]">Email:</div>
                  <div className="font-medium text-text-[14px] text-[#16151C]">{tutor?.tutorDetails?.email}</div>
                </div>
              </div>
            </div>

          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[20px] font-semibold text-[#16151C]">Time Available</h4>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#57AD85] rounded-full"></div>
                  <span className="text-[16px] font-light text-[#16151C]">Selected by Tutor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#F49342] rounded-full"></div>
                  <span className="text-[16px] font-light text-[#16151C]">Selected by Student</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#00C8FF] rounded-full"></div>
                  <span className="text-[16px] font-light text-[#16151C]">Tutor and student selected same slot</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden bg-[#A2A1A80D]">
              {/* Header row */}
              <div className="grid grid-cols-8">
                <div className="p-3 font-semibold text-[14px] text-[#16151C] text-left">Time & Day</div>
                {days.map((day) => (
                  <div
                    key={day}
                    className="p-3 font-semibold text-[14px] text-[#16151C] text-center"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Time slots */}
              {timePeriods.map((time) => (
                <div key={time} className="grid grid-cols-8">
                  {/* Time label */}
                  <div className="p-3 text-[#16151C] font-light text-[14px] text-left">
                    {time.replace("PM", " pm").replace("AM", " am")}
                  </div>

                  {/* Slots per day */}
                  {days.map((day) => (
                    <div
                      key={day}
                      className="p-2 flex justify-center items-center"
                    >
                      <div
                        className={`w-[20px] h-[20px] border-1 border-[#16151C] rounded-[4px] transition-all duration-200
                          ${isSelected(day, time) && isRequired(day, time)
                            ? "bg-[#00C8FF] "
                            : isSelected(day, time)
                              ? "bg-[#57AD85] "
                              : isRequired(day, time)
                                ? "bg-[#F49342]"
                                : "bg-white hover:border-gray-400"
                          }`}
                      >
                        {(isSelected(day, time) || isRequired(day, time)) && (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-6 h-6"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M14.592 7.46049C14.8463 7.13353 14.7874 6.66232 14.4605 6.40802C14.1335 6.15372 13.6623 6.21262 13.408 6.53958L9.40099 11.6914C9.31189 11.806 9.14429 11.8209 9.03641 11.7238L6.50173 9.44256C6.19385 9.16547 5.71963 9.19043 5.44254 9.49831C5.16544 9.80619 5.1904 10.2804 5.49828 10.5575L8.03296 12.8387C8.78809 13.5183 9.9613 13.4143 10.585 12.6123L14.592 7.46049Z"
                                fill="white"
                              />
                            </svg>
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
              <h4 className="text-[12px] font-light text-[#A2A1A8] mb-2">Supporting Information</h4>
              <div className="border rounded-lg p-4">
                <p className="text-[#16151C] font-light text-[16px]">{tutor?.supportingInformation}</p>
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
                fontWeight: 600,
                borderRadius: "8px",
                padding: "12px 32px",
                backgroundColor: "#4071B6",
                "&:hover": {
                  backgroundColor: "#3763a0ff",
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
