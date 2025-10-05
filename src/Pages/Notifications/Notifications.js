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

import PaginationItem from "@mui/material/PaginationItem"; // <-- add this


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

  async function markAllAsRead() {
    if (userType === "admin") {
      const notificationsRef = collection(db, "adminNotifications");
      const querySnapshot = await getDocs(notificationsRef);

      querySnapshot.forEach(async (docSnap) => {
        if (docSnap.data().read === false) {
          await updateDoc(docSnap.ref, { read: true });
        }
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } else if (userType === "teacher" || userType === "student") {
      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userDetails.userId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        const updatedNotifications = userData.notifications.map((n) => ({
          ...n,
          read: true,
        }));

        await updateDoc(doc(db, "userList", userDoc.id), {
          notifications: updatedNotifications,
        });

        setNotifications(updatedNotifications);
      }
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

  const getVisiblePages = (currentPage, totalPages, maxVisible = 4) => {
    let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxVisible + 1, 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  useEffect(() => {
    return () => {
      markAllAsRead();
    };
  }, []);


  return (
    <TopHeadingProvider>
      <div className="p-4 sm:p-6 min-h-screen">
        <div className="bg-white border border-[#A2A1A833] rounded-[10px] p-3 sm:p-2 sm:pt-3">
          {/* Top flex section (empty div in your code) */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 px-2 sm:px-2.5">
            <h1 className="text-[14px] sm:text-[16px] font-semibold text-gray-900 text-center sm:text-left">
              Latest Notifications
            </h1>

            {/* Delete All button */}
            {notifications.length !== 0 && (
              <div className="flex justify-center sm:justify-end items-center">
                <Button
                  variant="outlined"
                  color="error"
                  className="bg-transparent text-[#00ACE8] w-full sm:w-auto"
                  onClick={() => setShowModal(true)}
                  sx={{
                    color: "#4071B6",
                    border: "none",
                    "&:hover": { border: "none" },
                    fontSize: { xs: "14px", sm: "16px" },
                    fontWeight: 600,
                    padding: { xs: "6px 12px", sm: 0 },
                    paddingRight: { sm: 3 },
                    textTransform: "none",
                  }}
                >
                  Delete All
                </Button>
              </div>
            )}
          </div>

          {/* Notifications list */}
          <div className="px-1 sm:px-2.5">
            {notifications.length === 0 && (
              <div className="flex-1 text-gray-400 text-lg sm:text-2xl text-center py-8">
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
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 px-2 sm:px-2.5">
              <div className="text-[12px] sm:text-[14px] font-light text-[#A2A1A8] text-center sm:text-left">
                Showing {notificationStartIndex + 1} to{" "}
                {Math.min(notificationEndIndex, notifications.length)} of{" "}
                {notifications.length} records
              </div>
              <Stack direction="row" spacing={1} alignItems="center">
                {/* Previous button */}
                <Button
                  disabled={notificationCurrentPage === 1}
                  onClick={() => setNotificationCurrentPage(notificationCurrentPage - 1)}
                  sx={{
                    minWidth: { xs: '28px', sm: '32px' },
                    padding: { xs: '2px', sm: '4px' },
                    height: { xs: '32px', sm: '36px' }
                  }}
                >
                  {/* Prev SVG */}
                  <svg
                    width="6"
                    height="12"
                    viewBox="0 0 6 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5.46849 11.5856C5.79194 11.3269 5.84438 10.8549 5.58562 10.5315L1.96044 5.99997L5.58562 1.46849C5.84438 1.14505 5.79194 0.673077 5.46849 0.41432C5.14505 0.155562 4.67308 0.208004 4.41432 0.53145L0.414321 5.53145C0.19519 5.80536 0.19519 6.19458 0.414321 6.46849L4.41432 11.4685C4.67308 11.7919 5.14505 11.8444 5.46849 11.5856Z"
                      fill="#16151C"
                    />
                  </svg>
                </Button>

                {/* Page numbers */}
                {getVisiblePages(
                  notificationCurrentPage,
                  Math.ceil(notifications.length / notificationItemsPerPage),
                  4
                ).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setNotificationCurrentPage(page)}
                    sx={{
                      width: page === notificationCurrentPage ? { xs: 30, sm: 35 } : { xs: 28, sm: 32 },
                      height: { xs: 32, sm: 36 },
                      borderRadius: page === notificationCurrentPage ? '8px' : '50px',
                      padding: { xs: '4px 8px', sm: '7px 12px' },
                      gap: '10px',
                      borderWidth: page === notificationCurrentPage ? 1 : 0,
                      border: page === notificationCurrentPage ? '1px solid #4071B6' : 'none',
                      background: page === notificationCurrentPage ? '#FFFFFF' : '#FFFFFF',
                      opacity: 1,
                      minWidth: 'unset',
                      color: page === notificationCurrentPage ? '#4071B6' : '#16151C',
                      fontWeight: page === notificationCurrentPage ? 600 : 300,
                      fontSize: { xs: '12px', sm: '14px' },
                    }}
                  >
                    {page}
                  </Button>

                ))}

                {/* Next button */}
                <Button
                  disabled={
                    notificationCurrentPage ===
                    Math.ceil(notifications.length / notificationItemsPerPage)
                  }
                  onClick={() => setNotificationCurrentPage(notificationCurrentPage + 1)}
                  sx={{
                    minWidth: { xs: '28px', sm: '32px' },
                    padding: { xs: '2px', sm: '4px' },
                    height: { xs: '32px', sm: '36px' }
                  }}
                >
                  {/* Next SVG */}
                  <svg
                    width="6"
                    height="12"
                    viewBox="0 0 6 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.531506 11.5856C0.20806 11.3269 0.155619 10.8549 0.414376 10.5315L4.03956 5.99997L0.414376 1.46849C0.155618 1.14505 0.208059 0.673077 0.531506 0.41432C0.854952 0.155562 1.32692 0.208004 1.58568 0.53145L5.58568 5.53145C5.80481 5.80536 5.80481 6.19458 5.58568 6.46849L1.58568 11.4685C1.32692 11.7919 0.854953 11.8444 0.531506 11.5856Z"
                      fill="#16151C"
                    />
                  </svg>
                </Button>
              </Stack>

            </div>
          )}

          {/* Delete confirmation modal */}
          <CustomModal
            open={showModal}
            onClose={() => setShowModal(false)}
            PaperProps={{
              sx: {
                height: "auto",
                overflow: "hidden",
                borderRadius: "20px",
                width: { xs: "90%", sm: "auto" },
                maxWidth: { xs: "400px", sm: "500px" },
                margin: { xs: "20px", sm: "auto" }
              },
            }}
          >
            <h2 className="text-lg sm:text-xl font-semibold text-center text-[#16151C] mb-4 sm:mb-7 px-4 sm:px-0">
              Please confirm to delete all notifications.
            </h2>

            <Divider className="border-gray-200 mb-4 sm:mb-5" />

            <p className="text-base sm:text-lg text-center font-light text-[#16151C] mt-2 sm:mt-4 mb-6 sm:mb-12 px-4 sm:px-0">
              Are you sure you want to delete all notifications?
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-end mt-4 sm:mt-7 px-4 sm:px-0">
              <Button
                onClick={() => setShowModal(false)}
                variant="outlined"
                className="w-full sm:w-40 h-10 sm:h-12 rounded-lg border border-gray-300 text-gray-900 font-semibold text-sm sm:text-base"
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                className="w-full sm:w-40 h-10 sm:h-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base"
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