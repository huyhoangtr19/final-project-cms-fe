// Function Name : App
// Created date :  19/7/24             by :  NgVinh
// Updated date :  22/7/24             by :  NgVinh
import Cookies from "js-cookie";
import PropTypes from "prop-types";
import React, { useEffect } from "react";

import { Routes, Route } from "react-router-dom";
import { connect } from "react-redux";

import { useSelector } from "react-redux";
import { createSelector } from "reselect";

// Import Routes all
import { authProtectedRoutes, publicRoutes } from "./routes/index";

// Import all middleware
import Authmiddleware from "./routes/route";

// layouts Format
import VerticalLayout from "./components/VerticalLayout/";
import HorizontalLayout from "./components/HorizontalLayout/";
import NonAuthLayout from "./components/NonAuthLayout";
import "react-toastify/dist/ReactToastify.css";
// Import scss
import "./assets/scss/theme.scss";

// Import Firebase Configuration file
// import { initFirebaseBackend } from "./helpers/firebase_helper"

import fakeBackend from "/src/helpers/AuthType/fakeBackend";
import {
  handleGetInformationAdmin,
  handleGetOperatorForAdmin,
} from "./utils/app";
import { ToastContainer } from "react-toastify";
import Pages404 from "./pages/Utility/pages-404";
import { initializeFirebaseMessaging } from "./firebase/firebaseConfig";
// import { initializeFirebaseMessaging } from "./firebase/messaging";
// import { onMessage } from "firebase/messaging";
// import { messaging } from "./firebase/firebaseConfig";

// Activating fake backend
fakeBackend();

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_APP_APIKEY,
//   authDomain: import.meta.env.VITE_APP_AUTHDOMAIN,
//   databaseURL: import.meta.env.VITE_APP_DATABASEURL,
//   projectId: import.meta.env.VITE_APP_PROJECTID,
//   storageBucket: import.meta.env.VITE_APP_STORAGEBUCKET,
//   messagingSenderId: import.meta.env.VITE_APP_MESSAGINGSENDERID,
//   appId: import.meta.env.VITE_APP_APPID,
//   measurementId: import.meta.env.VITE_APP_MEASUREMENTID,
// };

// init firebase backend
// initFirebaseBackend(firebaseConfig)

const App = (props) => {
  const isToken = sessionStorage.getItem("isToken");
  const isAccessToken = Cookies.get("accessToken");
  const LayoutProperties = createSelector(
    (state) => state.Layout,
    (layout) => ({
      layoutType: layout.layoutType,
    })
  );
  useEffect(() => {
    initializeFirebaseMessaging();
    // if ('serviceWorker' in navigator && 'PushManager' in window) {
    //   navigator.serviceWorker?.register('/firebase-messaging-sw.js')
    //     .then(registration => {
    //       console.log('Service Worker registered with scope:', registration.scope);
    //       // Khởi tạo Firebase Messaging ở đây hoặc trong service worker
    //        requestNotificationPermission();
    //     }).catch(error => {
    //       console.error('Error registering service worker:', error);
    //     });
    // } else {
    //   console.log("Service Worker or PushManager is not supported in this browser.");
    // }
  //  onMessage(messaging, (payload) => {
  //     console.log('Message received. ', payload);
  //     // Hiển thị thông báo hoặc thực hiện hành động khác
  //     const notificationTitle = payload.notification.title || "Background message title";
  //     const notificationOptions = {
  //       body: payload.notification.body || "Background message body",
  //       icon: payload.notification.icon || "/firebase-logo.png",
  //     };
  //     new Notification(notificationTitle, notificationOptions);
  //  } )
  }, []);

  useEffect(() => {
    if (isAccessToken && !isToken) {
      sessionStorage.setItem("isToken", true);
      sessionStorage.setItem("accessToken", isAccessToken);
    }
    if (isToken) {
      handleGetOperatorForAdmin();
      handleGetInformationAdmin();
    }
  }, [isToken, isAccessToken]);

  // useEffect()

  const { layoutType } = useSelector(LayoutProperties);

  function getLayout(layoutType) {
    let layoutCls = VerticalLayout;
    switch (layoutType) {
      case "horizontal":
        layoutCls = HorizontalLayout;
        break;
      default:
        layoutCls = VerticalLayout;
        break;
    }
    return layoutCls;
  }

  const Layout = getLayout(layoutType);

  return (
    <React.Fragment>
      <Routes>
        {publicRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={<NonAuthLayout>{route.component}</NonAuthLayout>}
            key={idx}
            exact={true}
          />
        ))}

        {authProtectedRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={
              <Authmiddleware requiredPermission={route.permission}>
                <Layout>{route.component}</Layout>
              </Authmiddleware>
            }
            key={idx}
            exact={true}
          />
        ))}
        <Route path="*" element={<Pages404 />} />
      </Routes>
      <ToastContainer />
    </React.Fragment>
  );
};

App.propTypes = {
  layout: PropTypes.any,
};

const mapStateToProps = (state) => {
  return {
    layout: state.Layout,
  };
};

export default connect(mapStateToProps, null)(App);
