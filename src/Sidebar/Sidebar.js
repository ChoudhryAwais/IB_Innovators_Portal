"use client"

import { useState, useEffect, useContext } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import logo from "../assets/logo.png"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBars,
  faTachometerAlt,
  faUserPlus,
  faUsers,
  faGlobe,
  faChevronDown,
  faHome,
  faLink,
  faBriefcase,
  faChalkboardTeacher,
  faGraduationCap,
  faUserShield,
  faBook,
  faFileAlt,
  faPhone,
  faBookOpen,
  faBlog,
  faLifeRing,
  faSearch,
  faEye,
  faAddressCard,
  faChalkboardUser,
  faFileInvoice,
  faUser,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons"
import { MyContext } from "../Context/MyContext"
import { faWpforms } from "@fortawesome/free-brands-svg-icons"

const Sidebar = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const location = useLocation()
  const navigate = useNavigate()
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(windowWidth >= 768)
  const [currentPath, setCurrentPath] = useState("")
  const { userType } = useContext(MyContext)

  const [expandedSections, setExpandedSections] = useState({
    userManagement: false,
    forms: false,
    webControl: false,
  })

  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    setCurrentPath(location.pathname)

    if (location.pathname === "/" || location.pathname === "/signup") {
      setActiveSection("")
      setExpandedSections({
        userManagement: false,
        forms: false,
        webControl: false,
      })
    }
  }, [location.pathname])

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      if (window.innerWidth >= 768) {
        setIsSidebarExpanded(true)
      } else {
        setIsSidebarExpanded(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded)

  const toggleSection = (section) => {
    setExpandedSections((prev) => {
      const newState = {
        userManagement: false,
        forms: false,
        webControl: false,
      }
      newState[section] = !prev[section]

      if (!prev[section]) {
        if (section === "userManagement") {
          navigate("/links")
        } else if (section === "forms") {
          navigate("/coursesForms")
        } else if (section === "webControl") {
          navigate("/subjects")
        }
      }

      return newState
    })

    setActiveSection((prev) => (prev === section ? "" : section))
  }

  const SidebarIcon = ({ isActive, ActiveIcon, InactiveIcon }) => {
    return isActive ? <ActiveIcon /> : <InactiveIcon />;
  };

  const linkClass = (path, isDashboard = false) =>
    `flex items-center justify-between w-full p-2 rounded-md text-[14px] transition-colors cursor-pointer ${currentPath === path ? (isDashboard ? "text-[#4071B6] font-semibold" : " font-semibold text-[#4071B6]") : "text-[#16151C] font-light hover:text-[#4071B6]"
    }`

  const sectionHeaderClass = (section, isExpanded) =>
    `flex items-center justify-between w-full p-2 rounded-md text-[14px] transition-colors cursor-pointer ${activeSection === section && isExpanded ? "text-[#4071B6] font-semibold " : "text-[#16151C] font-light hover:text-[#4071B6] "
    }`

  const subItemClass = (path, parent) =>
    `flex items-center w-full p-2 pl-8 rounded-md text-[14px] transition-colors cursor-pointer ${currentPath === path
      ? "bg-[#4071B60D] border-[0.6px] border-[#4071B60D] font-semibold text-[#4071B6] ml-2"
      : activeSection === parent
        ? "text-[#16151C] font-light bg-[#A2A1A80D] ml-2"
        : "text-[#16151C] ml-2"
    }`

  return (
    <>
      {windowWidth < 768 && isSidebarExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleSidebar} />
      )}

      <div
        className={`fixed top-0 bottom-0 left-0 bg-[#fafafa] text-gray-700 z-50 transition-all duration-300 ease-in-out ${isSidebarExpanded
          ? "w-[300px] max-w-[300px] translate-x-0"
          : windowWidth < 768
            ? "w-[80px] max-w-[80px] translate-x-0" // <- always visible on mobile, just narrow
            : "w-16"
          }`}
      >

        <div className="h-full w-full overflow-y-auto px-4">
          <div className="mb-6 flex items-center justify-between mt-6">
            <div className="flex items-center">
              {isSidebarExpanded && (
                <img src={logo || "/placeholder.svg"} alt="IB INNOVATORS" className="h-12 w-auto object-contain ml-2" />
              )}
            </div>
            {windowWidth < 768 && (
              <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-200 transition-colors">
                <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
              </button>
            )}
          </div>

          {userType === "admin" && (
            <nav className="space-y-1">

              <Link className={linkClass("/", true)} to="/">
                <div className="flex items-center">

                  <SidebarIcon
                    isActive={currentPath === "/"}
                    ActiveIcon={() => (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M17.5 8.45796V14.9717C17.5 16.8279 16.0076 18.3327 14.1667 18.3327H5.83333C3.99238 18.3327 2.5 16.8279 2.5 14.9717V8.45796C2.5 7.44883 2.9497 6.4931 3.72488 5.85479L7.89155 2.42381C9.11859 1.41342 10.8814 1.41342 12.1084 2.4238L16.2751 5.85478C17.0503 6.4931 17.5 7.44883 17.5 8.45796ZM8.33333 14.3743C7.98816 14.3743 7.70833 14.6542 7.70833 14.9993C7.70833 15.3445 7.98816 15.6243 8.33333 15.6243H11.6667C12.0118 15.6243 12.2917 15.3445 12.2917 14.9993C12.2917 14.6542 12.0118 14.3743 11.6667 14.3743H8.33333Z" fill="#4071B6" />
                      </svg>
                    )}
                    InactiveIcon={() => (
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.5 14.9717V8.45796C17.5 7.44883 17.0503 6.4931 16.2751 5.85478L12.1084 2.4238C10.8814 1.41342 9.11859 1.41342 7.89155 2.42381L3.72488 5.85479C2.9497 6.4931 2.5 7.44883 2.5 8.45796V14.9717C2.5 16.8279 3.99238 18.3327 5.83333 18.3327H14.1667C16.0076 18.3327 17.5 16.8279 17.5 14.9717Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.33398 15H11.6673"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>

                    )}
                  />

                  {isSidebarExpanded && <span className="ml-2">Dashboard</span>}
                </div>
              </Link>

              <div className="text-[14px]">
                <div
                  className={sectionHeaderClass("userManagement", expandedSections.userManagement)}
                  onClick={() => toggleSection("userManagement")}
                >
                  <div className="flex items-center">

                    <SidebarIcon
                      isActive={activeSection === "userManagement"}
                      ActiveIcon={() => (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M15.0003 1.66602H5.00033C3.15938 1.66602 1.66699 3.1584 1.66699 4.99935V14.9993C1.66699 16.5529 2.72976 17.8582 4.16791 18.2279C4.43399 18.2963 4.71291 18.3327 5.00033 18.3327H15.0003C15.2877 18.3327 15.5667 18.2963 15.8327 18.2279C17.2709 17.8582 18.3337 16.5529 18.3337 14.9994V4.99935C18.3337 3.1584 16.8413 1.66602 15.0003 1.66602ZM12.5003 7.49935C12.5003 6.11864 11.381 4.99935 10.0003 4.99935C8.61961 4.99935 7.50033 6.11864 7.50033 7.49935C7.50033 8.88006 8.61961 9.99935 10.0003 9.99935C11.381 9.99935 12.5003 8.88006 12.5003 7.49935ZM5.9608 14.1789C6.4177 12.7347 8.05301 11.666 10.0003 11.666C11.9476 11.666 13.5829 12.7347 14.0398 14.1789C14.1787 14.6177 13.7939 14.9993 13.3337 14.9993H6.66699C6.20676 14.9993 5.82198 14.6177 5.9608 14.1789Z" fill="#4071B6" />
                        </svg>

                      )}
                      InactiveIcon={() => (
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0)">
                            <circle
                              cx="2.5"
                              cy="2.5"
                              r="2.5"
                              transform="matrix(1 0 0 -1 7.5 10)"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M15.8318 18.2279C17.2699 17.8582 18.3327 16.5529 18.3327 14.9994V4.99935C18.3327 3.1584 16.8403 1.66602 14.9994 1.66602H4.99935C3.1584 1.66602 1.66602 3.1584 1.66602 4.99935V14.9993C1.66602 16.5529 2.72878 17.8582 4.16694 18.2279M15.8318 18.2279C15.5657 18.2963 15.2868 18.3327 14.9993 18.3327H4.99935C4.71193 18.3327 4.43301 18.2963 4.16694 18.2279M15.8318 18.2279C15.7759 15.0546 13.186 12.4993 9.99935 12.4993C6.81269 12.4993 4.22283 15.0546 4.16694 18.2279"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0">
                              <rect width="20" height="20" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      )}
                    />

                    {isSidebarExpanded && <span className="ml-2 text-[14px] ">User Management</span>}
                  </div>
                  {isSidebarExpanded && (
                    <FontAwesomeIcon
                      icon={expandedSections.userManagement ? faChevronUp : faChevronDown}
                      className="w-3.5 h-3.5 ml-2 flex-shrink-0"
                    />
                  )}
                </div>
                {expandedSections.userManagement && isSidebarExpanded && (
                  <div className="mt-1 space-y-1">
                    <Link className={subItemClass("/links", "userManagement")} to="/links">
                      <span className="ml-2 ">Manage Links</span>
                    </Link>
                    <Link className={subItemClass("/jobsAndRequests", "userManagement")} to="/jobsAndRequests">
                      <span className="ml-2 ">Jobs & Requests</span>
                    </Link>
                    <Link className={subItemClass("/tutorsAndSubjects", "userManagement")} to="/tutorsAndSubjects">
                      <span className="ml-2 ">Tutors</span>
                    </Link>
                    <Link className={subItemClass("/students", "userManagement")} to="/students">
                      <span className="ml-2 ">Students</span>
                    </Link>
                    <Link className={subItemClass("/admins", "userManagement")} to="/admins">
                      <span className="ml-2 ">Admins</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="text-[14px] ">
                <div
                  className={sectionHeaderClass("forms", expandedSections.forms)}
                  onClick={() => toggleSection("forms")}
                >
                  <div className="flex items-center">

                    <SidebarIcon
                      isActive={activeSection === "forms"}
                      ActiveIcon={() => (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M4.99984 17.5C3.15889 17.5 1.6665 16.0076 1.6665 14.1667V5.83333C1.6665 3.99238 3.15889 2.5 4.99984 2.5H14.9998C16.8408 2.5 18.3332 3.99238 18.3332 5.83333V10.286C18.3332 10.5424 18.3036 10.7958 18.2464 11.0417H15.8332C13.647 11.0417 11.8748 12.8139 11.8748 15V17.4132C11.629 17.4704 11.3756 17.5 11.1191 17.5H4.99984ZM13.1248 16.8291C13.2482 16.7361 13.3657 16.6342 13.4761 16.5237L17.3569 12.643C17.4673 12.5325 17.5693 12.415 17.6622 12.2917H15.8332C14.3374 12.2917 13.1248 13.5042 13.1248 15V16.8291ZM5.20817 7.5C5.20817 7.15482 5.48799 6.875 5.83317 6.875H14.1665C14.5117 6.875 14.7915 7.15482 14.7915 7.5C14.7915 7.84518 14.5117 8.125 14.1665 8.125H5.83317C5.48799 8.125 5.20817 7.84518 5.20817 7.5ZM5.83317 11.0417C5.48799 11.0417 5.20817 11.3215 5.20817 11.6667C5.20817 12.0118 5.48799 12.2917 5.83317 12.2917H9.99984C10.345 12.2917 10.6248 12.0118 10.6248 11.6667C10.6248 11.3215 10.345 11.0417 9.99984 11.0417H5.83317Z" fill="#4071B6" />
                        </svg>

                      )}
                      InactiveIcon={() => (
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18.3327 11.6667V6.5C18.3327 4.29086 16.5418 2.5 14.3327 2.5H5.66602C3.45688 2.5 1.66602 4.29086 1.66602 6.5V13.5C1.66602 15.7091 3.45688 17.5 5.66602 17.5H12.4993M18.3327 11.6667L12.4993 17.5M18.3327 11.6667H16.4993C14.2902 11.6667 12.4993 13.4575 12.4993 15.6667V17.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5.83398 7.5H14.1673"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M5.83398 11.666L10.0007 11.666"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    />

                    {isSidebarExpanded && <span className="ml-2">Forms</span>}
                  </div>
                  {isSidebarExpanded && (
                    <FontAwesomeIcon
                      icon={expandedSections.forms ? faChevronUp : faChevronDown}
                      className="w-3.5 h-3.5 ml-2 flex-shrink-0"
                    />
                  )}
                </div>
                {expandedSections.forms && isSidebarExpanded && (
                  <div className="mt-1 space-y-1">
                    <Link className={subItemClass("/coursesForms", "forms")} to="/coursesForms">
                      <span className="ml-2">Courses</span>
                    </Link>
                    <Link className={subItemClass("/studentForms", "forms")} to="/studentForms">
                      <span className="ml-2">1 - 1 Student Inquiry</span>
                    </Link>
                    <Link className={subItemClass("/tutorForms", "forms")} to="/tutorForms">
                      <span className="ml-2">Tutor Resume</span>
                    </Link>
                    <Link className={subItemClass("/contactUsForms", "forms")} to="/contactUsForms">
                      <span className="ml-2">Contact Us</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="text-[14px] ">
                <div
                  className={sectionHeaderClass("webControl", expandedSections.webControl)}
                  onClick={() => toggleSection("webControl")}
                >
                  <div className="flex items-center">

                    <SidebarIcon
                      isActive={activeSection === "webControl"}
                      ActiveIcon={() => (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M8.19946 4.2191C7.89994 4.97401 7.65616 5.89099 7.49144 6.92045C8.28843 6.84745 9.13049 6.80859 9.99937 6.80859C10.8682 6.80859 11.7103 6.84745 12.5073 6.92045C12.3426 5.89099 12.0988 4.97401 11.7993 4.2191C11.5114 3.49351 11.1844 2.94916 10.8538 2.59665C10.5244 2.24549 10.2354 2.12754 9.99937 2.12754C9.76332 2.12754 9.47439 2.24549 9.14498 2.59665C8.8143 2.94916 8.48735 3.49351 8.19946 4.2191ZM7.02372 3.74496C6.65 4.6869 6.36323 5.82157 6.18748 7.07597C5.32231 7.2046 4.53277 7.37624 3.84799 7.58335C3.05121 7.82434 2.36029 8.12397 1.85442 8.4857C1.79051 8.5314 1.72743 8.5797 1.66605 8.63062C2.22443 5.15104 4.8753 2.37832 8.2751 1.66699C8.25823 1.68429 8.24151 1.70178 8.22493 1.71946C7.74761 2.22831 7.34692 2.93036 7.02372 3.74496ZM11.7236 1.66699C11.7405 1.68429 11.7572 1.70178 11.7738 1.71946C12.2511 2.22831 12.6518 2.93036 12.975 3.74496C13.3487 4.6869 13.6355 5.82157 13.8113 7.07597C14.6764 7.2046 15.466 7.37624 16.1507 7.58335C16.9475 7.82434 17.6384 8.12397 18.1443 8.4857C18.2082 8.5314 18.2713 8.5797 18.3327 8.63062C17.7743 5.15104 15.1234 2.37832 11.7236 1.66699ZM18.3327 11.3698C18.2713 11.4207 18.2082 11.469 18.1443 11.5147C17.6384 11.8765 16.9475 12.1761 16.1507 12.4171C15.466 12.6242 14.6764 12.7958 13.8113 12.9245C13.6355 14.1788 13.3487 15.3135 12.975 16.2555C12.6518 17.0701 12.2511 17.7721 11.7738 18.281C11.7571 18.2987 11.7403 18.3163 11.7234 18.3337C15.1234 17.6224 17.7744 14.8495 18.3327 11.3698ZM8.27535 18.3337C8.2584 18.3163 8.24159 18.2987 8.22493 18.281C7.74761 17.7721 7.34692 17.0701 7.02372 16.2555C6.65 15.3135 6.36323 14.1788 6.18748 12.9245C5.32231 12.7958 4.53277 12.6242 3.84799 12.4171C3.05121 12.1761 2.36029 11.8765 1.85442 11.5147C1.7905 11.469 1.72741 11.4207 1.66602 11.3698C2.22432 14.8495 4.87535 17.6224 8.27535 18.3337ZM4.21186 11.1943C4.74893 11.3567 5.36687 11.4975 6.04795 11.6105C6.0094 11.087 5.98939 10.5488 5.98939 10.0002C5.98939 9.45166 6.0094 8.91341 6.04795 8.38992C5.36687 8.50292 4.74893 8.64372 4.21186 8.80616C3.48093 9.02723 2.93554 9.27779 2.58702 9.52701C2.22206 9.78798 2.19046 9.95714 2.19046 10.0002C2.19046 10.0433 2.22206 10.2124 2.58702 10.4734C2.93554 10.7226 3.48093 10.9732 4.21186 11.1943ZM7.2557 10.0002C7.2557 10.614 7.28224 11.2102 7.33216 11.7819C8.16459 11.8679 9.06173 11.9152 9.99937 11.9152C10.937 11.9152 11.8341 11.8679 12.6666 11.7819C12.7165 11.2102 12.743 10.614 12.743 10.0002C12.743 9.38639 12.7165 8.79026 12.6666 8.21855C11.8341 8.13249 10.937 8.08524 9.99937 8.08524C9.06173 8.08524 8.16459 8.13249 7.33216 8.21855C7.28224 8.79025 7.2557 9.38639 7.2557 10.0002ZM8.19946 15.7813C7.89994 15.0264 7.65616 14.1094 7.49144 13.08C8.28843 13.153 9.13049 13.1918 9.99937 13.1918C10.8682 13.1918 11.7103 13.153 12.5073 13.08C12.3426 14.1094 12.0988 15.0264 11.7993 15.7813C11.5114 16.5069 11.1844 17.0513 10.8538 17.4038C10.5244 17.7549 10.2354 17.8729 9.99937 17.8729C9.76332 17.8729 9.47439 17.7549 9.14498 17.4038C8.8143 17.0513 8.48735 16.5069 8.19946 15.7813ZM15.7869 11.1943C15.2498 11.3567 14.6319 11.4975 13.9508 11.6105C13.9893 11.087 14.0093 10.5488 14.0093 10.0002C14.0093 9.45166 13.9893 8.91341 13.9508 8.38993C14.6319 8.50292 15.2498 8.64372 15.7869 8.80616C16.5178 9.02723 17.0632 9.27779 17.4117 9.52701C17.7767 9.78799 17.8083 9.95714 17.8083 10.0002C17.8083 10.0433 17.7767 10.2124 17.4117 10.4734C17.0632 10.7226 16.5178 10.9732 15.7869 11.1943Z" fill="#4071B6" />
                        </svg>

                      )}
                      InactiveIcon={() => (
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18.3327 9.99935C18.3327 14.6017 14.6017 18.3327 9.99935 18.3327M18.3327 9.99935C18.3327 5.39698 14.6017 1.66602 9.99935 1.66602M18.3327 9.99935C18.3327 8.61864 14.6017 7.49935 9.99935 7.49935C5.39698 7.49935 1.66602 8.61864 1.66602 9.99935M18.3327 9.99935C18.3327 11.3801 14.6017 12.4994 9.99935 12.4994C5.39698 12.4994 1.66602 11.3801 1.66602 9.99935M9.99935 18.3327C5.39698 18.3327 1.66602 14.6017 1.66602 9.99935M9.99935 18.3327C11.8403 18.3327 13.3327 14.6017 13.3327 9.99935C13.3327 5.39698 11.8403 1.66602 9.99935 1.66602M9.99935 18.3327C8.1584 18.3327 6.66602 14.6017 6.66602 9.99935C6.66602 5.39698 8.1584 1.66602 9.99935 1.66602M1.66602 9.99935C1.66602 5.39698 5.39698 1.66602 9.99935 1.66602"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      )}
                    />

                    {isSidebarExpanded && <span className="ml-2">Web Control</span>}
                  </div>
                  {isSidebarExpanded && (
                    <FontAwesomeIcon
                      icon={expandedSections.webControl ? faChevronUp : faChevronDown}
                      className="w-3.5 h-3.5 ml-2 flex-shrink-0"
                    />
                  )}
                </div>
                {expandedSections.webControl && isSidebarExpanded && (
                  <div className="mt-1 space-y-1">
                    <Link className={subItemClass("/subjects", "webControl")} to="/subjects">
                      <span className="ml-2">Subjects</span>
                    </Link>
                    <Link className={subItemClass("/upcomingCourses", "webControl")} to="/upcomingCourses">
                      <span className="ml-2">Upcoming Courses</span>
                    </Link>
                    <Link className={subItemClass("/blogs", "webControl")} to="/blogs">
                      <span className="ml-2">Blogs</span>
                    </Link>
                    <Link className={subItemClass("/supportBlogs", "webControl")} to="/supportBlogs">
                      <span className="ml-2">Support Blogs</span>
                    </Link>
                    <Link className={subItemClass("/seo", "webControl")} to="/seo">
                      <span className="ml-2">Seo</span>
                    </Link>
                    <Link className={subItemClass("/supportBlogsPreview", "webControl")} to="/supportBlogsPreview">
                      <span className="ml-2">Support Blogs Preview</span>
                    </Link>
                  </div>
                )}
              </div>


              <Link className={linkClass("/signup")} to="/signup">
                <div className="flex items-center text-[14px]">

                  <SidebarIcon
                    isActive={currentPath === "/signup"}
                    ActiveIcon={() => (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.001 10.834C12.7622 10.834 15.0006 11.9534 15.001 13.334C15.001 14.7147 12.7624 15.834 10.001 15.834C7.23955 15.834 5.00098 14.7147 5.00098 13.334C5.00133 11.9534 7.23977 10.834 10.001 10.834ZM5.31934 10.8506C4.34373 11.512 3.75115 12.3813 3.75098 13.334C3.75098 13.8742 3.94151 14.3885 4.28418 14.8525C2.75086 14.545 1.66816 13.7945 1.66797 12.918C1.66797 11.8546 3.26128 10.9775 5.31934 10.8506ZM14.6826 10.8506C16.7407 10.9775 18.334 11.8546 18.334 12.918C18.3338 13.7945 17.2511 14.545 15.7178 14.8525C16.0604 14.3885 16.251 13.8742 16.251 13.334C16.2508 12.3813 15.6582 11.512 14.6826 10.8506ZM5.83398 5.83398C6.00581 5.83398 6.17217 5.85992 6.32812 5.9082C6.27773 6.15334 6.25098 6.40792 6.25098 6.66797C6.25104 7.45143 6.49142 8.17873 6.90234 8.78027C6.61311 9.02198 6.2404 9.16797 5.83398 9.16797C4.91366 9.16779 4.16797 8.42134 4.16797 7.50098C4.16797 6.58061 4.91366 5.83416 5.83398 5.83398ZM10.001 4.16797C11.3817 4.16797 12.501 5.28726 12.501 6.66797C12.5008 8.04853 11.3816 9.16797 10.001 9.16797C8.62037 9.16797 7.50115 8.04853 7.50098 6.66797C7.50098 5.28726 8.62026 4.16797 10.001 4.16797ZM14.168 5.83398C15.0883 5.83417 15.834 6.58062 15.834 7.50098C15.834 8.42133 15.0883 9.16778 14.168 9.16797C13.7616 9.16797 13.3888 9.02198 13.0996 8.78027C13.5105 8.17873 13.7509 7.45143 13.751 6.66797C13.751 6.40792 13.7242 6.15334 13.6738 5.9082C13.8298 5.85992 13.9961 5.83398 14.168 5.83398Z" fill="#4071B6" />
                      </svg>

                    )}
                    InactiveIcon={() => (
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <ellipse
                          cx="10"
                          cy="13.7493"
                          rx="5"
                          ry="2.08333"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <ellipse
                          cx="10"
                          cy="6.66602"
                          rx="2.5"
                          ry="2.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5.62793 10.9219C4.67406 11.3887 3.95876 12.0045 3.59766 12.7061C3.44276 12.7511 3.29851 12.799 3.16699 12.8516C2.84255 12.9813 2.6298 13.117 2.51074 13.2295C2.45817 13.2792 2.43343 13.3138 2.42285 13.333C2.43317 13.352 2.45736 13.387 2.51074 13.4375C2.62978 13.55 2.84251 13.6856 3.16699 13.8154C3.22197 13.8374 3.27967 13.8572 3.33887 13.8779C3.3768 14.5154 3.69804 15.1115 4.2334 15.6299C3.63102 15.538 3.07882 15.3967 2.60938 15.209C2.18036 15.0374 1.78305 14.8134 1.48047 14.5273C1.21427 14.2756 0.983247 13.9354 0.929688 13.5176L0.917969 13.334L0.929688 13.1494C0.983294 12.7317 1.21432 12.3914 1.48047 12.1396C1.78299 11.8537 2.18049 11.6306 2.60938 11.459C3.42324 11.1335 4.48484 10.9428 5.62793 10.9219Z"
                          fill="currentColor"
                        />
                        <path
                          d="M14.373 10.9219C15.5163 10.9427 16.5776 11.1334 17.3916 11.459C17.8208 11.6307 18.2188 11.8535 18.5215 12.1396C18.8258 12.4274 19.083 12.8312 19.083 13.334C19.0829 13.8365 18.8256 14.2397 18.5215 14.5273C18.2188 14.8135 17.8208 15.0373 17.3916 15.209C16.9218 15.3969 16.3693 15.538 15.7666 15.6299C16.3023 15.1114 16.6232 14.5156 16.6611 13.8779C16.7206 13.8571 16.7787 13.8375 16.834 13.8154C17.1584 13.6857 17.3712 13.55 17.4902 13.4375C17.5432 13.3874 17.5667 13.3521 17.5771 13.333C17.5664 13.3137 17.5424 13.2788 17.4902 13.2295C17.3712 13.117 17.1584 12.9813 16.834 12.8516C16.7022 12.7989 16.5576 12.7511 16.4023 12.7061C16.0411 12.0046 15.3268 11.3886 14.373 10.9219Z"
                          fill="currentColor"
                        />
                        <path
                          d="M14.167 5.08203C15.5014 5.08221 16.5828 6.16459 16.583 7.49902C16.5828 8.83345 15.5014 9.91486 14.167 9.91504C13.7289 9.91498 13.3192 9.79661 12.9648 9.59277C13.3188 9.23436 13.6074 8.812 13.8135 8.34473C13.9223 8.39023 14.0417 8.415 14.167 8.41504C14.673 8.41486 15.0828 8.00503 15.083 7.49902C15.0828 6.99302 14.673 6.58221 14.167 6.58203H14.1641C14.1538 6.05978 14.0478 5.56171 13.8623 5.10352C13.9622 5.09092 14.0637 5.08204 14.167 5.08203Z"
                          fill="currentColor"
                        />
                        <path
                          d="M5.83496 5.08203C5.93755 5.08206 6.03848 5.0901 6.1377 5.10254C5.95208 5.56084 5.84623 6.05962 5.83594 6.58203H5.83496C5.32881 6.58203 4.91814 6.99291 4.91797 7.49902C4.91814 8.00513 5.32881 8.41504 5.83496 8.41504C5.95994 8.41495 6.07899 8.39007 6.1875 8.34473C6.39353 8.81198 6.68226 9.23437 7.03613 9.59277C6.68205 9.79643 6.27279 9.91492 5.83496 9.91504C4.50038 9.91504 3.41814 8.83356 3.41797 7.49902C3.41814 6.16448 4.50038 5.08203 5.83496 5.08203Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  />
                  {isSidebarExpanded && <span className="ml-2">User Sign Up</span>}
                </div>
              </Link>
            </nav>
          )}

          {userType === "teacher" && (
            <ul className="flex flex-col gap-1 p-0 m-0 list-none">

              <li>
                <Link className={linkClass("/")} to="/">
                  {isSidebarExpanded && <span className="ml-2">Overview</span>}
                </Link>
              </li>
              <li>
                <Link className={linkClass("/myStudents")} to="/myStudents">
                  {isSidebarExpanded && <span className="ml-2">My Students</span>}
                </Link>
              </li>
              <li>
                <Link className={linkClass("/jobOpenings")} to="/jobOpenings">
                  {isSidebarExpanded && <span className="ml-2">Job Openings</span>}
                </Link>
              </li>
              <li>
                <Link className={linkClass("/profileAndFinance")} to="/profileAndFinance">
                  {isSidebarExpanded && <span className="ml-2">Profile & Finance</span>}
                </Link>
              </li>
              <li>
                <Link className={linkClass("/supportAndTraining")} to="/supportAndTraining">
                  {isSidebarExpanded && <span className="ml-2">Support & Training</span>}
                </Link>
              </li>
            </ul>
          )}

          {(userType === "student" || userType === "parent") && (
            <ul className="flex flex-col gap-1 p-0 m-0 list-none">
              <li>
                <Link className={linkClass("/")} to="/">
                  {isSidebarExpanded && <span className="ml-2">Overview</span>}
                </Link>
              </li>
              <li>
                <Link className={linkClass("/mySubscriptions")} to="/mySubscriptions">
                  {isSidebarExpanded && <span className="ml-2">My Subscriptions</span>}
                </Link>
              </li>
              <li>
                <Link className={linkClass("/myCourses")} to="/myCourses">
                  {isSidebarExpanded && <span className="ml-2">Courses & Requests</span>}
                </Link>
              </li>
              <li>
                <Link className={linkClass("/profile")} to="/profile">
                  {isSidebarExpanded && <span className="ml-2">Profile and Credit</span>}
                </Link>
              </li>
              <li>
                <Link className={linkClass("/supportAndTraining")} to="/supportAndTraining">
                  {isSidebarExpanded && <span className="ml-2">Support & Training</span>}
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

export default Sidebar
