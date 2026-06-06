// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXO9h5noJ-LeNvT3_OKYZ2b5L7W1mS3T4",
  authDomain: "questlearn-82dc3.firebaseapp.com",
  databaseURL: "https://questlearn-82dc3-default-rtdb.firebaseio.com",
  projectId: "questlearn-82dc3",
  storageBucket: "questlearn-82dc3.firebasestorage.app",
  messagingSenderId: "608950941190",
  appId: "1:608950941190:web:12cba0e674381ee3823587",
  measurementId: "G-R9XW3TCPP9"
};

// Initialize Firebase only once
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();
