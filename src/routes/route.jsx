// Function Name : Login Page
// Created date :  19/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh

import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";

import Cookies from "js-cookie";
import { isPermissionScreen } from "../utils/app";

const Authmiddleware = (props) => {
  let cookieListPermission = Cookies.get("permissionUser")?  JSON.parse(Cookies.get("permissionUser")) : []
  if (!sessionStorage.getItem("isToken") && !Cookies.get("accessToken")) {
    return (
      <Navigate to={{ pathname: "/login", state: { from: props.location } }} />
    );
  }
  
  useEffect(() => {
    if(Cookies.get("permissionUser")){
      cookieListPermission = JSON.parse(Cookies.get("permissionUser"))
    }
    
  },[Cookies.get("permissionUser")])
  if (
    !isPermissionScreen(
      props.requiredPermission,
      cookieListPermission
    )
  ) {
    return (
      <Navigate to={{ pathname: "/dashboard", state: { from: props.location } }} />
    );
  }
  return <React.Fragment>{props.children}</React.Fragment>;
};

export default Authmiddleware;
