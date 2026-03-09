// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQXzb07FKie4fijNwJTvwx7Ef6ufE7pOU",
  authDomain: "onlycashuniversity-9dc25.firebaseapp.com",
  projectId: "onlycashuniversity-9dc25",
  storageBucket: "onlycashuniversity-9dc25.firebasestorage.app",
  messagingSenderId: "582032106132",
  appId: "1:582032106132:web:fc6c17807adaa449f08a81",
  measurementId: "G-PQQYGF0NXL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();