// Function Name : Routes
// Created date :  19/7/24             by :  NgVinh
// Updated date :  1/8/24              by :  NgVinh

import React from "react";
import { Navigate } from "react-router-dom";

// Pages Component
import Chat from "../pages/Chat/Chat";

// // File Manager
import FileManager from "../pages/FileManager/index";

// // Profile
import UserProfile from "../pages/Authentication/user-profile";

// Pages Calendar
import Calendar from "../pages/Calendar/index";

// // //Tasks
import TasksList from "../pages/Tasks/tasks-list";
import TasksCreate from "../pages/Tasks/tasks-create";
import TasksKanban from "../pages/Tasks/tasks-kanban";

// // //Projects
import ProjectsGrid from "../pages/Projects/projects-grid";
import ProjectsList from "../pages/Projects/projects-list";
import ProjectsOverview from "../pages/Projects/ProjectOverview/projects-overview";
import ProjectsCreate from "../pages/Projects/projects-create";

// // //Ecommerce Pages
// import EcommerceProducts from "../pages/Ecommerce/EcommerceProducts";
// import EcommerceProductDetail from "../pages/Ecommerce/EcommerceProductDetail/index";
// import EcommerceOrders from "../pages/Ecommerce/EcommerceOrders/index";
// import EcommerceCustomers from "../pages/Ecommerce/EcommerceCustomers/index";
// import EcommerceCart from "../pages/Ecommerce/EcommerceCart";
// import EcommerceCheckout from "../pages/Ecommerce/EcommerceCheckout";
// import EcommerceShops from "../pages/Ecommerce/EcommerceShops/index";
// import EcommerenceAddProduct from "../pages/Ecommerce/EcommerceAddProduct";

// //Email
// import EmailInbox from "../pages/Email/email-inbox";
// import EmailRead from "../pages/Email/email-read";
// import EmailBasicTemplte from "../pages/Email/email-basic-templte";
// import EmailAlertTemplte from "../pages/Email/email-template-alert";
// import EmailTemplateBilling from "../pages/Email/email-template-billing";

// //Invoices
import InvoicesList from "../pages/Invoices/invoices-list";
import InvoiceDetail from "../pages/Invoices/invoices-detail";

// // Authentication related pages
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";
import ForgetPwd from "../pages/Authentication/ForgetPassword";

// //  // Inner Authentication
import Login1 from "../pages/AuthenticationInner/Login";
import Login2 from "../pages/AuthenticationInner/Login2";
import Register1 from "../pages/AuthenticationInner/Register";
import Register2 from "../pages/AuthenticationInner/Register2";
import Recoverpw from "../pages/AuthenticationInner/Recoverpw";
import Recoverpw2 from "../pages/AuthenticationInner/Recoverpw2";
import ForgetPwd1 from "../pages/AuthenticationInner/ForgetPassword";
import ForgetPwd2 from "../pages/AuthenticationInner/ForgetPassword2";
import LockScreen from "../pages/AuthenticationInner/auth-lock-screen";
import LockScreen2 from "../pages/AuthenticationInner/auth-lock-screen-2";
import ConfirmMail from "../pages/AuthenticationInner/page-confirm-mail";
import ConfirmMail2 from "../pages/AuthenticationInner/page-confirm-mail-2";
import EmailVerification from "../pages/AuthenticationInner/auth-email-verification";
import EmailVerification2 from "../pages/AuthenticationInner/auth-email-verification-2";
import TwostepVerification from "../pages/AuthenticationInner/auth-two-step-verification";
import TwostepVerification2 from "../pages/AuthenticationInner/auth-two-step-verification-2";

// // Dashboard
import Dashboard from "../pages/Dashboard/index";
import DashboardSaas from "../pages/Dashboard-saas/index";
// import DashboardCrypto from "../pages/Dashboard-crypto/index";
import Blog from "../pages/Dashboard-Blog/index";
import DashboardJob from "../pages/DashboardJob/index";

// // //Crypto
// import CryptoWallet from "../pages/Crypto/CryptoWallet/crypto-wallet";
// import CryptoBuySell from "../pages/Crypto/crypto-buy-sell";
// import CryptoExchange from "../pages/Crypto/crypto-exchange";
// import CryptoLending from "../pages/Crypto/crypto-lending";
// import CryptoOrders from "../pages/Crypto/CryptoOrders";
// import CryptoKYCApplication from "../pages/Crypto/crypto-kyc-application";
// import CryptoIcoLanding from "../pages/Crypto/CryptoIcoLanding/index";

// // Charts
import ChartApex from "../pages/Charts/Apexcharts";
import ChartjsChart from "../pages/Charts/ChartjsChart";
import EChart from "../pages/Charts/EChart";
import SparklineChart from "../pages/Charts/SparklineChart";
import ChartsKnob from "../pages/Charts/charts-knob";
import ReCharts from "../pages/Charts/ReCharts";

// // Maps

// //Icons
import IconBoxicons from "../pages/Icons/IconBoxicons";
import IconDripicons from "../pages/Icons/IconDripicons";
import IconMaterialdesign from "../pages/Icons/IconMaterialdesign";
import IconFontawesome from "../pages/Icons/IconFontawesome";

// //Tables
import BasicTables from "../pages/Tables/BasicTables";
import DatatableTables from "../pages/Tables/DatatableTables";

// //Blog
// import BlogList from "../pages/Blog/BlogList/index";
// import BlogGrid from "../pages/Blog/BlogGrid/index";
// import BlogDetails from "../pages/Blog/BlogDetails";

// //Job
// import JobGrid from "../pages/JobPages/JobGrid/index";
// import JobDetails from "../pages/JobPages/JobDetails";
// import JobCategories from "../pages/JobPages/JobCategories";
// import JobList from "../pages/JobPages/JobList/index";
// import ApplyJobs from "../pages/JobPages/ApplyJobs/index";
// import CandidateList from "../pages/JobPages/CandidateList";
// import CandidateOverview from "../pages/JobPages/CandidateOverview";

// // Forms
import FormElements from "../pages/Forms/FormElements";
import FormLayouts from "../pages/Forms/FormLayouts";
import FormAdvanced from "../pages/Forms/FormAdvanced/index";
// import FormEditors from "../pages/Forms/FormEditors";
// import FormValidations from "../pages/Forms/FormValidations";
import FormMask from "../pages/Forms/FormMask";
// import FormRepeater from "../pages/Forms/FormRepeater";
// import FormUpload from "../pages/Forms/FormUpload";
// import FormWizard from "../pages/Forms/FormWizard";
// import DualListbox from "../pages/Tables/DualListbox";

// // //Ui
// import UiAlert from "../pages/Ui/UiAlerts/index";
// import UiButtons from "../pages/Ui/UiButtons/index";
// import UiCards from "../pages/Ui/UiCard/index";
// import UiCarousel from "../pages/Ui/UiCarousel";
// import UiColors from "../pages/Ui/UiColors";
// import UiDropdown from "../pages/Ui/UiDropdown/index";
// import UiOffCanvas from "../pages/Ui/UiOffCanvas";

// import UiGeneral from "../pages/Ui/UiGeneral";
// import UiGrid from "../pages/Ui/UiGrid";
// import UiImages from "../pages/Ui/UiImages";
// import UiModal from "../pages/Ui/UiModal/index";

// import UiTabsAccordions from "../pages/Ui/UiTabsAccordions";
// import UiTypography from "../pages/Ui/UiTypography";
// import UiVideo from "../pages/Ui/UiVideo";
// import UiSessionTimeout from "../pages/Ui/UiSessionTimeout";
// import UiRating from "../pages/Ui/UiRating";
// import UiRangeSlider from "../pages/Ui/UiRangeSlider";
// import UiNotifications from "../pages/Ui/UINotifications";

// import UiPlaceholders from "../pages/Ui/UiPlaceholders";
// import UiToasts from "../pages/Ui/UiToast";
// import UiUtilities from "../pages/Ui/UiUtilities";

// //Pages
import PagesStarter from "../pages/Utility/pages-starter";
import PagesMaintenance from "../pages/Utility/pages-maintenance";
import PagesComingsoon from "../pages/Utility/pages-comingsoon";
import PagesTimeline from "../pages/Utility/pages-timeline";
import PagesFaqs from "../pages/Utility/pages-faqs";
import PagesPricing from "../pages/Utility/pages-pricing";
import Pages404 from "../pages/Utility/pages-404";
import Pages500 from "../pages/Utility/pages-500";

// //Contacts
import ContactsGrid from "../pages/Contacts/contacts-grid";
import ContactsList from "../pages/Contacts/ContactList/contacts-list";
import ContactsProfile from "../pages/Contacts/ContactsProfile/index";
import UiProgressbar from "../pages/Ui/UiProgressbar";
import Home from "../pages/Home";
import ChangePassword from "../pages/Authentication/ChangePassword";
import OperatorInfo from "../pages/BussinessInfo/OperatorInfo";
import Location from "../pages/BussinessInfo/Location";
import LocationDetail from "../pages/BussinessInfo/Location/LocationDetail";
import LocationUpdate from "../pages/BussinessInfo/Location/LocationUpdate";
import Service from "../pages/Service";
import Customer from "../pages/Customer";
import CustomerDetail from "../pages/Customer/CustomerDetail";
import Staff from "../pages/Staff";
import StaffDetail from "../pages/Staff/StaffDetail";
import Package from "../pages/Package";
import ClassInfo from "../pages/Class/ClassInfo";
import ClassDetail from "../pages/Class/ClassInfo/ClassDetail";
import RetailProduct from "../pages/RetailProduct";
import Sale from "../pages/Sale";
import SaleScreen from "../pages/Sale/SaleScreen";
import Booking from "../pages/Booking";
import BookingDetail from "../pages/Booking/BookingDetail";
import BookingToday from "../pages/Booking/BookingToday";
import CustomerTab from "../pages/Customer/CustomerTab";
import CustomerReview from "../pages/CustomerReview/index";
import Users from "../pages/Users";
import UserDetail from "../pages/Users/UserDetail";
import RegisterAdmin from "../pages/Authentication/RegisterAdmin";
import NotificationDetail from "../pages/Notification/NotificationDetail";
import Notification from "../pages/Notification";
import BookingPTDetail from "../pages/Booking/BookingPTDetail";
import BookingPTList from "../pages/Booking/BookingPTList";
import MarketSegments from "../pages/MarketSegment/index";
import i18n from "../i18n";
import Settings from "../pages/Settings";
import TrainerSchedule from "../pages/TrainerSchedule";
import BookingCreate from "../pages/Booking/BookingCreate";
import PolicyDetail from "../pages/Policy/PolicyDetail";
import Notice from "../pages/Notice";

// import UiProgressbar from "../../src/pages/Ui/UiProgressbar"

const authProtectedRoutes = [
  // { path: "/home", component: <Home /> },
  // {
  //   path: "/operator-info",
  //   component: <OperatorInfo />,
  //   permission: "all",
  //   title: i18n.t("operator_information"),
  //   subtitle: i18n.t("operator_information"),
  // },
  // {
  //   path: "/operator-info/create",
  //   component: <OperatorInfo type="create" />,
  //   permission: "operator:create",
  //   title: i18n.t("operator_information"),
  //   subtitle: i18n.t("create_operator"),
  // },
  // {
  //   path: "/location-list",
  //   component: <Location />,
  //   permission: "location:view_list",
  //   title: i18n.t("bussiness_information"),
  //   subtitle: i18n.t("location_list"),
  // },
  {
    path: "/location-list/create",
    component: <LocationDetail type="create" />,
    permission: "location:create",
    title: i18n.t("location_list"),
    subtitle: i18n.t("create_location"),
  },
  {
    path: "/location-list/detail/:id",
    component: <LocationUpdate type="detail" />,
    permission: "location:view_detail",
    title: i18n.t("location_list"),
    subtitle: i18n.t("location_detail"),
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
    path: "/customer/detail/:id/:cId",
    component: <CustomerTab type="detail" />,
    permission: "customer:view_detail",
    title: i18n.t("customer"),
    subtitle: i18n.t("contact_detail"),
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
    path: "/sale/detail/:id",
    component: <SaleScreen type="detail" />,
    permission: "sale_order:view_detail",
    title: i18n.t("sales_order_list"),
    subtitle: i18n.t("sales_detail"),
  },
  {
    path: "/booking",
    component: <Booking />,
    permission: "booking:view_list",
    title: i18n.t("booking"),
  },
  // {
  //   path: "/book-by-pt",
  //   component: <BookingPTList />,
  //   permission: "booking:view_list",
  //   title: i18n.t("booking_pt"),

  // },
  // {
  //   path: "/booking/today",
  //   component: <BookingToday />,
  //   permission: "all",
  //   title: i18n.t("booking"),
  //   subtitle: i18n.t("booking_today"),
  // },
  {
    path: "/booking/create",
    component: <BookingCreate />,
    permission: "booking:create",
    title: i18n.t("booking_list"),
    subtitle: i18n.t("add_new_booking"),
  },
  {
    path: "/booking/detail/:id",
    component: <BookingDetail type="detail" />,
    permission: "booking:view_detail",
    title: i18n.t("booking_list"),
    subtitle: i18n.t("booking_detail"),
  },
  // {
  //   path: "/book-by-pt/create",
  //   component: <BookingPTDetail type="create" />,
  //   permission: "booking:create",
  //   title: i18n.t("booking_list"),
  //   subtitle: i18n.t("add_new_booking_pt"),
  // },
  {
    path: "/book-by-pt/detail/:id",
    component: <BookingPTDetail type="detail" />,
    permission: "booking:view_detail",
    title: i18n.t("booking_list"),
    subtitle: i18n.t("book_by_pt_detail"),
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
    path: "/staff/detail/:id",
    component: <StaffDetail type="detail" />,
    permission: "staff:view_detail",
    title: i18n.t("contact_list"),
    subtitle: i18n.t("staff_detail"),
  },
  {
    path: "/class-info",
    component: <ClassInfo />,
    permission: "all",
    title: i18n.t("class"),
  },
  {
    path: "/class-info/create",
    component: <ClassDetail type="create" />,
    permission: "all",
    title: i18n.t("class_list"),
  },
  {
    path: "/class-info/detail/:id",
    component: <ClassDetail type="detail" />,
    permission: "class:view_detail",
    title: i18n.t("class_list"),
  },
  {
    path: "/retail-product",
    component: <RetailProduct />,
    permission: "all",
    title: i18n.t("retail_product"),
  },
  {
    path: "/customer-review",
    component: <CustomerReview />,
    permission: "review:view_list",
    title: i18n.t("customer_review"),
  },
  // {
  //   path: "/users",
  //   component: <Users />,
  //   permission: "user:view_list",
  //   title: i18n.t("user_permission"),
  // },
  {
    path: "/users/create",
    component: <UserDetail type="create" />,
    permission: "user:create",
    title: i18n.t("user_list"),
    subtitle: i18n.t("user_detail"),
  },
  {
    path: "/users/detail/:id",
    component: <UserDetail type="detail" />,
    permission: "user:view_detail",
    title: i18n.t("user_list"),
    subtitle: i18n.t("user_detail"),
  },
  {
    path: "/notification",
    component: <Notification />,
    permission: "all",
    title: i18n.t("notification"),
    subtitle: i18n.t("notification_list"),
  },
  {
    path: "/notification/create",
    component: <NotificationDetail type="create" />,
    permission: "all",
    title: i18n.t("notification"),
    subtitle: i18n.t("add_new_notification"),
  },
  {
    path: "/notification/:id",
    component: <NotificationDetail type="detail" />,
    permission: "all",
    title: i18n.t("notification"),
    subtitle: i18n.t("notification_detail"),
  },
  {
    path: "/profile",
    component: <UserProfile />,
    permission: "all",
    title: i18n.t("account_information"),
  },
  {
    path: "/dashboard",
    component: <Dashboard />,
    permission: "all",
    title: i18n.t("Dashboard"),
    subtitle: i18n.t("Dashboard"),
  },
  {
    path: "/settings",
    component: <Settings />,
    permission: "all",
    title: i18n.t("settings"),
  },
  {
    path: "/staff-schedule",
    component: <TrainerSchedule />,
    permission: "staff:view_list",
    title: i18n.t("staff_schedule"),
  },
  {
    path: "/policy/create",
    component: <PolicyDetail type="create" />,
    permission: "policy:create",
    title: i18n.t("policy"),
    subtitle: i18n.t("policy_details"),
  },
  {
    path: "/policy/detail/:id",
    component: <PolicyDetail type="detail" />,
    permission: "policy:view_detail",
    title: i18n.t("policy"),
    title: i18n.t("policy_details"),
  },
  {
    path: "/notice",
    component: <Notice />,
    permission: "all",
    title: i18n.t("notice"),
  },
  // { path: "/dashboard-saas", component: <DashboardSaas /> },
  // // { path: "/dashboard-crypto", component: <DashboardCrypto /> },
  // { path: "/blog", component: <Blog /> },
  // { path: "/dashboard-job", component: <DashboardJob /> },

  //   //Crypto
  // { path: "/crypto-wallet", component: <CryptoWallet /> },
  // { path: "/crypto-buy-sell", component: <CryptoBuySell /> },
  // { path: "/crypto-exchange", component: <CryptoExchange /> },
  // { path: "/crypto-lending", component: <CryptoLending /> },
  // { path: "/crypto-orders", component: <CryptoOrders /> },
  // { path: "/crypto-kyc-application", component: <CryptoKYCApplication /> },

  //chat
  // { path: "/chat", component: <Chat /> },

  // //File Manager
  // { path: "/apps-filemanager", component: <FileManager /> },

  // // //calendar
  // { path: "/calendar", component: <Calendar /> },

  // //   // //profile

  //   //Ecommerce
  // {
  //   path: "/ecommerce-product-detail/:id",
  //   component: <EcommerceProductDetail />,
  // },
  // { path: "/ecommerce-products", component: <EcommerceProducts /> },
  // { path: "/ecommerce-orders", component: <EcommerceOrders /> },
  // { path: "/ecommerce-customers", component: <EcommerceCustomers /> },
  // { path: "/ecommerce-cart", component: <EcommerceCart /> },
  // { path: "/ecommerce-checkout", component: <EcommerceCheckout /> },
  // { path: "/ecommerce-shops", component: <EcommerceShops /> },
  // { path: "/ecommerce-add-product", component: <EcommerenceAddProduct /> },

  //   //Email
  // { path: "/email-inbox", component: <EmailInbox /> },
  // { path: "/email-read/:id?", component: <EmailRead /> },
  // { path: "/email-template-basic", component: <EmailBasicTemplte /> },
  // { path: "/email-template-alert", component: <EmailAlertTemplte /> },
  // { path: "/email-template-billing", component: <EmailTemplateBilling /> },

  //   //Invoices
  // { path: "/invoices-list", component: <InvoicesList /> },
  // { path: "/invoices-detail", component: <InvoiceDetail /> },
  // { path: "/invoices-detail/:id?", component: <InvoiceDetail /> },

  // //   // Tasks
  // { path: "/tasks-list", component: <TasksList /> },
  // { path: "/tasks-create", component: <TasksCreate /> },
  // { path: "/tasks-kanban", component: <TasksKanban /> },

  // //   //Projects
  // { path: "/projects-grid", component: <ProjectsGrid /> },
  // { path: "/projects-list", component: <ProjectsList /> },
  // { path: "/projects-overview", component: <ProjectsOverview /> },
  // { path: "/projects-overview/:id", component: <ProjectsOverview /> },
  // { path: "/projects-create", component: <ProjectsCreate /> },

  //   //Blog
  // { path: "/blog-list", component: <BlogList /> },
  // { path: "/blog-grid", component: <BlogGrid /> },
  // { path: "/blog-details", component: <BlogDetails /> },

  // { path: "/job-grid", component: <JobGrid /> },
  // { path: "/job-details", component: <JobDetails /> },
  // { path: "/job-categories", component: <JobCategories /> },
  // { path: "/job-list", component: <JobList /> },
  // { path: "/job-apply", component: <ApplyJobs /> },
  // { path: "/candidate-list", component: <CandidateList /> },
  // { path: "/candidate-overview", component: <CandidateOverview /> },

  // // Contacts
  // { path: "/contacts-grid", component: <ContactsGrid /> },
  // { path: "/contacts-list", component: <ContactsList /> },
  // { path: "/contacts-profile", component: <ContactsProfile /> },

  //   //Charts
  // { path: "/apex-charts", component: <ChartApex /> },
  // { path: "/chartjs-charts", component: <ChartjsChart /> },
  // { path: "/e-charts", component: <EChart /> },
  // { path: "/sparkline-charts", component: <SparklineChart /> },
  // { path: "/charts-knob", component: <ChartsKnob /> },
  // { path: "/re-charts", component: <ReCharts /> },

  //   // Icons
  // { path: "/icons-boxicons", component: <IconBoxicons /> },
  // { path: "/icons-dripicons", component: <IconDripicons /> },
  // { path: "/icons-materialdesign", component: <IconMaterialdesign /> },
  // { path: "/icons-fontawesome", component: <IconFontawesome /> },

  //   // Tables
  // { path: "/tables-basic", component: <BasicTables /> },
  // { path: "/tables-datatable", component: <DatatableTables /> },

  //   // Forms
  // { path: "/form-elements", component: <FormElements /> },
  // { path: "/form-layouts", component: <FormLayouts /> },
  // { path: "/form-advanced", component: <FormAdvanced /> },
  // { path: "/form-editors", component: <FormEditors /> },
  { path: "/form-mask", component: <FormMask />, permission: "all" },
  // { path: "/form-repeater", component: <FormRepeater /> },
  // { path: "/form-uploads", component: <FormUpload /> },
  // { path: "/form-wizard", component: <FormWizard /> },
  // { path: "/form-validation", component: <FormValidations /> },
  // { path: "/dual-listbox", component: <DualListbox /> },

  //   // Ui
  // { path: "/ui-alerts", component: <UiAlert /> },
  // { path: "/ui-buttons", component: <UiButtons /> },
  // { path: "/ui-cards", component: <UiCards /> },
  // { path: "/ui-carousel", component: <UiCarousel /> },
  // { path: "/ui-colors", component: <UiColors /> },
  // { path: "/ui-dropdowns", component: <UiDropdown /> },
  // { path: "/ui-offcanvas", component: <UiOffCanvas /> },
  // { path: "/ui-general", component: <UiGeneral /> },
  // { path: "/ui-grid", component: <UiGrid /> },
  // { path: "/ui-images", component: <UiImages /> },
  // { path: "/ui-modals", component: <UiModal /> },
  // { path: "/ui-progressbars", component: <UiProgressbar />, permission: "all", },
  // { path: "/ui-tabs-accordions", component: <UiTabsAccordions /> },
  // { path: "/ui-typography", component: <UiTypography /> },
  // { path: "/ui-video", component: <UiVideo /> },
  // { path: "/ui-session-timeout", component: <UiSessionTimeout /> },
  // { path: "/ui-rating", component: <UiRating /> },
  // { path: "/ui-rangeslider", component: <UiRangeSlider /> },
  // { path: "/ui-notifications", component: <UiNotifications /> },
  // { path: "/ui-placeholders", component: <UiPlaceholders /> },
  // { path: "/ui-toasts", component: <UiToasts /> },
  // { path: "/ui-utilities", component: <UiUtilities /> },

  // //   //Utility
  // { path: "/pages-starter", component: <PagesStarter /> },
  // { path: "/pages-timeline", component: <PagesTimeline /> },
  // { path: "/pages-faqs", component: <PagesFaqs /> },
  // { path: "/pages-pricing", component: <PagesPricing /> },

  //   // this route should be at the end of all other routes
  //   // eslint-disable-next-line react/display-name
  { path: "/", exact: true, component: <Navigate to="/dashboard" /> },
];

const publicRoutes = [
  { path: "/admin/register", component: <RegisterAdmin /> },
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPwd /> },
  { path: "/register", component: <Register /> },
  { path: "/reset-password", component: <ChangePassword /> },

  //ChangePassWord

  // { path: "/pages-maintenance", component: <PagesMaintenance /> },
  // { path: "/pages-comingsoon", component: <PagesComingsoon /> },
  { path: "/pages-404", component: <Pages404 /> },
  { path: "/pages-500", component: <Pages500 /> },
  // { path: "/crypto-ico-landing", component: <CryptoIcoLanding /> },

  //   // Authentication Inner
  // { path: "/pages-login", component: <Login1 /> },
  // { path: "/pages-login-2", component: <Login2 /> },
  // { path: "/pages-register", component: <Register1 /> },
  // { path: "/pages-register-2", component: <Register2 /> },
  // { path: "/page-recoverpw", component: <Recoverpw /> },
  // { path: "/page-recoverpw-2", component: <Recoverpw2 /> },
  // { path: "/pages-forgot-pwd", component: <ForgetPwd1 /> },
  // { path: "/pages-forgot-pwd-2", component: <ForgetPwd2 /> },
  // { path: "/auth-lock-screen", component: <LockScreen /> },
  // { path: "/auth-lock-screen-2", component: <LockScreen2 /> },
  // { path: "/page-confirm-mail", component: <ConfirmMail /> },
  // { path: "/page-confirm-mail-2", component: <ConfirmMail2 /> },
  // { path: "/auth-email-verification", component: <EmailVerification /> },
  // { path: "/auth-email-verification-2", component: <EmailVerification2 /> },
  // { path: "/auth-two-step-verification", component: <TwostepVerification /> },
  // {
  //   path: "/auth-two-step-verification-2",
  //   component: <TwostepVerification2 />,
  // },
];

// export { authProtectedRoutes, publicRoutes };
export { authProtectedRoutes, publicRoutes };
