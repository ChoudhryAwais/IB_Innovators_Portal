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
            console.log("Tutor Data:", tutorData);
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

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      mobileLabel: "Profile",
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="17.5" rx="7" ry="3.5" stroke="#16151C" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" stroke="#16151C" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11ZM12 21C15.866 21 19 19.2091 19 17C19 14.7909 15.866 13 12 13C8.13401 13 5 14.7909 5 17C5 19.2091 8.13401 21 12 21Z" fill="white" />
        </svg>
      ),
    },
    {
      id: "subjects",
      label: "Approved Subjects",
      mobileLabel: "Subjects",
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2V5" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 2V5" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 7.5C3 5.29086 4.79086 3.5 7 3.5H17C19.2091 3.5 21 5.29086 21 7.5V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V7.5Z" stroke="#16151C" strokeWidth="1.5" />
          <path d="M9 15L10.7528 16.4023C11.1707 16.7366 11.7777 16.6826 12.1301 16.2799L15 13" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 9H21" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-3 h-4 sm:w-4 sm:h-5" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 17C18 19.2091 16.2091 21 14 21H4C1.79086 21 0 19.2091 0 17V8.75H18V17ZM12.4941 11.4355C12.1825 11.1628 11.7083 11.1943 11.4355 11.5059L8.56543 14.7861C8.47733 14.8866 8.32608 14.8999 8.22168 14.8164L6.46875 13.4141C6.1453 13.1553 5.67281 13.2078 5.41406 13.5312C5.15532 13.8547 5.20783 14.3272 5.53125 14.5859L7.28418 15.9883C8.01546 16.5732 9.07767 16.4782 9.69434 15.7734L12.5645 12.4941C12.8372 12.1825 12.8058 11.7083 12.4941 11.4355ZM13 0.25C13.4142 0.25 13.75 0.585786 13.75 1V2.5H14C16.2091 2.5 18 4.29086 18 6.5V7.25H0V6.5C0 4.29086 1.79086 2.5 4 2.5H4.25V1C4.25 0.585786 4.58579 0.25 5 0.25C5.41421 0.25 5.75 0.585786 5.75 1V2.5H12.25V1C12.25 0.585786 12.5858 0.25 13 0.25Z" fill="white" />
        </svg>
      ),
    },
    {
      id: "payments",
      label: "Payments",
      mobileLabel: "Payments",
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 22C8.86748 22 10.4361 20.7202 10.8766 18.9899C11.0128 18.4547 11.4477 18 12 18H19M7 22C4.79086 22 3 20.2091 3 18V5C3 3.34315 4.34315 2 6 2H16C17.6569 2 19 3.34315 19 5V18M7 22H19C20.8675 22 22.4361 20.7202 22.8766 18.9899C23.0128 18.4547 22.5523 18 22 18H19M15 7H7M11 12H7" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M19 5C19 3.34315 17.6569 2 16 2H6C4.34315 2 3 3.34315 3 5V17.25C3 19.0449 4.48047 20.5 6.27539 20.5C8.04261 20.4999 9.5 19.067 9.5 17.2998C9.50011 16.8581 9.85813 16.5001 10.2998 16.5H19V5ZM6.25 12C6.25 11.5858 6.58579 11.25 7 11.25H11C11.4142 11.25 11.75 11.5858 11.75 12C11.75 12.4142 11.4142 12.75 11 12.75H7C6.58579 12.75 6.25 12.4142 6.25 12ZM6.25 7C6.25 6.58579 6.58579 6.25 7 6.25H15C15.4142 6.25 15.75 6.58579 15.75 7C15.75 7.41421 15.4142 7.75 15 7.75H7C6.58579 7.75 6.25 7.41421 6.25 7ZM22.8766 18.9899C22.4361 20.7202 20.8675 22 19 22H7C8.86748 22 10.4361 20.7202 10.8766 18.9899C11.0128 18.4547 11.4477 18 12 18H22C22.5523 18 23.0128 18.4547 22.8766 18.9899Z" fill="white" />
        </svg>
      ),
    },
    {
      id: "students",
      label: "Students",
      mobileLabel: "Students",
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 10H16M8 14H16M8 18H12M8 4C8 5.10457 8.89543 6 10 6H14C15.1046 6 16 5.10457 16 4M8 4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4M8 4H7C4.79086 4 3 5.79086 3 8V18C3 20.2091 4.79086 22 7 22H17C19.2091 22 21 20.2091 21 18V8C21 5.79086 19.2091 4 17 4H16" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M10 2H14C15.1046 2 16 2.89543 16 4C16 5.10457 15.1046 6 14 6H10C8.89543 6 8 5.10457 8 4C8 2.89543 8.89543 2 10 2ZM6.50733 4.03003C6.50247 4.10272 6.5 4.17607 6.5 4.24999C6.5 6.04491 7.95507 7.49999 9.75 7.49999H14.25C16.0449 7.49999 17.5 6.04491 17.5 4.24999C17.5 4.17607 17.4975 4.10272 17.4927 4.03003C19.4694 4.27282 21 5.95766 21 7.99999V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V7.99999C3 5.95766 4.53062 4.27282 6.50733 4.03003ZM7.25 10C7.25 9.58579 7.58579 9.25 8 9.25H16C16.4142 9.25 16.75 9.58579 16.75 10C16.75 10.4142 16.4142 10.75 16 10.75H8C7.58579 10.75 7.25 10.4142 7.25 10ZM8 13.25C7.58579 13.25 7.25 13.5858 7.25 14C7.25 14.4142 7.58579 14.75 8 14.75H16C16.4142 14.75 16.75 14.4142 16.75 14C16.75 13.5858 16.4142 13.25 16 13.25H8ZM7.25 18C7.25 17.5858 7.58579 17.25 8 17.25H12C12.4142 17.25 12.75 17.5858 12.75 18C12.75 18.4142 12.4142 18.75 12 18.75H8C7.58579 18.75 7.25 18.4142 7.25 18Z" fill="white" />
        </svg>
      ),
    },
  ]

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
      <div className="min-h-screen p-3 sm:p-4 md:p-6">
        <div className="bg-white border border-[#A2A1A833] rounded-[10px] p-3 sm:p-4 md:p-7">
          <div className="bg-white border-b border-gray-200 mb-3 sm:mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3 sm:mb-4 md:mb-6 gap-3 sm:gap-4 md:gap-0">
              {/* Left Section: Avatar + Info */}
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300 flex-shrink-0">
                  <FontAwesomeIcon icon={faUser} className="text-base sm:text-lg md:text-2xl text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-[16px] sm:text-[18px] md:text-[24px] font-semibold text-[#16151C] mb-1 truncate">
                    {tutorData?.userName || "N/A"}
                  </h1>
                  <div className="flex items-center gap-1 sm:gap-2 text-[12px] sm:text-[14px] md:text-[16px] font-light text-[#16151C] mb-1">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 6V5C8 3.34315 9.34315 2 11 2H13C14.6569 2 16 3.34315 16 5V6M2 10.3475C2 10.3475 5.11804 12.4244 9.97767 12.9109M22 10.3475C22 10.3475 18.882 12.4244 14.0223 12.9109M6 22H18C20.2091 22 22 20.2091 22 18V10C22 7.79086 20.2091 6 18 6H6C3.79086 6 2 7.79086 2 10V18C2 20.2091 3.79086 22 6 22Z" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M14 12.1602V13.1602C14 13.1702 14 13.1702 14 13.1802C14 14.2702 13.99 15.1602 12 15.1602C10.02 15.1602 10 14.2802 10 13.1902V12.1602C10 11.1602 10 11.1602 11 11.1602H13C14 11.1602 14 11.1602 14 12.1602Z" stroke="#16151C" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="truncate">Science Tutors</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-[12px] sm:text-[14px] md:text-[16px] font-light text-[#16151C]">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="3" width="20" height="18" rx="4" stroke="#16151C" strokeWidth="1.5" />
                      <path d="M2 7L9.50122 13.001C10.9621 14.1697 13.0379 14.1697 14.4988 13.001L22 7" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="truncate">{tutorData?.email || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Button on the right, aligned with email */}
              <Button
                variant="outlined"
                color="primary"
                startIcon={
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 19H19M11.7844 3.31171C11.7844 3.31171 11.7844 4.94634 13.419 6.58096C15.0537 8.21559 16.6883 8.21559 16.6883 8.21559M5.31963 15.9881L8.75234 15.4977C9.2475 15.4269 9.70636 15.1975 10.06 14.8438L18.3229 6.58096C19.2257 5.67818 19.2257 4.21449 18.3229 3.31171L16.6883 1.67708C15.7855 0.774305 14.3218 0.774305 13.419 1.67708L5.15616 9.93996C4.80248 10.2936 4.57305 10.7525 4.50231 11.2477L4.01193 14.6804C3.90295 15.4432 4.5568 16.097 5.31963 15.9881Z" stroke="#4071B6" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                }
                sx={{
                  backgroundColor: "#4071B60D",
                  borderColor: "#4071B6",
                  color: "#4071B6",
                  borderRadius: "8px",
                  sm: { borderRadius: "10px" },
                  width: { xs: "100%", sm: "140px", md: "156px" },
                  height: { xs: "36px", sm: "40px", md: "50px" },
                  textTransform: "none",
                  fontSize: { xs: "12px", sm: "14px", md: "16px" },
                  "&:hover": {
                    backgroundColor: "#4071b62a",
                  },
                }}
                onClick={() => navigate(`/tutorsAndSubjects/${tutorId}/edit`)}
              >
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6">
            {/* Tab Navigation - Horizontal on mobile, Vertical on desktop */}
            <div className="w-full sm:w-48 md:w-64 rounded-lg border border-gray-200 p-0 h-fit overflow-hidden">
              <div className="flex sm:flex-col overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 text-left px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 transition-all duration-200 text-[12px] sm:text-[14px] md:text-[16px] min-w-max ${activeTab === tab.id
                      ? "bg-[#4071B6] text-[#FFFFFF] font-semibold"
                      : "bg-white font-light text-[#16151C] hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                      {activeTab === tab.id ? tab.activeIcon : tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.mobileLabel}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-lg overflow-hidden min-w-0">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </TopHeadingProvider>
  )
}

export default TutorDetail