import React, { useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { db } from "../../../firebase";
import { collection, addDoc, doc, setDoc, getDocs } from "firebase/firestore";
import { useTopHeading } from "../../../Components/Layout";
import { TopHeadingProvider } from "../../../Components/Layout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

export default function SEO() {
  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("SEO")
    setSecondMessage("Show all SEO pages")
  }, [setFirstMessage, setSecondMessage])

  const [loading, setLoading] = useState(false);
  const [seoData, setSeoData] = useState([
    {
      pageName: "Home",
      title: "",
      metaTitle: "Home",
      metaDescription: "",
      canonicalUrl: "",
      schema: "",
    },
    {
      pageName: "Why IBI",
      title: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      schema: "",
    },
    {
      pageName: "How it works",
      title: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      schema: "",
    },
    {
      pageName: "IGCSE Tutoring",
      title: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      schema: "",
    },
    {
      pageName: "Revision Courses",
      title: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      schema: "",
    },
    {
      pageName: "Pricing",
      title: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      schema: "",
    },
    {
      pageName: "Contact Us",
      title: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      schema: "",
    },
    {
      pageName: "Blogs",
      title: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      schema: "",
    },
    {
      pageName: "Login",
      title: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      schema: "",
    },
    {
      pageName: "Sign Up",
      title: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      schema: "",
    },
    {
      pageName: "Become Tutor",
      title: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      schema: "",
    },
  ]);

  const handleInputChange = (index, field, value) => {
    const newData = [...seoData];
    newData[index][field] = value;
    setSeoData(newData);
  };

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "seoData"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const mergedData = seoData.map((item) => {
        const matchedItem = data.find((d) => d.pageName === item.pageName);
        return matchedItem ? { ...item, ...matchedItem } : item;
      });

      setSeoData(mergedData);
    };

    fetchData();
  }, []);

  const handleSubmit = async (index) => {
    try {
      setLoading(true);

      const updatedData = seoData[index];
      const { id, ...dataWithoutId } = updatedData;

      if (id) {
        await setDoc(doc(db, "seoData", id), dataWithoutId);
      } else {
        const docRef = await addDoc(collection(db, "seoData"), dataWithoutId);
        const newData = [...seoData];
        newData[index].id = docRef.id;
        setSeoData(newData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TopHeadingProvider>
      <div className="min-h-screen p-6">
        <div className="rounded-xl p-6 border">
          <h1 className="text-[24px] font-semibold text-[#16151C] pb-2">Seo Pages</h1>
          <div className="flex-1 h-max mt-0 mb-2 p-2 ">

            {seoData.map((item, index) => (
              <Accordion
                key={index}
                className="overflow-hidden mb-4"
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
                  expandIcon={<ExpandMoreIcon fontSize="inherit" className="ml-1 !text-3xl text-[#16151C]" />}
                  aria-controls={`panel${index}-content`}
                  id={`panel${index}-header`}
                  className="px-6 py-4 hover:bg-gray-50"
                  sx={{
                    minHeight: "60px !important",
                    maxHeight: "60px",
                    "&.Mui-expanded": {
                      minHeight: "60px !important",
                      maxHeight: "60px",
                    },
                    "& .MuiAccordionSummary-content": {
                      margin: 0,
                      my: 0,
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    },
                    "&.Mui-expanded": {
                      minHeight: "0px !important",
                    },
                    "& .MuiAccordionSummary-content.Mui-expanded": {
                      margin: 0,
                      my: 0,
                    },
                    "& .MuiAccordionSummary-expandIconWrapper": {
                      marginLeft: "16px",
                    },
                  }}
                >
                  <div className="text-lg font-light text-[#16151C]">
                    {item.pageName}
                  </div>
                </AccordionSummary>

                <AccordionDetails className="px-0 pb-4 pt-0">
                  <div className="space-y-4 px-6">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(index);
                      }}
                    >
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Enter SEO Tags"
                        multiline
                        rows={5}
                        placeholder={`<title>${item.pageName}</title>
<meta name="title" content="IB Innovators - ${item.pageName}" />
<meta name="description" content="Welcome to IB Innovators, your go-to platform for personalized tutoring services." />
<link rel="canonical" href="https://example.com/${item.pageName.toLowerCase()}" />
<script type="application/ld+json">{JSON.stringify("schemaMarkup")}</script>`}
                        variant="outlined"
                        value={item.schema}
                        onChange={(e) => handleInputChange(index, "schema", e.target.value)}
                      />
                      <Button
                        disabled={loading}
                        variant="outlined"
                        color="primary"
                        type="submit"
                        sx={{
                          borderRadius: "8px",
                          width: "118px",
                          height: "36px",
                          color: "white",
                          backgroundColor: "#4071B6",
                          borderColor: "#4071B6",
                          fontSize: "14px",
                        }}
                      >
                        Save
                      </Button>
                    </form>
                  </div>
                </AccordionDetails>
              </Accordion>

            ))}
          </div>
        </div>
      </div>
    </TopHeadingProvider>
  );
}
