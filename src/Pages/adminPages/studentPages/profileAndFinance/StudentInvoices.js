import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function StudentInvoices({ userDetails, userId }) {
  const [linkedDocs, setLinkedDocs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        const linkedRef = collection(db, "Linked");
        const q = query(linkedRef, where("studentId", "==", userId));
        const linkedSnapshot = await getDocs(q);
        setLinkedDocs(
          linkedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    };

    fetchData();
  }, [userId]);

  const markInvoicePaid = async (linkedDocId, invoice) => {
    try {
      const docRef = doc(db, "Linked", linkedDocId);
      const updatedInvoice = { ...invoice, status: "Paid" };
      const invoices =
        linkedDocs.find((doc) => doc.id === linkedDocId)?.invoices || [];
      const updatedInvoices = invoices.map((inv) =>
        inv === invoice ? updatedInvoice : inv
      );

      await updateDoc(docRef, { invoices: updatedInvoices });

      setLinkedDocs((prev) =>
        prev.map((doc) =>
          doc.id === linkedDocId ? { ...doc, invoices: updatedInvoices } : doc
        )
      );
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  // --- Helper Functions ---
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
    const invoiceDate = invoice.createdAt.toDate();
    return { month: invoiceDate.getMonth() + 1, year: invoiceDate.getFullYear() };
  }

  function getUniqueMonthsAndYears(invoices) {
    const uniqueMonthsAndYears = [];
    invoices.forEach((invoice) => {
      const { month, year } = extractMonthYearFromInvoice(invoice);
      const exists = uniqueMonthsAndYears.some(
        (i) => i.month === month && i.year === year
      );
      if (!exists) uniqueMonthsAndYears.push({ month, year });
    });
    return uniqueMonthsAndYears.sort((a, b) =>
      a.year !== b.year ? b.year - a.year : b.month - a.month
    );
  }

  const calculateMonthlyInvoice = (invoices, month, year) => {
    return invoices
      .filter((invoice) => {
        const d = invoice.createdAt.toDate();
        return d.getMonth() === month - 1 && d.getFullYear() === year;
      })
      .reduce((total, invoice) => total + parseInt(invoice.amount), 0);
  };

  const provideMonthlyInvoice = (invoices, month, year) => {
    return invoices
      .filter((invoice) => {
        const d = invoice.createdAt.toDate();
        return d.getMonth() === month - 1 && d.getFullYear() === year;
      })
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
  };

  // Flatten all invoices across linkedDocs
  const allInvoices = linkedDocs.flatMap((doc) => doc.invoices || []);
  const result = getUniqueMonthsAndYears(allInvoices);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Invoices</h1>
      </div>

      {/* Accordion Style Invoices */}
      <div className="space-y-4">
        {result.map((item) => {
          const monthKey = `${item.month}-${item.year}`;
          const monthlyInvoices = provideMonthlyInvoice(
            allInvoices,
            item?.month,
            item?.year
          );

          return (
            <Accordion
              key={monthKey}
              className="overflow-hidden"
              sx={{
                "&:before": { display: "none" },
                boxShadow: "none",
                border: "1px solid #A2A1A833",
                borderRadius: "12px !important",
                overflow: "hidden",
                backgroundColor: "#A2A1A80D",
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    fontSize="inherit"
                    className="ml-1 !text-3xl text-[#16151C]"
                  />
                }
                aria-controls={`panel-${monthKey}-content`}
                id={`panel-${monthKey}`}
                className="px-6 py-4 hover:bg-gray-50"
                sx={{
                  minHeight: "72px !important",
                  maxHeight: "72px",
                  "&.Mui-expanded": {
                    minHeight: "72px !important",
                    maxHeight: "72px",
                    "& .summary-text, & .MuiAccordionSummary-expandIconWrapper svg": {
                      color: "#4071B6",
                    },
                  },
                  "& .MuiAccordionSummary-content": {
                    margin: 0,
                    my: 0,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                  },
                  "& .MuiAccordionSummary-content.Mui-expanded": {
                    margin: 0,
                    my: 0,
                  },
                  "& .MuiAccordionSummary-expandIconWrapper": {
                    marginLeft: "16px",
                    color: "#4071B6",
                  },
                }}
              >
                <div className="flex w-full justify-between items-center summary-text">
                  <div className="text-lg font-light">
                    {months[item?.month - 1]} {item?.year} Detail View
                  </div>
                  <div className="text-2xl font-semibold">
                    £ {calculateMonthlyInvoice(allInvoices, item?.month, item?.year)}
                  </div>
                </div>
              </AccordionSummary>

              <AccordionDetails sx={{ backgroundColor: "#f9fafb", p: 2 }}>
                <Box
                  sx={{ borderTop: "1px solid #e5e7eb", overflow: "hidden" }}
                >
                  {/* Header Row */}
                  <Grid
                    container
                    sx={{
                      backgroundColor: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                      fontWeight: 500,
                      color: "#4b5563",
                      p: 1.5,
                    }}
                  >
                    <Grid item xs={3}>
                      Date
                    </Grid>
                    <Grid item xs={3}>
                      Tutor
                    </Grid>
                    <Grid item xs={3}>
                      Status
                    </Grid>
                    <Grid item xs={3}>
                      Amount
                    </Grid>
                  </Grid>

                  {/* Data Rows */}
                  {monthlyInvoices.map((inv, idx) => {
                    const dateObj =
                      inv?.createdAt?.toDate?.() || new Date(inv?.createdAt);
                    const date = new Intl.DateTimeFormat("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    }).format(dateObj);

                    return (
                      <Grid
                        container
                        key={idx}
                        alignItems="center"
                        sx={{
                          borderBottom: "1px solid #A2A1A81A",
                          p: 1.5,
                        }}
                      >
                        <Grid item xs={3}>
                          <div className="text-gray-900">{date}</div>
                        </Grid>
                        <Grid item xs={3}>
                          <div className="text-gray-900">{inv?.teacherName}</div>
                        </Grid>
                        <Grid item xs={3}>
                          <div
                            className={`font-medium ${
                              inv?.status === "Pending"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {inv?.status}
                          </div>
                        </Grid>
                        <Grid item xs={3}>
                          <div className="font-bold text-gray-900">
                            £ {inv?.amount}
                          </div>
                        </Grid>
                      </Grid>
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}

        {result.length === 0 && (
          <div className="text-center text-gray-400 text-xl py-8">
            No Invoices Yet
          </div>
        )}
      </div>
    </div>
  );
}
