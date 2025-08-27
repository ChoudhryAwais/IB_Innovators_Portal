import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./Details.module.css"; // Import the CSS module
import { Firestore, collection, addDoc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "react-quill/dist/quill.snow.css"; // Import styles
import toast from "react-hot-toast";
import CircularProgress from '@mui/material/CircularProgress';

const Details = () => {
  const [reqData, setReqData] = useState({});
  const params = useParams();
  const reqId = params.id;
  const [data, setData] = useState([])

  const [loading, setLoading] = useState(true);
  

  const fetchBlogs = async () => {
    try{
      setLoading(true)
    const blogsRef = collection(db, "SupportBlogs");
    const snapshot = await getDocs(blogsRef);
    
    const blogsArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    setData(blogsArray);
    const reqData = blogsArray.find((item) => item.id === reqId);
    setReqData(reqData);
  } catch(e){
    toast("Error Fetching Details")
  } finally{
    setLoading(false);
  }
};

// Using useEffect to call fetchBlogs on component mount
useEffect(() => {
    fetchBlogs();
}, []);

  useEffect(() => {
    const reqData = data.find((item) => item.id === reqId);
    setReqData(reqData);
  }, [reqId]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to handle window resize
    const handleResize = () => {
      if (window.innerWidth < 990) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    // Initial check on component mount
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);



  return (
    <div 
    className="shadowAndBorder"
    style={{
      marginTop: "0px",
      flex: 1,
      height: "max-content",
      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
      background: 'rgba(255,255,255, 0.5)',
      backdropFilter: 'blur(4px)', // Adjust the blur intensity as needed
      WebkitBackdropFilter: 'blur(4px)', // For Safari support,
      padding: '10px',
      borderRadius: '10px',
      marginRight: '10px',
      marginBottom: '20px'
    }}>

{
          loading ?

          <div style={{flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex', marginBottom: '20px', marginTop: '20px'}}>
          <CircularProgress />
        </div>
        :
      <>
      {reqData &&
    <div style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px'}}>{reqData?.header}</div>
    }

<div >
      <div
      >
        <div 
  dangerouslySetInnerHTML={{ __html: reqData?.content }}
></div>

      </div>
    </div>


    </>

  }

    </div>

  );
};

export default Details;
