import React, { useState, useEffect } from "react";
import "./styles.css";
import Logo from "../../images/IBI/IBILogo.png";
import LogoMobile from "../../images/IBI/final logo-16.png";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { MyContext } from "../../Context/MyContext";
import NavDropdown from "react-bootstrap/NavDropdown";
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

import { db } from "../../firebase";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faDoorOpen,
  faUserCircle,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { getAuth } from "firebase/auth";
import { IconButton } from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const NavBar = () => {
  const navigtePages = useNavigate();
  const [currentTab, setCurrentTab] = useState("/");
  const [showModal, setShowModal] = useState(false);

  const { userType, userDetails, setIsUserLoggedIn } = useContext(MyContext);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let unsubscribe;

    async function fetchAdminNotifications() {
      try {
        const notificationsRef = collection(db, "adminNotifications");
        unsubscribe = onSnapshot(notificationsRef, (querySnapshot) => {
          const notifications = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          notifications.sort((a, b) => b.time - a.time);
          setNotifications(notifications);
        });
      } catch (error) {
        console.error("Failed to fetch admin notifications: " + error.message);
      }
    }

    if (userType === "teacher" || userType === "student") {
      if (userDetails.userId) {
        const userListRef = collection(db, "userList");
        const q = query(userListRef, where("userId", "==", userDetails.userId));

        unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            querySnapshot.forEach((doc) => {
              const userDetails = doc.data();
              setNotifications(userDetails.notifications);
            });
          },
          (error) => {
            console.error("Error fetching user details: ", error);
          }
        );
      }
    } else if (userType === "admin") {
      fetchAdminNotifications();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userType, userDetails]);

  function logOutHandler() {
    setIsUserLoggedIn(false);
    const auth = getAuth();
    auth.signOut();
    navigtePages("/login", { replace: true });
  }

  // handle change pages
  const handleChange = (e, navValue) => {
    e.preventDefault();
    const pageNavigate = navValue === "home" ? "/" : navValue;
    navigtePages(pageNavigate);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [isMobile, setIsMobile] = useState(false);

  const checkIsMobile = () => {
    setIsMobile(window.innerWidth <= 769); // You can adjust the width threshold as needed
  };

  useEffect(() => {
    checkIsMobile(); // Initial check
    window.addEventListener("resize", checkIsMobile); // Add event listener

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return (
    <>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "space-between",
          top: 0,
          width: "100%",
          height: "80px",
          padding: "15px",
          pointerEvents: "none",
          position: "fixed",
          // background: 'rgba(238,238,238, 0.3)',
          zIndex: 999,
          margin: "0px auto",
          maxWidth: "1800px",
        }}
      >
        <div
          style={{
            flex: 1,
            marginLeft: isMobile ? "6px" : "20px",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={isMobile ? LogoMobile : Logo}
            className="LogoImg"
            alt="SomeImage"
            style={{
              objectFit: "contain",
              width: isMobile ? "40px" : "160px",
              marginBottom: "10px",
            }}
          />
        </div>

        <div
          style={{
            justifyContent: "flex-end",
            flexDirection: "row",
          }}
        >
          <div
            style={{
              alignItems: "center",
              gap: "5px",
              flexDirection: "row",
              display: "flex",
              justifyContent: "flex-end",
              height: "100%",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              background: "rgba(0,0,0,0.1)",
              width: "max-content",
              padding: "10px 5px",
              borderRadius: "30px",
            }}
          >
            <div
              className="navBarItem"
              style={{
                position: "relative",
                backgroundColor: "white",
                borderRadius: "50%",
                height: "43px",
                width: "43px",
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "30px",
                cursor: "pointer",
                zIndex: 999999,
                pointerEvents: "auto",
                userSelect: "none",
              }}
              onClick={(e) => handleChange(e, "notifications")}
            >
              <FontAwesomeIcon icon={faBell} />

              {/* Display the notification count if greater than 0 */}
              {notifications?.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    backgroundColor: "red",
                    color: "white",
                    borderRadius: "50%",
                    fontSize: "10px",
                    minWidth: "20px",
                    textAlign: "center",
                    width: "27px",
                    height: "27px",
                    fontSize: "15px",
                    fontWeight: "bold",
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {notifications?.length}
                </div>
              )}
            </div>

            <>
              <div
                className="navBarItem"
                style={{
                  backgroundColor: "white",
                  borderRadius: "50%",
                  height: "43px",
                  width: "43px",
                  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "30px",
                  cursor: "pointer",
                  zIndex: 999999,
                  pointerEvents: "auto",
                }}
                onClick={() => {
                  setShowModal(true);
                  document
                    .getElementById("navbarSupportedContent")
                    .classList.remove("show");
                }}
              >
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
              </div>

              <div
                className="navBarItem"
                style={{
                  backgroundColor: "white",
                  borderRadius: "50%",
                  height: "43px",
                  width: "43px",
                  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  transition: "all 0.5s ease-in-out",
                  zIndex: 999999,
                  pointerEvents: "auto",
                  overflow: "hidden",
                }}
                onClick={(e) => {
                  if (userType === "teacher") {
                    handleChange(e, "profileAndFinance");
                  } else if (userType === "admin") {
                    handleChange(e, "/");
                  } else {
                    handleChange(e, "profile");
                  }
                }}
              >
                <FontAwesomeIcon
                  style={{ width: "105%", height: "105%" }}
                  icon={faUserCircle}
                />
              </div>
            </>
          </div>
        </div>
      </div>

      <Dialog
        open={showModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          setShowModal(false);
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Are you sure you want to Log Out?"}</DialogTitle>

        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setShowModal(false);
            }}
          >
            CANCEL
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() => {
              logOutHandler();
              setShowModal(false);
            }}
          >
            LOG OUT
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NavBar;
