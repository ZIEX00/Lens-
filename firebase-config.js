import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyDHuBs0xZ6DQ6UeBWQWOnXnzyU1ss1gqzc",
    authDomain: "lens-1a4c5.firebaseapp.com",
    databaseURL: "https://lens-1a4c5-default-rtdb.firebaseio.com",
    projectId: "lens-1a4c5",
    storageBucket: "lens-1a4c5.firebasestorage.app",
    messagingSenderId: "254801418901",
    appId: "1:254801418901:web:8e90e841b46b8616ec599c",
    measurementId: "G-KBW0BHPSZR"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, database, storage };