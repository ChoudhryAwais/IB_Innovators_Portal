import React from "react";
import { MyContext } from "../../Context/MyContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Notifications.module.css";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListDots } from "@fortawesome/free-solid-svg-icons";
import { NotificationItem } from "./NotificationItem";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import DeleteIcon from "@mui/icons-material/Delete";
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

import toast from "react-hot-toast";
import TopHeading from "../../Components/TopHeading/TopHeading";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const Notifications = () => {
  const { userType, userDetails } = useContext(MyContext);

  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsubscribe = () => {}; // Initialize unsubscribe function

    async function fetchAdminNotifications() {
      try {
        // Query Firestore to get notifications for admin
        const notificationsRef = collection(db, "adminNotifications");
        unsubscribe = onSnapshot(notificationsRef, (querySnapshot) => {
          const notifications = [];
          querySnapshot.forEach((doc) => {
            notifications.push({ id: doc.id, ...doc.data() });
          });
          notifications.sort((a, b) => b.time - a.time);
          setNotifications(notifications);
        });
      } catch (error) {
        console.error("Failed to fetch admin notifications: " + error.message);
      }
    }

    if (userType === "teacher" || userType === "student") {
      const myNotifications = userDetails?.notifications
        ? userDetails?.notifications
        : [];
      setNotifications(myNotifications.sort((a, b) => b.time - a.time));
    } else if (userType === "admin") {
      fetchAdminNotifications();
    }

    // Cleanup function to unsubscribe from Firestore listener
    return () => {
      unsubscribe();
    };
  }, []);

  async function deleteItemHandler(notificationId) {
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification.id !== notificationId
      )
    );

    if (userType === "teacher" || userType === "student") {
      try {
        // Query Firestore to get user details based on userId
        const userListRef = collection(db, "userList");
        const q = query(userListRef, where("userId", "==", userDetails.userId));
        const userDocSnapshot = await getDocs(q);

        if (!userDocSnapshot.empty) {
          // User document found
          const userDoc = userDocSnapshot.docs[0];
          const userData = userDoc.data();
          const updatedNotifications = userData.notifications.filter(
            (notification) => notification.id !== notificationId
          );

          // Update notifications array in Firestore
          await updateDoc(doc(db, "userList", userDoc.id), {
            notifications: updatedNotifications,
          });
        } else {
          toast.error("User document not found");
        }
      } catch (error) {
        toast.error("Failed to delete notification");
      }
    } else if (userType === "admin") {
      // Query Firestore to delete the notification from 'adminNotifications' collection
      await deleteDoc(doc(db, "adminNotifications", notificationId));
    }
  }

  async function deleteAllHandler(userId) {
    setNotifications([]);

    if (userType === "teacher" || userType === "student") {
      try {
        // Query Firestore to get user details based on userId
        const userListRef = collection(db, "userList");
        const q = query(userListRef, where("userId", "==", userId));
        const userDocSnapshot = await getDocs(q);

        if (!userDocSnapshot.empty) {
          // User document found
          const userDoc = userDocSnapshot.docs[0];
          await updateDoc(doc(db, "userList", userDoc.id), {
            notifications: [],
          }); // Update notifications array to empty in Firestore
          toast.success("All notifications deleted");
          setShowModal(false);
        } else {
          toast.error("User document not found");
        }
      } catch (error) {
        toast.error("Failed to delete notifications");
      }
    } else if (userType === "admin") {
      // Query Firestore to delete all notifications from 'adminNotifications' collection
      const notificationsRef = collection(db, "adminNotifications");
      const querySnapshot = await getDocs(notificationsRef);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      setShowModal(false);
      toast.success("All notifications deleted");
    }
  }

  const notificationItemsPerPage = 10; // Update the number of items per page
  const [notificationCurrentPage, setNotificationCurrentPage] = useState(1);

  const handleNotificationChangePage = (event, newPage) => {
    setNotificationCurrentPage(newPage);
  };

  const notificationStartIndex =
    (notificationCurrentPage - 1) * notificationItemsPerPage;
  const notificationEndIndex =
    notificationStartIndex + notificationItemsPerPage;
  const notificationDisplayedSessions = notifications?.slice(
    notificationStartIndex,
    notificationEndIndex
  );

  return (
    <div className={styles.dataSummary}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "5px",
        }}
      >
        <TopHeading>Notifications</TopHeading>
      </div>

      {notifications.length !== 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: "10px",
            marginRight: "10px",
          }}
        >
            <Button
              variant="contained"
              startIcon={<DeleteIcon />}
              color="error"
              style={{
                // borderColor: "rgba(139, 0, 0, 0.8)",
                // background: "rgba(139, 0, 0, 0.8)",
                color: "white",
              }}
              onClick={() => {
                setShowModal(true);
              }}
            >
              DELETE ALL
            </Button>
        </div>
      )}

      <div style={{ paddingLeft: "10px", paddingRight: "10px" }}>
        {notifications.length !== 0 ? (
          <></>
        ) : (
          <div
            style={{
              flex: 1,
              color: "#aeaeae",
              fontSize: "1.5rem",
            }}
          >
            No Notifications
          </div>
        )}
        {notificationDisplayedSessions.map((item) => (
          <NotificationItem
            userId={userDetails.userId}
            handleDelete={deleteItemHandler}
            item={item}
          />
        ))}
      </div>

      {notifications.length > notificationItemsPerPage && (
        <div
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            marginTop: "20px",
          }}
        >
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(
                notifications?.length / notificationItemsPerPage
              )}
              page={notificationCurrentPage}
              onChange={handleNotificationChangePage}
            />
          </Stack>
        </div>
      )}

      <Dialog
        open={showModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          setShowModal(false);
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>
          {"Please confirm to delete all notifications."}
        </DialogTitle>

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
              deleteAllHandler(userDetails.userId);
            }}
          >
            DELETE
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const data = [
  {
    id: 12094812094,
    message:
      "Hello, How are you? Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibusodio a ligula cursus, in ultricies justo pharetra. Suspendissepotenti. Nulla facilisi. Proin quis risus vel odio ullamcorpervestibulum.",
    link: "http://localhost:3000/",
    time: new Date(),
  },
];
