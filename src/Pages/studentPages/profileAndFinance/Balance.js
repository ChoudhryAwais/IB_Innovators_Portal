import React, { useState, useContext } from "react";
import { db } from "../../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  arrayUnion,
} from "firebase/firestore";

import { MyContext } from "../../../Context/MyContext";

import { Modal, TextField } from "@mui/material";

import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Button from "@mui/material/Button";
import { toast } from "react-hot-toast";

import Grid from "@mui/material/Grid";

import {
  StripeTextFieldNumber,
  StripeTextFieldExpiry,
  StripeTextFieldCVC,
} from "./commonTextFields";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";
import { Enable2FAForm } from "../../Enable2FAForm/Enable2FAForm";
import emailjs from "emailjs-com";

const stripePromise = loadStripe("pk_test_ju6veMmqd5eDMe1XhQVPyze2");

export default function Balance() {
  const {
    userDetails,
    addNotification,
    adminAddNotification,
    calculateHoursLeft,
    convertToGBP,
  } = useContext(MyContext);
  const [addBalanceModal, setAddBalanceModal] = useState(false);
  const [invoicePrice, setInvoicePrice] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [students, setStudents] = useState([]);
  const [deactivatedStudentsList, setDeactivatedStudentsList] = useState([]);

  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (userDetails?.userId) {
        const linkedRef = collection(db, "Linked");
        const q = query(
          linkedRef,
          where("studentId", "==", userDetails?.userId)
        );

        try {
          // Fetch data
          setLoading(true);
          const querySnapshot = await getDocs(q);
          const updatedStudents = [];
          const deactivatedStudents = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.studentDeactivated) {
              deactivatedStudents.push({ ...data });
            } else {
              updatedStudents.push({ ...data });
            }
          });

          setDeactivatedStudentsList(deactivatedStudents);
          setStudents(updatedStudents);
        } catch (error) {
          console.error("Error fetching data: ", error);
        } finally {
          // Set loading to false once data fetching is complete
          setLoading(false);
        }
      }
    };

    // Invoke fetchData immediately and whenever userDetails?.userId changes
    fetchData();
  }, [userDetails?.userId]);

  const [state, setState] = React.useState({
    cardNumberComplete: false,
    expiredComplete: false,
    cvcComplete: false,
    cardNumberError: null,
    expiredError: null,
    cvcError: null,
  });

  const onElementChange =
    (field, errorField) =>
    ({ complete, error = { message: null } }) => {
      setState({ ...state, [field]: complete, [errorField]: error.message });
    };

  const { cardNumberError, expiredError, cvcError } = state;

  const addBalance = async () => {
    const accountRef = doc(db, "userList", userDetails?.userId);
    if (!invoicePrice || invoicePrice === 0) {
      toast("Please add amount above 0");
    } else if (!invoicePrice) {
      toast("Please enter valid number");
    } else {
      // Fetch the current document
      try {
        setSubmitting(true);
        const docSnapshot = await getDoc(accountRef);

        if (docSnapshot.exists()) {
          // If the document exists, retrieve the current credits value
          const currentCredits = docSnapshot.data().credits;
          // Subtract a certain value from the current credits
          const updatedCredits =
            parseFloat(currentCredits) + parseFloat(invoicePrice);

          // Update the document with the new credits value
          await updateDoc(accountRef, { credits: updatedCredits });

          const balanceHistory = {
            id:
              Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            amount: invoicePrice,
            createdAt: new Date(),
          };

          const docRef = doc(collection(db, "userList"), userDetails?.userId);

          await updateDoc(docRef, {
            balanceHistory: arrayUnion(balanceHistory),
          });

          addNotification(
            `You added a credit of £ ${invoicePrice}.`,
            userDetails?.userId
          );
          adminAddNotification(
            `${userDetails?.userName} added a credit of £ ${invoicePrice}. USER ID: ${userDetails?.userId}`
          );
          toast.success("Credit Added Successfully");
          setInvoicePrice(null);
        } else {
          console.error("Document not found");
        }
      } catch (e) {
        toast.error("Error Occured");
      } finally {
        setAddBalanceModal(false);
        setSubmitting(false);
      }
    }
  };

  // BALANCE HISTORY FUNCTIONALITIES

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function extractMonthYearFromInvoice(invoice) {
    const invoiceDate = invoice.createdAt.toDate(); // Convert Firebase timestamp to JavaScript Date
    const month = invoiceDate.getMonth() + 1; // Adding 1 because getMonth() is zero-based
    const year = invoiceDate.getFullYear();

    return { month, year };
  }

  function getUniqueMonthsAndYears(invoices) {
    const uniqueMonthsAndYears = [];

    invoices.forEach((invoice) => {
      const { month, year } = extractMonthYearFromInvoice(invoice);

      // Check if the combination of month and year already exists in the array
      const exists = uniqueMonthsAndYears.some(
        (item) => item.month === month && item.year === year
      );

      // If it doesn't exist, add it to the array
      if (!exists) {
        uniqueMonthsAndYears.push({ month, year });
      }
    });

    // Sort the array in descending order based on year and month
    uniqueMonthsAndYears.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year; // Sort by year in descending order
      } else {
        return b.month - a.month; // If years are the same, sort by month in descending order
      }
    });

    return uniqueMonthsAndYears;
  }

  const calculateMonthlyInvoice = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = invoice.createdAt.toDate(); // Convert Firestore timestamp to JavaScript Date object
      return (
        invoiceDate.getMonth() === month - 1 &&
        invoiceDate.getFullYear() === year
      );
    });

    const totalAmount = filteredInvoices.reduce(
      (total, invoice) => total + parseInt(invoice.amount),
      0
    );

    return totalAmount;
  };

  const provideMonthlyInvoice = (invoices, month, year) => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = invoice.createdAt.toDate(); // Convert Firebase timestamp to JavaScript Date
      return (
        invoiceDate.getMonth() === month - 1 &&
        invoiceDate.getFullYear() === year
      );
    });

    // Sort the filtered invoices in descending order based on invoice.createdAt
    const sortedInvoices = filteredInvoices.sort((a, b) => {
      const dateA = a.createdAt.toDate();
      const dateB = b.createdAt.toDate();
      return dateB - dateA;
    });

    return sortedInvoices;
  };

  const result = getUniqueMonthsAndYears(
    userDetails?.balanceHistory ? userDetails?.balanceHistory : []
  );

  // DATE AND TIME CALCULATIONS

  function convertToAMPM(time24) {
    // Validate input
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(time24)) {
      console.error(
        "Invalid time format. Please provide a valid 24-hour time (HH:mm)."
      );
      return null;
    }

    // Convert to 12-hour format
    const [hours, minutes] = time24.split(":");
    const parsedHours = parseInt(hours, 10);
    const ampm = parsedHours >= 12 ? "PM" : "AM";
    const hours12 = parsedHours % 12 || 12;

    return `${hours12}:${minutes} ${ampm}`;
  }

  function formatDisplayDateTime(timestamp) {
    let date;
    if (timestamp instanceof Date) {
      date = timestamp; // If it's already a Date object, no need to convert
    } else if (timestamp && typeof timestamp.toDate === "function") {
      date = timestamp.toDate(); // If it's a Firebase Timestamp object, convert to Date
    } else {
      return ""; // Handle invalid or missing timestamps
    }

    const options = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Use 12-hour clock format
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  async function notifyAdmin() {
    try {
      setSubmitting(true);

      const serviceId = process.env.REACT_APP_EMAILSERVICEID;
      const templateId = process.env.REACT_APP_EMAILTEMPLATEID;
      const userId = process.env.REACT_APP_EMAILUSERID;

      const emailParams = {
        from_name: "IBInnovators Portal",
        to_name: "",
        send_to: "billing@ibinnovators.com",
        subject: `${userDetails?.userName} wants to add credits to student account`,
        message: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        </head>
        <body>
          <div class="container">
            <p>Student named <b>${userDetails?.userName}</b> wants to add credits to his/her student account. Provided below is the student info:</p>
            <ul>
            <li>Name: ${userDetails?.userName}</li>
            <li>Email: ${userDetails?.email}</li>
            <li>User ID: ${userDetails?.userId}</li>
            </ul>
          </div>
        </body>
        </html>          
        `,
      };

      await emailjs
        .send(serviceId, templateId, emailParams, userId)
        .then((response) => {
          toast.success("Email sent successfully");
        })
        .catch((error) => {
          toast.error("Error sending email");
        });
    } catch (e) {
      console.error("Error sending email");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{ flex: 1, gap: "10px", display: "flex", flexDirection: "column" }}
    >
      <div
        className="shadowAndBorder"
        style={{
          marginTop: "0px",
          height: "max-content",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          background: "rgba(255,255,255, 0.5)",
          backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
          WebkitBackdropFilter: "blur(4px)", // For Safari support,
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        <h2 style={{ textAlign: "left" }}>
          Credits Left{" "}
          <span style={{ fontSize: "large" }}>
            (worth £ {userDetails?.credits?.toFixed(2)})
          </span>
        </h2>
        {/* <h1 style={{ textAlign: "center", fontSize: "3rem" }}>
          {parseFloat(userDetails?.credits)?.toFixed(2)}
        </h1> */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            margin: "10px auto",
          }}
        >
          {students?.map((item, index) => (
            <div
              style={{
                background: "#fff",
                padding: "10px",
                borderRadius: "5px",
                border: "2px dotted #ccc",
              }}
              key={index}
            >
              <div>Subject: {item?.subject}</div>
              <div>
                Useable Credits:{" "}
                <span style={{ color: "red" }}>
                  {calculateHoursLeft(
                    convertToGBP(parseFloat(item?.price)),
                    parseFloat(userDetails?.credits)
                  )}
                </span>
              </div>
            </div>
          ))}
          <div style={{ color: "red" }}>
            Note: Credits used in one subject will deduct the useable credits
            for other subject(s) accordingly.
          </div>
        </div>

        <Button
          onClick={() => {
            // setAddBalanceModal(true);
            setShowMessage(true);
            // toast.error("This feature is currently not available. Please contact admin to add credits.")
          }}
          style={{ width: "100%", marginTop: "20px" }}
          variant="contained"
          color="success"
        >
          Add Credit
        </Button>
      </div>

      <div
        className="shadowAndBorder"
        style={{
          marginTop: "0px",
          height: "max-content",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          background: "rgba(255,255,255, 0.5)",
          backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
          WebkitBackdropFilter: "blur(4px)", // For Safari support,
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        <h2 style={{ textAlign: "left" }}>Payment History</h2>

        {result.map((item) => (
          <Accordion
            style={{ borderRadius: "5px", background: "rgba(255,255,255,0.2)" }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <div
                style={{
                  flex: 1,
                  justifyContent: "space-between",
                  display: "flex",
                  fontSize: "large",
                  fontWeight: "bold",
                }}
              >
                <div>
                  {months[item?.month - 1]} {item?.year}
                </div>

                <div>
                  £{" "}
                  {calculateMonthlyInvoice(
                    userDetails?.balanceHistory,
                    item?.month,
                    item?.year
                  )}
                </div>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              {provideMonthlyInvoice(
                userDetails?.balanceHistory,
                item?.month,
                item?.year
              ).map((item, index) => (
                <div
                  style={{
                    padding: "10px",
                    borderTop: index !== 0 ? "2px solid #ccc" : "none",
                    fontSize: "medium",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      justifyContent: "space-between",
                      display: "flex",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>
                      Amount: £ {item?.amount}
                    </span>
                    <span>{formatDisplayDateTime(item?.createdAt)}</span>
                  </div>
                </div>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}

        {result?.length === 0 && (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              color: "#ccc",
              fontSize: "1.5rem",
            }}
          >
            No Credit History Yet
          </div>
        )}
      </div>

      {!userDetails?.TFAEnabled && <Enable2FAForm />}

      <Modal
        open={addBalanceModal}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center", // center the modal content vertically and horizontally
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "70%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflow: "hidden",
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
              background: "rgba(255,255,255, 0.9)",
              backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
              WebkitBackdropFilter: "blur(4px)", // For Safari support,
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                padding: "20px",
                flex: 1,
                overflow: "auto",
              }}
            >
              <h2>Add Credits</h2>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <TextField
                  type="number"
                  value={invoicePrice}
                  onChange={(e) => setInvoicePrice(e.target.value)}
                  label="Enter Amount in GBP"
                  min={0}
                  style={{ width: "100%" }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  margin: "15px auto",
                }}
              >
                <div style={{ color: "red" }}>
                  Note: Credits used in one subject will deduct the useable
                  credits for other subject(s) accordingly.
                </div>
                {students?.map((item, index) => (
                  <div
                    style={{
                      background: "#fff",
                      padding: "10px",
                      borderRadius: "5px",
                      border: "2px dotted #ccc",
                    }}
                    key={index}
                  >
                    <div>Subject: {item?.subject}</div>
                    <div>
                      Useable Credits:{" "}
                      <span style={{ color: "red" }}>
                        {calculateHoursLeft(
                          convertToGBP(parseFloat(item?.price)),
                          parseFloat(
                            parseFloat(invoicePrice || 0) +
                              parseFloat(userDetails?.credits)
                          )
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Elements stripe={stripePromise}>
                <Grid item xs={12} md={6}>
                  <StripeTextFieldNumber
                    error={Boolean(cardNumberError)}
                    labelErrorMessage={cardNumberError}
                    onChange={onElementChange(
                      "cardNumberComplete",
                      "cardNumberError"
                    )}
                  />
                </Grid>
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "15px",
                    marginBottom: "20px",
                  }}
                >
                  <Grid item xs={6} sm={3} style={{ flex: 1 }}>
                    <StripeTextFieldExpiry
                      error={Boolean(expiredError)}
                      labelErrorMessage={expiredError}
                      onChange={onElementChange(
                        "expiredComplete",
                        "expiredError"
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3} style={{ flex: 1 }}>
                    <StripeTextFieldCVC
                      error={Boolean(cvcError)}
                      labelErrorMessage={cvcError}
                      onChange={onElementChange("cvcComplete", "cvcError")}
                    />
                  </Grid>
                </div>
                {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
              </Elements>

              <div
                style={{
                  flexDirection: "row",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setInvoicePrice(0);
                    setAddBalanceModal(false);
                  }}
                >
                  CANCEL
                </Button>

                {submitting ? (
                  <LoadingButton
                    loading
                    loadingPosition="start"
                    startIcon={<SaveIcon />}
                    variant="outlined"
                  >
                    ADDING BALANCE
                  </LoadingButton>
                ) : (
                  <Button
                    onClick={addBalance}
                    variant="contained"
                    color="success"
                  >
                    ADD BALANCE
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={showMessage}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center", // center the modal content vertically and horizontally
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "70%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflow: "hidden",
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
              background: "rgba(255,255,255, 0.9)",
              backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
              WebkitBackdropFilter: "blur(4px)", // For Safari support,
              borderRadius: "10px",
            }}
          >
            <div
              style={{
                padding: "20px",
                flex: 1,
                overflow: "auto",
              }}
            >
              <h2>Sorry for the inconvenience!</h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  margin: "15px auto",
                }}
              >
                <div>
                  We are currently experiencing technical difficulties with our
                  direct payment option. Please try again later or contact us at
                  billing@ibinnovators.com or +44 (0) 7462 316382 to complete
                  your transaction. We appreciate your patience and look forward
                  to assisting you soon.
                  <br />
                  <br />
                  <span style={{ color: "red" }}>
                    Please confirm to notify the admin about your request to add
                    credits via email.
                  </span>
                </div>
              </div>
              <div
                style={{
                  flexDirection: "row",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setShowMessage(false);
                  }}
                >
                  CANCEL
                </Button>

                {submitting ? (
                  <LoadingButton
                    loading
                    loadingPosition="start"
                    startIcon={<SaveIcon />}
                    variant="outlined"
                  >
                    Sending Email
                  </LoadingButton>
                ) : (
                  <Button
                    onClick={notifyAdmin}
                    variant="contained"
                    color="success"
                  >
                    Send Email
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
