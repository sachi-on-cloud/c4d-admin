importScripts(
    "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
  );
  importScripts(
    "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
  );
  
//   firebase.initializeApp({
//     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//     appId: import.meta.env.VITE_FIREBASE_APP_ID,
//   });
  firebase.initializeApp({
    apiKey: "AIzaSyA4AXmJH63vPQHJp0Hb3lSlABjB-BlT0UI",
    authDomain: "c4dadmin-3a69e.firebaseapp.com",
    projectId: "c4dadmin-3a69e",
    storageBucket: "c4dadmin-3a69e.firebasestorage.app",
    messagingSenderId: "494826851721",
    appId: "1:494826851721:web:466a0b430ec6b0ba20a558"
  });
  const messaging = firebase.messaging();
  
  messaging.onBackgroundMessage((payload) => {
    console.log("Received background message:", payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.image,
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
  