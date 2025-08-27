import React, { useState, useContext, useEffect } from "react";
import { MyContext } from "../../Context/MyContext";

import { db } from "../../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  onSnapshot,
  where,
  updateDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";

export function TeacherFillingForm() {
  const { userDetails } = useContext(MyContext);

  const [isAvailable, setIsAvailable] = useState(null);
  const [availabilityPerWeek, setAvailabilityPerWeek] = useState(0);

  const [subjects, setSubjects] = useState({});

  useEffect(() => {
    const userRef = collection(db, "userList");
    let unsubscribe;

    if (userDetails?.email) {
      const q = query(userRef, where("email", "==", userDetails.email));

      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            setIsAvailable(data?.isAvailable || null);
            setSubjects(data?.subjects || {});
            setAvailabilityPerWeek(data?.availabilityPerWeek || 0);
          });
        },
        (error) => {
          console.error("Error fetching data: ", error);
        }
      );
    }

    return () => {
      // Unsubscribe from the snapshot listener when the component unmounts
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [
    userDetails?.email,
    db,
    setIsAvailable,
    setSubjects,
    setAvailabilityPerWeek,
  ]);

  const handleInputChange = async (value) => {
    setIsAvailable(value);

    if (userDetails?.email) {
      try {
        const userListRef = collection(db, "userList");

        const q = query(userListRef, where("email", "==", userDetails.email));

        const querySnapshot = await getDocs(q);

        // Loop through all matching documents and update the isAvailable field
        querySnapshot.forEach(async (doc) => {
          try {
            await updateDoc(doc.ref, { isAvailable: value });
            toast.success("Availability updated");
          } catch (error) {
            toast.error("Error updating availability");
          }
        });
      } catch (error) {
        toast.error("Error updating availability");
      }
    }
  };

  const handleSubjectChange = async (subject, isChecked) => {
    setSubjects((prevSubjects) => ({
      ...prevSubjects,
      [subject]: isChecked,
    }));

    // Update Firestore with the new subjects value
    if (userDetails?.email) {
      try {
        const userListRef = collection(db, "userList");

        const q = query(userListRef, where("email", "==", userDetails.email));

        const querySnapshot = await getDocs(q);

        // Loop through all matching documents and update the isAvailable field
        querySnapshot.forEach(async (doc) => {
          try {
            await updateDoc(doc.ref, {
              subjects: { ...subjects, [subject]: isChecked },
            });
            toast.success(`${subject} updated`);
          } catch (error) {
            toast.error(`Error updating ${subject}`);
          }
        });
      } catch (error) {
        toast.error(`Error updating ${subject}`);
      }
    }
  };

  const handleAvailabilityChange = async (e) => {
    setAvailabilityPerWeek(e.target.value);

    if (userDetails?.email) {
      try {
        const userListRef = collection(db, "userList");

        const q = query(userListRef, where("email", "==", userDetails.email));

        const querySnapshot = await getDocs(q);

        // Loop through all matching documents and update the isAvailable field
        querySnapshot.forEach(async (doc) => {
          try {
            await updateDoc(doc.ref, { availabilityPerWeek: e.target.value });
            toast.success("Availability Updated");
          } catch (error) {
            toast.error("Error updating availability");
          }
        });
      } catch (error) {
        toast.error("Error updating availability");
      }
    }
  };

  return (
    <div
    className="shadowAndBorder"
      style={{
        height: "max-content",
        marginBottom: "10px",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
        background: "rgba(255,255,255, 0.5)",
        backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
        WebkitBackdropFilter: "blur(4px)", // For Safari support,
        padding: "10px",
        borderRadius: "10px",
      }}
    >
    <h2 style={{ textAlign: "left", marginBottom: '20px' }}>Availability Form</h2>
      <div>
        <div style={{ display: "flex", width: "100%", flex: 1 }}>
          <div style={{ flex: 3, textAlign: "left" }}>
            <h4>{""}</h4>
          </div>

          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "medium", fontWeight: "bold" }}>Yes</div>
          </div>

          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "medium", fontWeight: "bold" }}>No</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            flex: 1,
            marginBottom: "20px",
          }}
        >
          <div style={{ flex: 3, textAlign: "left", fontSize: "medium" }}>
            <div style={{ fontSize: "medium" }}>
              I am available to support new students
            </div>
          </div>

          <div style={{ flex: 1, textAlign: "center" }}>
            <input
              type="radio"
              id="yes"
              name="availability"
              value="Yes"
              checked={isAvailable === "Yes"}
              onChange={() => handleInputChange("Yes")}
              style={{ transform: "scale(1.3)" }}
            />
          </div>

          <div style={{ flex: 1, textAlign: "center" }}>
            <input
              type="radio"
              id="no"
              name="availability"
              value="No"
              checked={isAvailable === "No"}
              onChange={() => handleInputChange("No")}
              style={{ transform: "scale(1.3)" }}
            />
          </div>
        </div>

        {Object.keys(subjects).length > 0 && (
          <>
            {isAvailable === "Yes" && (
              <>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "medium", fontWeight: "bold" }}>
                    I can support Students in the following Subjects
                  </div>

                  {Object.keys(subjects).sort((a, b) => a.localeCompare(b)).map((subject, index) => (
                    <div
                      key={subject}
                      style={{
                        display: "flex",
                        width: "100%",
                        flex: 1,
                        marginTop: "5px",
                        borderTop: index !== 0 ? "2px solid #ccc" : "none",
                        paddingTop: "7px",
                      }}
                    >
                      <div style={{ flex: 3, textAlign: "left" }}>
                        <div style={{ fontSize: "medium" }}>{subject}</div>
                      </div>
                      <div style={{ flex: 2, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          id={subject}
                          name={subject}
                          value={subject}
                          style={{ transform: "scale(1.3)" }}
                          checked={subjects[subject]}
                          onChange={(e) =>
                            handleSubjectChange(subject, e.target.checked)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", width: "100%", flex: 1 }}>
  <div style={{ flex: 5, textAlign: "left"}}>
    <div style={{ fontSize: "medium", fontWeight: "bold", width: '70%' }}>
      Availability Per Week
    </div>
  </div>

  <div style={{
    flex: 1,
    textAlign: "center",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  }}>
    <div>
      <input
        type="number"
        value={availabilityPerWeek}
        onChange={(e) => handleAvailabilityChange(e)}
        style={{
          background: "rgba(255,255,255,0.4)",
          outline: "none",
          border: "1px solid #aeaeae",
          borderRadius: "5px",
          maxWidth: '60px', marginRight: '5px', textAlign: 'center'
        }}
      />
    </div>
    <div style={{ flex: 1 }}>Hours</div>
  </div>
</div>

              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
