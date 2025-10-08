"use client"

import { useState, useContext } from "react"
import { MyContext } from "../../../Context/MyContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons"

import { collection, addDoc, doc, updateDoc, query, where, getDocs, deleteDoc } from "firebase/firestore"
import { db } from "../../../firebase"
import emailjs from "emailjs-com"
import toast from "react-hot-toast"

import { Button } from "@mui/material"
import getCourseRequestedEmailTemplate from "../../../Components/getEmailTemplate/getCourseRequestedEmailTemplate"
import { faUser } from "@fortawesome/free-solid-svg-icons"


export function CreateOrderForm({ item, handleClose }) {
  const { userDetails, addNotification, adminAddNotification } = useContext(MyContext)

  const [submitting, setSubmitting] = useState(false)
  const [tutorHourlyRate, setTutorHourlyRate] = useState(null)
  const [price, setPrice] = useState(null)

  const isSelected = (day, time) => item?.slotRequired.includes(`${day}-${time}`)

  const timePeriods = ["Before 12PM", "12PM - 3PM", "3PM - 6PM", "After 6PM"]
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  async function submittingForm() {
    if (!tutorHourlyRate || tutorHourlyRate <= 0 || !price || price <= 0) {
      toast("Please Enter Tutor Hourly Rate")
      return
    }

    try {
      setSubmitting(true)
      const details = {
        subject: item?.subject,
        studentName: item?.studentInformation?.userName,
        country: item?.country,
        credits: item?.credits || 0,
        yearOfGraduation: item?.yearOfGraduation,
        timeZone: item?.timeZone,
        slotRequired: item?.slotRequired,
        requestedHours: item?.requestedHours,
        startDate: item?.startDate,
        studentInformation: item?.studentInformation,
        tutorHourlyRate,
        session: item?.session,
        gmt: item?.gmt,
        price,
        createdOn: new Date(),
      }

      const userListRef = collection(db, "orders")
      const docRef = await addDoc(userListRef, details)
      const docId = docRef.id
      await updateDoc(doc(db, "orders", docId), { id: docId })
      await deleteDoc(doc(db, "studentRequests", item?.id))

      handleClose(false)

      const checkTeacherEligibility = (teacher) => {
        const filteredSubjects = Object.entries(teacher.subjects)
          .filter(([_, value]) => value === true)
          .map(([subject]) => subject)

        return filteredSubjects.includes(item?.subject)
      }

      const userListRefSecond = collection(db, "userList")
      const q = query(userListRefSecond, where("type", "==", "teacher"))
      const querySnapshot = await getDocs(q)
      const teachersData = querySnapshot.docs.map((doc) => doc.data())
      const eligibleTeacherEmails = teachersData
        .filter((teacher) => checkTeacherEligibility(teacher, item?.subject))
        .map(({ email, userId }) => ({ email, userId }))

      const serviceId = process.env.REACT_APP_EMAILSERVICEID
      const templateId = process.env.REACT_APP_EMAILTEMPLATEID
      const userId = process.env.REACT_APP_EMAILUSERID

      eligibleTeacherEmails.forEach((e) => {
        const emailTemplate = getCourseRequestedEmailTemplate(
          item?.studentInformation?.userName,
          item?.subject,
          item?.yearOfGraduation,
          item?.country,
          item?.startDate,
          `https://portal.ibinnovators.com/jobOpenings/${docId}?gimeg02j0i3jrg03i43g0n=${e.userId}`,
        )

        const emailParams = {
          from_name: "IBInnovators",
          to_name: "",
          send_to: e.email,
          subject: `IB Innovators ${item?.subject} Opening (${item?.gmt})`,
          message: emailTemplate,
        }

        emailjs
          .send(serviceId, templateId, emailParams, userId)
          .then((response) => {
            console.log("Email sent successfully:", response);
          })
          .catch((err) => console.error("Error sending email:", err))
      })

      addNotification(`You created a job for ${item?.subject}.`, userDetails?.userId)
      adminAddNotification(`${userDetails?.userName} created a job for ${item?.subject}.`)

      toast.success("Job created successfully")
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Error Submitting Form")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full md:w-4xl mx-auto h-full overflow-auto p-4 md:p-6"
      style={{
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div className="">
        <h1 className="text-[18px] md:text-[20px] font-semibold text-[#16151C] mb-4">
          Order Submission Form <span className="text-gray-500 font-normal">(Course Application)</span>
        </h1>

        {/* Student Info Section */}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
          {/* Icon */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#4071B6] rounded-[4px] flex items-center justify-center mb-2 sm:mb-0 overflow-hidden">
            {item?.studentInformation?.image ? (
              <img
                src={item.studentInformation.image}
                alt={item?.studentInformation.userName || "Student"}
                className="w-full h-full object-cover"
              />
            ) : (
              <FontAwesomeIcon
                className="text-white text-base sm:text-lg"
                icon={faUser}
              />
            )}
          </div>

          {/* Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 w-full sm:w-auto">
            <div className="font-light text-[14px] text-[#16151C]">Student Name:</div>
            <div className="font-medium text-[14px] text-[#16151C] mb-2 sm:mb-0">
              {item?.studentInformation?.userName}
            </div>

            <div className="font-light text-[14px] text-[#16151C]">Email:</div>
            <div className="font-medium text-[14px] text-[#16151C]">
              {item?.studentInformation?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Time Slots Section */}
      <div className="mb-8">
        {/* Heading + Legends */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
          <h2 className="text-[18px] md:text-[20px] font-semibold text-[#16151C]">Select your Timing Slots</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#57AD85] rounded-full"></div>
              <span className="text-[14px] sm:text-[16px] font-light text-[#16151C]">Selected by Tutor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#F49342] rounded-full"></div>
              <span className="text-[14px] sm:text-[16px] font-light text-[#16151C]">Selected by Student</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#00C8FF] rounded-full"></div>
              <span className="text-[14px] sm:text-[16px] font-light text-[#16151C]">
                Tutor and student selected same slot
              </span>
            </div>
          </div>
        </div>

        {/* Time Slots Grid */}
        <div className="rounded-[10px] overflow-hidden bg-[#A2A1A80D]">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-8">
            <div className="p-3 font-semibold text-[14px] text-[#16151C] text-left">
              Time & Day
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="p-3 font-semibold text-[14px] text-[#16151C] text-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Mobile header (scrollable) */}
          <div className="md:hidden overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="p-3 font-semibold text-[14px] text-[#16151C]">Time & Day</th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="p-3 font-semibold text-[14px] text-[#16151C] text-center"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timePeriods.map((time) => (
                  <tr key={time}>
                    <td className="p-3 text-[#16151C] font-light text-[14px] text-left whitespace-nowrap">
                      {time.replace("PM", " pm").replace("AM", " am")}
                    </td>
                    {days.map((day) => (
                      <td key={day} className="p-2 text-center">
                        <div
                          className={`w-[20px] h-[20px] border-1 border-[#16151C] rounded-[4px] cursor-pointer transition-all duration-200 ${isSelected(day, time)
                            ? "bg-[#F49342]" : "bg-white hover:border-gray-400"
                            }`}
                        >
                          {isSelected(day, time) && (
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
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Desktop grid */}
          <div className="hidden md:block">
            {timePeriods.map((time) => (
              <div key={time} className="grid grid-cols-8">
                <div className="p-3 text-[#16151C] font-light text-[14px] text-left">
                  {time.replace("PM", " pm").replace("AM", " am")}
                </div>
                {days.map((day) => (
                  <div
                    key={day}
                    className="p-2 flex justify-center items-center"
                  >
                    <div
                      className={`w-[20px] h-[20px] border-1 border-[#16151C] rounded-[4px] cursor-pointer transition-all duration-200 ${isSelected(day, time)
                        ? "bg-[#F49342]" : "bg-white hover:border-gray-400"
                        }`}
                    >
                      {isSelected(day, time) && (
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
      </div>

      <div className="mb-8">
        <h2 className="text-[18px] md:text-[20px] font-semibold text-[#16151C] mb-6">
          Additional Information
        </h2>

        {/* Row 1: Subject & Tutor Tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">
              Subject
            </label>
            <div className="relative w-full">
              <select
                value={item?.subject || ""}
                className="w-full h-14 px-4 bg-white text-gray-900 appearance-none cursor-not-allowed rounded-[10px] border border-[#A2A1A833]"
                disabled
              >
                <option>{item?.subject}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">
              Tutor Tier
            </label>
            <div className="relative w-full">
              <select
                value={item?.tutorTier || "Foundation"}
                className="w-full h-14 px-4 bg-white text-gray-900 appearance-none cursor-not-allowed rounded-[10px] border border-[#A2A1A833]"
                disabled
              >
                <option>{item?.tutorTier || "Foundation"}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Requested Hours, Session, Year of Graduation, Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">
              Requested Hours
            </label>
            <div className="relative w-full">
              <select
                value={item?.requestedHours || "02"}
                className="w-full h-14 px-4 bg-white text-gray-900 appearance-none cursor-not-allowed rounded-[10px] border border-[#A2A1A833]"
                disabled
              >
                <option>{item?.requestedHours || "02"}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">
              Session
            </label>
            <div className="relative w-full">
              <select
                value={item?.session || "May Session"}
                className="w-full h-14 px-4 bg-white text-gray-900 appearance-none cursor-not-allowed rounded-[10px] border border-[#A2A1A833]"
                disabled
              >
                <option>{item?.session || "May Session"}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">
              Year of Graduation
            </label>
            <div className="relative w-full">
              <select
                value={item?.yearOfGraduation || "N/A"}
                className="w-full h-14 px-4 bg-white text-gray-900 appearance-none cursor-not-allowed rounded-[10px] border border-[#A2A1A833]"
                disabled
              >
                <option>{item?.yearOfGraduation || "N/A"}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">
              Country
            </label>
            <div className="relative w-full">
              <select
                value={item?.country || "N/A"}
                className="w-full h-14 px-4 bg-white text-gray-900 appearance-none cursor-not-allowed rounded-[10px] border border-[#A2A1A833]"
                disabled
              >
                <option>{item?.country || "N/A"}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Time Zone, Start Date, Tutor Hourly Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">
              Time Zone
            </label>
            <div className="relative w-full">
              <select
                value={item?.gmt || "N/A"}
                className="w-full h-14 px-4 bg-white text-gray-900 appearance-none cursor-not-allowed rounded-[10px] border border-[#A2A1A833]"
                disabled
              >
                <option>{item?.gmt || "N/A"}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">
              Start Date
            </label>
            <div className="relative w-full">
              <select
                value={item?.startDate || "Immediately"}
                className="w-full h-14 px-4 bg-white text-gray-900 appearance-none cursor-not-allowed rounded-[10px] border border-[#A2A1A833]"
                disabled
              >
                <option>{item?.startDate || "Immediately"}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">
              Tutor Hourly Rate (USD)*
            </label>
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={tutorHourlyRate}
                disabled
                className="w-full h-14 pl-8 pr-4 bg-white text-gray-900 rounded-[10px] border border-[#A2A1A833] cursor-not-allowed"
                placeholder="Tutor Rate"
              />
            </div>
          </div>
        </div>
      </div>


      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          disabled={submitting}
          variant="outlined"
          onClick={() => handleClose(false)}
          className="px-8 py-3 rounded-lg"
          sx={{
            width: 166,
            height: 50,
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
          disabled={submitting}
          variant="contained"
          onClick={submittingForm}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
          sx={{
            width: 166,
            height: 50,
            textTransform: "none",
            fontSize: "16px",
            fontWeight: 600,
            borderRadius: "8px",
            padding: "12px 32px",
            backgroundColor: "#4071B6",
            "&:hover": {
              backgroundColor: "#3763a0ff",
            },
          }}
        >
          {submitting ? "Submitting" : "Create Job"}
        </Button>
      </div>
    </div>
  )
}
