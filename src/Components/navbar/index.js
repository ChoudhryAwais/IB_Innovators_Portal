"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useContext } from "react"
import { MyContext } from "../../Context/MyContext"
import { db } from "../../firebase"


import { faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBell, faArrowRightFromBracket, faChevronDown, faBars, faTimes } from "@fortawesome/free-solid-svg-icons"

import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"
import Slide from "@mui/material/Slide"
import { getAuth } from "firebase/auth"
import CustomModal from "../CustomModal/CustomModal";
import Divider from "@mui/material/Divider"
import {
  collection,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const NavBar = () => {
  const navigtePages = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const { userType, userDetails, setIsUserLoggedIn, setUserDetails } = useContext(MyContext)
  const [notifications, setNotifications] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  const [isNavBarOpen, setIsNavBarOpen] = useState(false)
  const unreadNotifications = notifications?.filter(n => !n.read) || []
  const [hasUnread, setHasUnread] = useState(false);
  const [isOnNotificationsPage, setIsOnNotificationsPage] = useState(false);
  const location = useLocation();



  useEffect(() => {
    if (!isOnNotificationsPage) {
      setHasUnread(unreadNotifications.length > 0);
    }
  }, [unreadNotifications, isOnNotificationsPage]);

  useEffect(() => {
    let unsubscribe
    async function fetchAdminNotifications() {
      try {
        const notificationsRef = collection(db, "adminNotifications")
        unsubscribe = onSnapshot(notificationsRef, (querySnapshot) => {
          const notifications = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          notifications.sort((a, b) => b.time - a.time)
          setNotifications(notifications)
        })
      } catch (error) {
        console.error("Failed to fetch admin notifications: " + error.message)
      }
    }

    if (userType === "teacher" || userType === "student") {
      if (userDetails.userId) {
        const userListRef = collection(db, "userList")
        const q = query(userListRef, where("userId", "==", userDetails.userId))

        unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            querySnapshot.forEach((doc) => {
              const userDetails = doc.data()
              setNotifications(userDetails.notifications)
            })
          },
          (error) => {
            console.error("Error fetching user details: ", error)
          },
        )
      }
    } else if (userType === "admin") {
      if (userDetails.userId) {
        // Fetch admin details from userList (same as student/teacher)
        const userListRef = collection(db, "userList")
        const q = query(userListRef, where("userId", "==", userDetails.userId))

        unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            querySnapshot.forEach((doc) => {
              const adminDetails = doc.data();
            })
          }
        )
      }
      fetchAdminNotifications()
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [userType, userDetails])

  function logOutHandler() {
    setIsUserLoggedIn(false)
    const auth = getAuth()
    auth.signOut()
    navigtePages("/login", { replace: true })
  }

  const handleChange = (e, navValue) => {
    e.preventDefault()
    if (navValue === "notifications") {
      setIsOnNotificationsPage(true);
    } else {
      setIsOnNotificationsPage(false);
    }
    const pageNavigate = navValue === "home" ? "/" : navValue
    navigtePages(pageNavigate)
    window.scrollTo({ top: 0, behavior: "smooth" })
    setHasUnread(false);
    // Close mobile navbar when navigating
    if (isMobile) {
      setIsNavBarOpen(false)
    }
  }

  const handleNotificationClick = (e) => {
    e.preventDefault();

    setHasUnread(false);
    // Go to notifications page
    handleChange(e, "notifications");

    //Clear red dot immediately when bell is clicked
  };

  const checkIsMobile = () => {
    const mobile = window.innerWidth <= 769
    setIsMobile(mobile)
    // Close navbar when switching from mobile to desktop
    if (!mobile && isNavBarOpen) {
      setIsNavBarOpen(false)
    }
  }

  useEffect(() => {
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => {
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  const toggleNavBar = () => {
    setIsNavBarOpen(!isNavBarOpen)
  }

  // Close navbar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isNavBarOpen) {
        const navbar = document.querySelector('.navbar-content')
        const toggleBtn = document.querySelector('.navbar-toggle')
        if (navbar && !navbar.contains(event.target) && !toggleBtn?.contains(event.target)) {
          setIsNavBarOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile, isNavBarOpen])

  const navBarContent = (
    <div className="flex items-center gap-4 navbar-content">
      {/* Profile section */}
      <div
        className="flex items-center gap-3 border border-[#A2A1A833] rounded-lg px-3 py-2 cursor-pointer transition-colors"
        onClick={(e) => {
          if (userType === "teacher") {
            handleChange(e, "profileAndFinance")
          } else if (userType === "admin") {
            handleChange(e, "/")
          } else {
            handleChange(e, "profile")
          }
        }}
      >
        {/* Avatar with emoji */}
        {!userDetails?.image ? (
          <div className="w-8 h-8 sm:w-7 sm:h-7 bg-[#4071B6] rounded-lg flex items-center justify-center text-lg">
            <FontAwesomeIcon icon={faUser} className="text-[#ffff] text-sm sm:text-base" />
          </div>
        ) : (
          <img
            src={userDetails.image}
            alt={userDetails.userName || "User"}
            className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg object-cover"
          />
        )}

        {/* User info */}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {userDetails?.userName || "N/A"}
          </span>

          {/* Hide role text on sm screens, show from md+ */}
          <span className="hidden md:block text-xs text-gray-500">
            {userType === "admin"
              ? "Admin Manager"
              : userType === "teacher"
                ? "Teacher"
                : "Student"}
          </span>
        </div>

        {/* Dropdown arrow */}
        <FontAwesomeIcon
          icon={faChevronDown}
          className="text-gray-400 text-xs hidden sm:block"
        />
      </div>

      {/* Notification bell */}
      <div
        className="relative h-[50px] w-[50px] sm:h-[40px] sm:w-[40px] bg-[#A2A1A81A] rounded-lg cursor-pointer transition-colors flex items-center justify-center"
        onClick={handleNotificationClick}
      >
        {/* Bell SVG */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="sm:w-5 sm:h-5"
        >
          <path
            d="M5.67964 8.79403C6.05382 5.49085 8.77095 3 12 3C15.2291 3 17.9462 5.49085 18.3204 8.79403L18.6652 11.8385C18.7509 12.595 19.0575 13.3069 19.5445 13.88C20.5779 15.0964 19.7392 17 18.1699 17H5.83014C4.26081 17 3.42209 15.0964 4.45549 13.88C4.94246 13.3069 5.24906 12.595 5.33476 11.8385L5.67964 8.79403Z"
            stroke="#16151C"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M15 19C14.5633 20.1652 13.385 21 12 21C10.615 21 9.43668 20.1652 9 19"
            stroke="#16151C"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Notification badge */}
        {hasUnread > 0 && (
          <div className="absolute -top-1 -right-1 bg-[#E94234] text-white rounded-full w-5 h-5 flex justify-center items-center text-xs font-medium">
            {unreadNotifications.length}
          </div>
        )}
      </div>

      {/* Additional action button */}
      <div
        className="h-[50px] w-[50px] sm:h-[40px] sm:w-[40px] bg-[#A2A1A81A] rounded-lg cursor-pointer transition-colors flex items-center justify-center"
        onClick={() => setShowModal(true)}
      >
        {/* Logout SVG */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 21 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="sm:w-5 sm:h-5"
        >
          <path
            d="M13.0155 5.38948V4.45648C13.0155 2.42148 11.3655 0.771484 9.33048 0.771484H4.45548C2.42148 0.771484 0.771484 2.42148 0.771484 4.45648V15.5865C0.771484 17.6215 2.42148 19.2715 4.45548 19.2715H9.34048C11.3695 19.2715 13.0155 17.6265 13.0155 15.5975V14.6545"
            stroke="#16151C"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.8086 10.0215H7.76758"
            stroke="#16151C"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.8809 7.10547L19.8089 10.0205L16.8809 12.9365"
            stroke="#16151C"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Toggle button for mobile - inside the navbar content */}
      {isMobile && (
        <button
          onClick={toggleNavBar}
          className="h-[40px] w-[40px] bg-[#A2A1A81A] rounded-lg cursor-pointer transition-colors flex items-center justify-center navbar-toggle"
        >
          <FontAwesomeIcon
            icon={isNavBarOpen ? faTimes : faBars}
            className="w-5 h-5"
          />
        </button>
      )}
    </div>
  )
  useEffect(() => {
    // Check if user is currently viewing the notifications page
    setIsOnNotificationsPage(location.pathname.includes("notifications"));
  }, [location]);

  return (
    <>
      {/* Mobile toggle button - outside navbar content */}
      {isMobile && (
        <button
          onClick={toggleNavBar}
          className="fixed top-4 right-4 z-50 h-[50px] w-[50px] bg-[#A2A1A81A] rounded-lg cursor-pointer transition-colors flex items-center justify-center navbar-toggle"
        >
          <FontAwesomeIcon
            icon={isNavBarOpen ? faTimes : faBars}
            className="w-5 h-5"
          />
        </button>
      )}

      {/* Backdrop for mobile */}
      {isMobile && isNavBarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={() => setIsNavBarOpen(false)}
        />
      )}

      {/* Navbar content */}
      <div className={`
        ${isMobile
          ? `fixed p-1 top-0 right-0 h-auto bg-white z-50 transition-transform duration-300 ease-in-out ${isNavBarOpen ? 'translate-x-0' : 'translate-x-full'
          }`
          : 'relative'
        }
      `}>
        {navBarContent}
      </div>

      {/* Logout confirmation modal */}
      <CustomModal
        open={showModal}
        onClose={() => setShowModal(false)}
        PaperProps={{
          sx: {
            height: "auto",
            overflow: "hidden",
            borderRadius: "20px",
            width: "383px",
          },
        }}
      >
        <h2 className="text-[20px] font-semibold text-center text-[#16151C] mb-7">
          Logout
        </h2>

        <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

        <p className="text-[18px] text-center font-light text-[#16151C] mt-4 mb-12">
          Are you sure you want to Logout?
        </p>

        <div className="flex gap-3 justify-end mt-7">
          <Button
            onClick={() => setShowModal(false)}
            variant="outlined"
            sx={{
              width: 166,
              height: 50,
              borderRadius: "10px",
              borderColor: "#A2A1A833",
              fontSize: "16px",
              fontWeight: 600,
              color: "#16151C",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            sx={{
              width: 166,
              height: 50,
              borderRadius: "10px",
              backgroundColor: "#4071B6",
              fontSize: "20px",
              fontWeight: 600,
              color: "#FFFFFF",
            }}
            onClick={() => {
              logOutHandler()
              setShowModal(false)
            }}
          >
            Logout
          </Button>
        </div>
      </CustomModal>
    </>
  )
}

export default NavBar