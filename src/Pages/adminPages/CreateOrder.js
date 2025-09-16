"use client"

import { useEffect, useState } from "react"
import { StudentList } from "./createOrderPages/StudentList"
import { OrderList } from "./createOrderPages/OrderList"
import { StudentsOnly } from "./createOrderPages/StudentsOnly"
import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"

export const CreateOrder = () => {
  const { setFirstMessage, setSecondMessage } = useTopHeading()
  const [activeTab, setActiveTab] = useState("createJob")

  useEffect(() => {
    setFirstMessage("Jobs and Requests")
    setSecondMessage("Show all Jobs and Requests")
  }, [setFirstMessage, setSecondMessage])

  const tabs = [
    {
      id: "createJob",
      label: "Create Job",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      id: "viewApplicants",
      label: "View Applicants",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.121M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: "courseApplication",
      label: "Course Application",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "createJob":
        return <StudentsOnly />
      case "viewApplicants":
        return <OrderList />
      case "courseApplication":
        return <StudentList />
      default:
        return <StudentsOnly />
    }
  }

  return (
  <TopHeadingProvider>
    <div className="min-h-screen p-6">
      <div className="mr-[10px] mb-5 pt-0">
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Tabs header */}
          <div className="flex border-b border-gray-200 mx-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? "text-blue-600 border-blue-600 "
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content directly attached */}
          <div className="p-4">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  </TopHeadingProvider>
)
}
