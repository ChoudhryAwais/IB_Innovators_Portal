import React, { useState, useEffect, useContext } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  addDoc,
  query,
  onSnapshot,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { MyContext } from "../../Context/MyContext";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import ViewInvoices from "./ViewInvoices";

import { MenuItem, Modal, Select, TextField } from "@mui/material";

import Button from "@mui/material/Button";
import TopHeading from "../../Components/TopHeading/TopHeading";
import toast from "react-hot-toast";
import CustomModal from "../../Components/CustomModal/CustomModal";

export default function ManageLinks() {
  const [links, setLinks] = useState([]);
  const { calculateHoursLeft, convertToGBP, addNotification } = useContext(MyContext);
  const [searchedLinks, setSearchedLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null);
  const [invoicePrice, setInvoicePrice] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [link, setLink] = useState({});

  const [newHourlyRate, setNewHourlyRate] = useState(0);

  const [showInvoicesModal, setShowInvoicesModal] = useState(false);

  const [showHourlyRateModal, setShowHourlyRateModal] = useState(false);

  const [deactivatedStudents, setDeactivatedStudents] = useState([]);

  const [active, setActive] = useState("Active Links");

  const [currentData, setCurrentData] = useState([]);
  const [currentSearched, setCurrentSearched] = useState([]);

  const [removeBalance, setRemoveBalance] = useState(false);

  const [creditsForSelectedStudent, setCreditsForSelectedStudent] = useState(0);
  const [fetchingCredits, setFetchingCredits] = useState(false);

  const [loading, setLoading] = useState(false);

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
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = currentSearched?.slice(startIndex, endIndex);

  return (
    <div style={{ flex: 1 }}>
      <TopHeading>Manage Links</TopHeading>

      <div
        style={{
          display: "flex",
          paddingTop: "0px",
          flexWrap: "wrap",
          gap: "10px",
          marginRight: "10px",
          marginBottom: "20px",
        }}
      >
        <div
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
            marginBottom: "10px",
          }}
        >
          {links.length !== 0 && (
            <div
              style={{
                marginBottom: "10px",
                marginTop: "20px",
                display: "flex",
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                borderBottom: "2px solid #ccc",
              }}
            >
              <FontAwesomeIcon
                style={{ marginLeft: "10px", marginRight: "10px" }}
                icon={faMagnifyingGlass}
              />
              <input
                onChange={handleSearch}
                placeholder="Search via Student Or Teacher Name / Email / User ID / Link ID"
                style={{
                  border: "none",
                  flex: 1,
                  outline: "none",
                  background: "transparent",
                }}
                defaultValue=""
              />
            </div>
          )}

          <Select
            id="demo-select-small"
            value={active}
            onChange={handleActiveChange}
            fullWidth
            variant="outlined"
            style={{
              marginBottom: "10px",
            }}
          >
            <MenuItem value={"Active Links"}>Active Links</MenuItem>
            <MenuItem value={"Deactivated Links"}>Deactivated Links</MenuItem>
          </Select>

          {displayedSessions.map((item, index) => (
            <div
              style={{
                borderTop: index !== 0 ? "2px solid #ccc" : "none",
                cursor: "pointer",
                padding: "10px",
                width: "100%",
              }}
              key={index}
            >
              <div>Subscription# {item?.id}</div>
              <div>Student: {item?.studentName}</div>
              <div>Tutor: {item?.teacherName}</div>

              <Button
                variant="outlined"
                onClick={() => {
                  setLink(item);
                }}
                style={{ flex: 1, marginTop: "5px", width: "100%" }}
              >
                SELECT
              </Button>
            </div>
          ))}

          {currentSearched?.length > itemsPerPage && (
            <div
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                marginTop: "20px",
                marginBottom: "10px",
              }}
            >
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
            <div
              style={{
                flex: 1,
                textAlign: "center",
                color: "#ccc",
                fontSize: "1.5rem",
              }}
            >
              No Students
            </div>
          )}
        </div>

        <div
          className="shadowAndBorder"
          style={{
            marginTop: "0px",
            flex: 2,
            height: "max-content",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
            background: "rgba(255,255,255, 0.5)",
            backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
            WebkitBackdropFilter: "blur(4px)", // For Safari support,
            padding: "10px",
            borderRadius: "10px",
            marginBottom: "10px",
          }}
        >
          {Object.values(link).length === 0 ? (
            <div
              style={{
                fontSize: "3rem",
                fontWeight: "bold",
                color: "#aeaeae",
                textAlign: "center",
                minHeight: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div>
                <div>No Details Available</div>
                <div style={{ fontSize: "1.5rem" }}>
                  Select a link to show details
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  margin: "5px",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              >
                <div style={{ fontSize: "x-large", textAlign: "center" }}>
                  <b>Subscription# {link?.id}</b>
                </div>
                {link?.reactivateRequest && (
                  <>
                    <div
                      style={{
                        color: "green",
                        fontSize: "large",
                        fontWeight: "bold",
                      }}
                    >
                      Reactivating Request: {link?.reactivatingReason}
                    </div>
                  </>
                )}
                {link?.studentDeactivated && (
                  <div
                    style={{
                      color: "red",
                      fontSize: "large",
                      fontWeight: "bold",
                    }}
                  >
                    This Student is Deactivated
                  </div>
                )}
                <div style={{ marginBottom: "10px" }}>
                  Subject: {link?.subject}
                </div>
                <div>Student: {link?.studentName}</div>
                <div style={{ marginBottom: "10px" }}>
                  Student Email: {link?.studentEmail}
                </div>
                <div>Tutor: {link?.teacherName}</div>
                <div style={{ marginBottom: "10px" }}>
                  Tutor Email: {link?.teacherEmail || "N/A"}
                </div>
                {fetchingCredits ? (
                  <div>Fetching Balance...</div>
                ) : (
                  <>
                    <div>
                      Balance (GBP): £ {creditsForSelectedStudent?.toFixed(2)}
                    </div>

                    <div>
                      Credits:{" "}
                      {calculateHoursLeft(
                        convertToGBP(link?.price),
                        creditsForSelectedStudent
                      )?.toFixed(2)}
                    </div>
                  </>
                )}
                <div>Hourly Rate (USD): ${link?.price}</div>
                <div>Tutor Hourly Rate (USD): ${link?.tutorHourlyRate}</div>
                {/* <div>Plan Selected: {link?.plan}</div> */}
                <div>
                  Start Date:{" "}
                  {link?.startDate &&
                    new Date(link?.startDate.toDate()).toLocaleDateString()}
                </div>
              </div>
              <div
                style={{
                  flexDirection: "column",
                  display: "flex",
                  margin: "5px",
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: "10px",
                  }}
                >
                  <Button
                    variant="contained"
                    style={{
                      flex: 1,
                    }}
                    onClick={() => {
                      handleGenerateInvoiceClick(link);
                    }}
                  >
                    Add Balance
                  </Button>

                  <Button
                    variant="contained"
                    style={{
                      flex: 1,
                    }}
                    onClick={() => {
                      {
                        setSelectedLink(link);
                        setRemoveBalance(true);
                      }
                    }}
                  >
                    Remove Balance
                  </Button>
                </div>

                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: "10px",
                  }}
                >
                  <Button
                    variant="contained"
                    style={{
                      flex: 1,
                    }}
                    onClick={() => {
                      handleViewInvoicesClick(link);
                    }}
                  >
                    View Invoices
                  </Button>

                  {/* <Button variant="contained"
                    style={{
                      flex: 1,
                    }}
                    onClick={() => {
                      setSelectedLink(link);
                      setShowHourlyRateModal(true);
                      setNewHourlyRate(link.price);
                    }}
                  >
                    Edit Hourly Rate
                  </Button> */}
                </div>

                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {link?.studentDeactivated && (
                    <Button
                      variant="contained"
                      style={{ flex: 1 }}
                      onClick={() => {
                        setSelectedLink(link);
                        setShowReactivateModal(true);
                      }}
                    >
                      Reactivate Student
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    color="error"
                    style={{
                      flex: 1,
                    }}
                    onClick={() => {
                      handleDeleteInvoiceClick(link);
                    }}
                  >
                    Delete Link
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        open={showInvoicesModal}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <CustomModal>
          <ViewInvoices
            data={selectedLink}
            setShowInvoicesModal={setShowInvoicesModal}
          />
        </CustomModal>
      </Modal>

      <Modal
        open={showReactivateModal}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <CustomModal>
          <h2>Reactivate Student</h2>

          <div style={{ marginTop: "10px" }}>
            <button
              style={{
                marginRight: "10px",
                padding: "10px 15px",
                width: "100%",
              }}
              onClick={() => setShowReactivateModal(false)}
            >
              Close
            </button>
            <button
              style={{
                padding: "10px 15px",
                width: "100%",
              }}
              onClick={() => reactivateStudent(selectedLink)}
            >
              Reactivate
            </button>
          </div>
        </CustomModal>
      </Modal>

      <Modal
        open={showHourlyRateModal}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <CustomModal>
          <h2>Enter New Hourly Rate</h2>

          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: "x-large", fontWeight: "bold" }}>£</span>{" "}
            <input
              type="number"
              value={newHourlyRate}
              onChange={(e) => setNewHourlyRate(e.target.value)}
              placeholder="Enter New Hourly Rate"
              style={{
                width: "100%",
                padding: "10px",
                margin: "10px 0",
                border: "1px solid #ccc",
                background: "rgba(255,255,255,0.5)",
                borderRadius: "10px",
              }}
              min={0}
            />
          </div>
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={() => setShowHourlyRateModal(false)}
              style={{
                marginRight: "10px",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                hourlyRateUpdate(selectedLink);
              }}
            >
              Submit
            </Button>
          </div>
        </CustomModal>
      </Modal>

      <Modal
        open={showModal}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <CustomModal>
          <h2>Enter Balance Amount</h2>
          <TextField
            type="number"
            value={invoicePrice}
            onChange={(e) => setInvoicePrice(e.target.value)}
            label="Enter Amount in GBP"
            min={0}
            style={{ width: "100%", marginBottom: "15px" }}
          />

          {/* <div style={{marginBottom: '15px'}}>
                  Credits to be added: {calculateHoursLeft(convertToGBP(link?.price), invoicePrice)}
                </div> */}
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setInvoicePrice(0);
                setShowModal(false);
              }}
              style={{ marginRight: "10px" }}
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

      <Modal
        open={removeBalance}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <CustomModal>
          <h2>Enter Balance Amount to Remove</h2>

          <TextField
            type="number"
            value={invoicePrice}
            onChange={(e) => setInvoicePrice(e.target.value)}
            label="Enter Amount in GBP"
            min={0}
            style={{ width: "100%", marginBottom: "15px" }}
          />

          {/* <div style={{marginBottom: '15px'}}>
                  Credits to be removed: {calculateHoursLeft(convertToGBP(link?.price), invoicePrice)}
                </div> */}

          <div
            style={{
              flexDirection: "row",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setInvoicePrice(0);
                setRemoveBalance(false);
              }}
              style={{
                marginRight: "10px",
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

      <Modal
        open={showDeleteModal}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <CustomModal>
          <h2>Are you sure you want to delete this link?</h2>
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setShowDeleteModal(false)}
              style={{
                marginRight: "10px",
              }}
            >
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
    </div>
  );
}
