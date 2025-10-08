"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { db } from "../../../../firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

import { EditContactInformation } from "./editProfilePages/EditContactInformation"
import { EditEducation } from "./editProfilePages/EditEducation"
import { EditGuardianInformation } from "./editProfilePages/EditGuardianInformation"

import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Box from "@mui/material/Box"
import { TopHeadingProvider, useTopHeading } from "../../../../Components/Layout"

export function EditStudentProfile() {
  const { studentId } = useParams()
  const [curr, setCurr] = useState("Personal Information")
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  const { setFirstMessage, setSecondMessage } = useTopHeading()
  useEffect(() => {
    setFirstMessage("Student Edit Profile")
    setSecondMessage(`Show Student /${userDetails?.userName || ""} / Edit Profile`)
  }, [setFirstMessage, setSecondMessage, userDetails?.userName])

  useEffect(() => {
    async function fetchStudent() {
      try {
        setLoading(true)
        const userListRef = collection(db, "userList")
        const q = query(
          userListRef,
          where("userId", "==", studentId),
          where("type", "==", "student") // Ensure it's a student
        )
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          setUserDetails(snapshot.docs[0].data())
        } else {
          setUserDetails(null)
        }
      } catch (err) {
        console.error("Error fetching student data:", err)
        setUserDetails(null)
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      fetchStudent()
    }
  }, [studentId])

  const handleChange = (event, newValue) => {
    setCurr(newValue)
  }

  if (loading) {
    return <div className="p-6 text-gray-600">Loading profile...</div>
  }

  if (!userDetails) {
    return <div className="p-6 text-red-500">Student data not found.</div>
  }

  return (
    <TopHeadingProvider>
      <div className="h-full p-6">
        <div className="bg-white border border-[#A2A1A833] rounded-[10px] p-3">
          {/* Tabs header */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={curr}
              onChange={handleChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                "& .MuiTab-root": {
                  fontSize: "16px",
                  fontWeight: 300,
                  textTransform: "none",
                  padding: "12px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                  color: "#16151C",
                  "&:hover": {
                    borderBottom: "2px solid",
                    borderColor: "grey.300",
                  },
                },
                "& .Mui-selected": {
                  color: "#4071B6",
                  borderBottom: "2px solid",
                  borderColor: "#4071B6",
                  fontWeight: 600,
                },
              }}
            >
              {/* Personal Info Tab */}
              <Tab
                value="Personal Information"
                label={
                  <div className="flex items-center gap-2">
                    {curr === "Personal Information" ? (
                      <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 10C10.866 10 14 11.7909 14 14C14 16.2091 10.866 18 7 18C3.13401 18 0 16.2091 0 14C0 11.7909 3.13401 10 7 10ZM7 0C9.20914 0 11 1.79086 11 4C11 6.20914 9.20914 8 7 8C4.79086 8 3 6.20914 3 4C3 1.79086 4.79086 0 7 0Z" fill="#4071B6" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="12" cy="17.5" rx="7" ry="3.5" stroke="#16151C" strokeWidth="1.5" strokeLinejoin="round" />
                        <circle cx="12" cy="7" r="4" stroke="#16151C" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    )}
                    <span>Personal Information</span>
                  </div>
                }
              />

              {/* Guardian Information Tab */}
              <Tab
                value="Guardian Information"
                label={
                  <div className="flex items-center gap-2">
                    {curr === "Guardian Information" ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 13C13.866 13 17 14.7909 17 17C17 19.2091 13.866 21 10 21C6.13401 21 3 19.2091 3 17C3 14.7909 6.13401 13 10 13ZM15.8867 13.0322C18.7799 13.2465 21 14.4938 21 16C21 17.0776 19.8635 18.0228 18.1572 18.5518C18.3804 18.0597 18.5 17.5388 18.5 17C18.5 15.4409 17.4974 14.0331 15.8867 13.0322ZM10 3C12.2091 3 14 4.79086 14 7C14 9.20914 12.2091 11 10 11C7.79086 11 6 9.20914 6 7C6 4.79086 7.79086 3 10 3ZM15.126 5.00293C16.7243 5.06904 18 6.38544 18 8C18 9.65683 16.6568 11 15 11C14.6351 11 14.2854 10.9347 13.9619 10.8154C14.9145 9.82651 15.5 8.48151 15.5 7C15.5 6.2955 15.3674 5.62201 15.126 5.00293Z" fill="#4071B6" />
                      </svg>

                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="10" cy="17.5" rx="7" ry="3.5" stroke="#16151C" stroke-width="1.5" stroke-linejoin="round" />
                        <circle cx="10" cy="7" r="4" stroke="#16151C" stroke-width="1.5" stroke-linejoin="round" />
                        <path d="M15.3398 4.26562C17.2514 4.43755 18.7499 6.04374 18.75 8C18.75 10.0709 17.0709 11.7498 15 11.75C14.6085 11.75 14.2308 11.6894 13.876 11.5781C14.3277 11.1953 14.7208 10.7465 15.043 10.2471C16.2656 10.2239 17.25 9.22814 17.25 8C17.2499 7.07941 16.6962 6.28874 15.9043 5.94043C15.7985 5.34729 15.6062 4.7847 15.3398 4.26562Z" fill="#16151C" />
                        <path d="M15.752 13.2705C17.192 13.3418 18.5093 13.6142 19.5312 14.04C20.1281 14.2888 20.6604 14.6039 21.0547 14.9922C21.4516 15.3833 21.7499 15.8937 21.75 16.5C21.75 17.1063 21.4516 17.6167 21.0547 18.0078C20.6604 18.3961 20.128 18.7112 19.5312 18.96C19.2139 19.0922 18.8672 19.2081 18.498 19.3096C18.8122 18.7588 18.9873 18.1695 18.9971 17.5547C19.4625 17.3561 19.7956 17.1418 20.002 16.9385C20.2119 16.7316 20.25 16.5839 20.25 16.5C20.2499 16.4161 20.2119 16.2684 20.002 16.0615C19.7891 15.8519 19.4426 15.6284 18.9541 15.4248C18.7068 15.3218 18.4318 15.2278 18.1338 15.1445C17.5694 14.4181 16.7526 13.7792 15.752 13.2705Z" fill="#16151C" />
                      </svg>

                    )}
                    <span>Guardian Information</span>
                  </div>
                }
              />

              {/* Education Tab */}
              <Tab
                value="Education"
                label={
                  <div className="flex items-center gap-2">
                    {curr === "Education" ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12.25 3.10414V6C12.25 8.62335 14.3766 10.75 17 10.75H19.8959C19.9645 11.045 20 11.3491 20 11.6569V17C20 19.2091 18.2091 21 16 21H8C5.79086 21 4 19.2091 4 17V7C4 4.79086 5.79086 3 8 3H11.3431C11.6509 3 11.955 3.03547 12.25 3.10414ZM13.75 3.80513V6C13.75 7.79493 15.2051 9.25 17 9.25H19.1949C19.0833 9.10195 18.961 8.96101 18.8284 8.82843L14.1716 4.17157C14.039 4.03899 13.898 3.91667 13.75 3.80513ZM7.25 12C7.25 11.5858 7.58579 11.25 8 11.25H12C12.4142 11.25 12.75 11.5858 12.75 12C12.75 12.4142 12.4142 12.75 12 12.75H8C7.58579 12.75 7.25 12.4142 7.25 12ZM8 15.25C7.58579 15.25 7.25 15.5858 7.25 16C7.25 16.4142 7.58579 16.75 8 16.75H16C16.4142 16.75 16.75 16.4142 16 16C16.75 15.5858 16.4142 15.25 16 15.25H8Z" fill="#4071B6" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 11L12 11" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M8 16H16" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M21 9V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V6C3 3.79086 4.79086 2 7 2H14M21 9L14 2M21 9H18C15.7909 9 14 7.20914 14 5V2" stroke="#16151C" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    )}
                    <span>Education</span>
                  </div>
                }
              />
            </Tabs>
          </Box>


          {/* Tab Content */}
          <div className="p-6">
            {curr === "Personal Information" && (
              <EditContactInformation userDetails={userDetails} userId={studentId} />
            )}
            {curr === "Education" && (
              <EditEducation userDetails={userDetails} userId={studentId} />
            )}
            {curr === "Guardian Information" && (
              <EditGuardianInformation userDetails={userDetails} userId={studentId} />
            )}
          </div>
        </div>
      </div>
    </TopHeadingProvider>
  )
}
