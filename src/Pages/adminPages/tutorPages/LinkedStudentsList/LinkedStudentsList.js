"use client"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../../../../firebase"
import StudentDetails from "./StudentDetails"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export default function LinkedStudentsList({ userId }) {
  const [categorizedClasses, setCategorizedClasses] = useState({})
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [viewType, setViewType] = useState(null) // 'classes' or 'balance'

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        const linkedRef = collection(db, "Linked")
        const q = query(linkedRef, where("teacherId", "==", userId))
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const classesByStudent = {}

          snapshot.forEach((doc) => {
            const data = doc.data()
              ; (data.invoices || []).forEach((invoice) => {
                const { studentId, studentName } = invoice

                if (!classesByStudent[studentId]) {
                  classesByStudent[studentId] = {
                    studentName,
                    classes: [],
                  }
                }

                classesByStudent[studentId].classes.push({
                  ...invoice,
                  linkId: doc.id,
                })
              })
          })

          setCategorizedClasses(classesByStudent)
        })

        return () => unsubscribe()
      }
    }

    fetchData()
  }, [userId])

  const handleViewClasses = (studentId) => {
    setSelectedStudent(studentId)
    setViewType("classes")
  }

  const handleViewBalance = (studentId) => {
    setSelectedStudent(studentId)
    setViewType("balance")
  }

  const handleBackToList = () => {
    setSelectedStudent(null)
    setViewType(null)
  }

  if (selectedStudent && viewType) {
    return (
      <div className="">
        <div className="flex items-center gap-2 mb-6 cursor-pointer hover:text-blue-800" onClick={handleBackToList}>
          {/* Custom SVG as button */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 2H18C20.2091 2 22 3.79086 22 6V18C22 20.2091 20.2091 22 18 22H6C3.79086 22 2 20.2091 2 18V6C2 3.79086 3.79086 2 6 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 7L8 9M8 9L10 11M8 9H13C14.6569 9 16 10.3431 16 12V12C16 13.6569 14.6569 15 13 15H8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Text next to the SVG */}
          <span className="font-semibold text-[18px]">{viewType === "classes" ? "Classes Taken" : "Balance History"} </span><span className="font-light text-[16px]">{categorizedClasses[selectedStudent]?.studentName ? ` (${categorizedClasses[selectedStudent].studentName})` : ""}</span>
        </div>

        <StudentDetails
          studentData={categorizedClasses[selectedStudent]}
          studentId={selectedStudent}
          viewType={viewType}
        />
      </div>
    )
  }

  return (
    <div className="">
      <h1 className="text-[24px] font-semibold text-[#16151C] mb-6">Students List</h1>

      <div className="space-y-4">
        {Object.entries(categorizedClasses).map(([studentId, studentData]) => (
          <div
            key={studentId}
            className="flex h-[60px] items-center justify-between py-4 px-2 bg-[#A2A1A80D] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4071B6] rounded-full flex items-center justify-center overflow-hidden">
                {studentData?.image ? (
                  <img
                    src={studentData.image}
                    alt={studentData?.studentName || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faUser} // always faUser
                    className="text-white text-sm"
                  />
                )}
              </div>
              <span className="text-[18px] font-light text-[#16151C]">{studentData.studentName}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleViewClasses(studentId)}
                className="bg-[#4071B60D] h-[36px] border-1 border-[#4071B6] font-semibold text-[#4071B6] px-2 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                Classes Taken
                <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.26685 15L13.2668 10L8.26685 5" stroke="#4071B6" stroke-width="1.69163" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

              </button>
              <button
                onClick={() => handleViewBalance(studentId)}
                className="bg-[#4071B60D] h-[36px] border-1 border-[#4071B6] font-semibold text-[#4071B6] px-2 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                Balance History
                <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.26685 15L13.2668 10L8.26685 5" stroke="#4071B6" stroke-width="1.69163" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

              </button>
            </div>
          </div>
        ))}

        {Object.keys(categorizedClasses).length === 0 && (
          <div className="text-gray-500 text-center py-8">No students found</div>
        )}
      </div>
    </div>
  )
}
