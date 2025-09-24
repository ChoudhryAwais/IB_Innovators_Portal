"use client"

import { useState, useEffect, useContext } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import logo from "../assets/logo.png";
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(windowWidth < 769 ? true : false)
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
    const handleResize = () => setWindowWidth(window.innerWidth)
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

  // Dashboard link style (no bg on active, just blue text+icon)
  const linkClass = (path, isDashboard = false) =>
    `flex items-center justify-between w-[244px] p-2 rounded-md text-sm transition-colors cursor-pointer ${
      currentPath === path
        ? isDashboard
          ? "text-blue-600" // only text + icon blue
          : "bg-blue-50 text-blue-600"
        : "text-gray-700"
    }`

  const sectionHeaderClass = (section, isExpanded) =>
    `flex items-center justify-between w-[244px] p-2 rounded-md text-sm transition-colors cursor-pointer ${
      activeSection === section && isExpanded ? "text-blue-600" : "text-gray-700"
    }`

  const subItemClass = (path, parent) =>
    `flex items-center w-[244px] p-2 pl-8 rounded-md text-sm transition-colors cursor-pointer ${
      currentPath === path
        ? "bg-blue-50 text-blue-600 ml-2"
        : activeSection === parent
        ? "text-gray-700 ml-2"
        : "text-gray-600 ml-2"
    }`

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 bg-[#fafafa] text-gray-700 z-50 transition-all ${
        isSidebarExpanded ? "w-[300px] max-w-[300px]" : "w-max"
      }`}
    >
      <div className="h-full w-full overflow-y-auto px-4">
        <div className="mb-6">
          <div className="flex items-center">
            {(windowWidth > 768 || !isSidebarExpanded) && (
              <img src={logo} alt="IB INNOVATORS" className="h-12 w-auto object-contain ml-2" />
            )}
          </div>
        </div>

        {/* Admin Sidebar */}
        {userType === "admin" && (
          <nav className="space-y-1">
            {windowWidth <= 768 && (
              <button onClick={toggleSidebar} className="p-2">
                <FontAwesomeIcon icon={faBars} />
              </button>
            )}

            {/* Dashboard */}
            <Link className={linkClass("/", true)} to="/">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
                {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">Dashboard</span>}
              </div>
            </Link>

            {/* User Management Section */}
            <div>
              <div
                className={sectionHeaderClass("userManagement", expandedSections.userManagement)}
                onClick={() => toggleSection("userManagement")}
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />
                  {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">User Management</span>}
                </div>
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <FontAwesomeIcon
                    icon={expandedSections.userManagement ? faChevronUp : faChevronDown}
                    className="w-3.5 h-3.5 ml-2"
                  />
                )}
              </div>
              {expandedSections.userManagement && (windowWidth > 768 || !isSidebarExpanded) && (
                <div className="mt-1 space-y-1">
                  <Link className={subItemClass("/links", "userManagement")} to="/links">
                    <FontAwesomeIcon icon={faLink} className="w-3.5 h-3.5" />
                    <span className="ml-2">Manage Links</span>
                  </Link>
                  <Link className={subItemClass("/jobsAndRequests", "userManagement")} to="/jobsAndRequests">
                    <FontAwesomeIcon icon={faBriefcase} className="w-3.5 h-3.5" />
                    <span className="ml-2">Jobs & Requests</span>
                  </Link>
                  <Link className={subItemClass("/tutorsAndSubjects", "userManagement")} to="/tutorsAndSubjects">
                    <FontAwesomeIcon icon={faChalkboardTeacher} className="w-3.5 h-3.5" />
                    <span className="ml-2">Tutors</span>
                  </Link>
                  <Link className={subItemClass("/myStudents", "userManagement")} to="/myStudents">
                    <FontAwesomeIcon icon={faGraduationCap} className="w-3.5 h-3.5" />
                    <span className="ml-2">Students</span>
                  </Link>
                  <Link className={subItemClass("/admins", "userManagement")} to="/admins">
                    <FontAwesomeIcon icon={faUserShield} className="w-3.5 h-3.5" />
                    <span className="ml-2">Admins</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Forms Section */}
            <div>
              <div
                className={sectionHeaderClass("forms", expandedSections.forms)}
                onClick={() => toggleSection("forms")}
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faWpforms} className="w-4 h-4" />
                  {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">Forms</span>}
                </div>
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <FontAwesomeIcon icon={expandedSections.forms ? faChevronUp : faChevronDown} className="w-3.5 h-3.5 ml-2" />
                )}
              </div>
              {expandedSections.forms && (windowWidth > 768 || !isSidebarExpanded) && (
                <div className="mt-1 space-y-1">
                  <Link className={subItemClass("/coursesForms", "forms")} to="/coursesForms">
                    <FontAwesomeIcon icon={faBook} className="w-3.5 h-3.5" />
                    <span className="ml-2">Courses</span>
                  </Link>
                  <Link className={subItemClass("/studentForms", "forms")} to="/studentForms">
                    <FontAwesomeIcon icon={faFileAlt} className="w-3.5 h-3.5" />
                    <span className="ml-2">1 - 1 Student Inquiry</span>
                  </Link>
                  <Link className={subItemClass("/tutorForms", "forms")} to="/tutorForms">
                    <FontAwesomeIcon icon={faFileAlt} className="w-3.5 h-3.5" />
                    <span className="ml-2">Tutor Resume</span>
                  </Link>
                  <Link className={subItemClass("/contactUsForms", "forms")} to="/contactUsForms">
                    <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5" />
                    <span className="ml-2">Contact Us</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Web Control Section */}
            <div>
              <div
                className={sectionHeaderClass("webControl", expandedSections.webControl)}
                onClick={() => toggleSection("webControl")}
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faGlobe} className="w-4 h-4" />
                  {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">Web Control</span>}
                </div>
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <FontAwesomeIcon
                    icon={expandedSections.webControl ? faChevronUp : faChevronDown}
                    className="w-3.5 h-3.5 ml-2"
                  />
                )}
              </div>
              {expandedSections.webControl && (windowWidth > 768 || !isSidebarExpanded) && (
                <div className="mt-1 space-y-1">
                  <Link className={subItemClass("/subjects", "webControl")} to="/subjects">
                    <FontAwesomeIcon icon={faBookOpen} className="w-3.5 h-3.5" />
                    <span className="ml-2">Subjects</span>
                  </Link>
                  <Link className={subItemClass("/upcomingCourses", "webControl")} to="/upcomingCourses">
                    <FontAwesomeIcon icon={faBook} className="w-3.5 h-3.5" />
                    <span className="ml-2">Upcoming Courses</span>
                  </Link>
                  <Link className={subItemClass("/blogs", "webControl")} to="/blogs">
                    <FontAwesomeIcon icon={faBlog} className="w-3.5 h-3.5" />
                    <span className="ml-2">Blogs</span>
                  </Link>
                  <Link className={subItemClass("/supportBlogs", "webControl")} to="/supportBlogs">
                    <FontAwesomeIcon icon={faLifeRing} className="w-3.5 h-3.5" />
                    <span className="ml-2">Support Blogs</span>
                  </Link>
                  <Link className={subItemClass("/seo", "webControl")} to="/seo">
                    <FontAwesomeIcon icon={faSearch} className="w-3.5 h-3.5" />
                    <span className="ml-2">Seo</span>
                  </Link>
                  <Link className={subItemClass("/supportBlogsPreview", "webControl")} to="/supportBlogsPreview">
                    <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                    <span className="ml-2">Support Blogs Preview</span>
                  </Link>
                </div>
              )}
            </div>

            {/* User Sign Up */}
            <Link className={linkClass("/signup")} to="/signup">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4" />
                {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">User Sign Up</span>}
              </div>
            </Link>
          </nav>
        )}

        {/* Teacher Sidebar */}
        {userType === "teacher" && (
          <ul className="flex flex-col gap-1 p-0 m-0 list-none">
            {windowWidth <= 768 && (
              <li>
                <Link to="#" onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faBars} />
                </Link>
              </li>
            )}
            <li>
              <Link className={linkClass("/")} to="/">
                <FontAwesomeIcon icon={faTachometerAlt} className="w-4 h-4" />
                {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">Overview</span>}
              </Link>
            </li>
            <li>
              <Link className={linkClass("/myStudents")} to="/myStudents">
                <FontAwesomeIcon icon={faGraduationCap} className="w-4 h-4" />
                {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">My Students</span>}
              </Link>
            </li>
            <li>
              <Link className={linkClass("/jobOpenings")} to="/jobOpenings">
                <FontAwesomeIcon icon={faBriefcase} className="w-4 h-4" />
                {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">Job Openings</span>}
              </Link>
            </li>
            <li>
              <Link className={linkClass("/profileAndFinance")} to="/profileAndFinance">
                <FontAwesomeIcon icon={faAddressCard} className="w-4 h-4" />
                {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">Profile & Finance</span>}
              </Link>
            </li>
            <li>
              <Link className={linkClass("/supportAndTraining")} to="/supportAndTraining">
                <FontAwesomeIcon icon={faChalkboardUser} className="w-4 h-4" />
                {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">Support & Training</span>}
              </Link>
            </li>
          </ul>
        )}

        {/* Student/Parent Sidebar */}
        {(userType === "student" || userType === "parent") && (
          <ul className="flex flex-col gap-1 p-0 m-0 list-none">
            {windowWidth <= 768 && (
              <li>
                <Link to="#" onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faBars} />
                </Link>
              </li>
            )}
            <li>
              <Link className={linkClass("/")} to="/">
                <FontAwesomeIcon icon={faTachometerAlt} className="w-4 h-4" />
                {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">Overview</span>}
              </Link>
            </li>
            <li>
              <Link className={linkClass("/mySubscriptions")} to="/mySubscriptions">
                <FontAwesomeIcon icon={faFileInvoice} className="w-4 h-4" />
                {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">My Subscriptions</span>}
              </Link>
            </li>
            <li>
              <Link className={linkClass("/myCourses")} to="/myCourses">
                <FontAwesomeIcon icon={faBook} className="w-4 h-4" />
                {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">Courses & Requests</span>}
              </Link>
            </li>
            <li>
              <Link className={linkClass("/profile")} to="/profile">
                <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">Profile and Credit</span>}
              </Link>
            </li>
            <li>
              <Link className={linkClass("/supportAndTraining")} to="/supportAndTraining">
                <FontAwesomeIcon icon={faChalkboardUser} className="w-4 h-4" />
                {(windowWidth > 768 || !isSidebarExpanded) && <span className="ml-2">Support & Training</span>}
              </Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  )
}

export default Sidebar
