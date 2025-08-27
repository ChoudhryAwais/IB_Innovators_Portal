import React from "react";
import { MyContext } from "../../Context/MyContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  addDoc,
  where,
  query,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import "../studentForm/StudentForm.css";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import ProcessedContactUsForm from "./ProcessedContactUsForm";
import TopHeading from "../../Components/TopHeading/TopHeading";
import { toast } from "react-hot-toast";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ContactUsForm = () => {
  const {
    isUserLoggedIn,
    setIsUserLoggedIn,
    setUserType,
    setUserDetails,
    userType,
  } = useContext(MyContext);
  const navigate = useNavigate();
  const [contactUsSubmissions, setContactUsSubmissions] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const [createAccountModal, setCreateAccountModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "contactUsForm");
    const orderCollectionRef = collection(customDocRef, "contactUsForm");

    const orderedQuery = query(
      orderCollectionRef,
      orderBy("submittedAt", "desc")
    );

    // Listen for real-time updates
    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = [];
        querySnapshot.forEach((doc) => {
          fetchedData.push({ id: doc.id, ...doc.data() });
        });

        // Order by submittedAt in descending order
        fetchedData.sort(
          (a, b) => b.submittedAt.toDate() - a.submittedAt.toDate()
        );

        setContactUsSubmissions(fetchedData);
      },
      (error) => {
        alert("Error fetching data: ", error);
      }
    );

    // Don't forget to unsubscribe when the component unmounts
    return () => {
      unsubscribe();
    };
  };

  const handleProcessedClick = async (item) => {
    try {
      setLoading(true);
      const ordersRef = collection(db, "adminPanel");
      const customDocRef = doc(ordersRef, "processedContactUsForm");
      const orderCollectionRef = collection(
        customDocRef,
        "processedContactUsForm"
      );

      await addDoc(orderCollectionRef, { ...item, processedAt: new Date() });

      const prevOrdersRef = collection(db, "adminPanel");
      const prevCustomDocRef = doc(prevOrdersRef, "contactUsForm");
      const prevOrderCollectionRef = collection(
        prevCustomDocRef,
        "contactUsForm"
      );

      // Reference the specific document by ID
      const docToDelete = doc(prevOrderCollectionRef, item.id);

      // Delete the document
      await deleteDoc(docToDelete);

      setShowModal(false);
      toast.success("Marked as processed");
      // alert("Successfully processed teacher form");
    } catch (error) {
      toast.error("Error processing teacher form");
      console.error("Error processing teacher form: ", error);
    } finally {
      setLoading(false);
    }
  };

  // TUTOR FORM PAGINATION
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = contactUsSubmissions?.slice(startIndex, endIndex);

  function formatDateTime(timestampData) {
    // Convert Firestore timestamp to JavaScript Date object
    const dateObject = new Date(
      timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000
    );

    // Format time as "hh:mm A"
    const formattedTime = dateObject.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Format date as "DD/MM/YYYY"
    const formattedDate = dateObject.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Combine formatted time and date
    // const formattedDateTime = `${formattedTime} - ${formattedDate}`;

    return { date: formattedDate, time: formattedTime };
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <TopHeading>Contact Us Forms</TopHeading>

      <div
        style={{
          flex: 1,
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginRight: "10px",
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
          <h2 style={{ textAlign: "left" }}>Pending Forms</h2>
          {displayedSessions.map((item, index) => (
            <Accordion key={index}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <div
                  style={{
                    flex: 1,
                    height: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    {item?.firstName} {item?.lastName}
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <div
                  style={{
                    marginBottom: "1rem",
                    marginRight: "1rem",
                    marginLeft: "1rem",
                  }}
                >
                  <div>
                    <div>
                      <strong>Submission Date:</strong>{" "}
                      {formatDateTime(item?.submittedAt)?.date}
                    </div>
                    <div>
                      <strong>Submission Time:</strong>{" "}
                      {formatDateTime(item?.submittedAt)?.time}
                    </div>
                    <div>
                      <strong>Email:</strong> {item?.email || "N/A"}
                    </div>

                    <div>
                      <strong>Phone:</strong> {item.phone}
                    </div>
                    <div>
                      <strong>Country:</strong> {item?.country?.label}
                    </div>
                    <div>
                      <strong>Graduation Year:</strong> {item?.graduationYear}
                    </div>
                    <div>
                      <strong>Message:</strong> {item.howCanWeSupport}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => {
                      setShowModal(true);
                      setSelectedLink(item);
                    }}
                  >
                    Mark as Processed
                  </Button>
                </div>
              </AccordionDetails>
            </Accordion>
          ))}

          {contactUsSubmissions?.length > itemsPerPage && (
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
                  count={Math.ceil(contactUsSubmissions?.length / itemsPerPage)}
                  page={currentPage}
                  onChange={handleChangePage}
                />
              </Stack>
            </div>
          )}

          {contactUsSubmissions?.length === 0 && (
            <div
              style={{
                flex: 1,
                textAlign: "center",
                color: "#ccc",
                fontSize: "1.5rem",
              }}
            >
              No Pending Forms
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
              {"Please confirm to mark this as processed"}
            </DialogTitle>

            <DialogActions>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                No
              </Button>
              <Button
                disabled={loading}
                variant="contained"
                onClick={() => handleProcessedClick(selectedLink)}
              >
                {loading ? "Submitting" : "Confirm"}
              </Button>
            </DialogActions>
          </Dialog>
        </div>

        <ProcessedContactUsForm />
      </div>
    </div>
  );
};

export default ContactUsForm;
