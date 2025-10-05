import React from "react";
import { useEffect } from "react";
import { createContext } from "react";
import { useState } from "react";
import { db } from "../firebase";
import {
  getDocs,
  collection,
  where,
  query,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import toast from "react-hot-toast";
import moment from "moment-timezone";
import axios from "axios";

export const MyContext = createContext({});

export const ContextProvider = ({ children }) => {
  const [userId, setUserId] = useState(null)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userDetails, setUserDetails] = useState([]);
  const [studentForm, setStudentForm] = useState({});
  const [subjectsArray, setSubjectArray] = useState([]);
  const [subjectsWithCategory, setSubjectsWithCategory] = useState([]);


  const [sideBarShowing, setSideBarShowing] = useState(false);
  const [navBarShowing, setNavBarShowing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  const auth = getAuth();

  
  const calculateHoursLeft = (hourlyRateInGBP, creditsInGBP) => {
    return Math.trunc(creditsInGBP / hourlyRateInGBP);
};

  
  

  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      setExchangeRates(response.data.rates);
    } catch (error) {
      toast.error("Error loading your hourly rates. Please reload.");
    }
  };

  function convertToGBP(priceInUsd) {
    if (!exchangeRates) {
      return 0;
    }
    return (priceInUsd * exchangeRates.GBP).toFixed(2); // Convert price and fix to 2 decimal points
  }

  function convertToUSD(priceInGbp) {
    if (!exchangeRates) {
      return 0;
    }
    return (priceInGbp / exchangeRates.GBP).toFixed(2);
  }

  const generateRandomId = () => {
    // Generate a random number between 10000000 and 9999999999
    const min = 10000000; // 8-digit minimum
    const max = 9999999999; // 10-digit maximum
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    
    return randomId.toString();
  };

  // FETCHDATA
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      let userId = user ? user.uid : null;
      setUserId(userId)

      if (userId) {
        setSideBarShowing(true);
        setNavBarShowing(true);
        const userDocRef = doc(db, "userList", userId);
        const timeZone = moment.tz.guess();

        const unsubscribeSnapshot = onSnapshot(
          userDocRef,
          (doc) => {
            if (doc.exists()) {
              const userDetails = doc.data();
              setUserDetails({ ...userDetails, timeZone: timeZone }); // Set the user details in your context
              setUserType(userDetails.type);
              setIsUserLoggedIn(true);
            } else {
              console.log("User not found in Firestore");
              setUserDetails({});
              setIsUserLoggedIn(false);
            }
            setLoading(false);
            setDataFetched(true);
          },
          (error) => {
            toast.error("Error fetching user");
            setLoading(false);
            setDataFetched(true);
          }
        );

        return () => {
          unsubscribeSnapshot();
        };
      } else {
        setSideBarShowing(false);
        setNavBarShowing(false);
        setIsUserLoggedIn(false);
        setUserDetails({});
        setDataFetched(true);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [auth]);

  // EXCHANGE RATES
  useEffect(() => {
    fetchExchangeRates();
  }, []);

  
const timeZoneConverter = (dateString, timeString, receivedTimeZone) => {
  // Combine date and time into a single string
  const dateTimeString = `${dateString}T${timeString}`;

  // Parse the combined string into a moment object and convert to the target timezone
  const dateTime = moment.tz(dateTimeString, receivedTimeZone);

  // Format the date and time
  const formattedDate = dateTime.format('D MMMM, YYYY');
  const formattedTime = dateTime.format('h:mm A');

  return { date: formattedDate, time: formattedTime };
};

  // <- Ensure useEffect runs when userId changes

  useEffect(() => {
    if (isUserLoggedIn) {
      setSideBarShowing(true);
      setNavBarShowing(true);
    } else {
      setSideBarShowing(false);
      setNavBarShowing(false);
    }
  }, [isUserLoggedIn]);

    useEffect(() => {
    const fetchSubjects = () => {
      try {
        const userListRef = collection(db, "subjectsAvailable");

        const unsubscribe = onSnapshot(userListRef, (querySnapshot) => {
          const subjectsData = [];
          const categorizedSubjectsData = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();

            // ✅ Old format (array of strings)
            if (Array.isArray(data.subjects)) {
              subjectsData.push(...data.subjects);
            }

            // ✅ New format (array of objects)
            if (Array.isArray(data.subjectsWithCategory)) {
              categorizedSubjectsData.push(...data.subjectsWithCategory);
            }
          });

          // Flatten and sort old subjects
          const flattenedAndSortedSubjects = subjectsData.flat().sort();

          setSubjectArray(flattenedAndSortedSubjects);
          setSubjectsWithCategory(categorizedSubjectsData);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching subjects: ", error);
      }
    };

    fetchSubjects();
  }, []);


  async function addNotification(message, userId) {
    const detail = {
      id: `${userDetails?.notifications?.length}${Math.random()
        .toString(36)
        .substr(2, 10)}`,
      message,
      read: false,
      time: new Date(),
    };

    try {
      // Query Firestore to get user details based on userId
      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userId));

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // User document found
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.notifications && Array.isArray(userData.notifications)) {
          // Notifications array already exists, append new detail
          const updatedNotifications = [...userData.notifications, detail];
          await updateDoc(userDoc.ref, { notifications: updatedNotifications });
        } else {
          // Notifications array doesn't exist, create and append new detail
          await updateDoc(userDoc.ref, { notifications: [detail] });
        }
      } else {
        console.error("Failed to add notification");
      }
    } catch (error) {
      console.error("Failed to add notification", error);
    }
  }

  async function adminAddNotification(message) {
    const notificationData = { id: "", message, read: false, time: new Date() };

    try {
      // Add a new document to the 'adminNotifications' collection
      const docRef = await addDoc(
        collection(db, "adminNotifications"),
        notificationData
      );

      // Update the 'id' field with the document ID generated by Firestore
      await updateDoc(docRef, { id: docRef.id });

    } catch (error) {
      console.error("Failed to add notification ");
    }
  }

  const [notificationLength, setNotificationLength] = useState(0);

  useEffect(() => {
    if (userDetails?.userType === "admin") {
      setNotificationLength(0);
    } else if (userDetails?.userType === "teacher") {
      setNotificationLength(userDetails?.notifications?.length);
    } else if (userDetails?.userType === "student") {
      setNotificationLength(userDetails?.notifications?.length);
    }
  }, [userDetails?.notifications, userDetails?.userType]);

  return (
    <MyContext.Provider
      value={{
        isUserLoggedIn,
        setIsUserLoggedIn,
        userDetails,
        setUserDetails,
        userType,
        setUserType,
        studentForm,
        setStudentForm,
        subjectsArray,
        subjectsWithCategory,          // new categorized subjects
        addNotification,
        adminAddNotification,
        notificationLength,
        sideBarShowing,
        navBarShowing,
        setNavBarShowing,
        setSideBarShowing,
        loading,
        convertToGBP,
        timeZoneConverter,
        generateRandomId,
        calculateHoursLeft,
        userId,
        convertToUSD,
        exchangeRates
      }}
    >
      {children}
    </MyContext.Provider>
  );
};
