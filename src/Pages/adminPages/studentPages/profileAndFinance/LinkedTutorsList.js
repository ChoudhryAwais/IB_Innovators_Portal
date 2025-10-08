"use client"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "../../../../firebase"
import TutorDetails from "./TutorDetails"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"


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
              ; (data.invoices || []).forEach((invoice) => {
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

          <span className="font-semibold text-[18px]">
            {viewType === "classes" ? "Classes Taken" : "Balance History"}
          </span>
          <span className="font-light text-[16px]">
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
      <h1 className="text-[24px] font-semibold text-[#16151C] mb-6">Tutors List</h1>

      <div className="space-y-4">
        {Object.entries(categorizedClasses).map(([tutorId, tutorData]) => (
          <div
            key={tutorId}
            className="flex h-[60px] items-center justify-between py-4 px-2 bg-[#A2A1A80D] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4071B6] rounded-full flex items-center justify-center overflow-hidden">
                {tutorData?.image ? (
                  <img
                    src={tutorData.image}
                    alt={tutorData?.tutorName || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-white text-sm"
                  />
                )}
              </div>

              <span className="text-[18px] font-light text-[#16151C]">
                {tutorData.tutorName}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleViewClasses(tutorId)}
                className="bg-[#4071B60D] h-[36px] border-1 border-[#4071B6] font-semibold text-[#4071B6] px-2 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                Classes Taken
                <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.26685 15L13.2668 10L8.26685 5" stroke="#4071B6" stroke-width="1.69163" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => handleViewBalance(tutorId)}
                className="bg-[#4071B60D] h-[36px] border-1 border-[#4071B6] font-semibold text-[#4071B6] px-2 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                Credit History
                <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.26685 15L13.2668 10L8.26685 5" stroke="#4071B6" stroke-width="1.69163" stroke-linecap="round" stroke-linejoin="round" />
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
