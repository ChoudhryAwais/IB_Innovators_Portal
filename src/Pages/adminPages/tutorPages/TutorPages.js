"use client"

import React, { useEffect, useState } from "react"
import { Profile } from "./profileAndFinance/Profile"
import { AddSubjectsApplication } from "./AddSubjectsApplication"

import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faUser, faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { db } from "../../../firebase"
import { collection, query, onSnapshot, where } from "firebase/firestore"
import TeacherInvoices from "./profileAndFinance/TeacherInvoices"
import LinkedStudentsList from "./LinkedStudentsList/LinkedStudentsList"
import { TopHeadingProvider, useTopHeading } from "../../../Components/Layout"
import { useNavigate } from "react-router-dom"


export const TutorPages = () => {
  // const [currentView, setCurrentView] = useState("list") // "list" or "detail"
  // const [activeTab, setActiveTab] = useState("profile") // "profile", "subjects", "payments", "students"
  const navigate = useNavigate()
  
  const { setFirstMessage, setSecondMessage } = useTopHeading()
  useEffect(() => {
    setFirstMessage("Tutors")
    setSecondMessage("Show all Tutors")
  }, [setFirstMessage, setSecondMessage])

  // const [selectedTutor, setSelectedTutor] = useState({})

  const [students, setStudents] = useState([])
  const [searchedStudents, setSearchedStudents] = useState(students)

  useEffect(() => {
    let unsubscribe

    const fetchData = async () => {
      try {
        const userListRef = collection(db, "userList")
        const q = query(userListRef, where("type", "==", "teacher"))

        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const tutorData = querySnapshot.docs.map((doc) => doc.data())
          setStudents(tutorData)
          setSearchedStudents(tutorData)

          // if (selectedTutor) {
          //   const updatedTutor = tutorData.find((tutor) => tutor.userId === selectedTutor.userId)
          //   if (updatedTutor) {
          //     setSelectedTutor(updatedTutor)
          //   }
          // }
        })
      } catch (e) {
        console.error("Error fetching data:", e)
      }
    }

    fetchData()

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
  }, [])

  function handleSearch(e) {
    const searchedData = e.target.value.toLowerCase()

    if (searchedData.length >= 2) {
      setSearchedStudents(
        students.filter((item) => {
          return (
            item?.userName.toLowerCase().includes(searchedData) ||
            item?.email.toLowerCase().includes(searchedData) ||
            item?.userId.toLowerCase().includes(searchedData)
          )
        }),
      )
    } else {
      setSearchedStudents(students)
    }
  }

  const itemsPerPage = 5
  const [currentPage, setCurrentPage] = React.useState(1)

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedSessions = searchedStudents?.slice(startIndex, endIndex)

  const handleSelectTutor = (tutor) => {
  navigate(`/tutorsAndSubjects/${tutor.userId}`)
}

  // const handleBackToList = () => {
  //   setCurrentView("list")
  //   setSelectedTutor({})
  // }

  // const renderTabContent = () => {
  //   switch (activeTab) {
  //     case "profile":
  //       return <Profile userDetails={selectedTutor} userId={selectedTutor.userId} />
  //     case "subjects":
  //       return <AddSubjectsApplication userDetails={selectedTutor} userId={selectedTutor.userId} />
  //     case "payments":
  //       return <TeacherInvoices userDetails={selectedTutor} userId={selectedTutor.userId} />
  //     case "students":
  //       return <LinkedStudentsList userId={selectedTutor.userId} />
  //     default:
  //       return <Profile userDetails={selectedTutor} userId={selectedTutor.userId} />
  //   }
  // }

  // if (currentView === "detail") {
  //   return (
  //     <TopHeadingProvider>
  //       <div className="flex flex-col h-full">
  //         <div className="bg-white/50 backdrop-blur-md rounded-lg shadow-lg p-6 mb-4">
  //           <div className="flex justify-between items-center">
  //             <Button
  //               onClick={handleBackToList}
  //               variant="outlined"
  //               startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
  //               className="mb-4"
  //             >
  //               Back to List
  //             </Button>
  //             <Button variant="contained" color="primary" className="mb-4">
  //               Edit Profile
  //             </Button>
  //           </div>

  //           <div className="flex items-center justify-end">
  //             <div className="text-right">
  //               <div className="flex items-center justify-end gap-3 mb-2">
  //                 <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
  //                   <FontAwesomeIcon icon={faUser} className="text-2xl text-gray-600" />
  //                 </div>
  //               </div>
  //               <h2 className="text-2xl font-bold text-gray-800">{selectedTutor?.userName}</h2>
  //               <p className="text-gray-600">{selectedTutor?.email}</p>
  //               <p className="text-sm text-gray-500">ID: {selectedTutor?.userId}</p>
  //             </div>
  //           </div>
  //         </div>

  //         <div className="flex flex-1 gap-4">
  //           <div className="w-64 bg-white/50 backdrop-blur-md rounded-lg shadow-lg p-4">
  //             <h3 className="text-lg font-semibold mb-4 text-gray-800">Navigation</h3>
  //             <div className="flex flex-col gap-2">
  //               <button
  //                 onClick={() => setActiveTab("profile")}
  //                 className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
  //                   activeTab === "profile"
  //                     ? "bg-blue-600 text-white shadow-md"
  //                     : "bg-white/50 text-gray-700 hover:bg-white/70"
  //                 }`}
  //               >
  //                 Profile
  //               </button>
  //               <button
  //                 onClick={() => setActiveTab("subjects")}
  //                 className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
  //                   activeTab === "subjects"
  //                     ? "bg-blue-600 text-white shadow-md"
  //                     : "bg-white/50 text-gray-700 hover:bg-white/70"
  //                 }`}
  //               >
  //                 Approved Subjects
  //               </button>
  //               <button
  //                 onClick={() => setActiveTab("payments")}
  //                 className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
  //                   activeTab === "payments"
  //                     ? "bg-blue-600 text-white shadow-md"
  //                     : "bg-white/50 text-gray-700 hover:bg-white/70"
  //                 }`}
  //               >
  //                 Payments
  //               </button>
  //               <button
  //                 onClick={() => setActiveTab("students")}
  //                 className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
  //                   activeTab === "students"
  //                     ? "bg-blue-600 text-white shadow-md"
  //                     : "bg-white/50 text-gray-700 hover:bg-white/70"
  //                 }`}
  //               >
  //                 Students
  //               </button>
  //             </div>
  //           </div>

  //           <div className="flex-1 bg-white/50 backdrop-blur-md rounded-lg shadow-lg p-6 overflow-auto">
  //             {renderTabContent()}
  //           </div>
  //         </div>
  //       </div>
  //     </TopHeadingProvider>
  //   )
  // }

  return (
    <TopHeadingProvider>
      <div className="flex flex-wrap gap-2 mr-2 mb-5 pt-0 flex-1">
        <div className="flex-1 h-max mt-0 mb-2 p-2 rounded-lg shadow-lg bg-white/50 backdrop-blur-md">
          {students.length !== 0 && (
            <div className="flex flex-1 items-center justify-center border-b-2 border-gray-300 mt-5 mb-2">
              <FontAwesomeIcon className="mx-2" icon={faMagnifyingGlass} />
              <input
                onChange={handleSearch}
                placeholder="Search via Name / Email / User ID"
                className="flex-1 border-none outline-none bg-transparent"
                defaultValue=""
              />
            </div>
          )}

          {displayedSessions.map((student, index) => (
            <div key={index} className={`flex-1 p-2 ${index !== 0 ? "border-t-2 border-gray-300" : ""}`}>
              <div className="font-bold">{student?.userName}</div>
              <div>Email: {student?.email}</div>
              <div>User ID: {student?.userId}</div>

              <Button variant="outlined" onClick={() => handleSelectTutor(student)} className="flex-1 my-1 w-full">
                SELECT
              </Button>
            </div>
          ))}

          {searchedStudents?.length > itemsPerPage && (
            <div className="flex flex-1 items-center justify-center mt-5 mb-2">
              <Stack spacing={2}>
                <Pagination
                  count={Math.ceil(students?.length / itemsPerPage)}
                  page={currentPage}
                  onChange={handleChangePage}
                />
              </Stack>
            </div>
          )}

          {searchedStudents.length === 0 && <div className="flex-1 text-center text-gray-300 text-2xl">No Tutors</div>}
        </div>
      </div>
    </TopHeadingProvider>
  )
}
