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
import CustomModal from "../../Components/CustomModal/CustomModal"
import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"
import Divider from "@mui/material/Divider"

import { db } from "../../firebase";

import toast from "react-hot-toast";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const Notifications = () => {
  const { userType, userDetails } = useContext(MyContext);

  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("Latest Notification")
    setSecondMessage("Notification")
  }, [setFirstMessage, setSecondMessage])
  useEffect(() => {



    const unsubscribe = () => { }; // Initialize unsubscribe function

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
    <TopHeadingProvider>
      <div className="p-6 min-h-screen">
        <div className="bg-white border border-[#A2A1A833] rounded-[10px] p-2 pt-3">
          {/* Top flex section (empty div in your code) */}
          <div className="flex justify-between items-center mb-4 px-2.5">
            <h1 className="text-[16px] font-semibold text-gray-900">Latest Notifications</h1>

            {/* Delete All button */}
            {notifications.length !== 0 && (
              <div className="flex justify-end items-center mb-2.5">
                <Button
                  variant="outlined"
                  color="error"
                  className="bg-transparent text-[#00ACE8] "
                  onClick={() => setShowModal(true)}
                  sx={{
                    color: "#4071B6",
                    border: "none",
                    "&:hover": { border: "none" },
                    fontSize: "16px",
                    fontWeight: 600,
                    padding: 0,
                    paddingRight: 3,
                    textTransform: "none",
                  }}
                >
                  Delete All
                </Button>
              </div>
            )}
          </div>

          {/* Notifications list */}
          <div className="px-2.5">
            {notifications.length === 0 && (
              <div className="flex-1 text-gray-400 text-2xl">
                No Notifications
              </div>
            )}
            {notificationDisplayedSessions.map((item, index) => (
              <NotificationItem
                key={item.id}
                userId={userDetails.userId}
                handleDelete={deleteItemHandler}
                item={item}
                index={index}
              />
            ))}
          </div>

          {/* Pagination */}
          {notifications.length > notificationItemsPerPage && (
            <div className="mt-6 flex items-center justify-between px-2.5">
              <div className="text-sm text-gray-600">
                Showing {notificationStartIndex + 1} to{" "}
                {Math.min(notificationEndIndex, notifications.length)} of{" "}
                {notifications.length} records
              </div>
              <Stack spacing={2}>
                <Pagination
                  count={Math.ceil(notifications?.length / notificationItemsPerPage)}
                  page={notificationCurrentPage}
                  onChange={handleNotificationChangePage}
                  color="primary"
                />
              </Stack>
            </div>
          )}

          {/* Delete confirmation modal */}
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
              Please confirm to delete all notifications.
            </h2>

            <Divider className="border-gray-200 mb-5" />

            <p className="text-lg text-center font-light text-[#16151C] mt-4 mb-12">
              Are you sure you want to delete all notifications?
            </p>

            <div className="flex gap-3 justify-end mt-7">
              <Button
                onClick={() => setShowModal(false)}
                variant="outlined"
                className="w-40 h-12 rounded-lg border border-gray-300 text-gray-900 font-semibold text-base"
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                className="w-40 h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
                onClick={() => {
                  deleteAllHandler(userDetails.userId)
                  setShowModal(false)
                }}
              >
                DELETE
              </Button>
            </div>
          </CustomModal>
        </div>
      </div>
    </TopHeadingProvider>

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
