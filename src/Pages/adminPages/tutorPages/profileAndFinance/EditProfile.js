"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { db } from "../../../../firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

import { EditContactInformation } from "./editProfilePages/EditContactInformation"
import { EditEducation } from "./editProfilePages/EditEducation"
import { EditYourSupport } from "./editProfilePages/EditYourSupport"

import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Box from "@mui/material/Box"
import { TopHeadingProvider, useTopHeading } from "../../../../Components/Layout"


export function EditProfile() {
  const { tutorId } = useParams()
  const [curr, setCurr] = useState("Personal Information")
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  const { setFirstMessage, setSecondMessage } = useTopHeading()
  useEffect(() => {
    setFirstMessage("Tutors Edit Profile")
    setSecondMessage(`Show Tutors /${userDetails?.userName || ""} / Edit Profile`)
  }, [setFirstMessage, setSecondMessage])


  useEffect(() => {
    async function fetchTutor() {
      try {
        setLoading(true)
        const userListRef = collection(db, "userList")
        const q = query(userListRef, where("userId", "==", tutorId))
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          setUserDetails(snapshot.docs[0].data())
        } else {
          setUserDetails(null)
        }
      } catch (err) {
        console.error("Error fetching tutor data:", err)
        setUserDetails(null)
      } finally {
        setLoading(false)
      }
    }

    if (tutorId) {
      fetchTutor()
    }
  }, [tutorId])

  const handleChange = (event, newValue) => {
    setCurr(newValue)
  }

  if (loading) {
    return <div className="p-6 text-gray-600">Loading profile...</div>
  }

  if (!userDetails) {
    return <div className="p-6 text-red-500">Tutor data not found.</div>
  }

  return (
    <TopHeadingProvider>
      <div className="h-full p-6 ">
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
                  borderBottom: "2px solid transparent",
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
                      // ✅ Selected SVG
                      <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 10C10.866 10 14 11.7909 14 14C14 16.2091 10.866 18 7 18C3.13401 18 0 16.2091 0 14C0 11.7909 3.13401 10 7 10ZM7 0C9.20914 0 11 1.79086 11 4C11 6.20914 9.20914 8 7 8C4.79086 8 3 6.20914 3 4C3 1.79086 4.79086 0 7 0Z" fill="#4071B6" />
                      </svg>

                    ) : (
                      // ⚪ Unselected SVG
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="12" cy="17.5" rx="7" ry="3.5" stroke="#16151C" stroke-width="1.5" stroke-linejoin="round" />
                        <circle cx="12" cy="7" r="4" stroke="#16151C" stroke-width="1.5" stroke-linejoin="round" />
                      </svg>

                    )}
                    <span>Personal Information</span>
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
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.25 3.10414V6C12.25 8.62335 14.3766 10.75 17 10.75H19.8959C19.9645 11.045 20 11.3491 20 11.6569V17C20 19.2091 18.2091 21 16 21H8C5.79086 21 4 19.2091 4 17V7C4 4.79086 5.79086 3 8 3H11.3431C11.6509 3 11.955 3.03547 12.25 3.10414ZM13.75 3.80513V6C13.75 7.79493 15.2051 9.25 17 9.25H19.1949C19.0833 9.10195 18.961 8.96101 18.8284 8.82843L14.1716 4.17157C14.039 4.03899 13.898 3.91667 13.75 3.80513ZM7.25 12C7.25 11.5858 7.58579 11.25 8 11.25H12C12.4142 11.25 12.75 11.5858 12.75 12C12.75 12.4142 12.4142 12.75 12 12.75H8C7.58579 12.75 7.25 12.4142 7.25 12ZM8 15.25C7.58579 15.25 7.25 15.5858 7.25 16C7.25 16.4142 7.58579 16.75 8 16.75H16C16.4142 16.75 16.75 16.4142 16.75 16C16.75 15.5858 16.4142 15.25 16 15.25H8Z" fill="#4071B6" />
                      </svg>
                    ) : (

                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 11L12 11" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" />
                        <path d="M8 16H16" stroke="#16151C" stroke-width="1.5" stroke-linecap="round" />
                        <path d="M21 9V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V6C3 3.79086 4.79086 2 7 2H14M21 9L14 2M21 9H18C15.7909 9 14 7.20914 14 5V2" stroke="#16151C" stroke-width="1.5" stroke-linejoin="round" />
                      </svg>
                    )}
                    <span>Education</span>
                  </div>
                }
              />

              {/* Your Support Tab */}
              <Tab
                value="Your Support"
                label={
                  <div className="flex items-center gap-2">
                    {curr === "Your Support" ? (

                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.3691 8.59473C16.5931 8.24638 17.0569 8.14536 17.4053 8.36914C17.7536 8.59307 17.8546 9.05687 17.6309 9.40527L13.4668 15.8828C13.5185 16.4143 13.2734 16.9543 12.791 17.2559L8.76465 19.3975C8.52384 19.548 8.26339 19.6404 8 19.6797V22H2V16C2 14.3431 3.34315 13 5 13C6.65685 13 8 14.3431 8 16V16.5L11.2432 14.7998C11.6264 14.5561 12.0796 14.5146 12.4785 14.6465L16.3691 8.59473ZM20 1.25C21.5188 1.25 22.75 2.48122 22.75 4V10C22.75 11.5188 21.5188 12.75 20 12.75H19C18.5858 12.75 18.25 12.4142 18.25 12C18.25 11.5858 18.5858 11.25 19 11.25H20C20.6904 11.25 21.25 10.6904 21.25 10V4C21.25 3.30964 20.6904 2.75 20 2.75H8C7.30964 2.75 6.75 3.30964 6.75 4V5.5C6.75 5.91421 6.41421 6.25 6 6.25C5.58579 6.25 5.25 5.91421 5.25 5.5V4C5.25 2.48122 6.48122 1.25 8 1.25H20ZM5 8C6.10457 8 7 8.89543 7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10C3 8.89543 3.89543 8 5 8ZM14 8.25C14.4142 8.25 14.75 8.58579 14.75 9C14.75 9.41421 14.4142 9.75 14 9.75H10C9.58579 9.75 9.25 9.41421 9.25 9C9.25 8.58579 9.58579 8.25 10 8.25H14ZM18 5.25C18.4142 5.25 18.75 5.58579 18.75 6C18.75 6.41421 18.4142 6.75 18 6.75H10C9.58579 6.75 9.25 6.41421 9.25 6C9.25 5.58579 9.58579 5.25 10 5.25H18Z" fill="#4071B6" />
                      </svg>

                    ) : (

                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 16.5H7.25C7.25 16.7625 7.38724 17.0059 7.61184 17.1417C7.83645 17.2776 8.11574 17.2861 8.34822 17.1643L8 16.5ZM1.25 22C1.25 22.4142 1.58579 22.75 2 22.75C2.41421 22.75 2.75 22.4142 2.75 22H2H1.25ZM11.2428 14.8L11.591 15.4643L11.6189 15.4497L11.6455 15.4328L11.2428 14.8ZM12.7913 17.2554L13.1435 17.9176L13.1666 17.9053L13.1888 17.8914L12.7913 17.2554ZM8.76427 19.3973L8.41207 18.7352L8.38896 18.7475L8.36677 18.7613L8.76427 19.3973ZM5.96778 18.6936L6.61896 18.3215L5.96778 18.6936ZM5.65118 16.6279C5.44568 16.2683 4.98753 16.1433 4.6279 16.3488C4.26826 16.5543 4.14331 17.0125 4.34882 17.3721L5 17L5.65118 16.6279ZM13.2667 15.2778L13.9098 14.8919V14.8919L13.2667 15.2778ZM8.75 20C8.75 19.5858 8.41421 19.25 8 19.25C7.58579 19.25 7.25 19.5858 7.25 20H8H8.75ZM7.25 22C7.25 22.4142 7.58579 22.75 8 22.75C8.41421 22.75 8.75 22.4142 8.75 22H8H7.25ZM12.8673 14.0973L12.4646 14.7301L13.7301 15.5354L14.1327 14.9027L13.5 14.5L12.8673 14.0973ZM17.6327 9.40266C17.8551 9.0532 17.7521 8.58964 17.4027 8.36725C17.0532 8.14487 16.5896 8.24789 16.3673 8.59734L17 9L17.6327 9.40266ZM5.25 4.5C5.25 4.91421 5.58579 5.25 6 5.25C6.41421 5.25 6.75 4.91421 6.75 4.5H6H5.25ZM19 11.25C18.5858 11.25 18.25 11.5858 18.25 12C18.25 12.4142 18.5858 12.75 19 12.75V12V11.25ZM10 5.25C9.58579 5.25 9.25 5.58579 9.25 6C9.25 6.41421 9.58579 6.75 10 6.75V6V5.25ZM18 6.75C18.4142 6.75 18.75 6.41421 18.75 6C18.75 5.58579 18.4142 5.25 18 5.25V6V6.75ZM10 8.25C9.58579 8.25 9.25 8.58579 9.25 9C9.25 9.41421 9.58579 9.75 10 9.75V9V8.25ZM14 9.75C14.4142 9.75 14.75 9.41421 14.75 9C14.75 8.58579 14.4142 8.25 14 8.25V9V9.75ZM7 9H6.25C6.25 9.69036 5.69036 10.25 5 10.25V11V11.75C6.51878 11.75 7.75 10.5188 7.75 9H7ZM5 11V10.25C4.30964 10.25 3.75 9.69036 3.75 9H3H2.25C2.25 10.5188 3.48122 11.75 5 11.75V11ZM3 9H3.75C3.75 8.30964 4.30964 7.75 5 7.75V7V6.25C3.48122 6.25 2.25 7.48122 2.25 9H3ZM5 7V7.75C5.69036 7.75 6.25 8.30964 6.25 9H7H7.75C7.75 7.48122 6.51878 6.25 5 6.25V7ZM8 16.5H8.75V16H8H7.25V16.5H8ZM2 16H1.25V22H2H2.75V16H2ZM8 16.5L8.34822 17.1643L11.591 15.4643L11.2428 14.8L10.8946 14.1358L7.65178 15.8357L8 16.5ZM12.7913 17.2554L12.4391 16.5933L8.41207 18.7352L8.76427 19.3973L9.11646 20.0595L13.1435 17.9176L12.7913 17.2554ZM5.96778 18.6936L6.61896 18.3215L5.65118 16.6279L5 17L4.34882 17.3721L5.3166 19.0657L5.96778 18.6936ZM11.2428 14.8L11.6455 15.4328C11.9784 15.2209 12.4205 15.3253 12.6236 15.6637L13.2667 15.2778L13.9098 14.8919C13.2726 13.8299 11.885 13.5024 10.8402 14.1673L11.2428 14.8ZM8.76427 19.3973L8.36677 18.7613C7.76495 19.1375 6.97107 18.9377 6.61896 18.3215L5.96778 18.6936L5.3166 19.0657C6.09123 20.4213 7.83776 20.8608 9.16176 20.0333L8.76427 19.3973ZM2 16H2.75C2.75 14.7574 3.75736 13.75 5 13.75V13V12.25C2.92893 12.25 1.25 13.9289 1.25 16H2ZM13.2667 15.2778L12.6236 15.6637C12.8203 15.9916 12.7181 16.4167 12.3938 16.6194L12.7913 17.2554L13.1888 17.8914C14.2066 17.2553 14.5273 15.9211 13.9098 14.8919L13.2667 15.2778ZM8 16H8.75C8.75 13.9289 7.07107 12.25 5 12.25V13V13.75C6.24264 13.75 7.25 14.7574 7.25 16H8ZM8 20H7.25V22H8H8.75V20H8ZM13.5 14.5L14.1327 14.9027L17.6327 9.40266L17 9L16.3673 8.59734L12.8673 14.0973L13.5 14.5ZM6 4.5H6.75V4H6H5.25V4.5H6ZM8 2V2.75H20V2V1.25H8V2ZM22 4H21.25V10H22H22.75V4H22ZM20 12V11.25H19V12V12.75H20V12ZM22 10H21.25C21.25 10.6904 20.6904 11.25 20 11.25V12V12.75C21.5188 12.75 22.75 11.5188 22.75 10H22ZM20 2V2.75C20.6904 2.75 21.25 3.30964 21.25 4H22H22.75C22.75 2.48122 21.5188 1.25 20 1.25V2ZM6 4H6.75C6.75 3.30964 7.30964 2.75 8 2.75V2V1.25C6.48122 1.25 5.25 2.48122 5.25 4H6ZM10 6V6.75H18V6V5.25H10V6ZM10 9V9.75H14V9V8.25H10V9Z" fill="#16151C" />
                      </svg>
                    )}
                    <span>Your Support</span>
                  </div>
                }
              />
            </Tabs>
          </Box>


          {/* Tab Content */}
          <div className="p-6">
            {curr === "Personal Information" && (
              <EditContactInformation
                userDetails={userDetails}
                userId={tutorId}
              />
            )}
            {curr === "Education" && (
              <EditEducation userDetails={userDetails} userId={tutorId} />
            )}
            {curr === "Your Support" && (
              <EditYourSupport userDetails={userDetails} userId={tutorId} />
            )}
          </div>
        </div>
      </div>
    </TopHeadingProvider>
  )
}
