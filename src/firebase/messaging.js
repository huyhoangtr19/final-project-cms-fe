import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseConfig } from "./firebaseConfig";
import { initializeApp } from "firebase/app";
import Cookies from "js-cookie";

// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// export const requestNotificationPermission = () => {

// export const initializeFirebaseMessaging = async () => {
//   try {
//     // Kiểm tra xem trình duyệt có hỗ trợ service worker và notifications không
//     if (!('serviceWorker' in navigator)) {
//       console.log('Trình duyệt này không hỗ trợ service workers');
//       return null;
//     }

//     if (!('Notification' in window)) {
//       console.log('Trình duyệt này không hỗ trợ notifications');
//       return null;
//     }

//     // Kiểm tra xem chúng ta có đang ở trên iOS Safari không
//     const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
//     const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

//     if (isIOS && isSafari) {
//       // Từ iOS 15.4+, Safari đã hỗ trợ push notifications, nhưng cần kiểm tra thêm
//       // Hiện tại chúng ta có thể hiển thị thông báo thay thế cho người dùng iOS
//       console.log('Push notifications có thể không hoạt động đầy đủ trên Safari iOS');
      
//       // Tùy chọn: triển khai giải pháp thay thế cho iOS
//       // Ví dụ: sử dụng local notifications hoặc polling
//       return null;
//     }

//     // Đăng ký service worker
//     const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
//       scope: '/'
//     });

//     // Kiểm tra quyền thông báo
//     const permission = await Notification.requestPermission();
//     if (permission !== 'granted') {
//       console.log('Không được cấp quyền notification');
//       return null;
//     }

//     // Khởi tạo Firebase Messaging
//     const messaging = getMessaging(app);
    
//     // Nhận FCM token
//     const token = await getToken(messaging, {
//       vapidKey:  "BE7wmCbHI7KfeClY4SNjKe7C8WmDAhl1peyUX9CwMomLSnldnp3Qtq8h0vIwCyYcpJVp9gDSAkHbCAqS_6OWl60",
//       serviceWorkerRegistration: registration
//     });
// Cookies.set("device_token", token, {
//           expires: 1,
//         });
//     console.log('FCM Token:', token);

//     // Xử lý tin nhắn khi ứng dụng đang mở (foreground)
//     // onMessage(messaging, (payload) => {
//     //   console.log('Message received in foreground:', payload);
//     //   // Hiển thị thông báo tùy chỉnh trong ứng dụng của bạn
//     //   showCustomNotification(payload);
//     // });

//     return token;

//   } catch (error) {
//     console.error('Lỗi khi cài đặt Firebase Messaging:', error);
//     return null;
//   }
// };

// export const setupIOSFallback = (checkInterval = 30000) => {
//   // Chỉ sử dụng cho iOS
//   const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
//   if (!isIOS) return;

//   // Thiết lập polling để kiểm tra thông báo
//   setInterval(async () => {
//     try {
//       // Gọi API backend của bạn để kiểm tra thông báo mới
//       const response = await fetch('/api/check-notifications');
//       const notifications = await response.json();
      
//       if (notifications && notifications.length > 0) {
//         // Hiển thị thông báo trong ứng dụng
//         notifications.forEach(notification => {
//           showCustomNotification(notification);
//         });
//       }
//     } catch (error) {
//       console.error('Lỗi khi kiểm tra thông báo:', error);
//     }
//   }, checkInterval);
// };

  // Notification.requestPermission()
  //   .then(async (permission) => {
  //     if (permission === "granted") {
  //       console.log("Notification permission granted.");
  //       // Lấy token thiết bị
  //       const token = await getToken(messaging, {
  //         vapidKey:
  //           "BE7wmCbHI7KfeClY4SNjKe7C8WmDAhl1peyUX9CwMomLSnldnp3Qtq8h0vIwCyYcpJVp9gDSAkHbCAqS_6OWl60",
  //       });
  //       Cookies.set("device_token", token, {
  //         expires: 1,
  //       });
  //       return token;
  //     } else if (permission === "denied") {
  //       alert(
  //         "Notifications are blocked. Please enable them in your browser settings to receive updates."
  //       );
  //     } else {
  //       console.log("Notification permission");
  //     }
  //   })
  //   .then(async (currentToken) => {
  //     if (currentToken) {
  //       console.log("FCM registration token:", currentToken);
  //       // Gửi token này lên server của bạn để lưu trữ và sử dụng gửi thông báo
  //       // Bạn cần API trên server để xử lý việc này
  //     } else {
  //       // Show permission request UI
  //       console.log("Can not get FCM token, request permission first.");
  //     }
  //   })
  //   .catch((err) => {
  //     console.log("An error occurred while retrieving token. ", err);
  //   });
// };

export const requestForToken = async () => {
  try {
    const token = await messaging.getToken({
      vapidKey: "YOUR_VAPID_KEY_HERE", // Replace with your VAPID key
    });
    console.log("Token received: ", token);
    return token;
  } catch (error) {
    console.error("Error getting token: ", error);
  }
};

export const generateToken = async () => {
  try {
    const token = await Notification.requestPermission();
    console.log("token: ", token);
    if (token) {
      console.log("Token generated: ", token);
      // Send the token to your server or use it as needed
    } else {
      console.error("No token generated");
    }
  } catch (error) {
    console.error("Error generating token: ", error);
  }
};

onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  new Notification(notificationTitle, notificationOptions);
});
