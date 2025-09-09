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
import {useTopHeading} from "../../../Components/Layout";
import { TopHeadingProvider } from "../../../Components/Layout";

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
        <div className="rounded-xl shadow-sm p-6 border">
          <div className="flex-1 h-max mt-0 mb-2 p-2 ">

            {seoData.map((item, index) => (
              <Accordion key={index} className="mb-4 bg-[#A2A1A80D] rounded-lg">
                <AccordionSummary
                  expandIcon={<ArrowDownwardIcon />}
                  aria-controls={`panel${index}-content`}
                  id={`panel${index}-header`}
                >
                  <Typography>
                    <b>{item.pageName}</b>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
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
                      placeholder={`<title>Home</title>
                      <meta name="title" content="IB Innovators - Home" />
                      <meta name="description" content="Welcome to IB Innovators, your go-to platform for personalized tutoring services." />
                      <link rel="canonical" href="https://example.com/home" />
                      <script type="application/ld+json">{JSON.stringify(
                        "schemaMarkup"
                      )}</script>`}
                      variant="outlined"
                      value={item.schema}
                      onChange={(e) =>
                        handleInputChange(index, "schema", e.target.value)
                      }
                    />
                    <Button
                      disabled={loading}
                      variant="contained"
                      color="primary"
                      type="submit"
                    >
                      Save
                    </Button>
                  </form>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        </div>
      </div>
    </TopHeadingProvider>
  );
}
