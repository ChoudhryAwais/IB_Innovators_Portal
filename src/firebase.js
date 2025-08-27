// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';


// const firebaseConfig = {
//   apiKey: "AIzaSyCg6EWB41zsWt7Hp7LN9iUKGoSuVGxMSYk",
//   authDomain: "ibinnovators-5df85.firebaseapp.com",
//   projectId: "ibinnovators-5df85",
//   storageBucket: "ibinnovators-5df85.appspot.com",
//   messagingSenderId: "787904298281",
//   appId: "1:787904298281:web:180c229047f15ae2ed4b38",
//   measurementId: "G-9QLN3TZM0N"
// };

const firebaseConfig = {
  apiKey: process.env.REACT_APP_URL,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGESENDERID,
  appId: process.env.REACT_APP_APPID,
  measurementId: process.env.REACT_APP_MEASUREMENTID
};

firebase.initializeApp(firebaseConfig)



// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app);

export const storage = getStorage(app);
export const db = getFirestore(app)