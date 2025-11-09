// Function Name : Header
// Created date :  19/7/24             by :  NgVinh
// Updated date :  20/7/24             by :  NgVinh

import PropTypes from "prop-types";
import React, { useState } from "react";

import { connect } from "react-redux";
import { Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

// Reactstrap
import { Dropdown, DropdownToggle, DropdownMenu } from "reactstrap";

// Import menuDropdown
import LanguageDropdown from "../CommonForBoth/TopbarDropdown/LanguageDropdown";
import NotificationDropdown from "../CommonForBoth/TopbarDropdown/NotificationDropdown";
import ProfileMenu from "../CommonForBoth/TopbarDropdown/ProfileMenu";
import megamenuImg from "../../assets/images/megamenu-img.png";

// import images
import github from "../../assets/images/brands/github.png";
import bitbucket from "../../assets/images/brands/bitbucket.png";
import dribbble from "../../assets/images/brands/dribbble.png";
import dropbox from "../../assets/images/brands/dropbox.png";
import mail_chimp from "../../assets/images/brands/mail_chimp.png";
import slack from "../../assets/images/brands/slack.png";

import logo from "../../assets/images/logo.svg";
import logoLightSvg from "../../assets/images/logo-light.svg";

//i18n
import { withTranslation } from "react-i18next";

// Redux Store
import {
  showRightSidebarAction,
  toggleLeftmenu,
  changeSidebarType,
} from "../../store/actions";

//Routes for titles
import { useLocation, matchPath } from "react-router-dom";
import { authProtectedRoutes } from "../../routes";

// App icon
import appLogo from "../../assets/icon/logo.png";

const Header = (props) => {
  const [search, setsearch] = useState(false);
  const [megaMenu, setmegaMenu] = useState(false);
  const [socialDrp, setsocialDrp] = useState(false);

  // Get current page title
  const location = useLocation();

  let matchedRoute = null;
  for (const route of authProtectedRoutes) {
    if (matchPath({ path: route.path, end: true }, location.pathname)) {
      matchedRoute = route;
      break;
    }
  }
  const title = matchedRoute?.title ?? "Page";
  const subtitle = matchedRoute?.subtitle ?? "";

  function toggleFullscreen() {
    if (
      !document.fullscreenElement &&
      /* alternative standard method */ !document.mozFullScreenElement &&
      !document.webkitFullscreenElement
    ) {
      // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(
          Element.ALLOW_KEYBOARD_INPUT
        );
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  }

  function tToggle() {
    // To inform other components that the sidebar is toggled
    window.dispatchEvent(new Event("sidebar-toggled"));

    var body = document.body;
    if (window.screen.width <= 998) {
      body.classList.toggle("sidebar-enable");
    } else {
      body.classList.toggle("vertical-collpsed");
      body.classList.toggle("sidebar-enable");
    }
  }

  return (
    <React.Fragment>
      <header id="page-topbar">
        <div className="navbar-header">
          <div className="d-flex justify-content-center align-items-center">
            <button
              type="button"
              onClick={() => {
                tToggle();
              }}
              className="btn btn-sm font-size-16 header-item"
              id="vertical-menu-btn"
            >
              <img src={appLogo} alt="Logo" style={{ width: "2rem" }} />
            </button>

            {/* <div className="d-lg-none d-md-block">
              <div className="position-relative">
                <Link to="/" className="">
                  <h3>ACTIWELL</h3>
                </Link>
              </div>
            </div>

            <form className="d-none d-lg-block">
              <div className="position-relative">
                <Link to="/" className="">
                  <h3>ACTIWELL</h3>
                </Link>
              </div>
            </form> */}

            <h3 className="header-title">{title}</h3><h3 className="header-subtitle">{subtitle !== "" ? " / " + subtitle : ""}</h3>
          </div>
          <div className="d-flex flex-row">
            <ProfileMenu />

            {/* Settings button
            <div
              onClick={() => {
                props.showRightSidebarAction(!props.showRightSidebar);
              }}
              className="dropdown d-inline-block"
            >
              <button
                id="btn-settings"
                type="button"
                className="btn header-item noti-icon right-bar-toggle"
              >
                <i className="bx bx-cog bx-spin" />
              </button>
            </div>
            */}
          </div>
        </div>
      </header>
    </React.Fragment>
  );
};

Header.propTypes = {
  changeSidebarType: PropTypes.func,
  leftMenu: PropTypes.any,
  leftSideBarType: PropTypes.any,
  showRightSidebar: PropTypes.any,
  showRightSidebarAction: PropTypes.func,
  t: PropTypes.any,
  toggleLeftmenu: PropTypes.func,
};

const mapStatetoProps = (state) => {
  const { layoutType, showRightSidebar, leftMenu, leftSideBarType } =
    state.Layout;
  return { layoutType, showRightSidebar, leftMenu, leftSideBarType };
};

export default connect(mapStatetoProps, {
  showRightSidebarAction,
  toggleLeftmenu,
  changeSidebarType,
})(withTranslation()(Header));
