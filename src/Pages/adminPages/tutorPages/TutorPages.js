"use client"

import React, { useEffect, useState } from "react"

import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faUser } from "@fortawesome/free-solid-svg-icons"
import { db } from "../../../firebase"
import { collection, query, onSnapshot, where } from "firebase/firestore"
import { TopHeadingProvider, useTopHeading } from "../../../Components/Layout"
import { useNavigate } from "react-router-dom"

export const TutorPages = () => {
  const navigate = useNavigate()

  const { setFirstMessage, setSecondMessage } = useTopHeading()
  useEffect(() => {
    setFirstMessage("Tutors")
    setSecondMessage("Show all Tutors")
  }, [setFirstMessage, setSecondMessage])

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

  return (
    <TopHeadingProvider>
      <div className=" p-6 min-h-screen">
        <div className="bg-white border border-[#A2A1A833] rounded-[10px] p-7">
          {students.length !== 0 && (
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon className="text-gray-400" icon={faMagnifyingGlass} />
                </div>
                <input
                  onChange={handleSearch}
                  placeholder="Search by name/email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue=""
                />
              </div>
            </div>
          )}

          <div className=" overflow-hidden">
            {displayedSessions.map((student, index) => (
              <div
                key={index}
                className={"flex items-center p-4  border-b border-gray-200" }
              >
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <FontAwesomeIcon icon={faUser} className="text-gray-600" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{student?.userName}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    <div className="flex">
                      <span className="w-24 ">Email: </span><span className="text-gray-800">{student?.email}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 ">Tutor ID: </span><span className="text-gray-800">{student?.userId}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="contained"
                  onClick={() => handleSelectTutor(student)}
                  className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: "#3b82f6", textTransform: "none" }}
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>

          {searchedStudents?.length > itemsPerPage && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, searchedStudents.length)} out of{" "}
                {searchedStudents.length} records
              </div>
              <Stack spacing={2}>
                <Pagination
                  count={Math.ceil(searchedStudents?.length / itemsPerPage)}
                  page={currentPage}
                  onChange={handleChangePage}
                  color="primary"
                />
              </Stack>
            </div>
          )}

          {searchedStudents.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 text-xl">No Tutors Found</div>
            </div>
          )}
        </div>
      </div>
    </TopHeadingProvider>
  )
}
