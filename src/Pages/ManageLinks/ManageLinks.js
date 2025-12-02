"use client"

import React, { useState, useEffect, useContext } from "react"
import {
  collection,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  addDoc,
  query,
  onSnapshot,
  getDoc,
  orderBy,
  setDoc,
} from "firebase/firestore"
import { db } from "../../firebase"
import { MyContext } from "../../Context/MyContext"
import { useNavigate } from "react-router-dom"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faBook, faSuitcase, faRepeat } from "@fortawesome/free-solid-svg-icons"

import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import ViewInvoices from "./ViewInvoices"

import { MenuItem, Select, Button, TextField, Modal, InputAdornment } from "@mui/material"
import { useTopHeading } from "../../Components/Layout"
import { TopHeadingProvider } from "../../Components/Layout"

import toast from "react-hot-toast"
import CustomModal from "../../Components/CustomModal/CustomModal";
import manage_links from "../../assets/icons/manage_links.png";
import Divider from "@mui/material/Divider"

export default function ManageLinks() {
  const [links, setLinks] = useState([])
  const { calculateHoursLeft, convertToGBP, addNotification } = useContext(MyContext)
  const [searchedLinks, setSearchedLinks] = useState([])
  const [selectedLink, setSelectedLink] = useState(null)
  const [invoicePrice, setInvoicePrice] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [link, setLink] = useState({})
  const [newHourlyRate, setNewHourlyRate] = useState(0)
  const [showInvoicesModal, setShowInvoicesModal] = useState(false)
  const [showHourlyRateModal, setShowHourlyRateModal] = useState(false)
  const [deactivatedStudents, setDeactivatedStudents] = useState([])
  const [active, setActive] = useState("Active Links")
  const [currentData, setCurrentData] = useState([])
  const [currentSearched, setCurrentSearched] = useState([])
  const [removeBalance, setRemoveBalance] = useState(false)
  const [creditsForSelectedStudent, setCreditsForSelectedStudent] = useState(0)
  const [fetchingCredits, setFetchingCredits] = useState(false)
  const [loading, setLoading] = useState(false)



  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("Manage Links")
    setSecondMessage("Show all managed links")
  }, [setFirstMessage, setSecondMessage])

  useEffect(() => {
    if (link?.studentId) {
      setFetchingCredits(true);
      let unsubscribe; // Declare the unsubscribe variable outside the try block

      try {
        const accountRef = doc(db, "userList", link?.studentId);

        unsubscribe = onSnapshot(accountRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const currentCredits = docSnapshot.data().credits;
            setCreditsForSelectedStudent(parseFloat(currentCredits) || 0);
            setFetchingCredits(false);
          } else {
            console.error(
              `Document not found for studentId: ${link?.studentId}`
            );
            setFetchingCredits(false);
          }
        });
      } catch (error) {
        console.error(
          `Error fetching credits for studentId: ${link?.studentId}`,
          error
        );
        setFetchingCredits(false);
        setCreditsForSelectedStudent(0);
      }

      // Cleanup function to unsubscribe when the component unmounts or when selectedStudent changes
      return () => unsubscribe && unsubscribe();
    } else {
      setCreditsForSelectedStudent(0);
    }
  }, [link]);

  const handleActiveChange = (a) => {
    setActive(a.target.value);
  };

  useEffect(() => {
    if (active === "Active Links") {
      setCurrentData(links);
      setCurrentSearched(links);
    } else {
      setCurrentData(deactivatedStudents);
      setCurrentSearched(deactivatedStudents);
    }
  }, [active]);

  useEffect(() => {
    if (currentData.length > 0) {
      setLink(currentData[0]);
    } else {
      setLink({});
    }
  }, [currentData]);

  function handleSearch(e) {
    const searchedData = e.target.value.toLowerCase();

    if (searchedData.length >= 2) {
      setCurrentSearched(
        currentData.filter((item) => {
          return (
            item?.id?.toLowerCase().includes(searchedData) ||
            item?.studentName?.toLowerCase().includes(searchedData) ||
            item?.studentEmail?.toLowerCase().includes(searchedData) ||
            item?.studentId?.toLowerCase().includes(searchedData) ||
            item?.subject?.toLowerCase().includes(searchedData) ||
            item?.teacherId?.toLowerCase().includes(searchedData) ||
            item?.teacherName?.toLowerCase().includes(searchedData)
          );
        })
      );
    } else {
      setCurrentSearched(currentData);
    }
  }

  const handleViewInvoicesClick = (link) => {
    navigate(`/links/invoices/${link.id}`, { state: { link } });
  };

  const { isUserLoggedIn, userType } = useContext(MyContext);
  const navigate = useNavigate();

  const fetchData = () => {
    const linkedRef = collection(db, "Linked");

    const orderedQuery = query(linkedRef, orderBy("startDate", "desc"));

    // Start listening for document changes
    const unsubscribe = onSnapshot(orderedQuery, (querySnapshot) => {
      const fetchedLinks = [];
      const deactivatedStudents = [];
      const activeLinks = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        fetchedLinks.push({ ...data });

        if (data?.studentDeactivated === true) {
          deactivatedStudents.push({ ...data });
        } else {
          activeLinks.push({ ...data });
        }
      });

      setCurrentData(activeLinks);
      setDeactivatedStudents(deactivatedStudents);
      setCurrentSearched(activeLinks);
      setLinks(activeLinks);
    });

    // Return the unsubscribe function to clean up the listener when the component is unmounted
    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchData();

    return () => {
      // Clean up the listener when the component is unmounted
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);


  const handleDeactivate = async (linkId) => {
    try {
      setLoading(true);
      const docRef = doc(collection(db, "Linked"), linkId);

      await updateDoc(docRef, {
        studentDeactivated: true,
      });

      toast.success("Student deactivated successfully");
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Error deactivating student:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (linkId, linkData) => {
    try {
      setLoading(true);
      const linkedRef = collection(db, "Linked");
      const docRef = doc(linkedRef, linkId);

      // Move the link to DeletedLink collection
      const deletedLinkRef = collection(db, "DeletedLink");
      const newDocRef = await addDoc(deletedLinkRef, {
        ...linkData,
        originalId: linkId, // Just in case you want to keep track of the original ID
      });

      await deleteDoc(docRef);

      setLinks(links.filter((link) => link.id !== linkId));

      setShowDeleteModal(false);
      alert(`Document with ID: ${linkId} has been moved to DeletedLink`);
    } catch (error) {
      toast.error("Error deleting document:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoiceClick = (link) => {
    setSelectedLink(link);
    setShowModal(true);
  };

  const handleDeleteInvoiceClick = (link) => {
    setSelectedLink(link);
    setShowDeleteModal(true);
  };

  const handleDeleteModalSubmit = async () => {
    if (selectedLink) {
      await handleDelete(selectedLink.id, selectedLink);
    }
    setShowModal(false);
  };

  const handleModalSubmit = async () => {
    if (selectedLink && Number(invoicePrice)) {
      await addCredits(selectedLink, invoicePrice);
    }
    setShowModal(false);
    setInvoicePrice("");
  };

  const addCredits = async (link, amount) => {
    const accountRef = doc(db, "Linked", link?.id);

    try {
      setLoading(true);
      const docSnapshot = await getDoc(accountRef);
      let currentCredits = 0;

      if (docSnapshot.exists()) {
        currentCredits = docSnapshot.data().credits || 0;
        console.log("Current credits:", currentCredits);
      }

      const addedAmount = parseFloat(amount || 0);
      console.log("Added amount:", addedAmount);
      const newCredits = currentCredits + addedAmount;
      console.log("New credits:", newCredits);

      // Create balance history record
      const balanceHistory = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        amount: addedAmount,
        createdAt: new Date(),
      };  
      console.log('Balance history right now',balanceHistory)
      // Save history if positive
      if (addedAmount > 0) {
        const userRef = doc(collection(db, "userList"), link?.studentId);
        await updateDoc(userRef, {
          balanceHistory: arrayUnion(balanceHistory),
        });
      }

      // Update or set credits
      if (docSnapshot.exists()) {
        await updateDoc(accountRef, { credits: newCredits });
      } else {
        await setDoc(accountRef, { credits: newCredits });
      }

      addNotification(
        `Admin added ${amount} credits to your account.`,
        link?.id
      );
      toast.success("Credits added successfully");
    } catch (e) {
      console.error("Error adding credits: ", e);
      toast.error("Error occurred while adding credits");
    } finally {
      setLoading(false);
    }
  };

  const removeCredits = async (link, amount) => {
    const accountRef = doc(db, "Linked", link?.id);

    try {
      setLoading(true);
      const docSnapshot = await getDoc(accountRef);
      let currentCredits = 0;

      if (docSnapshot.exists()) {
        currentCredits = docSnapshot.data().credits || 0;
      }

      const deductedAmount = parseFloat(amount || 0);
      const newCredits = Math.max(currentCredits - deductedAmount, 0); // Prevent negative
       console.log('Deducted Amount:', -deductedAmount);
      // Create balance history record
      const balanceHistory = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        amount: -deductedAmount, // Negative for removal
        createdAt: new Date(),
        
      };

      // Save history
      if (deductedAmount > 0) {
        const userRef = doc(collection(db, "userList"), link?.studentId);
        await updateDoc(userRef, {
          balanceHistory: arrayUnion(balanceHistory),
        });
      }

      // Update or set credits
      if (docSnapshot.exists()) {
        await updateDoc(accountRef, { credits: newCredits });
      } else {
        await setDoc(accountRef, { credits: newCredits });
      }

      addNotification(
        `Admin removed ${amount} credits from your account.`,
        link?.id
      );
      toast.success("Credits removed successfully");
    } catch (e) {
      console.error("Error removing credits: ", e);
      toast.error("Error occurred while removing credits");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBalanceModalSubmit = async () => {
    if (selectedLink && Number(invoicePrice)) {
      // await removeBalanceFromLink(selectedLink, invoicePrice);
      await removeCredits(selectedLink, invoicePrice);
    }
    setRemoveBalance(false);
    setInvoicePrice("");
  };

  const removeBalanceFromLink = async (link, price) => {
    const accountRef = doc(db, "userList", link?.studentId);
    const docSnapshot = await getDoc(accountRef);

    const currentCredits = docSnapshot.data().credits;
    if (parseInt(currentCredits) < parseInt(price)) {
      toast.error("Credits cannot be less than 0");
    } else {
      // Fetch the current document
      try {
        setLoading(true);
        if (docSnapshot.exists()) {
          // Subtract a certain value from the current credits
          const updatedCredits = parseFloat(currentCredits) - parseFloat(price);

          // Update the document with the new credits value
          await updateDoc(accountRef, { credits: updatedCredits });
        } else {
          console.error("Document not found");
        }
      } catch (e) {
        toast.error("Error Occured");
      } finally {
        setLoading(false);
      }
    }
  };

  const hourlyRateUpdate = async (link, price) => {
    const docRef = doc(collection(db, "Linked"), link.id);

    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const docData = docSnapshot.data();

      await updateDoc(docRef, {
        price: parseFloat(newHourlyRate),
      });

      setNewHourlyRate(0);
      setShowHourlyRateModal(false);

      alert(
        `Hourly Rate Updated successfully for document with ID: ${link.id}`
      );
    } else {
      console.error("Document not found");
    }
  };

  const [showReactivateModal, setShowReactivateModal] = useState(false);

  const reactivateStudent = async (link) => {
    const docRef = doc(collection(db, "Linked"), link.id);

    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const docData = docSnapshot.data();

      await updateDoc(docRef, {
        studentDeactivated: false,
        reactivateRequest: false,
        reactivatingReason: "",
      });

      alert(`Student Reactivated`);
    } else {
      console.error("Student not found");
    }
  };

  // PAST LESSONS PAGINATION
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = currentSearched?.slice(startIndex, endIndex);

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

  const visiblePages = getVisiblePages(currentPage, Math.ceil(currentSearched.length / itemsPerPage));

  return (
    <TopHeadingProvider firstMessage="Manage Links" secondMessage="Show all managed links">
      <div className="min-h-screen p-4 sm:p-6">
        <div className="bg-white border border-[#A2A1A833] rounded-[10px] p-4 sm:p-7">
          {/* Search and Button Container */}
          <div className="flex flex-col gap-4 sm:gap-y-4 md:flex-row md:items-stretch md:space-x-4 mb-6">
            {/* Search Input */}
            <div className="flex items-center border border-[#A2A1A81A] rounded-[10px] px-3 py-2 flex-1 h-[50px] min-w-0">
              <svg
                className="w-[21.5px] h-[21.5px] flex-shrink-0 text-gray-500 mr-2"
                viewBox="0 0 22 22"
                fill="#16151C"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.75 10.5C1.75 15.3325 5.66751 19.25 10.5 19.25C15.3325 19.25 19.25 15.3325 19.25 10.5C19.25 5.66751 15.3325 1.75 10.5 1.75C5.66751 1.75 1.75 5.66751 1.75 10.5ZM10.5 20.75C4.83908 20.75 0.25 16.1609 0.25 10.5C0.25 4.83908 4.83908 0.25 10.5 0.25C16.1609 0.25 20.75 4.83908 20.75 10.5C20.75 13.0605 19.8111 15.4017 18.2589 17.1982L21.5303 20.4697C21.8232 20.7626 21.8232 21.2374 21.5303 21.5303C21.2374 21.8232 20.7626 21.8232 20.4697 21.5303L17.1982 18.2589C15.4017 19.8111 13.0605 20.75 10.5 20.75Z"
                />
              </svg>
              <input
                onChange={handleSearch}
                placeholder="Search"
                className="flex-1 bg-transparent border-none outline-none text-sm min-w-0"
              />
            </div>

            {/* Toggle Button */}
            <div className="w-full sm:w-48">
              <Button
                variant="outlined"
                fullWidth
                onClick={() =>
                  setActive(active === "Active Links" ? "Deactivated Links" : "Active Links")
                }
                sx={{
                  fontWeight: 600,
                  color: "#4071B6",
                  backgroundColor: "#4071B60D",
                  border: "1px solid #4071B6",
                  height: "50px",
                  borderRadius: "10px",
                  padding: 0,
                  textTransform: "none",
                  "&:hover": {
                    color: "#4071B6",
                    backgroundColor: "#4071B60D",
                    border: "1px solid #4071B6",
                  },
                }}
              >
                <span className="flex items-center justify-center gap-2 text-sm sm:text-base">
                  {active === "Active Links" ? "Active Links" : "Deactivated Links"}
                  <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.81934 11.9997V8.76865C4.81934 7.66408 5.71477 6.76865 6.81934 6.76865H18.7689L15.2815 3.28125" stroke="#4071B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.7686 12.0003V15.2313C18.7686 16.3359 17.8731 17.2314 16.7686 17.2314H4.81896L8.30636 20.7188" stroke="#4071B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column - Links List */}
            <div>
              {displayedSessions.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 ${link?.id === item?.id
                    ? "bg-[#4071B60D] border-1 border-[#4071B6]"
                    : "bg-[#A2A1A80D]"
                    }`}
                >
                  <div className="flex items-center mb-3">
                    <div className="h-[40px] w-[40px] sm:h-[45px] sm:w-[45px] bg-[#A2A1A80D] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 6H18" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M6 10H18" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M6 14H18" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M6 18H12" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="font-semibold text-[#16151C] text-[14px] sm:text-[16px] ml-3 truncate">
                      {item?.subject}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
                    <div className="flex flex-col text-sm text-[#16151C] space-y-1 flex-1">
                      <div className="flex">
                        <span className="font-light text-[12px] sm:text-[14px] w-20 sm:w-28">Subscription:</span>
                        <span className="font-medium text-[12px] sm:text-[14px] truncate">#{item?.id}</span>
                      </div>
                      <div className="flex">
                        <span className="font-light text-[12px] sm:text-[14px] w-20 sm:w-28">Student:</span>
                        <span className="font-medium text-[12px] sm:text-[14px] truncate">{item?.studentName}</span>
                      </div>
                      <div className="flex">
                        <span className="font-light text-[12px] sm:text-[14px] w-20 sm:w-28">Tutor:</span>
                        <span className="font-medium text-[12px] sm:text-[14px] truncate">{item?.teacherName}</span>
                      </div>
                    </div>

                    {link?.id !== item?.id && (
                      <Button
                        sx={{
                          fontSize: "12px",
                          width: "100px",
                          sm: { width: "100px" },
                          height: "40px",
                          borderRadius: "8px",
                          padding: 0,
                          fontWeight: "600",
                          color: "#4071B6",
                          backgroundColor: "#4071B60D",
                          border: "1px solid #4071B6",
                          textTransform: "none",
                          "&:hover": {
                            color: "#4071B6",
                            backgroundColor: "#4071B60D",
                            border: "1px solid #4071B6",
                          },
                        }}
                        variant="outlined"
                        onClick={() => setLink(item)}
                        className="sm:self-end"
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {currentSearched.length === 0 && (
                <div className="flex-1 text-center text-gray-400 text-lg sm:text-2xl py-8">
                  No Students
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div>
              {Object.values(link).length === 0 ? (
                <div className="text-center py-12 sm:py-20 text-gray-400">
                  <div className="text-lg sm:text-2xl font-light">No Details Available</div>
                  <div className="text-xs sm:text-sm mt-2">Select a link to show details</div>
                </div>
              ) : (
                <>
                  <div className="bg-[#A2A1A80D] rounded-lg px-4 sm:px-6 py-4 h-auto sm:h-[518px]">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                      {/* Left section: icon + subject */}
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="h-[40px] w-[40px] sm:h-[45px] sm:w-[45px] bg-[#A2A1A80D] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            width="20"
                            height="20"
                            className="sm:w-6 sm:h-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M8 6V5C8 3.34315 9.34315 2 11 2H13C14.6569 2 16 3.34315 16 5V6M2 10.3475C2 10.3475 5.11804 12.4244 9.97767 12.9109M22 10.3475C22 10.3475 18.882 12.4244 14.0223 12.9109M6 22H18C20.2091 22 22 20.2091 22 18V10C22 7.79086 20.2091 6 18 6H6C3.79086 6 2 7.79086 2 10V18C2 20.2091 3.79086 22 6 22Z"
                              stroke="#16151C"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M14 12.1602V13.1602C14 13.1702 14 13.1702 14 13.1802C14 14.2702 13.99 15.1602 12 15.1602C10.02 15.1602 10 14.2802 10 13.1902V12.1602C10 11.1602 10 11.1602 11 11.1602H13C14 11.1602 14 11.1602 14 12.1602Z"
                              stroke="#16151C"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        {/*  Text now wraps properly */}
                        <span className="font-semibold text-[#16151C] text-[14px] sm:text-[16px] whitespace-normal break-words leading-snug">
                          {link?.subject}
                        </span>
                      </div>

                      {/* Right section: fixed-width button or icon */}
                      <div className="flex-shrink-0 flex items-center justify-end">
                        {!link?.studentDeactivated ? (
                          <Button
                            sx={{
                              fontSize: "12px",
                              width: "100px", //  stays fixed
                              height: "32px",
                              borderRadius: "4px",
                              padding: "10px",
                              fontWeight: "600",
                              color: "#A81E1E",
                              backgroundColor: "#A81E1E0D",
                              border: "1px solid #A81E1E",
                              minWidth: "unset",
                              textTransform: "none",
                              boxSizing: "border-box",
                              "&:hover": {
                                color: "#A81E1E",
                                backgroundColor: "#A81E1E0D",
                                border: "1px solid #A81E1E",
                              },
                            }}
                            variant="outlined"
                            onClick={() => {
                              setSelectedLink(link);
                              setShowDeactivateModal(true);
                            }}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <div
                            onClick={() => {
                              setSelectedLink(link);
                              setShowDeleteModal(true);
                            }}
                            className="flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-[6px] cursor-pointer transition-colors duration-200 hover:bg-[#F3F4F6]"
                          >
                            <svg
                              width="18"
                              height="20"
                              className="sm:w-5 sm:h-5"
                              viewBox="0 0 20 22"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3 7V17C3 19.2091 4.79086 21 7 21H13C15.2091 21 17 19.2091 17 17V7M12 10V16M8 10L8 16M14 4L12.5937 1.8906C12.2228 1.3342 11.5983 1 10.9296 1H9.07037C8.40166 1 7.7772 1.3342 7.40627 1.8906L6 4M14 4H6M14 4H19M6 4H1"
                                stroke="#A2A1A8"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>


                    {/* Details Content */}
                    <div className="space-y-3 sm:space-y-1 text-sm text-gray-700">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-light text-[12px] sm:text-[14px] w-full sm:w-40 mb-1 sm:mb-0">Subscription:</span>
                        <span className="text-[#16151C] font-medium text-[12px] sm:text-[14px]">#{link?.id}</span>
                      </div>

                      <div className="h-3 sm:h-5" />

                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-light text-[12px] sm:text-[14px] w-full sm:w-40 mb-1 sm:mb-0">Student:</span>
                        <span className="text-[#16151C] font-medium text-[12px] sm:text-[14px] truncate">{link?.studentName}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-light text-[12px] sm:text-[14px] w-full sm:w-40 mb-1 sm:mb-0">Email:</span>
                        <span className="text-[#16151C] font-medium text-[12px] sm:text-[14px] truncate">{link?.studentEmail}</span>
                      </div>

                      <div className="h-3 sm:h-5" />

                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-light text-[12px] sm:text-[14px] w-full sm:w-40 mb-1 sm:mb-0">Tutor:</span>
                        <span className="text-[#16151C] font-medium text-[12px] sm:text-[14px] truncate">{link?.teacherName}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-light text-[12px] sm:text-[14px] w-full sm:w-40 mb-1 sm:mb-0">Email:</span>
                        <span className="text-[#16151C] font-medium text-[12px] sm:text-[14px] truncate">{link?.teacherEmail || "N/A"}</span>
                      </div>

                      <div className="h-3 sm:h-5" />

                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-light text-[12px] sm:text-[14px] w-full sm:w-40 mb-1 sm:mb-0">Start Date:</span>
                        <span className="text-[#16151C] font-medium text-[12px] sm:text-[14px]">
                          {link?.startDate && new Date(link?.startDate.toDate()).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-light text-[12px] sm:text-[14px] w-full sm:w-40 mb-1 sm:mb-0">Credits:</span>
                        <span className="text-[#16151C] font-medium text-[12px] sm:text-[14px]">
                          {fetchingCredits
                            ? "Fetching..."
                            : link?.credits || 0
                          }
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-light text-[12px] sm:text-[14px] w-full sm:w-40 mb-1 sm:mb-0">Hourly Rate (USD):</span>
                        <span className="text-[#16151C] font-medium text-[12px] sm:text-[14px]">${link?.price}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-light text-[12px] sm:text-[14px] w-full sm:w-40 mb-1 sm:mb-0">Tutor Hourly Rate (USD):</span>
                        <span className="text-[#16151C] font-medium text-[12px] sm:text-[14px]">${link?.tutorHourlyRate}</span>
                      </div>

                      <div className="h-3 sm:h-5" />

                      {/* <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="font-light text-[12px] sm:text-[14px] w-full sm:w-40 mb-1 sm:mb-0">Balance (GBP):</span>
                        <span className="text-[#16151C] font-medium text-[12px] sm:text-[14px]">
                          {fetchingCredits ? "Fetching..." : `£ ${creditsForSelectedStudent?.toFixed(2)}`}
                        </span>
                      </div> */}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-6">
                      <Button
                        sx={{
                          color: '#F49342',
                          backgroundColor: '#F493420D',
                          border: '1px solid #F49342',
                          fontSize: '12px',
                          fontWeight: '600',
                          padding: 0,
                          textTransform: "none",
                          width: '100%',
                          height: '40px',
                          '&:hover': {
                            color: '#F49342',
                            backgroundColor: '#F493420D',
                            border: '1px solid #F49342',
                          },
                        }}
                        variant="outlined"
                        onClick={() => {
                          setSelectedLink(link);
                          setRemoveBalance(true);
                        }}
                        className="rounded-[8px]"
                      >
                        Remove Credits
                      </Button>

                      {link?.studentDeactivated ? (
                        <Button
                          variant="outlined"
                          color="success"
                          sx={{
                            color: '#3FC28A',
                            backgroundColor: '#3FC28A0D',
                            border: '1px solid #3FC28A',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: "none",
                            width: '100%',
                            height: '40px',
                            '&:hover': {
                              color: '#3FC28A',
                              backgroundColor: '#3FC28A0D',
                              border: '1px solid #3FC28A',
                            },
                          }}
                          onClick={() => {
                            setSelectedLink(link);
                            setShowReactivateModal(true);
                          }}
                          className="rounded-[8px]"
                        >
                          Reactivate
                        </Button>
                      ) : (
                        <Button
                          sx={{
                            color: '#3FC28A',
                            backgroundColor: '#3FC28A0D',
                            border: '1px solid #3FC28A',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: "none",
                            padding: 0,
                            width: '100%',
                            height: '40px',
                            '&:hover': {
                              color: '#3FC28A',
                              backgroundColor: '#3FC28A0D',
                              border: '1px solid #3FC28A',
                            },
                          }}
                          variant="outlined"
                          onClick={() => handleGenerateInvoiceClick(link)}
                          className="rounded-[8px]"
                        >
                          Add Credits
                        </Button>
                      )}

                      <Button
                        sx={{
                          color: '#4071B6',
                          backgroundColor: '#4071B60D',
                          border: '1px solid #4071B6',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: "none",
                          padding: 0,
                          width: '100%',
                          height: '40px',
                          '&:hover': {
                            color: '#4071B6',
                            backgroundColor: '#4071B60D',
                            border: '1px solid #4071B6',
                          },
                        }}
                        variant="outlined"
                        onClick={() => handleViewInvoicesClick(link)}
                        className="rounded-[8px]"
                      >
                        View Invoice
                      </Button>
                    </div>
                  </div>


                  <CustomModal open={showReactivateModal} onClose={() => setShowReactivateModal(false)}>
                    <h2 className="text-xl font-semibold text-center text-[#16151C] mb-7">
                      Reactivate
                    </h2>

                    <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />
                    <p className="text-lg text-center font-light text-[#16151C] mb-12">
                      Are you sure you want to Reactivate this student?
                    </p>
                    <div className="flex gap-3 justify-end">
                      <Button
                        onClick={() => setShowReactivateModal(false)}
                        variant="outlined"
                        sx={{
                          width: 166,
                          height: 50,
                          borderRadius: "10px",
                          borderColor: "#A2A1A833",
                          fontSize: "16px",
                          fontWeight: 300,
                          color: "#16151C",
                          textTransform: "none",
                        }}
                      >
                        Close
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          width: 166,
                          height: 50,
                          borderRadius: "10px",
                          backgroundColor: "#4071B6",
                          fontSize: "20px",
                          fontWeight: 300,
                          color: "#FFFFFF",
                          textTransform: "none",
                        }}
                        onClick={() => reactivateStudent(selectedLink)}
                      >
                        Yes
                      </Button>
                    </div>
                  </CustomModal>



                  <Modal open={showHourlyRateModal}>
                    <CustomModal>
                      <h2>Enter New Hourly Rate</h2>
                      <div className="flex items-center mt-4">
                        <span className="font-bold text-xl mr-2">£</span>
                        <input
                          type="number"
                          value={newHourlyRate}
                          onChange={(e) => setNewHourlyRate(e.target.value)}
                          placeholder="Enter New Hourly Rate"
                          className="w-full p-2 border rounded-lg"
                          min={0}
                        />
                      </div>
                      <div className="flex justify-end mt-4 space-x-2">
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => setShowHourlyRateModal(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => hourlyRateUpdate(selectedLink)}
                        >
                          Submit
                        </Button>
                      </div>
                    </CustomModal>
                  </Modal>

                  <CustomModal open={showModal} onClose={() => setShowModal(false)}>
                    <h2 className="text-xl font-semibold text-start text-[#16151C] mb-7">
                      Add Credit
                    </h2>

                    <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

                    <TextField
                      type="number"
                      value={invoicePrice}
                      onChange={(e) => setInvoicePrice(e.target.value)}
                      label="Enter Credits"
                      fullWidth
                      sx={{
                        borderColor: "#A2A1A833",
                        mb: 7,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px", //  custom radius
                        },
                        "& .MuiInputLabel-root": {
                          color: "#A2A1A8CC", //  default label color
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#4071B6", //  label color when focused
                        },
                      }}
                    />

                    <div className="flex gap-3 justify-end">
                      <Button
                        onClick={() => {
                          setInvoicePrice(0)
                          setShowModal(false)
                        }}
                        variant="outlined"
                        sx={{
                          width: 166,
                          height: 50,
                          borderRadius: "10px",
                          borderColor: "#A2A1A833",
                          fontSize: "16px",
                          fontWeight: 300,
                          color: "#16151C",
                          textTransform: "none",

                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={loading}
                        variant="contained"
                        sx={{
                          width: 166,
                          height: 50,
                          borderRadius: "10px",
                          backgroundColor: "#4071B6",
                          fontSize: "20px",
                          fontWeight: 300,
                          color: "#FFFFFF",
                          textTransform: "none",
                        }}
                        onClick={handleModalSubmit}
                      >
                        {loading ? "Adding" : "Add"}
                      </Button>
                    </div>
                  </CustomModal>


                  <CustomModal open={removeBalance} onClose={() => setRemoveBalance(false)}>
                    <h2 className="text-xl font-semibold text-start text-[#16151C] mb-7">
                      Remove Credits
                    </h2>

                    <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

                    <TextField
                      type="number"
                      value={invoicePrice}
                      onChange={(e) => setInvoicePrice(e.target.value)}
                      label="Enter Credits"
                      fullWidth
                      sx={{
                        borderColor: "#A2A1A833",
                        mb: 7,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px", // 👈 custom radius
                        },
                        "& .MuiInputLabel-root": {
                          color: "#A2A1A8CC", // 👈 default label color
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#4071B6", // 👈 label color when focused
                        },
                      }}
                    />

                    <div className="flex gap-3 justify-end">
                      <Button
                        onClick={() => {
                          setInvoicePrice(0)
                          setRemoveBalance(false)
                        }}
                        variant="outlined"
                        sx={{
                          width: 166,
                          height: 50,
                          borderRadius: "10px",
                          borderColor: "#A2A1A833",
                          fontSize: "16px",
                          fontWeight: 300,
                          color: "#16151C",
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={loading}
                        variant="contained"
                        sx={{
                          width: 166,
                          height: 50,
                          borderRadius: "10px",
                          backgroundColor: "#4071B6",
                          fontSize: "20px",
                          fontWeight: 300,
                          color: "#FFFFFF",
                        }}
                        onClick={handleRemoveBalanceModalSubmit}
                      >
                        {loading ? "Removing" : "Remove"}
                      </Button>
                    </div>
                  </CustomModal>

                  <CustomModal open={showDeactivateModal} onClose={() => setShowDeactivateModal(false)}>
                    <h2 className="text-xl font-semibold text-center text-[#16151C] mb-7">
                      Deactivate
                    </h2>

                    <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

                    <p className="text-lg text-center font-light text-[#16151C] mb-12">
                      Are you sure you want to Deactivate this student?
                    </p>

                    <div className="flex gap-3 justify-end">
                      <Button
                        onClick={() => setShowDeactivateModal(false)}
                        variant="outlined"
                        sx={{
                          width: 166,
                          height: 50,
                          borderRadius: "10px",
                          borderColor: "#A2A1A833",
                          fontSize: "16px",
                          fontWeight: 300,
                          color: "#16151C",
                          textTransform: "none",
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={loading}
                        variant="contained"
                        sx={{
                          width: 166,
                          height: 50,
                          borderRadius: "10px",
                          backgroundColor: "#4071B6",
                          fontSize: "20px",
                          fontWeight: 300,
                          color: "#FFFFFF",
                          textTransform: "none",
                        }}
                        onClick={() => handleDeactivate(selectedLink.id)}
                      >
                        {loading ? "Deactivating" : "Yes"}
                      </Button>
                    </div>
                  </CustomModal>

                  <CustomModal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                    <h2 className="text-xl font-semibold text-center text-[#16151C] mb-7">
                      Delete Link
                    </h2>

                    <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

                    <p className="text-lg text-center font-light text-[#16151C] mb-12">
                      Are you sure you want to permanently delete this link?
                    </p>

                    <div className="flex gap-3 justify-end">
                      <Button
                        onClick={() => setShowDeleteModal(false)}
                        variant="outlined"
                        sx={{
                          width: 166,
                          height: 50,
                          borderRadius: "10px",
                          borderColor: "#A2A1A833",
                          fontSize: "16px",
                          fontWeight: 300,
                          color: "#16151C",
                          textTransform: "none",
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={loading}
                        variant="contained"
                        sx={{
                          width: 166,
                          height: 50,
                          borderRadius: "10px",
                          backgroundColor: "#4071B6",
                          fontSize: "20px",
                          fontWeight: 300,
                          color: "#FFFFFF",
                          textTransform: "none",
                        }}
                        onClick={handleDeleteModalSubmit}
                      >
                        {loading ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </CustomModal>
                </>
              )}
            </div>

          </div>
          {currentSearched?.length > itemsPerPage && (
            <div className="mt-6 flex items-center justify-between px-4 py-3 bg-white">
              <div className="text-[14px] font-light text-[#A2A1A8] hidden sm:block">
                Showing {startIndex + 1} to {Math.min(endIndex, currentSearched.length)} out of {currentSearched.length} records
              </div>
              <Stack direction="row" spacing={1} alignItems="center">
                {/* Previous button */}
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  sx={{ minWidth: '32px', padding: '4px' }}
                >
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
                {getVisiblePages(currentPage, Math.ceil(currentSearched.length / itemsPerPage), 4).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    sx={{
                      width: page === currentPage ? 35 : 32,
                      minWidth: 'unset', // <-- remove MUI default min-width
                      height: 36,
                      borderRadius: page === currentPage ? '8px' : '50px',
                      padding: '7px 12px', // adjust padding to match desired width
                      gap: '10px',
                      borderWidth: page === currentPage ? 1 : 0,
                      border: page === currentPage ? '1px solid #4071B6' : 'none',
                      background: '#FFFFFF',
                      color: page === currentPage ? '#4071B6' : '#16151C',
                      fontWeight: page === currentPage ? 600 : 300,
                      fontSize: '14px',
                    }}
                  >
                    {page}
                  </Button>

                ))}

                {/* Next button */}
                <Button
                  disabled={currentPage === Math.ceil(currentSearched.length / itemsPerPage)}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  sx={{ minWidth: '32px', padding: '4px' }}
                >
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

        </div>
      </div>
    </TopHeadingProvider>
  )
}