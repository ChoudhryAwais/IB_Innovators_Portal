"use client"

import React, { useState, useEffect, useContext } from "react"

import { db } from "../../../firebase"
import { collection, query, onSnapshot, where } from "firebase/firestore"
import { MyContext } from "../../../Context/MyContext"
import { Modal } from "@mui/material"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"

import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import { CreateNewOrderForm } from "./CreateNewOrderForm"
import CustomModal from "../../../Components/CustomModal/CustomModal";

import Ellipse from "../../../assets/icons/Ellipse 1171.png"

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
} from "@mui/material";
export function StudentsOnly() {
  const { userDetails } = useContext(MyContext)

  const [showModal, setShowModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState({})

  const [subjects, setSubjects] = useState(userDetails?.subjects ? userDetails?.subjects : {})

  function closingModal(e) {
    setShowModal(e)
  }

  const [students, setStudents] = useState([])

  const fetchData = () => {
    try {
      const userListRef = collection(db, "userList")
      const q = query(userListRef, where("type", "==", "student"))

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const studentData = querySnapshot.docs.map((doc) => doc.data())
        setStudents(studentData)
        setSearchedStudents(studentData)
      })

      return unsubscribe
    } catch (e) {
      console.error("Error fetching data:", e)
    }
  }

  useEffect(() => {
    const unsubscribe = fetchData()
    return () => {
      unsubscribe()
    }
  }, [])

  const [searchedStudents, setSearchedStudents] = useState(students)

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

  return (
  <div>
    {students.length !== 0 && (
      <div className="relative mb-4 sm:mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="w-4 h-4 sm:w-[21.5px] sm:h-[21.5px] flex-shrink-0 text-gray-500 mr-2"
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
          className="w-full h-[40px] sm:h-[50px] pl-8 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
          defaultValue=""
        />
      </div>
    )}

    <div className="space-y-3 sm:space-y-4">
      {displayedSessions.map((student, index) => (
        <div
          key={index}
          className="flex items-stretch p-3 sm:p-4 border-b border-gray-200"
        >
          {/* Info + Button */}
          <div className="flex flex-col sm:flex-row justify-between w-full gap-3 sm:gap-0">
            {/* Student Info */}
            <div className="flex-1">
              {/* Avatar + Name */}
              <div className="flex items-center">
                {/* Avatar */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <img
                    src={`/profile-picture-of-.jpg?key=i60jq&height=48&width=48&query=profile+picture+of+${student?.userName || "student"}`}
                    alt={student?.userName}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                  />
                </div>
                {/* Student Name aligned with avatar bottom */}
                <h3 className="font-semibold text-[#16151C] text-[16px] sm:text-[18px] truncate">
                  {student?.userName}
                </h3>
              </div>

              {/* Email + User ID + Balance aligned with student name (indented) */}
              <div className="text-sm text-gray-600 mt-2 sm:mt-1 pl-0 sm:pl-[4rem] space-y-1">
                <div className="flex flex-col sm:flex-row">
                  <span className="w-16 sm:w-24 font-light text-[#16151C] text-[12px] sm:text-[14px] mb-1 sm:mb-0">Email:</span>
                  <span className="text-[#16151C] text-[12px] sm:text-[14px] font-medium truncate">{student?.email}</span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="w-16 sm:w-24 font-light text-[#16151C] text-[12px] sm:text-[14px] mb-1 sm:mb-0">User ID:</span>
                  <span className="text-[#16151C] text-[12px] sm:text-[14px] font-medium truncate">{student?.userId}</span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="w-16 sm:w-24 font-light text-[#16151C] text-[12px] sm:text-[14px] mb-1 sm:mb-0">Balance:</span>
                  <span className="text-[#16151C] text-[12px] sm:text-[14px] font-medium">
                    ${student?.credits && student?.credits > 0 ? student?.credits?.toFixed(2) : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Button aligned with Student info */}
            <div className="flex items-center sm:items-end justify-center sm:justify-end mt-2 sm:mt-0">
              <button
                className="w-full sm:w-auto bg-[#4071B6] hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-2 rounded-lg font-[12px] text-sm sm:text-base transition-colors"
                onClick={() => {
                  setSelectedStudent(student)
                  setShowModal(true)
                }}
              >
                Create Job
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>

    {searchedStudents?.length > itemsPerPage && (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 pt-4 border-gray-200 gap-3 sm:gap-0">
        <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
          Showing {startIndex + 1} to {Math.min(endIndex, searchedStudents.length)} out of {searchedStudents.length}{" "}
          records
        </div>
        <Stack spacing={2}>
          <Pagination
            count={Math.ceil(searchedStudents?.length / itemsPerPage)}
            page={currentPage}
            onChange={handleChangePage}
            color="primary"
            size="small"
          />
        </Stack>
      </div>
    )}

    {searchedStudents.length === 0 && (
      <div className="text-center text-gray-400 text-lg sm:text-xl py-8 sm:py-12">No Students</div>
    )}

    <CustomModal
      open={showModal}
      onClose={closingModal}
      PaperProps={{
        sx: {
          width: "95vw",    // responsive width for mobile
          sm: { width: "720px" }, // tablet
          md: { width: "1080px" }, // desktop
          height: "auto",
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflow: "hidden",
          borderRadius: "10px",
          padding: 0,
        },
      }}
    >
      <CreateNewOrderForm item={selectedStudent} handleClose={closingModal} />
    </CustomModal>
  </div>
)
}
