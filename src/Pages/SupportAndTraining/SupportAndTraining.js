import React from "react";
import {  useEffect, useState } from "react";
import { TopSearch } from "./TopSearch";
import { SearchBlogs } from "./SearchBlogs";


import { db } from "../../firebase";
import {
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
import toast from "react-hot-toast";
import TopHeading from "../../Components/TopHeading/TopHeading";

export const SupportAndTraining = () => {

  const [search, setSearch] = useState("");
  
  const [blogs, setBlogs] = useState([]);

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    try{
      setLoading(true)
    const q = query(collection(db, "SupportBlogs"));

    // Start real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBlogs(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });

    // Stop listening for changes when component unmounts
    return () => unsubscribe();
  } catch(e){
    toast.error("Error Fetching Blogs")
  } finally{
    setLoading(false)
  }
  }, []);



  return (
    <React.Fragment>
      
      <TopHeading>Support & Training</TopHeading>


        <TopSearch blogs={blogs} search={search} setSearch={setSearch} />
        <SearchBlogs loading={loading}  blogs={blogs} search={search} setSearch={setSearch}/>

      {/* <div className={styles.dashboardContainer} >

      

        <JobList />

      <TeacherSubjects />

      </div> */}

    </React.Fragment>
  );
};
