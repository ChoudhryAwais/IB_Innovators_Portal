"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { MyContext } from "../../Context/MyContext"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "../../firebase"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBell, faArrowRightFromBracket, faChevronDown } from "@fortawesome/free-solid-svg-icons"

import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"
import Slide from "@mui/material/Slide"
import { getAuth } from "firebase/auth"
import CustomModal from "../CustomModal/CustomModal";
import Divider from "@mui/material/Divider"

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

const NavBar = () => {
  const navigtePages = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const { userType, userDetails, setIsUserLoggedIn } = useContext(MyContext)
  const [notifications, setNotifications] = useState([])
  const [isMobile, setIsMobile] = useState(false)

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
    const pageNavigate = navValue === "home" ? "/" : navValue
    navigtePages(pageNavigate)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const checkIsMobile = () => {
    setIsMobile(window.innerWidth <= 769)
  }

  useEffect(() => {
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => {
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  return (
    <>
      <div className="flex items-center gap-4">
        {/* Profile section */}
        <div
          className="flex items-center gap-3 bg-purple-100 rounded-lg px-3 py-2 cursor-pointer hover:bg-purple-200 transition-colors"
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
          <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center text-lg">🤗</div>

          {/* User info */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{userDetails?.name || "Shahrukh"}</span>
            <span className="text-xs text-gray-500">
              {userType === "admin" ? "Admin Manager" : userType === "teacher" ? "Teacher" : "Student"}
            </span>
          </div>

          {/* Dropdown arrow */}
          <FontAwesomeIcon icon={faChevronDown} className="text-gray-400 text-xs" />
        </div>

        {/* Notification bell */}
        <div
          className="relative p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
          onClick={(e) => handleChange(e, "notifications")}
        >
          <FontAwesomeIcon icon={faBell} className="text-gray-600 text-lg" />
          {notifications?.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex justify-center items-center text-xs font-medium">
              {notifications?.length}
            </div>
          )}
        </div>

        {/* Additional action button */}
        <div
          className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
          onClick={() => {
            setShowModal(true)
          }}
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-gray-600 text-lg" />
        </div>
      </div>

      {/* Logout confirmation modal */}
      <CustomModal open={showModal} onClose={() => setShowModal(false)}
        PaperProps={{
          sx: {
            height: "auto",
            overflow: "hidden",
            borderRadius: "20px",
          },
        }}
      >
        <h2 className="text-xl font-semibold text-center text-[#16151C] mb-7">
          Logout
        </h2>

        <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

        <p className="text-lg text-center font-light text-[#16151C] mt-4 mb-12">
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
