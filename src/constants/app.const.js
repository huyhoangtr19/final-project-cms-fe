// Function Name : App Constants
// Created date :  28/7/24              by :  NgVinh
// Updated date :  1/8/24               by :  NgVinh

import i18n from "../i18n";

const STATUS_ACTIVE = 1;
const STATUS_INACTIVE = 0;

export const listActive = [
  { value: 1, label: i18n.t("active_member") },
  { value: 0, label: i18n.t("inactive") },
];

const STAGE_CUSTOMER = {
  NEW: 0,
  OPEN: 1,
  POTENTIAL: 2,
  ACTIVE: 3,
  INACTIVE: 4,
};
export const listStatus = [
  { value: STAGE_CUSTOMER.NEW, label: i18n.t("new") },
  { value: STAGE_CUSTOMER.OPEN, label: i18n.t("open") },
  { value: STAGE_CUSTOMER.POTENTIAL, label: i18n.t("potential") },
  { value: STAGE_CUSTOMER.ACTIVE, label: i18n.t("active_status") },
  { value: STAGE_CUSTOMER.INACTIVE, label: i18n.t("inactive") },
];

export const STATUS_SALE_PACKAGE_DETAIL = [
  { value: 0, label: i18n.t("inactive") },
  { value: 1, label: i18n.t("active") },
  { value: 2, label: i18n.t("expired") },
  { value: 3, label: i18n.t("transfer") },
  { value: 4, label: i18n.t("on_hold") },
];

export const listStatusOrder = [
  { value: 0, label: i18n.t("unpaid") },
  { value: 1, label: i18n.t("paid") },
  { value: 2, label: i18n.t("part-paid") },
];

export const listStatusSaleOrder = [
  { value: 0, label: i18n.t("quotation"), badge: "error" },
  { value: 1, label: i18n.t("confirmed"), badge: "success" },
  { value: 2, label: i18n.t("deposited"), badge: "warning" },
];

export const listStatusContract = [
  { value: 0, label: i18n.t("new"), badge: "primary" },
  { value: 1, label: i18n.t("renew"), badge: "warning" },
  { value: 2, label: i18n.t("upgrade"), badge: "success" },
]

export const listPaymentMethod = [
  { value: 0, label: i18n.t("cash") },
  { value: 1, label: i18n.t("banking") },

  { value: 2, label: i18n.t("card") },
  //   [
  //     'cash' => 0,
  //     'banking' => 1,
  //     'card' => 2,
  // ];
];

export const STATUS_BOOKING = {
  RESERVER: 0,
  IN_CLASS: 1,
  COMPLETED: 2,
  CANCELLED: 3,
  NO_SHOW: 4,
};

export const STATUS_SALE_ORDER = {
  QUOTATION: 0,
  CONFIRMED: 1,
};

export const listStatusBooking = [
  { value: 0, label: i18n.t("reserved"), color: "#2563EB", bg: "info", badge: "info" },
  { value: 1, label: i18n.t("in_class"), color: "#FFC107", bg: "yellow", badge: "warning" },
  { value: 2, label: i18n.t("completed"), color: "#16A34A", bg: "success", badge: "success" },
  { value: 3, label: i18n.t("cancelled"), color: "#C42E2A", bg: "secondary", badge: "error" },
  { value: 4, label: i18n.t("no_show"), color: "#3A3B5C", bg: "primary", badge: "primary" },
  { value: 5, label: i18n.t("waiting_confirm"), color: "#00000040", bg: "warning", badge: "warning" },
];
export const listStatusPackageExpired = [
  { value: 4, label: i18n.t("on_hold"), color: "#B4B5B4", badge: "onhold" },
  { value: 1, label: i18n.t("on_going"), color: "#885EFE", badge: "ongoing" },
  { value: 2, label: i18n.t("expired"), color: "rgb(255, 0, 0)", badge: "error" },
  { value: 0, label: "", color: "#fff" },
];
export const listStatusClassScheduleTime = [
  { value: 0, label: i18n.t("available"), color: "#1D39C4", bg: "primary", badge: "primary" },
  { value: 1, label: i18n.t("on_going"), color: "#ffc107", bg: "info", badge: "info" },
  { value: 2, label: i18n.t("completed"), color: "#1EAD07", bg: "success", badge: "success" },
  { value: 3, label: i18n.t("full_booked"), color: "#00000040", bg: "warning", badge: "warning" },
  { value: 4, label: i18n.t("cancelled"), color: "#FF0000", bg: "danger", badge: "error" },
];

const STATUS_POLICY = {
  DRAFT: 0,
  ACTIVE: 1,
  INACTIVE: 2,
};
export const listStatusPolicy = [
  { value: STATUS_POLICY.DRAFT, label: i18n.t("draft"), badge: "warning" },
  { value: STATUS_POLICY.ACTIVE, label: i18n.t("active"), badge: "success" },
  { value: STATUS_POLICY.INACTIVE, label: i18n.t("inactive"), badge: "error" },
]

export const KIND_DISCOUNT = {
  AMOUNT: 0,
  RATE: 1,
};

const STATUS_STAFF = {
  INACTIVE: 0,
  ACTIVE: 1,
};

const TYPE_STAFF = {
  PARTTIME: 0,
  FULLTIME: 1,
};
export const listTypeStaff = [
  { value: 0, label: i18n.t("part_time") },
  { value: 1, label: i18n.t("full_time") },
];

const TYPE_CLASS = {
  GROUP: 0,
  PRIVATE: 1,
};
export const listTypeClass = [
  { value: 0, label: i18n.t("group") },
  { value: 1, label: i18n.t("private") },
];

export const listTypeBooking = [
  { value: 1, label: i18n.t('class') },
  { value: 2, label: i18n.t('sessions') },
]

const GEN_MALE = 0;
const GEN_FEMALE = 1;

export const listGender = [
  { value: 0, label: i18n.t("male") },
  {
    value: 1,
    label: i18n.t("female"),
  },
  {
    value: 2,
    label: i18n.t("Others"),
  },
];
export const listLabelCustomer = [
  { value: 0, label: i18n.t("basic") },
  { value: 1, label: i18n.t("silver") },
  { value: 2, label: i18n.t("gold") },
  { value: 3, label: i18n.t("vip") },
];

export const labelTypeCustomer = [
  { value: 0, label: "basic" },
  { value: 1, label: "silver" },
  { value: 2, label: "gold" },
  { value: 3, label: "vip" },
];

export const listStatusNotification = [
  { value: 0, label: i18n.t("noti_emp") + i18n.t("draft"), badge: "warning" },
  { value: 1, label: i18n.t("noti_emp") + i18n.t("pending"), badge: "warning" },
  { value: 2, label: i18n.t("noti_emp") + i18n.t("send"), badge: "success" },
  { value: 3, label: i18n.t("noti_emp") + i18n.t("cancel"), badge: "error" },
];

export const listReferSource = [
  { value: 0, label: i18n.t("staff") },
  { value: 1, label: i18n.t("customer") },
  { value: 2, label: i18n.t("social") },
];

export const KIND_PACKAGE = {
  MEMBERSHIP: 0,
  GROUP: 1,
  PRIVATE: 2,
  FIT: 3,
};
export const listKindPackage = [
  {
    value: KIND_PACKAGE.MEMBERSHIP,
    label: i18n.t("membership"),
    title: i18n.t("membership_programs"),
    description: i18n.t("membership_description")
  },
  {
    value: KIND_PACKAGE.GROUP,
    label: i18n.t("group"),
    title: i18n.t("group_classes"),
    description: i18n.t("group_description")
  },
  {
    value: KIND_PACKAGE.PRIVATE,
    label: i18n.t("private"),
    title: i18n.t("private_training"),
    description: i18n.t("private_description")
  },
  {
    value: KIND_PACKAGE.FIT,
    label: i18n.t("fit"),
    title: i18n.t("fit_programs"),
    description: i18n.t("fit_description")
  }
];

export const listStageUser = [
  { value: 0, label: i18n.t("invitation_sent") },
  { value: 1, label: i18n.t("confirmed") },
];

const FREQUENCY = {
  WEEKLY: 0,
  SPECIFIC: 1,
};
export const listFrequency = [
  { value: 0, label: i18n.t("weekly") },
  { value: 1, label: i18n.t("specific") },
];

const SUNDAY = 0;
const MONDAY = 1;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;
export const listDayOfWeek = [
  { value: 0, label: i18n.t("sunday") },
  { value: 1, label: i18n.t("monday") },
  { value: 2, label: i18n.t("tuesday") },
  { value: 3, label: i18n.t("wednesday") },
  { value: 4, label: i18n.t("thursday") },
  { value: 5, label: i18n.t("friday") },
  { value: 6, label: i18n.t("saturday") },
];

export const lIST_SIDEBAR_CONTENT = [
  {
    id: 1,
    name: "booking",
    icon: "bx-calendar",
    link: "/booking",
    key: "booking:view_list",
  },
  // {
  //   id: 2,
  //   name: "booking_pt",
  //   icon: "mdi-account-multiple mdi",
  //   link: "/book-by-pt",
  //   key: "booking:view_list",
  // },
  {
    id: 16,
    name: "staff_schedule",
    icon: "fa fa-clock",
    link: "/staff-schedule",
    key: "staff:view_list",
  },
  {
    id: 3,
    name: "class",
    icon: "bx-pulse",
    link: "/class-info",
    key: "class:view_list",
  },
  {
    id: 4,
    name: "sales",
    icon: "bx-receipt",
    link: "/sale",
    key: "sale_order:view_list",
  },
  {
    id: 5,
    name: "customer",
    icon: "bx-user-pin",
    link: "/customer",
    key: "customer:view_list",
  },
  {
    id: 6,
    name: "staff",
    icon: "bx-user-circle",
    link: "/staff",
    key: "staff:view_list",
  },
  {
    id: 7,
    name: "service",
    icon: "bx-star",
    link: "/service",
    key: "service:view_list",
  },
  {
    id: 8,
    name: "package",
    icon: "bx-package",
    link: "/package",
    key: "package:view_list",
  },
  {
    id: 9,
    name: "retail_product",
    icon: "bxs-shopping-bag-alt",
    link: "/retail-product",
    key: ["product_category:view_list", "product:view_list"],
  },
  // {
  //   id: 10,
  //   name: "location",
  //   icon: "bx-building-house",
  //   link: "/location-list",
  //   key: "location:view_list",
  // },
  // {
  //   id: 11,
  //   name: "operator",
  //   icon: "bx-globe",
  //   link: "/operator-info",
  //   key: "all",
  // },
  {
    id: 12,
    name: "customer_review",
    icon: "dripicons-message",
    link: "/customer-review",
    key: "review:view_list",
  },
  // {
  //   id: 13,
  //   name: "user",
  //   icon: "dripicons-user-id",
  //   link: "/users",
  //   key: "user:view_list",
  // },
  {
    id: 14,
    name: "notification",
    icon: "dripicons-bell",
    link: "/notification",
    key: "all",
  },
  {
    id: 15,
    name: "settings",
    icon: "bx-cog",
    link: "/settings?tab=0",
    key: "all"
  },
  {
    id: 16,
    name: "notice",
    icon: "dripicons-bell",
    link: "/notice",
    key: "all",
  },
];

export const ACTIVITY_NEWEST = {
  0: i18n.t("purchased"),
  1: i18n.t("booked"),
  2: i18n.t("checked in"),
  3: i18n.t("cancelled"),
};
export const CHART_OPTIONS = [
  {
    value: "package",
    label: i18n.t("package"),
  },
  {
    value: "sale",
    label: i18n.t("sales"),
  },
  {
    value: "booking",
    label: i18n.t("booking"),
  },
  {
    value: "staff",
    label: i18n.t("staff"),
  },
];
export const MONTH_CHART = [
  {
    value: "1",
    label: i18n.t("jan"),
  },
  {
    value: "2",
    label: i18n.t("feb"),
  },
  {
    value: "3",
    label: i18n.t("mar"),
  },
  {
    value: "4",
    label: i18n.t("apr"),
  },
  {
    value: "5",
    label: i18n.t("may"),
  },
  {
    value: "6",
    label: i18n.t("jun"),
  },
  {
    value: "7",
    label: i18n.t("jul"),
  },
  {
    value: "8",
    label: i18n.t("aug"),
  },
  {
    value: "9",
    label: i18n.t("sep"),
  },
  {
    value: "10",
    label: i18n.t("oct"),
  },
  {
    value: "11",
    label: i18n.t("nov"),
  },
  {
    value: "12",
    label: i18n.t("dec"),
  },
];

export const STATUS_SALE_ORDER_CONTRACT = {
  NEW_CONTRACT: 0,
  PENDING_APPROVAL: 1,
  APPROVED: 2,
  SIGNED: 3,
  COMPLETED: 4,
  WAITING_CUSTOMER_APPROVAL: 5,
  CUSTOMER_SIGNED: 6,
  CANCELLED: 7,
};

export const CHART_THEME = {
  labels: {
    text: {
      fontSize: 13,
      fontWeight: 600,
      fill: "#F4F1ED",
    },
  }
};

export const PAYMENT_STRATEGY = [
  {value: 'FULL_PAYMENT_ONLY' , label: i18n.t('full_payment_only')},
  {value: 'EACH_PAYMENT', label: i18n.t('each_payment')},
];

export const TIER_KIND = {
  AMOUNT: 0,
  SESSION: 1,
};

export const TIER_COMMISSION_KIND = {
  AMOUNT: 0,
  RATE: 1,
}