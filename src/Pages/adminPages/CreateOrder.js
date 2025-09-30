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
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 6H21M5 11H9M5 15H9M14.2361 15.2764L17 13.8944C17.737 13.5259 17.737 12.4741 17 12.1056L14.2361 10.7236C13.5712 10.3912 12.7889 10.8747 12.7889 11.618V14.382C12.7889 15.1253 13.5712 15.6088 14.2361 15.2764ZM5 21H17C19.2091 21 21 19.2091 21 17V5C21 2.79086 19.2091 1 17 1H5C2.79086 1 1 2.79086 1 5V17C1 19.2091 2.79086 21 5 21Z" stroke="#28303F" stroke-width="1.5" stroke-linecap="round" />
        </svg>

      ),
      activeIcon: (
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
      activeIcon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 2C20.2091 2 22 3.79086 22 6V15C22 17.2091 20.2091 19 18 19H12.75V21.25H15C15.4142 21.25 15.75 21.5858 15.75 22C15.75 22.4142 15.4142 22.75 15 22.75H9C8.58579 22.75 8.25 22.4142 8.25 22C8.25 21.5858 8.58579 21.25 9 21.25H11.25V19H6C3.79086 19 2 17.2091 2 15V6C2 3.79086 3.79086 2 6 2H18ZM9.5 12C8.67157 12 8 12.6716 8 13.5C8 14.3284 8.67157 15 9.5 15H14.5C15.3284 15 16 14.3284 16 13.5C16 12.6716 15.3284 12 14.5 12H9.5ZM12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10C13.1046 10 14 9.10457 14 8C14 6.89543 13.1046 6 12 6Z" fill="#4071B6" />
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
      activeIcon: (
        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.9287 13.75C19.5776 15.6005 17.9527 17 16 17H10.75V19.25H13C13.4142 19.25 13.75 19.5858 13.75 20C13.75 20.4142 13.4142 20.75 13 20.75H7C6.58579 20.75 6.25 20.4142 6.25 20C6.25 19.5858 6.58579 19.25 7 19.25H9.25V17H4C2.04728 17 0.422423 15.6005 0.0712891 13.75H19.9287ZM16 0C18.2091 0 20 1.79086 20 4V12.25H0V4C0 1.79086 1.79086 3.22128e-08 4 0H16ZM5 8.25C4.58579 8.25 4.25 8.58579 4.25 9C4.25 9.41421 4.58579 9.75 5 9.75H15C15.4142 9.75 15.75 9.41421 15.75 9C15.75 8.58579 15.4142 8.25 15 8.25H5ZM5 4.25C4.58579 4.25 4.25 4.58579 4.25 5C4.25 5.41421 4.58579 5.75 5 5.75H10C10.4142 5.75 10.75 5.41421 10.75 5C10.75 4.58579 10.4142 4.25 10 4.25H5Z" fill="#4071B6" />
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
                  {activeTab === tab.id ? tab.activeIcon : tab.icon}
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
