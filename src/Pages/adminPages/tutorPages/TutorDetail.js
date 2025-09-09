"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Profile } from "./profileAndFinance/Profile"
import { AddSubjectsApplication } from "./AddSubjectsApplication"
import TeacherInvoices from "./profileAndFinance/TeacherInvoices"
import LinkedStudentsList from "./LinkedStudentsList/LinkedStudentsList"

import Button from "@mui/material/Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import { TopHeadingProvider, useTopHeading } from "../../../Components/Layout"
import { db } from "../../../firebase"
import { collection, query, onSnapshot, where } from "firebase/firestore"

const TutorDetail = () => {
  const { setFirstMessage, setSecondMessage } = useTopHeading()
  const navigate = useNavigate()
  const { tutorId } = useParams()
  const [activeTab, setActiveTab] = useState("profile")
  const [tutorData, setTutorData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setFirstMessage("Tutor Details")
    setSecondMessage("Manage Tutor Information")
  }, [setFirstMessage, setSecondMessage])

  useEffect(() => {
    if (!tutorId) return

    let unsubscribe

    const fetchTutorData = async () => {
      try {
        setLoading(true)
        const userListRef = collection(db, "userList")
        const q = query(userListRef, where("userId", "==", tutorId), where("type", "==", "teacher"))

        unsubscribe = onSnapshot(q, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const tutorDoc = querySnapshot.docs[0]
            setTutorData(tutorDoc.data())
          }
          setLoading(false)
        })
      } catch (e) {
        console.error("Error fetching tutor data:", e)
        setLoading(false)
      }
    }

    fetchTutorData()

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
  }, [tutorId])

  const handleBackToList = () => {
    navigate("/tutorsAndSubjects")
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile userDetails={tutorData} userId={tutorData.userId} />
      case "subjects":
        return <AddSubjectsApplication userDetails={tutorData} userId={tutorData.userId} />
      case "payments":
        return <TeacherInvoices userDetails={tutorData} userId={tutorData.userId} />
      case "students":
        return <LinkedStudentsList userId={tutorData.userId} />
      default:
        return <Profile userDetails={tutorData} userId={tutorData.userId} />
    }
  }

  if (loading) {
    return (
      <TopHeadingProvider>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-gray-600">Loading tutor details...</div>
        </div>
      </TopHeadingProvider>
    )
  }

  if (!tutorData.userId) {
    return (
      <TopHeadingProvider>
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-lg text-gray-600 mb-4">Tutor not found</div>
          <Button onClick={handleBackToList} variant="outlined">
            Back to List
          </Button>
        </div>
      </TopHeadingProvider>
    )
  }

  return (
    <TopHeadingProvider>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300">
                <FontAwesomeIcon icon={faUser} className="text-2xl text-gray-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{tutorData?.userName || "N/A"}</h1>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Science Tutors</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>{tutorData?.email || "N/A"}</span>
                </div>
              </div>
            </div>
            <button className="bg-white border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-0 h-fit">
            <div className="space-y-0">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-6 py-4 transition-all duration-200 font-medium border-b border-gray-100 ${
                  activeTab === "profile" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Profile
                </div>
              </button>
              <button
                onClick={() => setActiveTab("subjects")}
                className={`w-full text-left px-6 py-4 transition-all duration-200 font-medium border-b border-gray-100 ${
                  activeTab === "subjects" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approved Subjects
                </div>
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`w-full text-left px-6 py-4 transition-all duration-200 font-medium border-b border-gray-100 ${
                  activeTab === "payments" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  Payments
                </div>
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`w-full text-left px-6 py-4 transition-all duration-200 font-medium ${
                  activeTab === "students" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  Students
                </div>
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </TopHeadingProvider>
  )
}

export default TutorDetail
