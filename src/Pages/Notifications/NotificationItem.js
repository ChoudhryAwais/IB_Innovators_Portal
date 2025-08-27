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

export const NotificationItem = ({ item, handleDelete }) => {
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
      key={item.id}
      className="shadowAndBorder"
      style={{
        marginTop: "0px",
        flex: 1,
        height: "max-content",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
        background: "rgba(255,255,255, 0.5)",
        backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
        WebkitBackdropFilter: "blur(4px)", // For Safari support,
        padding: "10px",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
      }}
    >
      <div>
        <div>{item.message}</div>
        <div
          style={{
            fontSize: "small",
            transform: "translateY(8px)",
            color: "#5d5d5d",
          }}
        >
          {item.time && formatDisplayDateTime(item.time)}
        </div>
      </div>
      <div>
        <IconButton onClick={handleDeleteItem} aria-label="delete" size="large">
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  );
};
