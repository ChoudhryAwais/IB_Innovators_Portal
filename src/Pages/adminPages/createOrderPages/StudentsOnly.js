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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {students.length !== 0 && (
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon className="text-gray-400" icon={faMagnifyingGlass} />
          </div>
          <input
            onChange={handleSearch}
            placeholder="Search by name/email"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            defaultValue=""
          />
        </div>
      )}

      <div className="space-y-4">
        {displayedSessions.map((student, index) => (
          <div
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            key={index}
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                <img
                  src={`/profile-picture-of-.jpg?key=i60jq&height=48&width=48&query=profile+picture+of+${student?.userName || "student"}`}
                  alt={student?.userName}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{student?.userName}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Email:</span> {student?.email}
                  </div>
                  <div>
                    <span className="font-medium">User ID:</span> {student?.userId}
                  </div>
                  <div>
                    <span className="font-medium">Balance:</span> ${" "}
                    {student?.credits && student?.credits > 0 ? student?.credits?.toFixed(2) : "0.16"}
                  </div>
                </div>
              </div>
            </div>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              onClick={() => {
                setSelectedStudent(student)
                setShowModal(true)
              }}
            >
              Create Job
            </button>
          </div>
        ))}
      </div>

      {searchedStudents?.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(endIndex, searchedStudents.length)} out of {searchedStudents.length}{" "}
            records
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

      {searchedStudents.length === 0 && <div className="text-center text-gray-400 text-xl py-12">No Students</div>}

      <Modal open={showModal} aria-labelledby="parent-modal-title" aria-describedby="parent-modal-description">
        <CreateNewOrderForm item={selectedStudent} handleClose={closingModal} />
      </Modal>
    </div>
  )
}
