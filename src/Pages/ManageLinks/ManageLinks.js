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
} from "firebase/firestore"
import { db } from "../../firebase"
import { MyContext } from "../../Context/MyContext"
import { useNavigate } from "react-router-dom"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faBook, faSuitcase, faRepeat } from "@fortawesome/free-solid-svg-icons"

import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import ViewInvoices from "./ViewInvoices"

import { MenuItem, Select, Button, TextField, Modal } from "@mui/material"
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

  const handleMarkAsPaid = async (invoice) => {
    const updatedInvoices = selectedLink.invoices.map((inv) => {
      if (inv.createdAt === invoice.createdAt) {
        return { ...inv, status: "Paid" };
      }
      return inv;
    });

    const docRef = doc(collection(db, "Linked"), selectedLink.id);

    await updateDoc(docRef, {
      invoices: updatedInvoices,
    });

    alert(`Invoice marked as paid.`);
    setShowInvoicesModal(false);
    handleViewInvoicesClick(selectedLink); // refresh the modal with updated data
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
    if (selectedLink && invoicePrice) {
      await addCredits(selectedLink, invoicePrice);
    }
    setShowModal(false);
    setInvoicePrice("");
  };

  const addCredits = async (link, price) => {
    const accountRef = doc(db, "userList", link?.studentId);

    // Fetch the current document
    try {
      setLoading(true);
      const docSnapshot = await getDoc(accountRef);

      if (docSnapshot.exists()) {
        // If the document exists, retrieve the current credits value
        const currentCredits = docSnapshot.data().credits;
        // Subtract a certain value from the current credits
        const updatedCredits = parseFloat(currentCredits) + parseFloat(price);

        const balanceHistory = {
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
          amount: price,
          createdAt: new Date(),
        };

        // Update the document with the new credits value
        await updateDoc(accountRef, {
          credits: updatedCredits,
          balanceHistory: arrayUnion(balanceHistory),
        });

        addNotification(
          `Admin added a credit of £ ${price} to you account.`,
          link?.studentId
        );
      } else {
        console.error("Document not found");
      }
    } catch (e) {
      toast.error("Error Occured");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBalanceModalSubmit = async () => {
    if (selectedLink && invoicePrice) {
      await removeBalanceFromLink(selectedLink, invoicePrice);
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

  return (
    <TopHeadingProvider firstMessage="Manage Links" secondMessage="Show all managed links">
      <div className="min-h-screen p-6">
        <div className="bg-white border border-[#A2A1A833] rounded-[10px] p-7">
          <div className="flex flex-col md:flex-row md:items-stretch md:space-x-4 mb-6">
            <div className="flex items-center border border-[#A2A1A81A] rounded-[10px] px-3 py-2 flex-1 h-[50px]">
              <FontAwesomeIcon className="text-gray-500 mr-2" icon={faMagnifyingGlass} />
              <input
                onChange={handleSearch}
                placeholder="Search"
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
            </div>
            <div className="w-full md:w-48">
              <Button
                variant="outlined"
                fullWidth
                onClick={() =>
                  setActive(active === "Active Links" ? "Deactivated Links" : "Active Links")
                }
                sx={{
                  color: "#4071B6",
                  backgroundColor: "#4071B60D",
                  border: "1px solid #4071B6",
                  height: "50px",
                  borderRadius: "10px",
                  padding: 0,
                  "&:hover": {
                    color: "#4071B6",
                    backgroundColor: "#4071B60D",
                    border: "1px solid #4071B6",
                  },
                }}
              >
                <span className="flex items-center gap-2">
                  {active === "Active Links" ? "Deactivated Links" : "Active Links"}
                  <FontAwesomeIcon icon={faRepeat} className="text-blue-600 text-lg" />
                </span>
              </Button>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {displayedSessions.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg mb-4  ${link?.id === item?.id ? "bg-[#4071B60D] border-1 border-[#4071B6]" : "bg-[#A2A1A80D]"
                    }`}

                >
                  <div className="flex items-center mb-3">
                    <FontAwesomeIcon icon={faBook} className="text-blue-500 mr-2" />
                    <span className="font-semibold text-[#16151C]">{item?.subject}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col text-sm text-[#16151C] space-y-1">
                      <div className="flex">
                        <span className="font-light w-28">Subscription:</span>
                        <span className="font-medium">#{item?.id}</span>
                      </div>
                      <div className="flex">
                        <span className="font-light w-28">Student:</span>
                        <span className="font-medium">{item?.studentName}</span>
                      </div>
                      <div className="flex">
                        <span className="font-light w-28">Tutor:</span>
                        <span className="font-medium">{item?.teacherName}</span>
                      </div>
                    </div>

                    {link?.id !== item?.id && (
                      <Button
                        sx={{
                          fontSize: "12px",
                          width: "100px",
                          height: "40px",
                          borderRadius: "8px",
                          padding: 0,
                          fontWeight: "600",
                          color: "#4071B6",
                          backgroundColor: "#4071B60D",
                          border: "1px solid #4071B6",
                          "&:hover": {
                            color: "#4071B6",
                            backgroundColor: "#4071B60D",
                            border: "1px solid #4071B6",
                          },
                        }}
                        variant="outlined"
                        onClick={() => setLink(item)}
                        className="self-end"
                      >
                        View Details
                      </Button>
                    )}
                  </div>

                </div>
              ))}

              {currentSearched.length === 0 && (
                <div className="flex-1 text-center text-gray-400 text-2xl">No Students</div>
              )}
            </div>

            <div>
              {Object.values(link).length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-2xl font-light">No Details Available</div>
                  <div className="text-sm mt-2">Select a link to show details</div>
                </div>
              ) : (
                <>
                  <div className="bg-[#A2A1A80D] rounded-lg px-6 py-4 h-[518px]">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faSuitcase} className="text-blue-600 text-lg" />
                        <span className="text-lg font-semibold text-gray-800">{link?.subject}</span>
                      </div>
                      {!link?.studentDeactivated ? (
                        <Button
                          sx={{
                            fontSize: "12px",
                            width: "120px",
                            height: "32px",
                            borderRadius: "4px",
                            padding: "10px",
                            fontWeight: "600",
                            color: "#A81E1E",
                            backgroundColor: "#A81E1E0D",
                            border: "1px solid #A81E1E",
                            "&:hover": {
                              color: "#A81E1E",
                              backgroundColor: "#A81E1E0D",
                              border: "1px solid #A81E1E",
                            },
                          }}
                          variant="outlined"
                          onClick={() => {
                            setSelectedLink(link);
                            setShowDeactivateModal(true);   // 👈 new modal state
                          }}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        (
                          <div
                            onClick={() => {
                              setSelectedLink(link);
                              setShowDeleteModal(true); // 👈 still opens delete modal
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "32px",
                              height: "32px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              border: "1px solid #E5E7EB",
                              backgroundColor: "#F9FAFB",
                              transition: "background-color 0.2s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                          >
                            <svg
                              width="20"
                              height="22"
                              viewBox="0 0 20 22"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3 7V17C3 19.2091 4.79086 21 7 21H13C15.2091 21 17 19.2091 17 17V7M12 10V16M8 10L8 16M14 4L12.5937 1.8906C12.2228 1.3342 11.5983 1 10.9296 1H9.07037C8.40166 1 7.7772 1.3342 7.40627 1.8906L6 4M14 4H6M14 4H19M6 4H1"
                                stroke="#28303F"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )

                      )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="flex">
                        <span className="font-light text-sm w-40">Subscription:</span>
                        <span className="text-[#16151C] font-medium">#{link?.id}</span>
                      </div>

                      <div className="h-5" />

                      <div className="flex ">
                        <span className="font-light text-sm w-40">Student:</span>
                        <span className="text-[#16151C] font-medium">{link?.studentName}</span>
                      </div>
                      <div className="flex ">
                        <span className="font-light text-sm w-40">Email:</span>
                        <span className="text-[#16151C] font-medium">{link?.studentEmail}</span>
                      </div>

                      <div className="h-5" />

                      <div className="flex">
                        <span className="font-light text-sm w-40">Tutor:</span>
                        <span className="text-[#16151C] font-medium">{link?.teacherName}</span>
                      </div>
                      <div className="flex">
                        <span className="font-light text-sm w-40">Email:</span>
                        <span className="text-[#16151C] font-medium">{link?.teacherEmail || "N/A"}</span>
                      </div>

                      <div className="h-5" />

                      <div className="flex">
                        <span className="font-light text-sm w-40">Start Date:</span>
                        <span className="text-[#16151C] font-medium">
                          {link?.startDate && new Date(link?.startDate.toDate()).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-light text-sm w-40">Credits:</span>
                        <span className="text-[#16151C] font-medium">
                          {fetchingCredits
                            ? "Fetching..."
                            : calculateHoursLeft(
                              convertToGBP(link?.price),
                              creditsForSelectedStudent
                            )?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-light text-sm w-40">Hourly Rate (USD):</span>
                        <span className="text-[#16151C] font-medium">${link?.price}</span>
                      </div>
                      <div className="flex">
                        <span className="font-light text-sm  w-40">Tutor Hourly Rate (USD):</span>
                        <span className="text-[#16151C] font-medium">${link?.tutorHourlyRate}</span>
                      </div>

                      <div className="h-5" />

                      <div className="flex">
                        <span className="font-light text-sm w-40">Balance (GBP):</span>
                        <span className="text-[#16151C] font-medium">
                          {fetchingCredits ? "Fetching..." : `£ ${creditsForSelectedStudent?.toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-6">
                      <Button
                        sx={{
                          color: '#F49342',
                          backgroundColor: '#F493420D',
                          border: '1px solid #F49342',
                          fontSize: '12px',
                          fontWeight: '600',
                          '&:hover': {
                            color: '#F49342',
                            backgroundColor: '#F493420D',
                            border: '1px solid #F49342',
                            fontSize: '12px',
                          },
                        }}
                        variant="outlined"
                        onClick={() => {
                          setSelectedLink(link);
                          setRemoveBalance(true);
                        }}
                        className=" w-[135px] h-[40px] rounded-[8px]"
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
                            '&:hover': {
                              color: '#3FC28A',
                              backgroundColor: '#3FC28A0D',
                              border: '1px solid #3FC28A',
                              fontSize: '12px',
                            },
                          }}
                          onClick={() => {
                            setSelectedLink(link);
                            setShowReactivateModal(true);
                          }}
                          className="w-[135px] h-[40px] rounded-[8px]"
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
                            '&:hover': {
                              color: '#3FC28A',
                              backgroundColor: '#3FC28A0D',
                              border: '1px solid #3FC28A',
                              fontSize: '12px',
                            },
                          }}
                          variant="outlined"
                          onClick={() => handleGenerateInvoiceClick(link)}
                          className="w-[135px] h-[40px] rounded-[8px]"
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
                          '&:hover': {
                            color: '#4071B6',
                            backgroundColor: '#4071B60D',
                            border: '1px solid #4071B6',
                            fontSize: '12px',
                          },
                        }}
                        variant="outlined"
                        onClick={() => handleViewInvoicesClick(link)}
                        className="w-[135px] h-[40px] rounded-[8px]"
                      >
                        View Invoice
                      </Button>
                    </div>
                  </div>


                  <CustomModal open={showReactivateModal} onClose={() => setShowReactivateModal(false)}>
                    <h2 className="text-xl font-semibold text-start text-[#16151C] mb-7">
                      Reactivate Student
                    </h2>

                    <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />
                    <p className="text-lg text-center font-light text-[#16151C] mb-12">
                      Are you sure you want to reactivate this student?
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
                        }}
                        onClick={() => reactivateStudent(selectedLink)}
                      >
                        Reactivate
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
                      Enter Balance Amount
                    </h2>

                    <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

                    <TextField
                      type="number"
                      value={invoicePrice}
                      onChange={(e) => setInvoicePrice(e.target.value)}
                      label="Enter Amount in GBP"
                      fullWidth
                      sx={{ mb: 7 }}
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
                        onClick={handleModalSubmit}
                      >
                        {loading ? "Submitting" : "Submit"}
                      </Button>
                    </div>
                  </CustomModal>


                  <CustomModal open={removeBalance} onClose={() => setRemoveBalance(false)}>
                    <h2 className="text-xl font-semibold text-start text-[#16151C] mb-7">
                      Remove Balance
                    </h2>

                    <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

                    <TextField
                      type="number"
                      value={invoicePrice}
                      onChange={(e) => setInvoicePrice(e.target.value)}
                      label="Enter Amount in GBP"
                      fullWidth
                      sx={{ mb: 7 }}
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
                        {loading ? "Submitting" : "Submit"}
                      </Button>
                    </div>
                  </CustomModal>

                  <CustomModal open={showDeactivateModal} onClose={() => setShowDeactivateModal(false)}>
                    <h2 className="text-xl font-semibold text-center text-[#16151C] mb-7">
                      Deactivate Student
                    </h2>

                    <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

                    <p className="text-lg text-center font-light text-[#16151C] mb-12">
                      Are you sure you want to deactivate this student?
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
            <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, currentSearched.length)} out of {currentSearched.length} records
              </div>
              <Stack spacing={2}>
                <Pagination
                  count={Math.ceil(currentSearched?.length / itemsPerPage)}
                  page={currentPage}
                  onChange={handleChangePage}
                  color="primary"
                  size="small"
                />
              </Stack>
            </div>
          )}

        </div>
      </div>
    </TopHeadingProvider>
  )
}