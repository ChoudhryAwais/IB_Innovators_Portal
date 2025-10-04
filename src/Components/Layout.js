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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth
      setWindowWidth(width)

      if (width < 768) {
        setSidebarWidth(80) // collapsed width on mobile
      } else if (width < 1024) {
        setSidebarWidth(80) // medium screens
      } else {
        setSidebarWidth(300) // full sidebar
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
          className="flex-1 flex flex-col transition-all duration-300"
          style={{ marginLeft: `${sidebarWidth}px` }}
        >
          {/* Header */}
          <div
            className="flex justify-between items-center fixed top-0 h-[70px] px-6 bg-white border-gray-200 z-[998] transition-all duration-300 pt-4 pb-2"
            style={{ left: `${sidebarWidth}px`, width: `calc(100% - ${sidebarWidth}px)` }}
          >
            <TopHeading />
            <NavBar />
          </div>

          {/* Main Content */}
          <div className="pt-[80px] min-h-screen bg-white">
            <Outlet />
          </div>
        </div>
      </div>
    </TopHeadingProvider>
  )
}
