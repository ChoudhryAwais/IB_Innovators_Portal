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
    <div className="w-4xl mx-auto h-full overflow-auto p-6 pr-7"
      style={{
        boxSizing: "border-box",
      }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Order Submission Form <span className="text-gray-500 font-normal">(Course Application)</span>
        </h1>
      </div>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          <FontAwesomeIcon className="text-gray-600 text-lg" icon={faGraduationCap} />
        </div>
        <div className="grid grid-cols-2 gap-y-1 gap-x-8">
          <div className="text-gray-600">Student Name:</div>
          <div className="font-semibold text-gray-900">{item?.studentInformation?.userName}</div>
          <div className="text-gray-600">Email:</div>
          <div className="text-gray-900">{item?.studentInformation?.email}</div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Select your Timing Slots</h2>
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
          <div className="grid grid-cols-8 ">
            <div className="p-3 font-medium text-gray-700 text-left">Time & Day</div>
            {days.map((day) => (
              <div
                key={day}
                className="p-3 font-medium text-gray-700 text-center"
              >
                {day}
              </div>
            ))}
          </div>

          {timePeriods.map((time, timeIndex) => (
            <div key={time} className="grid grid-cols-8">
              <div className="p-3 text-gray-700 text-left">
                {time.replace("PM", " pm").replace("AM", " am")}
              </div>
              {days.map((day) => (
                <div
                  key={day}
                  className="p-2 flex justify-center items-center"
                >
                  <div
                    className={`w-6 h-6 border-2 rounded cursor-pointer transition-all duration-200 ${isSelected(day, time)
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white hover:border-gray-400"
                      }`}
                  >
                    {isSelected(day, time) && (
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

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <div className="relative">
              <select
                value={item?.subject || ""}
                className="w-full h-14 px-4 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none cursor-pointer"
                disabled
              >
                <option>{item?.subject}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tutor Tier</label>
            <div className="relative">
              <select
                value={item?.tutorTier || "Foundation"}
                className="w-full h-14 px-4 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none cursor-pointer"
                disabled
              >
                <option>Foundation</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Requested Hours</label>
            <div className="relative">
              <select
                value={item?.requestedHours || "02"}
                className="w-full h-14 px-4 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none cursor-pointer"
                disabled
              >
                <option>02</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
            <div className="relative">
              <select
                value={item?.session || "May Session"}
                className="w-full h-14 px-4 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none cursor-pointer"
                disabled
              >
                <option>May Session</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year of Graduation</label>
            <div className="relative">
              <select
                value={item?.yearOfGraduation || "2027"}
                className="w-full h-14 px-4 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none cursor-pointer"
                disabled
              >
                <option>2027</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <div className="relative">
              <select
                value={item?.country || "Pakistan"}
                className="w-full h-14 px-4 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none cursor-pointer"
                disabled
              >
                <option>Pakistan</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          {/* Time Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
            <div className="relative w-[245px]">
              <select
                value={item?.gmt || "GMT - 03:00 pm"}
                disabled
                className="w-full h-14 px-4 border border-[#A2A1A833] rounded-lg bg-white text-gray-900 appearance-none cursor-not-allowed"
              >
                <option>GMT - 03:00 pm</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="relative w-[245px]">
              <select
                value={item?.startDate || "Immediately"}
                disabled
                className="w-full h-14 px-4 border border-[#A2A1A833] rounded-lg bg-white text-gray-900 appearance-none cursor-not-allowed"
              >
                <option>Immediately</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tutor Hourly Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tutor Hourly Rate (USD)*
            </label>
            <div className="relative w-[245px]">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={tutorHourlyRate}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value) || 0
                  setTutorHourlyRate(rate)
                  setPrice(rate * (item?.requestedHours || 0))
                }}

                className="w-full h-14 pl-8 pr-4 border border-[#A2A1A833] rounded-lg bg-white text-gray-900 "
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
            fontWeight: 500,
            borderRadius: "8px",
            padding: "12px 32px",
            backgroundColor: "#2563eb",
            "&:hover": {
              backgroundColor: "#1d4ed8",
            },
          }}
        >
          {submitting ? "Submitting" : "Create Job"}
        </Button>
      </div>
    </div>
  )
}
