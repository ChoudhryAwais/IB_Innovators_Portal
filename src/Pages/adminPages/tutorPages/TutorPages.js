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

  const getVisiblePages = (currentPage, totalPages, maxVisible = 4) => {
    let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxVisible + 1, 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages(currentPage, Math.ceil(searchedStudents.length / itemsPerPage));
  return (
    <TopHeadingProvider>
      <div className="p-4 md:p-6 min-h-screen">
        <div className="bg-white border border-[#A2A1A833] rounded-[10px] p-4 md:p-7">
          {students.length !== 0 && (
            <div className="mb-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 md:w-[21.5px] md:h-[21.5px] flex-shrink-0 text-gray-500 mr-2"
                    viewBox="0 0 22 22"
                    fill="#16151C"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M1.75 10.5C1.75 15.3325 5.66751 19.25 10.5 19.25C15.3325 19.25 19.25 15.3325 19.25 10.5C19.25 5.66751 15.3325 1.75 10.5 1.75C5.66751 1.75 1.75 5.66751 1.75 10.5ZM10.5 20.75C4.83908 20.75 0.25 16.1609 0.25 10.5C0.25 4.83908 4.83908 0.25 10.5 0.25C16.1609 0.25 20.75 4.83908 20.75 10.5C20.75 13.0605 19.8111 15.4017 18.2589 17.1982L21.5303 20.4697C21.8232 20.7626 21.8232 21.2374 21.5303 21.5303C21.2374 21.8232 20.7626 21.8232 20.4697 21.5303L17.1982 18.2589C15.4017 19.8111 13.0605 20.75 10.5 20.75Z"
                    />
                  </svg>
                </div>
                <input
                  onChange={handleSearch}
                  placeholder="Search by name/email"
                  className="w-full pl-8 md:pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  defaultValue=""
                />
              </div>
            </div>
          )}

          <div className="overflow-hidden">
            {displayedSessions.map((student, index) => (
              <div
                key={index}
                className="flex items-stretch p-3 md:p-4 border-b border-gray-200"
              >
                {/* Info + Button */}
                <div className="flex flex-col md:flex-row justify-between w-full gap-3 md:gap-0">
                  {/* Tutor Info */}
                  <div className="flex-1">
                    {/* Avatar + Name */}
                    <div className="flex items-center">
                      {/* Avatar */}
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-[#4071B6] rounded-[4px] flex items-center justify-center mr-3 md:mr-4 flex-shrink-0 overflow-hidden">
                        {student?.image ? (
                          <img
                            src={student.image}
                            alt={student?.userName || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faUser} // always faUser
                            className="text-white text-sm md:text-base"
                          />
                        )}
                      </div>
                      {/* Tutor Name aligned with avatar bottom */}
                      <h3 className="font-semibold text-[#16151C] text-[16px] md:text-[18px] truncate">
                        {student?.userName}
                      </h3>
                    </div>

                    {/* Email + Tutor ID aligned with tutor name (indented, not under avatar) */}
                    <div className="text-sm text-[#16151C] mt-2 md:mt-1 pl-0 md:pl-[4rem]">
                      <div className="flex flex-col md:flex-row">
                        <span className="w-20 md:w-24 font-light text-[14px] md:text-base mb-1 md:mb-0">Email: </span>
                        <span className="font-medium text-[14px] md:text-base truncate">{student?.email}</span>
                      </div>
                      <div className="flex flex-col md:flex-row mt-1">
                        <span className="w-20 md:w-24 font-light text-[14px] md:text-base mb-1 md:mb-0">Tutor ID: </span>
                        <span className="font-medium text-[14px] md:text-base truncate">{student?.userId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Button aligned with Tutor ID */}
                  <div className="flex items-center md:items-end justify-center md:justify-end">
                    <Button
                      variant="contained"
                      onClick={() => handleSelectTutor(student)}
                      className="w-full md:w-auto hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded-lg font-medium"
                      style={{
                        borderRadius: "8px",
                        width: "100%",
                        md: { width: "130px" },
                        height: "36px",
                        md: { height: "40px" },
                        color: "#FFFFFF",
                        backgroundColor: "#4071B6",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "none",
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {searchedStudents?.length > itemsPerPage && (
            <div className="mt-4 md:mt-6 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 px-4 py-3 bg-white">
              <div className="text-xs md:text-sm text-gray-600 text-center md:text-left">
                Showing {startIndex + 1} to {Math.min(endIndex, searchedStudents.length)} out of {searchedStudents.length} records
              </div>

              <Stack direction="row" spacing={1} alignItems="center">
                {/* Previous button */}
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  sx={{ minWidth: '32px', padding: '4px' }}
                >
                  <svg
                    width="6"
                    height="12"
                    viewBox="0 0 6 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5.46849 11.5856C5.79194 11.3269 5.84438 10.8549 5.58562 10.5315L1.96044 5.99997L5.58562 1.46849C5.84438 1.14505 5.79194 0.673077 5.46849 0.41432C5.14505 0.155562 4.67308 0.208004 4.41432 0.53145L0.414321 5.53145C0.19519 5.80536 0.19519 6.19458 0.414321 6.46849L4.41432 11.4685C4.67308 11.7919 5.14505 11.8444 5.46849 11.5856Z"
                      fill="#16151C"
                    />
                  </svg>
                </Button>

                {/* Page numbers */}
                {getVisiblePages(currentPage, Math.ceil(searchedStudents.length / itemsPerPage), 4).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    sx={{
                      width: page === currentPage ? 35 : 32,
                      minWidth: 'unset',
                      height: 36,
                      borderRadius: page === currentPage ? '8px' : '50px',
                      padding: '7px 12px',
                      gap: '10px',
                      borderWidth: page === currentPage ? 1 : 0,
                      border: page === currentPage ? '1px solid #4071B6' : 'none',
                      background: '#FFFFFF',
                      color: page === currentPage ? '#4071B6' : '#16151C',
                      fontWeight: page === currentPage ? 600 : 300,
                      fontSize: '14px',
                    }}
                  >
                    {page}
                  </Button>
                ))}

                {/* Next button */}
                <Button
                  disabled={currentPage === Math.ceil(searchedStudents.length / itemsPerPage)}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  sx={{ minWidth: '32px', padding: '4px' }}
                >
                  <svg
                    width="6"
                    height="12"
                    viewBox="0 0 6 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.531506 11.5856C0.20806 11.3269 0.155619 10.8549 0.414376 10.5315L4.03956 5.99997L0.414376 1.46849C0.155618 1.14505 0.208059 0.673077 0.531506 0.41432C0.854952 0.155562 1.32692 0.208004 1.58568 0.53145L5.58568 5.53145C5.80481 5.80536 5.80481 6.19458 5.58568 6.46849L1.58568 11.4685C1.32692 11.7919 0.854953 11.8444 0.531506 11.5856Z"
                      fill="#16151C"
                    />
                  </svg>
                </Button>
              </Stack>
            </div>
          )}

          {searchedStudents.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-12 text-center">
              <div className="text-gray-400 text-lg md:text-xl">No Tutors Found</div>
            </div>
          )}
        </div>
      </div>
    </TopHeadingProvider>
  )
}
