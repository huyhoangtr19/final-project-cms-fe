importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyAJXwqQZjz7m_CUZ1-TTp1pbeFXrUmTUBw",
  authDomain: "actiwell-74477.firebaseapp.com",
  projectId: "actiwell-74477",
  storageBucket: "actiwell-74477.firebasestorage.app",
  messagingSenderId: "447988273650",
  appId: "1:447988273650:web:1fcc681c248e9282b99b6b",
  measurementId: "G-MTD9JJ4F3W",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  try {
    console.log("Received background message: ", payload);
    // Customize notification here
    const notificationTitle =
      payload.notification.title || "Background message title";
    const notificationOptions = {
      body: payload.notification.body || "Background message body",
      icon: payload.notification.icon || "/firebase-logo.png",
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  } catch (e) {
    console.log("Error in background message: ", e);
  }
});
