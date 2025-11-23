import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCD3cUABCgpOd7_bMHcq_xeXntRzbOsbKU",
    authDomain: "drivesync-757cf.firebaseapp.com",
    projectId: "drivesync-757cf",
    storageBucket: "drivesync-757cf.firebasestorage.app",
    messagingSenderId: "147479660562",
    appId: "1:147479660562:web:1b5f020ded700e8022f0cb",
    measurementId: "G-EH37RTPS1R"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

let analytics;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, analytics };
