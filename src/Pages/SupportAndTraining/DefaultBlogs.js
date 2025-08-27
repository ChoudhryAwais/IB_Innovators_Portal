import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, Typography } from "@mui/material";

export default function DefaultBlogs({ blogs }) {
  const [accordionMapping, setAccordionMapping] = useState({});
  const [relevantBlogs, setRelevantBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  useEffect(() => {
    const mapping = {};

    blogs.forEach((blog) => {
      const { viewers, subCategory } = blog;
      if (mapping[viewers]) {
        if (!mapping[viewers].includes(subCategory)) {
          mapping[viewers].push(subCategory);
        }
      } else {
        mapping[viewers] = [subCategory];
      }
    });

    setAccordionMapping(mapping);
  }, [blogs]);

  useEffect(() => {
    if (selectedCategory && selectedSubCategory) {
      const filteredBlogs = blogs.filter(
        (blog) =>
          blog.viewers === selectedCategory &&
          blog.subCategory === selectedSubCategory
      );
      setRelevantBlogs(filteredBlogs);
    } else {
      setRelevantBlogs([]);
    }
  }, [blogs, selectedCategory, selectedSubCategory]);

  

  const [isMobile, setIsMobile] = useState(false);

  const checkIsMobile = () => {
    setIsMobile(window.innerWidth <= 950); // You can adjust the width threshold as needed
  };

  useEffect(() => {
    checkIsMobile(); // Initial check
    window.addEventListener("resize", checkIsMobile); // Add event listener

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return (
    <div style={{ display: "flex", flex: 1, gap: isMobile ? "20px" : "10px", alignItems: "stretch", flexWrap: 'wrap' }}>
      <div style={{ paddingRight: isMobile ? "0px" : "10px", borderRight: isMobile ? "none" : "2px solid #ccc", width: isMobile ? "100%" : '300px' }}>
        {Object.entries(accordionMapping).map(([viewer, subCategories], index) => (
          <Accordion key={index}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography>{viewer}</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ padding: "0px", background: "#eee" }}>
              {subCategories.map((subCategory, subIndex) => (
                <Button
                  onClick={() => {
                    setSelectedCategory(viewer);
                    setSelectedSubCategory(subCategory);
                  }}
                  style={{ width: "100%" }}
                  key={subIndex}
                >
                  {subCategory}
                </Button>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: "300px" }}>
        {
            (selectedCategory && selectedSubCategory) &&
            <div style={{fontWeight: 'bold'}}>
            {selectedCategory} {'>'} {selectedSubCategory} <br/><br/>
            </div>
        }
        {relevantBlogs.map((blog, index) => (
          <section key={blog.id}>
            <Link to={`/supportAndTraining/${blog.id}`}>
              <div
                style={{
                  borderTop: index !== 0 ? "2px solid #ccc" : "none",
                  padding: "10px",
                }}
              >
                <div>{blog.header}</div>
              </div>
            </Link>
          </section>
        ))}
        {relevantBlogs.length === 0 && (
            <div style={{height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Typography variant="body1" style={{ padding: "10px", fontWeight: 'bolder', fontSize: '1.5rem', color: 'rgba(158,158,158, 0.5)' }}>
            {
                selectedSubCategory ? "No relevant blogs found" : "Please select a subcategory"
            }
          </Typography>
          </div>
        )}
      </div>
    </div>
  );
}
