import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTachometerAlt,
  faUserPlus,
  faGraduationCap,
  faChalkboardTeacher,
  faFileInvoice,
  faLink,
  faBook,
  faBriefcase,
  faAddressCard,
  faChalkboardUser,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "../Context/MyContext";

const Sidebar = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(
    windowWidth < 769 ? true : false
  );

  const [currentPath, setCurrentPath] = useState("");

useEffect(() => {
  setCurrentPath(location.pathname)
}, [location.pathname])


  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { userType } = useContext(MyContext);

  function toggleSidebar() {
    setIsSidebarExpanded(!isSidebarExpanded);
  }

  const sidebarClass = isSidebarExpanded ? "sidebar expanded" : "sidebar";

  return (
    <div className={sidebarClass}>
      <div className="content">
        {userType === "admin" && (
          <ul>
            {windowWidth <= 768 && (
              <li>
                <Link to="#" onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faBars} />
                </Link>
              </li>
            )}
            <li>
              <Link className={currentPath === "/" ? "selected" : ""} to="/">
                <FontAwesomeIcon icon={faTachometerAlt} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Dashboard</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={currentPath === "/upcomingCourses" ? "selected" : ""}
                to="/upcomingCourses"
              >
                <FontAwesomeIcon icon={faBook} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Upcoming Courses</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={currentPath === "/jobsAndRequests" ? "selected" : ""}
                to="/jobsAndRequests"
              >
                <FontAwesomeIcon icon={faGraduationCap} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Jobs & Requests</span>
                )}
              </Link>
            </li>
            <li>
              <Link
                className={
                  currentPath === "/tutorsAndSubjects" ? "selected" : ""
                }
                to="/tutorsAndSubjects"
              >
                <FontAwesomeIcon icon={faGraduationCap} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Tutors & Subjects</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={currentPath === "/links" ? "selected" : ""}
                to="/links"
              >
                <FontAwesomeIcon icon={faLink} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Manage Links</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={currentPath === "/studentForms" ? "selected" : ""}
                to="/studentForms"
              >
                <FontAwesomeIcon icon={faGraduationCap} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Student Forms</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={currentPath === "/tutorForms" ? "selected" : ""}
                to="/tutorForms"
              >
                <FontAwesomeIcon icon={faChalkboardTeacher} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Tutor Forms</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={currentPath === "/contactUsForms" ? "selected" : ""}
                to="/contactUsForms"
              >
                <FontAwesomeIcon icon={faGraduationCap} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Contact Us Forms</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={
                  currentPath === "/requestCourseForm" ? "selected" : ""
                }
                to="/requestCourseForm"
              >
                <FontAwesomeIcon icon={faGraduationCap} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Request Course F</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={
                  currentPath === "/revisionCoursesForm" ? "selected" : ""
                }
                to="/revisionCoursesForm"
              >
                <FontAwesomeIcon icon={faGraduationCap} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Revision Course F</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={
                  currentPath === "/upcomingCoursesForm" ? "selected" : ""
                }
                to="/upcomingCoursesForm"
              >
                <FontAwesomeIcon icon={faGraduationCap} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Upcoming Course F</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={currentPath === "/createBlogs" ? "selected" : ""}
                to="/createBlogs"
              >
                <FontAwesomeIcon icon={faBook} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Blogs</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={currentPath === "/supportBlogs" ? "selected" : ""}
                to="/supportBlogs"
              >
                <FontAwesomeIcon icon={faBook} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Support Blogs</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={currentPath === "/seo" ? "selected" : ""}
                to="/seo"
              >
                <FontAwesomeIcon icon={faBook} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>SEO</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={currentPath === "/signup" ? "selected" : ""}
                to="/signup"
              >
                <FontAwesomeIcon icon={faUserPlus} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Admin SignUp</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={
                  currentPath === "/supportAndTraining" ? "selected" : ""
                }
                to="/supportAndTraining"
              >
                <FontAwesomeIcon icon={faChalkboardUser} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Support & Training</span>
                )}
              </Link>
            </li>
          </ul>
        )}

        {userType === "teacher" && (
          <ul>
            {windowWidth <= 768 && (
              <li>
                <Link to="#" onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faBars} />
                </Link>
              </li>
            )}
            <li>
              <Link className={currentPath === "/" ? "selected" : ""} to="/">
                <FontAwesomeIcon icon={faTachometerAlt} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Overview</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={currentPath === "/myStudents" ? "selected" : ""}
                to="/myStudents"
              >
                <FontAwesomeIcon icon={faGraduationCap} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>My Students</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={currentPath === "/jobOpenings" ? "selected" : ""}
                to="/jobOpenings"
              >
                <FontAwesomeIcon icon={faBriefcase} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Job Openings</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={
                  currentPath === "/profileAndFinance" ? "selected" : ""
                }
                to="/profileAndFinance"
              >
                <FontAwesomeIcon icon={faAddressCard} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Profile & Finance</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={
                  currentPath === "/supportAndTraining" ? "selected" : ""
                }
                to="/supportAndTraining"
              >
                <FontAwesomeIcon icon={faChalkboardUser} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Support & Training</span>
                )}
              </Link>
            </li>
            {/* _________________________________________________________________ */}
            {/* <li>
            <Link to="/activeCourses">
              <FontAwesomeIcon icon={faGraduationCap} />
              <span style={{ marginLeft: "5px" }}>Active Courses</span>
            </Link>
          </li>
          <li>
            <Link to='#' onClick={() => setShowLogoutModal(true)}>
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span style={{ marginLeft: "5px" }}>Logout</span>
            </Link>
          </li> */}
          </ul>
        )}

        {(userType === "student" || userType === "parent") && (
          <ul>
            {windowWidth <= 768 && (
              <li>
                <Link to="#" onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faBars} />
                </Link>
              </li>
            )}
            <li>
              <Link className={currentPath === "/" ? "selected" : ""} to="/">
                <FontAwesomeIcon icon={faTachometerAlt} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Overview</span>
                )}
              </Link>
            </li>
            <li>
              <Link
                className={currentPath === "/mySubscriptions" ? "selected" : ""}
                to="/mySubscriptions"
              >
                <FontAwesomeIcon icon={faFileInvoice} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>My Subscriptions</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={currentPath === "/myCourses" ? "selected" : ""}
                to="/myCourses"
              >
                <FontAwesomeIcon icon={faBook} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Courses & Requests</span>
                )}
              </Link>
            </li>

            <li>
              <Link
                className={currentPath === "/profile" ? "selected" : ""}
                to="/profile"
              >
                <FontAwesomeIcon icon={faUser} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Profile and Credit</span>
                )}
              </Link>
            </li>
            <li>
              <Link
                className={
                  currentPath === "/supportAndTraining" ? "selected" : ""
                }
                to="/supportAndTraining"
              >
                <FontAwesomeIcon icon={faChalkboardUser} />
                {(windowWidth > 768 || !isSidebarExpanded) && (
                  <span style={{ marginLeft: "5px" }}>Support & Training</span>
                )}
              </Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
