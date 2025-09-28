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

    if (location.pathname === "/") {
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

  const linkClass = (path, isDashboard = false) =>
    `flex items-center justify-between w-full p-2 rounded-md text-sm transition-colors cursor-pointer ${currentPath === path ? (isDashboard ? "text-blue-600" : "bg-blue-50 text-blue-600") : "text-gray-700"
    }`

  const sectionHeaderClass = (section, isExpanded) =>
    `flex items-center justify-between w-full p-2 rounded-md text-sm transition-colors cursor-pointer ${activeSection === section && isExpanded ? "text-blue-600" : "text-gray-700"
    }`

  const subItemClass = (path, parent) =>
    `flex items-center w-full p-2 pl-8 rounded-md text-sm transition-colors cursor-pointer ${currentPath === path
      ? "bg-blue-50 text-blue-600 ml-2"
      : activeSection === parent
        ? "text-gray-700 ml-2"
        : "text-gray-600 ml-2"
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

                  {isSidebarExpanded && <span className="ml-2">Dashboard</span>}
                </div>
              </Link>

              <div className="text-[14px] font-light">
                <div
                  className={sectionHeaderClass("userManagement", expandedSections.userManagement)}
                  onClick={() => toggleSection("userManagement")}
                >
                  <div className="flex items-center">
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

                    {isSidebarExpanded && <span className="ml-2 text-[14px] font-light">User Management</span>}
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

              <div className="text-[14px] font-light">
                <div
                  className={sectionHeaderClass("forms", expandedSections.forms)}
                  onClick={() => toggleSection("forms")}
                >
                  <div className="flex items-center">
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

              <div className="text-[14px] font-light">
                <div
                  className={sectionHeaderClass("webControl", expandedSections.webControl)}
                  onClick={() => toggleSection("webControl")}
                >
                  <div className="flex items-center">
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
                <div className="flex items-center text-[14px] font-light">
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
