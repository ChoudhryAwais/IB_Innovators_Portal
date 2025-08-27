import React, { useEffect, useState, useContext } from "react";
import { db } from "../../firebase";
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
import { MyContext } from "../../Context/MyContext";

export function UpcomingAndCanceledSessionsStudent(){

    const [students, setStudents] = useState([]);
    const {userDetails} = useContext(MyContext);

    const [completedSessions, setCompletedSessions] = useState([]);
    
    const [deletedSessions, setDeletedSessions] = useState([])

    const [upcomingSessions, setUpcomingSessions] = useState([]);

    useEffect(() => {
        const fetchData = () => {
          if (userDetails?.userId) {
            const linkedRef = collection(db, "Linked");
            const q = query(linkedRef, where("studentId", "==", userDetails?.userId));
      
            // Listen to the query snapshot changes
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
              const updatedCompletedSessions = [];
              const updatedDeletedSessions = [];
              const updatedUpcomingSessions = [];
      
              querySnapshot.forEach((doc) => {
                const data = doc.data();
                const linkId = doc.id;

                const upcoming = data?.sessionInfo;

if (upcoming && Object.keys(upcoming).length !== 0) {
  updatedUpcomingSessions.push({
    ...upcoming,
    id: linkId,
    subject: data.subject,
    studentName: data.studentName,
    teacherName: data.teacherName,
  });
}

      
                // Extracting completed sessions
const completed = data?.invoices || [];

completed.forEach((session) => {
  const {
    teacherId,
    status,
    sessionPrice,
    teacherName,
    createdAt,
    studentName,
    studentId,
    sessionInfo,
    subject,
    amount,
    ...rest
  } = session;

  updatedCompletedSessions.push({
    id: linkId,
    subject: subject,
    studentName: studentName,
    teacherName: teacherName,
    sessionPrice: sessionPrice,
    ...sessionInfo, // Assuming you want to include all fields from sessionInfo
    // Add additional fields if needed
  });
});

      
                // Extracting deleted sessions
                const deleted = data?.deletedSessions || [];
                deleted.forEach((session) => {
                  const { id, subject, studentName, teacherName, ...rest } = session;
                  updatedDeletedSessions.push({
                    id: linkId,
                    subject: data.subject,
                    studentName: data.studentName,
                    teacherName: data.teacherName,
                    ...rest,
                  });
                });
              });

              setUpcomingSessions(updatedUpcomingSessions)
              setCompletedSessions(updatedCompletedSessions);
              setDeletedSessions(updatedDeletedSessions);
            });
      
            return () => {
              // Unsubscribe from the snapshot listener when the component unmounts
              unsubscribe();
            };
          }
        };
      
        fetchData();
      }, [userDetails?.userId]); // Trigger the effect whenever userDetails?.userId changes or on initial mount




    const [showAll, setShowAll] = useState(false);
    const completedSessionsToShow = showAll ? completedSessions : completedSessions.slice(0, 2);

    const handleShowMore = () => {
      setShowAll(!showAll);
    };


    return(
        <div  style={{
            flex: 1,
            width: "100%",
          }}>


            <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            margin: "2rem",
            padding: "1rem",
            flex: 1,
          }}>
                <h2>Upcoming Sessions({upcomingSessions?.length})</h2>
                {upcomingSessions?.map((item, index) => 

                    <div style={{padding: '1rem', background: '#eee', margin: '10px', borderRadius: '10px'}}>
                      <div style={{fontSize: 'xx-large', fontWeight: 'bold'}}>{item?.subject}</div>
                        <div  style={{fontSize: 'large', fontWeight: 'bold', color: 'red'}}>Scheduled On: {item?.time} || {item?.date}</div>
                        <div style={{fontSize: 'large'}}>Tutor: {item?.teacherName}</div>
                        <div>Note: {item?.note}</div>

                    </div>
                )}
            </div>






            <div style={{
      backgroundColor: "rgb(212, 255, 218)",
      borderRadius: "8px",
      margin: "2rem",
      padding: "1rem",
      flex: 1,
    }}>
      <h2>Completed Sessions({completedSessions?.length})</h2>
      
      {completedSessions.length > 2 && 
        <div style={{margin: '10px', flex: 1, display: 'flex', justifyContent: 'center'}}>
        <button  onClick={handleShowMore} style={{ textAlign: 'center' }}>{!showAll ? "Show All" : "Show Less" }</button>
        </div>
        }
      {completedSessionsToShow.map((item, index) => (
        <div style={{padding: '1rem', background: 'darkgreen', margin: '10px', borderRadius: '10px', color: 'white'}}>
<div style={{fontSize: 'xx-large', fontWeight: 'bold'}}>{item?.subject}</div>
  <div  style={{fontSize: 'large', fontWeight: 'bold'}}>Conducted On: {item?.time} || {item?.date}</div>
  <div style={{fontSize: 'large'}}>Amount: £ {item?.sessionPrice}</div>
  <div style={{fontSize: 'large'}}>Tutor: {item?.teacherName}</div>
  <div>Note: {item?.note}</div>

</div>
      ))}
    </div>

            {/* <div style={{
            backgroundColor: "rgb(212, 255, 218)",
            borderRadius: "8px",
            margin: "2rem",
            padding: "1rem",
            flex: 1,
          }}>
                <h2>Completed Sessions({completedSessions?.length})</h2>
                {completedSessions?.map((item, index) => 

<div style={{padding: '1rem', background: 'darkgreen', margin: '10px', borderRadius: '10px', color: 'white'}}>
<div style={{fontSize: 'xx-large', fontWeight: 'bold'}}>{item?.subject}</div>
  <div  style={{fontSize: 'large', fontWeight: 'bold'}}>Conducted On: {item?.time} || {item?.date}</div>
  <div style={{fontSize: 'large'}}>Amount: £ {item?.sessionPrice}</div>
  <div style={{fontSize: 'large'}}>Tutor: {item?.teacherName}</div>
  <div>Note: {item?.note}</div>

</div>
                )}
            </div> */}


            {/* <div style={{
            backgroundColor: "rgb(255, 228, 228)",
            borderRadius: "8px",
            margin: "2rem",
            padding: "1rem",
            flex: 1,
          }}>
                <h2>Deleted Sessions({deletedSessions?.length})</h2>
                {deletedSessions?.map((item, index) => 

                    <div style={{color: 'white', padding: '1rem', background: 'darkred', margin: '10px', borderRadius: '10px'}}>
                        <div style={{fontSize: 'large'}}>{index+1}: {item?.studentName} || {item?.subject}</div>
                        <div>{item?.time} || {item?.date}</div>
                        <div>{item?.note}</div>

                    </div>
                )}
            </div> */}

        </div>
    )
}