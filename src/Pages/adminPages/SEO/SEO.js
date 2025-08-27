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
import TopHeading from "../../../Components/TopHeading/TopHeading";

export default function SEO() {

    const [loading, setLoading] = useState(false);

  const handleInputChange = (index, field, value) => {
    const newData = [...seoData];
    newData[index][field] = value;
    setSeoData(newData);
  };

  
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


  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'seoData'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const mergedData = seoData.map(item => {
        const matchedItem = data.find(d => d.pageName === item.pageName);
        return matchedItem ? { ...item, ...matchedItem } : item;
      });

      setSeoData(mergedData);
    };

    fetchData();
  }, []);


  const handleSubmit = async (index) => {
    try{
        setLoading(true)
    
    const updatedData = seoData[index];
    const { id, ...dataWithoutId } = updatedData;

    if (id) {
      await setDoc(doc(db, 'seoData', id), dataWithoutId);
    } else {
      const docRef = await addDoc(collection(db, 'seoData'), dataWithoutId);
      const newData = [...seoData];
      newData[index].id = docRef.id;
      setSeoData(newData);
    }

} catch(e){
    console.error(e)
} finally{
    setLoading(false)
}
  };

  return (
    <>
      <TopHeading>SEO</TopHeading>

      <div
        style={{
          display: "flex",
          paddingTop: "0px",
          flexWrap: "wrap",
          gap: "10px",
          marginRight: "10px",
          marginBottom: "20px",
          flex: 1,
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
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            padding: "10px",
            borderRadius: "10px",
            marginBottom: "10px",
          }}
        >
          <h2 style={{ textAlign: "left" }}>Pages</h2>

{/* <div style={{flex: 1, margin: '10px', border: '1px solid #fff', textAlign: 'center'}}>
    <div style={{fontWeight: 'bold', marginBottom: '10px', marginTop: '10px'}}>Displaying Following Tags</div>
    <div>
        {
        `
    <title>Home</title>
    ` }
    </div>
    <div>
        {
        `
        <meta name="title" content="IB Innovators - Home" />
        ` }
    </div>
    <div>
        {
        `
        <meta name="description" content="Welcome to IB Innovators, your go-to platform for personalized tutoring services." />
        ` }
        </div>
        <div>
        {
        `
        <link rel="canonical" href="https://example.com/home" />
        ` }
        </div>
        <div>
        {
        `
        <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
        ` }
        </div>

    </div> */}

          {seoData.map((item, index) => (
            <Accordion key={index}>
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
                  {/* <TextField
                    fullWidth
                    margin="normal"
                    label="Title"
                    variant="outlined"
                    value={item.title}
                    onChange={(e) =>
                      handleInputChange(index, "title", e.target.value)
                    }
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Meta Title"
                    variant="outlined"
                    value={item.metaTitle}
                    onChange={(e) =>
                      handleInputChange(index, "metaTitle", e.target.value)
                    }
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Meta Description"
                    multiline="true"
                    rows={2}
                    variant="outlined"
                    value={item.metaDescription}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "metaDescription",
                        e.target.value
                      )
                    }
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Canonical URL"
                    variant="outlined"
                    value={item.canonicalUrl}
                    onChange={(e) =>
                      handleInputChange(index, "canonicalUrl", e.target.value)
                    }
                  /> */}
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
<script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>`}
                    variant="outlined"
                    value={item.schema}
                    onChange={(e) =>
                      handleInputChange(index, "schema", e.target.value)
                    }
                  />
                  <Button disabled={loading} variant="contained" color="primary" type="submit">
                    Save
                  </Button>
                </form>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </div>
    </>
  );
}
