import React, { useRef } from "react";
import { MyContext } from "../../Context/MyContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Notifications.module.css";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Stack from "@mui/material/Stack";

import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

export const NotificationItem = ({ item, handleDelete, index }) => {
  const {
    isUserLoggedIn,
    setIsUserLoggedIn,
    setUserType,
    setUserDetails,
    userType,
    userDetails,
  } = useContext(MyContext);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  function handleDeleteItem() {
    handleDelete(item.id);
  }

  function formatDisplayDateTime(timestamp) {
    let date;
    if (timestamp instanceof Date) {
      date = timestamp; // If it's already a Date object, no need to convert
    } else if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate(); // If it's a Firebase Timestamp object, convert to Date
    } else {
      return ''; // Handle invalid or missing timestamps
    }

    const options = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true // Use 12-hour clock format
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }


  return (
    <div
      className={`min-h-[60px] sm:h-[60px] flex flex-col sm:flex-row justify-between items-start sm:items-center w-full p-3 sm:p-3 ${
        index % 2 === 0 ? "bg-[#4071B60D]" : "bg-white"
      }`}
    >
      {/* Left side: Message */}
      <div className="pl-0 sm:pl-6 text-sm sm:text-base text-gray-900 mb-2 sm:mb-0 flex-1 w-full sm:w-auto">
        {item.message}
      </div>

      {/* Right side: Date/Time + Delete (side by side) */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-3">
        <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
          {item.time && formatDisplayDateTime(item.time)}
        </span>
        <IconButton 
          onClick={handleDeleteItem} 
          aria-label="delete" 
          size="small"
          sx={{
            padding: { xs: '4px', sm: '8px' }
          }}
        >
          <svg 
            width="14" 
            height="16" 
            viewBox="0 0 16 18" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="sm:w-4 sm:h-4"
          >
            <path 
              d="M14.1032 6.88867C14.1032 6.88867 13.6507 12.5012 13.3882 14.8653C13.2632 15.9945 12.5657 16.6562 11.4232 16.677C9.24901 16.7162 7.07234 16.7187 4.89901 16.6728C3.79984 16.6503 3.11401 15.9803 2.99151 14.8712C2.72734 12.4862 2.27734 6.88867 2.27734 6.88867" 
              stroke="#A2A1A8" 
              strokeWidth="1.25" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <path 
              d="M15.2567 4.19792H1.125" 
              stroke="#A2A1A8" 
              strokeWidth="1.25" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <path 
              d="M12.5335 4.19852C11.8793 4.19852 11.316 3.73602 11.1877 3.09518L10.9852 2.08185C10.8602 1.61435 10.4368 1.29102 9.95432 1.29102H6.42682C5.94432 1.29102 5.52099 1.61435 5.39599 2.08185L5.19349 3.09518C5.06516 3.73602 4.50182 4.19852 3.84766 4.19852" 
              stroke="#A2A1A8" 
              strokeWidth="1.25" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </IconButton>
      </div>
    </div>
  )
};