import React, { useState, useRef, useEffect } from "react";
import i18n from "../../i18n";

const PermissionsPanel = ({
  listPermissions,
  validation,
  disabled = false,
}) => {
  const groupKeys = Object.keys(listPermissions);
  const [openGroups, setOpenGroups] = useState({});
  const [expandAll, setExpandAll] = useState(false);
  const contentRefs = useRef({});

  const handleChangeAllPermission = (group) => {
    if (!disabled) {
      if (isCheckAllGroup(group)) {
        validation.setFieldValue(
          "permission_ids",
          validation.values.permission_ids.filter(
            (no) => !listPermissions[group].map((item) => item.id).includes(no)
          )
        );
      } else {
        validation.setFieldValue(
          "permission_ids",
          [
            ...validation.values.permission_ids,
            ...listPermissions[group].map((item) => item.id),
          ].filter((item, index, self) => self.indexOf(item) === index)
        );
      }
    }
  };

  const handleChangePermissionItem = (id) => {
    validation.setFieldValue(
      "permission_ids",
      validation.values.permission_ids.includes(id)
        ? validation.values.permission_ids.filter((no) => no !== id)
        : [...validation.values.permission_ids, id]
    );
  };
  const isCheckAllGroup = (group) => {
    return listPermissions[group].every((permission) =>
      validation.values.permission_ids.includes(permission.id)
    );
  };

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const toggleAllGroups = () => {
    const newExpandAll = !expandAll;
    const updated = {};
    groupKeys.forEach((g) => {
      updated[g] = newExpandAll;
    });
    setOpenGroups(updated);
    setExpandAll(newExpandAll);
  };

  useEffect(() => {
    const handleResize = () => {
      setOpenGroups((prev) => ({ ...prev }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="permissions-wrapper">
      <div className="permissions-title" onClick={toggleAllGroups}>
        <h5>{i18n.t("user_permission")}</h5>
        <span className={`chevron ${expandAll ? "open" : ""}`}>▾</span>
      </div>

      <div className="permissions-container">
        {groupKeys.map((group) => {
          const isOpen = openGroups[group];

          return (
            <div className="permission-card" key={group}
              style={{ height: isOpen ? '100%' : 'fit-content' }}
            >
              <div
                className="card-header"
                onClick={() => toggleGroup(group)}
                role="button"
              >
                <input
                  type="checkbox"
                  id={group}
                  checked={isCheckAllGroup(group)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleChangeAllPermission(group);
                  }}
                  onClick={(e) => { e.stopPropagation(); handleChangeAllPermission(group); }}
                />
                <label >{i18n.t(group)}</label>
                <span className={`chevron ${isOpen ? "open" : ""}`}>▾</span>
              </div>

              <div
                className="card-body-wrapper"
                style={{
                  height: isOpen
                    ? `${contentRefs.current[group]?.scrollHeight || 0}px`
                    : "0px",
                }}
              >
                <div
                  className={`card-body ${isOpen ? "open" : ""}`}
                  ref={(el) => (contentRefs.current[group] = el)}
                >
                  {listPermissions[group].map((permission) => (
                    <div
                      key={permission.id}
                      className="permission-item"
                      onClick={() => handleChangePermissionItem(permission.id)}
                    >
                      <input
                        type="checkbox"
                        id={permission.id}
                        disabled={disabled}
                        checked={validation.values.permission_ids.includes(permission.id)}
                        onChange={() => { handleChangePermissionItem(permission.id) }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label htmlFor={permission.id}>
                        {i18n.t(permission.name)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionsPanel;
