"use client"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../../../../firebase"
import TutorDetails from "./TutorDetails"

export default function LinkedTutorsList({ userId }) {
  const [categorizedClasses, setCategorizedClasses] = useState({})
  const [selectedTutor, setSelectedTutor] = useState(null)
  const [viewType, setViewType] = useState(null) // 'classes' or 'balance'

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        const linkedRef = collection(db, "Linked")
        const q = query(linkedRef, where("studentId", "==", userId))
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const classesByTutor = {}

          snapshot.forEach((doc) => {
            const data = doc.data()
            ;(data.invoices || []).forEach((invoice) => {
              const { teacherId, teacherName } = invoice

              if (!classesByTutor[teacherId]) {
                classesByTutor[teacherId] = {
                  tutorName: teacherName,
                  classes: [],
                }
              }

              classesByTutor[teacherId].classes.push({
                ...invoice,
                linkId: doc.id,
              })
            })
          })

          setCategorizedClasses(classesByTutor)
        })

        return () => unsubscribe()
      }
    }

    fetchData()
  }, [userId])

  const handleViewClasses = (tutorId) => {
    setSelectedTutor(tutorId)
    setViewType("classes")
  }

  const handleViewBalance = (tutorId) => {
    setSelectedTutor(tutorId)
    setViewType("balance")
  }

  const handleBackToList = () => {
    setSelectedTutor(null)
    setViewType(null)
  }

  if (selectedTutor && viewType) {
    return (
      <div className="">
        <div
          className="flex items-center gap-2 mb-6 cursor-pointer hover:text-blue-800"
          onClick={handleBackToList}
        >
          {/* Back button */}
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

          <span className="font-semibold">
            {viewType === "classes" ? "Classes Taken" : "Balance History"}
          </span>
          <span className="font-medium">
            {categorizedClasses[selectedTutor]?.tutorName
              ? ` (${categorizedClasses[selectedTutor].tutorName})`
              : ""}
          </span>
        </div>

        <TutorDetails
          tutorData={categorizedClasses[selectedTutor]}
          tutorId={selectedTutor}
          viewType={viewType}
        />
      </div>
    )
  }

  return (
    <div className="">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tutors List</h1>

      <div className="space-y-4">
        {Object.entries(categorizedClasses).map(([tutorId, tutorData]) => (
          <div
            key={tutorId}
            className="flex h-[60px] items-center justify-between py-4 px-2 bg-[#A2A1A80D] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {tutorData.tutorName?.charAt(0) || "T"}
                </span>
              </div>
              <span className="text-lg font-medium text-gray-900">
                {tutorData.tutorName}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleViewClasses(tutorId)}
                className="bg-[#4071B60D] h-[36px] border-1 border-[#4071B6] font-semibold text-[#4071B6] px-2 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                Classes Taken
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleViewBalance(tutorId)}
                className="bg-[#4071B60D] h-[36px] border-1 border-[#4071B6] font-semibold text-[#4071B6] px-2 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                Balance History
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
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
          <div className="text-gray-500 text-center py-8">
            No tutors found
          </div>
        )}
      </div>
    </div>
  )
}
