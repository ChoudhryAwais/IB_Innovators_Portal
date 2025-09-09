"use client"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../../../../firebase"
import StudentDetails from "./StudentDetails"

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
            ;(data.invoices || []).forEach((invoice) => {
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
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handleBackToList} className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Back to Students List
          </button>
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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Students List</h1>

      <div className="space-y-4">
        {Object.entries(categorizedClasses).map(([studentId, studentData]) => (
          <div
            key={studentId}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">{studentData.studentName?.charAt(0) || "S"}</span>
              </div>
              <span className="text-lg font-medium text-gray-900">{studentData.studentName}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleViewClasses(studentId)}
                className="bg-white border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                Classes Taken
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleViewBalance(studentId)}
                className="bg-white border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                Balance History
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
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
