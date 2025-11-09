// Function Name : Login Page
// Created date :  19/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh

import { produce } from "immer";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: "",
  isToken: false,
  userInfo: null,
  permissionUser:[
    "operator:create",
    "operator:update_info",
    "operator:update_status",
    "location:create",
    "location:view_list",
    "location:view_detail",
    "location:update_info",
    "location:update_status",
    "location:delete",
    "service:create",
    "service:view_list",
    "service:view_detail",
    "service:update_info",
    "service:update_status",
    "service:delete",
    "package:create",
    "package:view_list",
    "package:view_detail",
    "package:update_info",
    "package:update_status",
    "package:delete",
    "staff:create",
    "staff:view_list",
    "staff:view_detail",
    "staff:update_info",
    "staff:update_status",
    "staff:delete",
    "staff:create_schedule",
    "staff:view_schedule",
    "staff:delete_schedule",
    "customer:create",
    "customer:view_list",
    "customer:view_detail",
    "customer:update_info",
    "customer:active_account",
    "customer:delete",
    "customer:view_booking_history",
    "customer:view_purchasing_history",
    "class:view_class_schedule",
    "class:view_list",
    "class:create",
    "class:view_detail",
    "class:update_info",
    "class:update_status",
    "class:delete",
    "class:view_list_schedule",
    "class:create_schedule",
    "class:view_detail_schedule",
    "class:update_schedule",
    "class:cancel_schedule",
    "class:delete_schedule",
    "product_category:create",
    "product_category:view_list",
    "product_category:view_detail",
    "product_category:update_info",
    "product_category:update_status",
    "product_category:delete",
    "product:create",
    "product:view_list",
    "product:view_detail",
    "product:update_info",
    "product:delete",
    "sale_order:create",
    "sale_order:view_list",
    "sale_order:view_detail",
    "sale_order:update_info",
    "sale_order:update_status",
    "sale_order:delete",
    "booking:create",
    "booking:view_list",
    "booking:checkin",
    "booking:view_detail",
    "booking:update_info",
    "booking:cancel",
    "user:create",
    "user:view_list",
    "user:view_detail",
    "user:update_info",
    "review:view_list",
    "review:view_detail"
],
};
export const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setIsToken: (state, action) => {
      state.isToken = action.payload;
    },

    setUserInfo: (state, action) => {
      return produce(state, (draftState) => {
        draftState.userInfo = action.payload;
      });
    },
    setPermissionUser:(state,action)=>{
      state.permissionUser = action.payload
    }
  },
});

export const { setToken, setIsToken, setUserInfo ,setPermissionUser} = authSlice.actions;
export const authSelector = (state) => state.auth;
export default authSlice.reducer;
