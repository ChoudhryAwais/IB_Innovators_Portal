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
    setFirstMessage("Jobs & Requests")
    setSecondMessage("Show all Jobs and Requests")
  }, [setFirstMessage, setSecondMessage])

  const tabs = [
    {
      id: "createJob",
      label: "Create Job",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 16C20 18.2091 18.2091 20 16 20H4C1.79086 20 3.22133e-08 18.2091 0 16V5.75H20V16ZM4 13.25C3.58579 13.25 3.25 13.5858 3.25 14C3.25 14.4142 3.58579 14.75 4 14.75H8C8.41421 14.75 8.75 14.4142 8.75 14C8.75 13.5858 8.41421 13.25 8 13.25H4ZM13.4473 9.72363C12.7824 9.39118 12 9.87478 12 10.6182V13.3818C12 14.1252 12.7824 14.6088 13.4473 14.2764L16.2109 12.8945C16.948 12.526 16.948 11.474 16.2109 11.1055L13.4473 9.72363ZM4 9.25C3.58579 9.25 3.25 9.58579 3.25 10C3.25 10.4142 3.58579 10.75 4 10.75H8C8.41421 10.75 8.75 10.4142 8.75 10C8.75 9.58579 8.41421 9.25 8 9.25H4ZM16 0C18.2091 0 20 1.79086 20 4V4.25H0V4C0 1.79086 1.79086 3.22128e-08 4 0H16Z" fill="#4071B6" />
        </svg>

      ),
    },
    {
      id: "viewApplicants",
      label: "View Applicants",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 19V22M12 22H9M12 22H15M14 8C14 6.89543 13.1046 6 12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10C13.1046 10 14 9.10457 14 8ZM6 19H18C20.2091 19 22 17.2091 22 15V6C22 3.79086 20.2091 2 18 2H6C3.79086 2 2 3.79086 2 6V15C2 17.2091 3.79086 19 6 19ZM9.5 15H14.5C15.3284 15 16 14.3284 16 13.5C16 12.6716 15.3284 12 14.5 12H9.5C8.67157 12 8 12.6716 8 13.5C8 14.3284 8.67157 15 9.5 15Z" stroke="#28303F" stroke-width="1.5" stroke-linecap="round" />
        </svg>

      ),
    },
    {
      id: "courseApplication",
      label: "Course Application",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 15V6C2 3.79086 3.79086 2 6 2H18C20.2091 2 22 3.79086 22 6V15M2 15C2 17.2091 3.79086 19 6 19H18C20.2091 19 22 17.2091 22 15M2 15H22M12 19V22M12 22H9M12 22H15M7 7H12M7 11H17" stroke="#28303F" stroke-width="1.5" stroke-linecap="round" />
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
                  className={`flex items-center gap-2 px-6 py-3 text-[16px]  transition-colors duration-200 border-b-2 ${activeTab === tab.id
                      ? "text-[#4071B6] border-[#4071B6] font-semibold"
                      : "text-[#16151C] border-transparent font-light hover:hover:border-gray-300"
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
