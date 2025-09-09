import React, { useState, useEffect, createContext, useContext } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../Sidebar/Sidebar"
import NavBar from "./navbar"
import TopHeading from "./TopHeading/TopHeading"

// Context setup
const TopHeadingContext = createContext()

export function TopHeadingProvider({ children }) {
  const [firstMessage, setFirstMessage] = useState("")
  const [secondMessage, setSecondMessage] = useState("")

  return (
    <TopHeadingContext.Provider
      value={{ firstMessage, secondMessage, setFirstMessage, setSecondMessage }}
    >
      {children}
    </TopHeadingContext.Provider>
  )
}

export function useTopHeading() {
  return useContext(TopHeadingContext)
}

export default function Layout() {
  const [sidebarWidth, setSidebarWidth] = useState(300)

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1024) {
        setSidebarWidth(100)
      } else {
        setSidebarWidth(300)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <TopHeadingProvider>
      <div className="max-w-[2200px] mx-auto flex relative">
        {/* Sidebar */}
        <div className="fixed top-0 left-0 h-full z-[999]">
          <Sidebar />
        </div>

        {/* Content area */}
        <div
          className="flex-1 flex flex-col"
          style={{ marginLeft: `${sidebarWidth - 8}px` }}
        >
          {/* Header - connected with Sidebar */}
          <div
            className="flex justify-between items-center fixed top-0 h-[70px] px-6 bg-white border-gray-200 z-[998]"
            style={{ left: `${sidebarWidth}px`, width: `calc(100% - ${sidebarWidth}px)` }}
          >
            <TopHeading />
            <NavBar />
          </div>

          {/* Main Content */}
          <div className="pt-[70px] min-h-screen bg-white">
            <Outlet />
          </div>
        </div>
      </div>
    </TopHeadingProvider>
  )
}
