// Function Name : operator Page
// Created date :  19/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh

import { createSlice } from "@reduxjs/toolkit";
import { set } from "lodash";

const initialState = {
  hasOperator: false,
  operator: null,
  locationOperator:[],
  firebaseMess:null,
};
export const operatorSlice = createSlice({
  name: "operator",
  initialState: initialState,
  reducers: {
    setHasOperator: (state, action) => {
      state.hasOperator = action.payload;
    },
    setOperator: (state, action) => {
      state.operator = action.payload;
    },
    setLocationOperator: (state, action) => {
      state.locationOperator = action.payload;
    },
    setFirebaseMess: (state, action) => {
      state.firebaseMess = action.payload;
    },
  },
});

export const { setHasOperator, setOperator, setLocationOperator, setFirebaseMess } = operatorSlice.actions;
export const operatorSelector = (state) => state.auth;
export default operatorSlice.reducer;
