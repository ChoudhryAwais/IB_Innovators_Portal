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
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  textTransform: "none",
                  padding: "12px 24px",
                  borderBottom: "2px solid transparent",
                  transition: "all 0.2s",
                  "&:hover": {
                    color: "text.primary",
                    borderBottom: "2px solid",
                    borderColor: "grey.300",
                  },
                },
                "& .Mui-selected": {
                  color: "primary.main",
                  borderBottom: "2px solid",
                  borderColor: "primary.main",
                },
              }}
            >
              <Tab label="Personal Information" value="Personal Information" />
              <Tab label="Guardian Information" value="Guardian Information" />
              <Tab label="Education" value="Education" />
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
