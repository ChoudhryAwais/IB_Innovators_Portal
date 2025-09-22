"use client"

import { useEffect, useState } from "react"
import RequestCoursesForm from "../requestCoursesForm/RequestCoursesForm"
import UpcomingCourseForm from "../upcomingCourseForm/UpcomingCourseForm"
import RevisionCoursesForm from "../revisionCourseForm/RevisionCoursesForm"
import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"

export const CourseTabs = () => {
  const [activeTab, setActiveTab] = useState("upcoming")
  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("Courses")
    setSecondMessage("Manage your courses")
  }, [setFirstMessage, setSecondMessage])

  const tabs = [
    {
      id: "upcoming",
      label: "Upcoming Courses Forms",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18" />
        </svg>
      ),
    },
    {
      id: "requested",
      label: "Request Course Forms",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
        </svg>
      ),
    },
    {
      id: "reviewed",
      label: "Revision Courses Forms",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "upcoming":
        return <UpcomingCourseForm />
      case "requested":
        return <RequestCoursesForm />
      case "reviewed":
        return <RevisionCoursesForm />
      default:
        return <UpcomingCourseForm />
    }
  }

  return (
    <TopHeadingProvider>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto border border-gray-200 rounded-lg p-6">
          <div className="bg-white border-b border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="tab-content">{renderTabContent()}</div>
        </div>
      </div>
    </TopHeadingProvider>
  )
}
