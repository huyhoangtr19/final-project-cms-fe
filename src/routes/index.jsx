import React from "react";
import { Navigate } from "react-router-dom";

import i18n from "../i18n";

import Dashboard from "../pages/Dashboard";
import Booking from "../pages/Booking";
import BookingCreate from "../pages/Booking/BookingCreate";
import ClassInfo from "../pages/Class/ClassInfo";
import Sale from "../pages/Sale";
import SaleScreen from "../pages/Sale/SaleScreen";
import Customer from "../pages/Customer";
import CustomerDetail from "../pages/Customer/CustomerDetail";
import Staff from "../pages/Staff";
import StaffDetail from "../pages/Staff/StaffDetail";
import Service from "../pages/Service";
import Package from "../pages/Package";
import Settings from "../pages/Settings";
import UserProfile from "../pages/Authentication/user-profile";
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";

const authProtectedRoutes = [
  {
    path: "/dashboard",
    component: <Dashboard />,
    permission: "all",
    title: i18n.t("Dashboard"),
    subtitle: i18n.t("Dashboard"),
  },
  {
    path: "/booking",
    component: <Booking />,
    permission: "booking:view_list",
    title: i18n.t("booking"),
  },
  {
    path: "/booking/create",
    component: <BookingCreate />,
    permission: "booking:create",
    title: i18n.t("booking_list"),
    subtitle: i18n.t("add_new_booking"),
  },
  {
    path: "/class-info",
    component: <ClassInfo />,
    permission: "class:view_list",
    title: i18n.t("class"),
  },
  {
    path: "/sale",
    component: <Sale />,
    permission: "sale_order:view_list",
    title: i18n.t("sales"),
  },
  {
    path: "/sale/create",
    component: <SaleScreen type="create" />,
    permission: "sale_order:create",
    title: i18n.t("sales_order_list"),
    subtitle: i18n.t("add_new_sale_order"),
  },
  {
    path: "/customer",
    component: <Customer />,
    permission: "customer:view_list",
    title: i18n.t("customer"),
  },
  {
    path: "/customer/create",
    component: <CustomerDetail type="create" />,
    permission: "customer:create",
    title: i18n.t("contact_list"),
    subtitle: i18n.t("add_new_contact"),
  },
  {
    path: "/staff",
    component: <Staff />,
    permission: "staff:view_list",
    title: i18n.t("staff"),
  },
  {
    path: "/staff/create",
    component: <StaffDetail type="create" />,
    permission: "staff:create",
    title: i18n.t("contact_list"),
    subtitle: i18n.t("add_new_staff"),
  },
  {
    path: "/service",
    component: <Service />,
    permission: "service:view_list",
    title: i18n.t("service"),
    subtitle: i18n.t("service_list"),
  },
  {
    path: "/package",
    component: <Package />,
    permission: "package:view_list",
    title: i18n.t("package"),
    subtitle: i18n.t("package_list"),
  },
  {
    path: "/settings",
    component: <Settings />,
    permission: "all",
    title: i18n.t("settings"),
  },
  {
    path: "/profile",
    component: <UserProfile />,
    permission: "all",
    title: i18n.t("account_information"),
  },
  {
    path: "/",
    exact: true,
    component: <Navigate to="/dashboard" />,
  },
];

const publicRoutes = [
  { path: "/login", component: <Login /> },
  { path: "/logout", component: <Logout /> },
];

export { authProtectedRoutes, publicRoutes };
