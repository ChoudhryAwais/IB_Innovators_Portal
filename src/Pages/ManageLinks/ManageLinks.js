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
import { faMagnifyingGlass, faBook, faSuitcase } from "@fortawesome/free-solid-svg-icons"

import Pagination from "@mui/material/Pagination"
import Stack from "@mui/material/Stack"
import ViewInvoices from "./ViewInvoices"

import { MenuItem, Select, Button ,TextField,Modal} from "@mui/material"
import { useTopHeading } from "../../Components/Layout"
import { TopHeadingProvider } from "../../Components/Layout"

import toast from "react-hot-toast"
import CustomModal from "../../Components/CustomModal/CustomModal";

export default function ManageLinks() {
  const [links, setLinks] = useState([])
  const { calculateHoursLeft, convertToGBP, addNotification } = useContext(MyContext)
  const [searchedLinks, setSearchedLinks] = useState([])
  const [selectedLink, setSelectedLink] = useState(null)
  const [invoicePrice, setInvoicePrice] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
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
    setSelectedLink(link);
    setShowInvoicesModal(true);
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
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-stretch md:space-x-4 mb-6">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 flex-1">
            <FontAwesomeIcon className="text-gray-500 mr-2" icon={faMagnifyingGlass} />
            <input
              onChange={handleSearch}
              placeholder="Search via Student Or Teacher Name / Email / User ID / Link ID"
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={active}
              onChange={handleActiveChange}
              fullWidth
              size="small"
              className="bg-white h-full"
              sx={{
                height: "100%",
                ".MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  py: 0,
                },
              }}
            >
              <MenuItem value={"Active Links"}>Active Links</MenuItem>
              <MenuItem value={"Deactivated Links"}>Deactivated Links</MenuItem>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {displayedSessions.map((item, index) => (
              <div className="p-4 border rounded-lg shadow-sm bg-white mb-4" key={index}>
                <div className="flex items-center mb-3">
                  <FontAwesomeIcon icon={faBook} className="text-blue-500 mr-2" />
                  <span className="font-semibold text-gray-800">{item?.subject}</span>
                </div>
                <div className="flex justify-between items-stretch">
                  <div className="flex flex-col text-sm text-gray-700 space-y-1">
                    <div>
                      <span className="font-medium">Subscription:</span> #{item?.id}
                    </div>
                    <div>
                      <span className="font-medium">Student:</span> {item?.studentName}
                    </div>
                    <div>
                      <span className="font-medium">Tutor:</span> {item?.teacherName}
                    </div>
                  </div>
                  <Button
                    sx={{
                      color:'#4071B6',
                      backgroundColor:'#4071B60D',
                      border: '1px solid #4071B6',
                      '&:hover': {
                        color:'#4071B6',
                        backgroundColor:'#4071B60D',
                        border: '1px solid #4071B6', 
                      },
                    }}
                    variant="outlined"
                    size="small"
                    onClick={() => setLink(item)}
                    className="h-full ml-4"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
            {currentSearched?.length > itemsPerPage && (
              <div className="flex justify-center items-center mt-5 mb-2">
                <Stack spacing={2}>
                  <Pagination
                    count={Math.ceil(currentSearched?.length / itemsPerPage)}
                    page={currentPage}
                    onChange={handleChangePage}
                  />
                </Stack>
              </div>
            )}
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
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faSuitcase} className="text-blue-600 text-lg" />
                      <span className="text-lg font-semibold text-gray-800">{link?.subject}</span>
                    </div>
                    {link?.studentDeactivated ? (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => {
                          setSelectedLink(link);
                          setShowReactivateModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Reactivate
                      </Button>
                    ) : (
                      <Button
                        sx={{
                          color:'#A81E1E',
                          backgroundColor:'#A81E1E0D',
                          border: '1px solid #A81E1E',
                          '&:hover': {
                            color:'#A81E1E',
                            backgroundColor:'#A81E1E0D',
                            border: '1px solid #A81E1E', 
                          },
                        }}
                        variant="outlined"
                        size="small"
                        onClick={() => handleDeleteInvoiceClick(link)}
                        className="w-[100px] h-[32px]"
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4 text-sm text-gray-700">
                    <div className="flex">
                      <span className="font-semibold w-40">Subscription:</span>
                      <span className="text-gray-900">#{link?.id}</span>
                    </div>
                    
                    <div className="h-2" />
                    
                    <div className="flex">
                      <span className="font-semibold w-40">Student:</span>
                      <span className="text-gray-900">{link?.studentName}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Email:</span>
                      <span className="text-gray-900">{link?.studentEmail}</span>
                    </div>
                    
                    <div className="h-2" />
                    
                    <div className="flex">
                      <span className="font-semibold w-40">Tutor:</span>
                      <span className="text-gray-900">{link?.teacherName}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Email:</span>
                      <span className="text-gray-900">{link?.teacherEmail || "N/A"}</span>
                    </div>
                    
                    <div className="h-2" />
                    
                    <div className="flex">
                      <span className="font-semibold w-40">Start Date:</span>
                      <span className="text-gray-900">
                        {link?.startDate && new Date(link?.startDate.toDate()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Credits:</span>
                      <span className="text-gray-900">
                        {fetchingCredits
                          ? "Fetching..."
                          : calculateHoursLeft(
                              convertToGBP(link?.price),
                              creditsForSelectedStudent
                            )?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Hourly Rate (USD):</span>
                      <span className="text-gray-900">${link?.price}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-40">Tutor Hourly Rate (USD):</span>
                      <span className="text-gray-900">${link?.tutorHourlyRate}</span>
                    </div>
                    
                    <div className="h-2" />
                    
                    <div className="flex">
                      <span className="font-semibold w-40">Balance (GBP):</span>
                      <span className="text-gray-900">
                        {fetchingCredits ? "Fetching..." : `£ ${creditsForSelectedStudent?.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <Button
                      sx={{
                        color:'#F49342',
                        backgroundColor:'#F493420D',
                        border: '1px solid #F49342',
                        fontSize: '12px',
                        '&:hover': {
                          color:'#F49342',
                          backgroundColor:'#F493420D',
                          border: '1px solid #F49342', 
                          fontSize: '12px',
                        },
                      }}
                      variant="outlined"
                      onClick={() => {
                        setSelectedLink(link);
                        setRemoveBalance(true);
                      }}
                      className="h-11 w-[135px] h-[40px] text-[12px] rounded-[8px]"
                    >
                      Remove Credits
                    </Button>
                    <Button
                      sx={{
                        color:'#3FC28A',
                        backgroundColor:'#3FC28A0D',
                        border: '1px solid #3FC28A',
                        fontSize: '12px',
                        '&:hover': {
                          color:'#3FC28A',
                          backgroundColor:'#3FC28A0D',
                          border: '1px solid #3FC28A',
                          fontSize: '12px', 
                        },
                      }}
                      variant="outlined"
                      onClick={() => handleGenerateInvoiceClick(link)}
                      className="h-11 w-[135px] h-[40px] text-[12px] rounded-[8px]"
                    >
                      Add Credits
                    </Button>
                    <Button
                      sx={{
                        color:'#4071B6',
                        backgroundColor:'#4071B60D',
                        border: '1px solid #4071B6',
                        fontSize: '12px',
                        '&:hover': {
                          color:'#4071B6',
                          backgroundColor:'#4071B60D',
                          border: '1px solid #4071B6',
                          fontSize: '12px', 
                        },
                      }}
                      variant="outlined"
                      onClick={() => handleViewInvoicesClick(link)}
                      className="h-11 w-[135px] h-[40px] rounded-[8px]"
                    >
                      View Invoice
                    </Button>
                  </div>
                </div>

                <Modal open={showInvoicesModal}>
                  <CustomModal>
                    <ViewInvoices data={selectedLink} setShowInvoicesModal={setShowInvoicesModal} />
                  </CustomModal>
                </Modal>

                <Modal open={showReactivateModal}>
                  <CustomModal>
                    <h2>Reactivate Student</h2>
                    <div className="mt-4 flex flex-col space-y-2">
                      <Button
                        variant="outlined"
                        onClick={() => setShowReactivateModal(false)}
                      >
                        Close
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => reactivateStudent(selectedLink)}
                      >
                        Reactivate
                      </Button>
                    </div>
                  </CustomModal>
                </Modal>

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

                <Modal open={showModal}>
                  <CustomModal>
                    <h2>Enter Balance Amount</h2>
                    <TextField
                      type="number"
                      value={invoicePrice}
                      onChange={(e) => setInvoicePrice(e.target.value)}
                      label="Enter Amount in GBP"
                      fullWidth
                      className="mb-4"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setInvoicePrice(0);
                          setShowModal(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={loading}
                        variant="contained"
                        color="success"
                        onClick={handleModalSubmit}
                      >
                        {loading ? "Submitting" : "Submit"}
                      </Button>
                    </div>
                  </CustomModal>
                </Modal>

                <Modal open={removeBalance}>
                  <CustomModal>
                    <h2>Enter Balance Amount to Remove</h2>
                    <TextField
                      type="number"
                      value={invoicePrice}
                      onChange={(e) => setInvoicePrice(e.target.value)}
                      label="Enter Amount in GBP"
                      fullWidth
                      className="mb-4"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setInvoicePrice(0);
                          setRemoveBalance(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={loading}
                        variant="contained"
                        color="success"
                        onClick={handleRemoveBalanceModalSubmit}
                      >
                        {loading ? "Submitting" : "Submit"}
                      </Button>
                    </div>
                  </CustomModal>
                </Modal>

                <Modal open={showDeleteModal}>
                  <CustomModal>
                    <h2>Are you sure you want to delete this link?</h2>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outlined" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                      </Button>
                      <Button
                        disabled={loading}
                        variant="contained"
                        color="error"
                        onClick={handleDeleteModalSubmit}
                      >
                        {loading ? "Deleting" : "Delete"}
                      </Button>
                    </div>
                  </CustomModal>
                </Modal>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </TopHeadingProvider>
)
}