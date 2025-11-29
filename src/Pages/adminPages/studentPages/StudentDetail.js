"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Button from "@mui/material/Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import { TopHeadingProvider, useTopHeading } from "../../../Components/Layout"
import { db } from "../../../firebase"
import { collection, query, onSnapshot, where } from "firebase/firestore"
import { Profile } from "./profileAndFinance/Profile"
import Balance from "./profileAndFinance/Balance"
import StudentInvoices from "./profileAndFinance/StudentInvoices"
import LinkedTutorsList from "./profileAndFinance/LinkedTutorsList"

const StudentDetail = () => {
  const { setFirstMessage, setSecondMessage } = useTopHeading()
  const navigate = useNavigate()
  const { studentId } = useParams()
  const [activeTab, setActiveTab] = useState("profile")
  const [studentData, setStudentData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setFirstMessage("Student Details")
    setSecondMessage("Manage Student Information")
  }, [setFirstMessage, setSecondMessage])

  useEffect(() => {
    if (!studentId) return

    let unsubscribe

    const fetchStudentData = async () => {
      try {
        setLoading(true)
        const userListRef = collection(db, "userList")
        const q = query(
          userListRef,
          where("userId", "==", studentId),
          where("type", "==", "student")
        )

        unsubscribe = onSnapshot(q, (querySnapshot) => {
          if (!querySnapshot.empty) {
            const studentDoc = querySnapshot.docs[0]
            setStudentData(studentDoc.data())
          }
          setLoading(false)
        })
      } catch (e) {
        console.error("Error fetching student data:", e)
        setLoading(false)
      }
    }

    fetchStudentData()

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
  }, [studentId])

  const handleBackToList = () => {
    navigate("/students")
  }

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      shortLabel: "Profile",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="17.5" rx="7" ry="3.5" stroke="#16151C" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" stroke="#16151C" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
      activeIcon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11ZM12 21C15.866 21 19 19.2091 19 17C19 14.7909 15.866 13 12 13C8.13401 13 5 14.7909 5 17C5 19.2091 8.13401 21 12 21Z" fill="white" />
        </svg>
      ),
    },
    {
      id: "credits",
      label: "Credits Usage",
      shortLabel: "Credits",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2V5" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 2V5" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 7.5C3 5.29086 4.79086 3.5 7 3.5H17C19.2091 3.5 21 5.29086 21 7.5V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V7.5Z" stroke="#16151C" strokeWidth="1.5" />
          <path d="M9 15L10.7528 16.4023C11.1707 16.7366 11.7777 16.6826 12.1301 16.2799L15 13" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 9H21" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      activeIcon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2V5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 2V5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 7.5C3 5.29086 4.79086 3.5 7 3.5H17C19.2091 3.5 21 5.29086 21 7.5V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V7.5Z" stroke="white" strokeWidth="1.5" />
          <path d="M9 15L10.7528 16.4023C11.1707 16.7366 11.7777 16.6826 12.1301 16.2799L15 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 9H21" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "Credits purchased",
      label: "Credits purchased",
      shortLabel: "Credits purchased",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 22C8.86748 22 10.4361 20.7202 10.8766 18.9899C11.0128 18.4547 11.4477 18 12 18H19M7 22C4.79086 22 3 20.2091 3 18V5C3 3.34315 4.34315 2 6 2H16C17.6569 2 19 3.34315 19 5V18M7 22H19C20.8675 22 22.4361 20.7202 22.8766 18.9899C23.0128 18.4547 22.5523 18 22 18H19M15 7H7M11 12H7" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      activeIcon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 22C8.86748 22 10.4361 20.7202 10.8766 18.9899C11.0128 18.4547 11.4477 18 12 18H19M7 22C4.79086 22 3 20.2091 3 18V5C3 3.34315 4.34315 2 6 2H16C17.6569 2 19 3.34315 19 5V18M7 22H19C20.8675 22 22.4361 20.7202 22.8766 18.9899C23.0128 18.4547 22.5523 18 22 18H19M15 7H7M11 12H7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "tutors",
      label: "Tutors",
      shortLabel: "Tutors",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 10H16M8 14H16M8 18H12M8 4C8 5.10457 8.89543 6 10 6H14C15.1046 6 16 5.10457 16 4M8 4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4M8 4H7C4.79086 4 3 5.79086 3 8V18C3 20.2091 4.79086 22 7 22H17C19.2091 22 21 20.2091 21 18V8C21 5.79086 19.2091 4 17 4H16" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      activeIcon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 10H16M8 14H16M8 18H12M8 4C8 5.10457 8.89543 6 10 6H14C15.1046 6 16 5.10457 16 4M8 4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4M8 4H7C4.79086 4 3 5.79086 3 8V18C3 20.2091 4.79086 22 7 22H17C19.2091 22 21 20.2091 21 18V8C21 5.79086 19.2091 4 17 4H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile userDetails={studentData} userId={studentData.userId} />
      case "credits":
        return <StudentInvoices userDetails={studentData} userId={studentData.userId} />
      case "Credits purchased":
        return <Balance userDetails={studentData} userId={studentData.userId} />
      case "tutors":
        return <LinkedTutorsList userId={studentData.userId} />
      default:
        return <Profile userDetails={studentData} userId={studentData.userId} />
    }
  }

  if (loading) {
    return (
      <TopHeadingProvider>
        <div className="flex items-center justify-center h-screen">
          <div className="text-base sm:text-lg text-gray-600">Loading student details...</div>
        </div>
      </TopHeadingProvider>
    )
  }

  if (!studentData.userId) {
    return (
      <TopHeadingProvider>
        <div className="flex flex-col items-center justify-center h-screen p-4">
          <div className="text-base sm:text-lg text-gray-600 mb-4 text-center">Student not found</div>
          <Button
            onClick={handleBackToList}
            variant="outlined"
            sx={{
              width: { xs: '100%', sm: 'auto' },
              maxWidth: '200px'
            }}
          >
            Back to List
          </Button>
        </div>
      </TopHeadingProvider>
    )
  }

  return (
    <TopHeadingProvider>
      <div className="min-h-screen p-3 sm:p-4 md:p-6">
        <div className="bg-white border border-[#A2A1A833] rounded-lg sm:rounded-[10px] p-3 sm:p-4 md:p-7">
          <div className="bg-white border-b border-gray-200 mb-3 sm:mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3 sm:mb-4 md:mb-6 gap-3 sm:gap-0">
              {/* Left Section: Avatar + Info */}
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-[#4071B6] rounded-[4px] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {studentData?.photoURL ? (
                    <img
                      src={studentData.photoURL}
                      alt={studentData?.userName || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faUser} 
                      className="text-white text-base sm:text-lg md:text-2xl"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-[16px] sm:text-[18px] md:text-[24px] font-semibold text-[#16151C] mb-1 truncate">
                    {studentData?.userName || "N/A"}
                  </h1>
                  <div className="flex items-center gap-1 sm:gap-2 text-[12px] sm:text-[14px] md:text-[16px] font-light text-[#16151C] mb-1">
                    <svg className="w-4 h-4 sm:w-4 sm:h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 6V5C8 3.34315 9.34315 2 11 2H13C14.6569 2 16 3.34315 16 5V6M2 10.3475C2 10.3475 5.11804 12.4244 9.97767 12.9109M22 10.3475C22 10.3475 18.882 12.4244 14.0223 12.9109M6 22H18C20.2091 22 22 20.2091 22 18V10C22 7.79086 20.2091 6 18 6H6C3.79086 6 2 7.79086 2 10V18C2 20.2091 3.79086 22 6 22Z" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M14 12.1602V13.1602C14 13.1702 14 13.1702 14 13.1802C14 14.2702 13.99 15.1602 12 15.1602C10.02 15.1602 10 14.2802 10 13.1902V12.1602C10 11.1602 10 11.1602 11 11.1602H13C14 11.1602 14 11.1602 14 12.1602Z" stroke="#16151C" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="truncate">Enrolled Student</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-[12px] sm:text-[14px] md:text-[16px] font-light text-[#16151C]">
                    <svg className="w-4 h-4 sm:w-4 sm:h-4 md:w-6 md:h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="3" width="20" height="18" rx="4" stroke="#16151C" strokeWidth="1.5" />
                      <path
                        d="M2 7l7.5 6a4 4 0 0 0 5 0L22 7"
                        stroke="#16151C"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="truncate">{studentData?.email || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Button on the right */}
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
                  borderRadius: "6px",
                  sm: { borderRadius: "8px" },
                  md: { borderRadius: "10px" },
                  width: { xs: "100%", sm: "120px", md: "156px" },
                  height: { xs: "36px", sm: "40px", md: "50px" },
                  textTransform: "none",
                  fontSize: { xs: "12px", sm: "14px", md: "16px" },
                  "&:hover": {
                    backgroundColor: "#4071b62a",
                  },
                  marginTop: { xs: "8px", sm: "0px" },
                }}
                onClick={() => navigate(`/students/${studentId}/edit`)}
              >
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Tabs & Content */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6">
            {/* Tabs - Horizontal on small/medium, Vertical on large */}
            <div className="w-full lg:w-48 xl:w-64 rounded-lg border border-gray-200 h-fit overflow-hidden">
              <div className="flex lg:flex-col overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 text-left px-3 sm:px-4 lg:px-5 xl:px-6 py-2 sm:py-3 lg:py-3.5 xl:py-4 transition-all duration-200 text-[12px] sm:text-[14px] lg:text-[15px] xl:text-[16px] min-w-max ${activeTab === tab.id
                      ? "bg-[#4071B6] text-white font-semibold"
                      : "bg-white font-light text-[#16151C] hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 xl:gap-3">
                      {activeTab === tab.id ? tab.activeIcon : tab.icon}
                      <span className="hidden sm:inline">
                        {tab.label}
                      </span>
                      <span className="sm:hidden">
                        {tab.shortLabel}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-lg overflow-hidden min-w-0">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </TopHeadingProvider>
  )
}

export default StudentDetail