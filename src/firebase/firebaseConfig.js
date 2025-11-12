// filepath: /fitness-cms-frontend/src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import Cookies from "js-cookie";
// importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js");
// importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js");

export const firebaseConfig = {
  apiKey: "AIzaSyAJXwqQZjz7m_CUZ1-TTp1pbeFXrUmTUBw",
  authDomain: "fitpro-74477.firebaseapp.com",
  projectId: "fitpro-74477",
  storageBucket: "fitpro-74477.firebasestorage.app",
  messagingSenderId: "447988273650",
  appId: "1:447988273650:web:1fcc681c248e9282b99b6b",
  measurementId: "G-MTD9JJ4F3W",
};

const app = initializeApp(firebaseConfig);

// export const messaging = getMessaging(app);
export const initializeFirebaseMessaging = async () => {
  try {
    // Kiểm tra xem trình duyệt có hỗ trợ service worker và notifications không
    if (!("serviceWorker" in navigator)) {
      console.log("Trình duyệt này không hỗ trợ service workers");
      return null;
    }

    if (!("Notification" in window)) {
      console.log("Trình duyệt này không hỗ trợ notifications");
      return null;
    }

    // Kiểm tra xem chúng ta có đang ở trên iOS Safari không
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS && isSafari) {
      // Từ iOS 15.4+, Safari đã hỗ trợ push notifications, nhưng cần kiểm tra thêm
      // Hiện tại chúng ta có thể hiển thị thông báo thay thế cho người dùng iOS
      console.log(
        "Push notifications có thể không hoạt động đầy đủ trên Safari iOS"
      );

      // Tùy chọn: triển khai giải pháp thay thế cho iOS
      // Ví dụ: sử dụng local notifications hoặc polling
      return null;
    }

    // Đăng ký service worker
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      {
        scope: "/",
      }
    );

    // Kiểm tra quyền thông báo
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Không được cấp quyền notification");
      return null;
    }

    // Khởi tạo Firebase Messaging
    const messaging = getMessaging(app);

    // Nhận FCM token
    const token = await getToken(messaging, {
      vapidKey:
        "BE7wmCbHI7KfeClY4SNjKe7C8WmDAhl1peyUX9CwMomLSnldnp3Qtq8h0vIwCyYcpJVp9gDSAkHbCAqS_6OWl60",
      serviceWorkerRegistration: registration,
    });
    Cookies.set("device_token", token, {
      expires: 1,
    });
    console.log("FCM Token:", token);

    // Xử lý tin nhắn khi ứng dụng đang mở (foreground)
    // onMessage(messaging, (payload) => {
    //   console.log('Message received in foreground:', payload);
    //   // Hiển thị thông báo tùy chỉnh trong ứng dụng của bạn
    //   showCustomNotification(payload);
    // });

    return token;
  } catch (error) {
    console.error("Lỗi khi cài đặt Firebase Messaging:", error);
    return null;
  }
};

// messaging.onBackgroundMessage((payload) => {
//   console.log("Received background message: ", payload);

//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: payload.notification.icon,
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });
