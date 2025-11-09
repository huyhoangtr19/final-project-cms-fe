// Function Name : Language Dropdown
// Created date :  22/7/24             by :  NgVinh
// Updated date :                      by :

import React, { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import { get, map } from "lodash";
import { withTranslation } from "react-i18next";

//i18n
import i18n from "../../../i18n";
import languages from "../../../common/languages";
import Cookies from "js-cookie";
import logoLanguage from "../../../assets/icon/languages.svg";

const LanguageDropdown = () => {
  // Declare a new state variable, which we'll call "menu"
  const [selectedLang, setSelectedLang] = useState("");
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const currentLanguage = Cookies.get("I18N_LANGUAGE");
    setSelectedLang(currentLanguage || "vi");
  }, []);

  const changeLanguageAction = (lang) => {
    //set language as i18n
    i18n.changeLanguage(lang);
    // localStorage.setItem("I18N_LANGUAGE", lang);
    Cookies.set("I18N_LANGUAGE", lang),
    {
      expires: 1,
    };

    setSelectedLang(lang);
    window.location.reload();
  };

  const toggle = () => {
    setMenu(!menu);
  };

  return (
    <Dropdown isOpen={menu} toggle={toggle}>
      <DropdownToggle className="dropdown-item" tag="button">
        <div className="">
          <img className="align-middle me-1" src={logoLanguage} alt="logo lang"
            style={{
              width: "16px"
            }}
          />
          {get(languages, `${selectedLang}.label`)}
        </div>
      </DropdownToggle>
      <DropdownMenu className="language-switch">
        {map(Object.keys(languages), (key) => (
          <DropdownItem
            key={key}
            onClick={() => changeLanguageAction(key)}
            className={`notify-item ${selectedLang === key ? "active" : "none"
              }`}
          >
            <span className="align-middle">
              {get(languages, `${key}.label`)}
            </span>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default withTranslation()(LanguageDropdown);
