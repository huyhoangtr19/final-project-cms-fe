import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { Badge, Button, Collapse, Input, Table } from "reactstrap";
import InputSearch from "../../components/Common/InputSearch";
import MyDropdown from "../../components/Common/MyDropdown";
import IcPlus from "../../assets/icon/IcPlus";
import MyPagination from "../../components/Common/Mypagination";
import MyModalTemplate from "../../components/Common/MyModalTemplate";
import withRouter from "../../components/Common/withRouter";
import { useAppSelector } from "../../hook/store.hook";
import Breadcrumb from "../../components/Common/Breadcrumb";
import { toast } from "react-toastify";
import staffService from "../../services/staff.service";
import departmentService from "../../services/department.service";
import operatorService from "../../services/operator.service";
import i18n from "../../i18n";
import ExcelJS from "exceljs";
import { debounce } from "lodash";
// import { set } from "lodash";

const listStatus = [
  { value: 1, label: i18n.t("active") },
  { value: 0, label: i18n.t("inactive") },
];

const StaffList = (props) => {
  document.title = "Staff | Actiwell System";
  const path = useLocation();
  const { hasOperator, operator } = useAppSelector((state) => state.operator);
  const { permissionUser } = useAppSelector((state) => state.auth);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [listLocation, setListLocation] = useState([]);
  // const [listPosition, setListPosition] = useState([]);
  const [listDepartment, setListDepartment] = useState([]);
  // const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenImport, setIsOpenImport] = useState(false);
  const [isOpenExport, setIsOpenExport] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [locationExport, setLocationExport] = useState("");

  const handleCheckboxChange = (choose) => {
    setSelectedStaff((prevSelected) => {
      if (prevSelected.includes(choose)) {
        return prevSelected.filter((no) => no !== choose);
      } else {
        return [...prevSelected, choose];
      }
    });
  };

  const handleResetFilter = () => {
    setSearchName("");
    setLocation("");
    setCity("");
    // setPosition("");
    setDepartment("");
  };

  const handleCheckAll = () => {
    if (!isAllChecked) {
      setSelectedStaff(staff.map((item) => item.id));
    } else {
      setSelectedStaff([]);
    }
  };

  const handleGetListStaff = async () => {
    try {
      const payload = {
        keyword: searchName,
        active: city,
        location: location,
        // position: position,
        department: department,
        limit: 20,
        page: page,
      };
      setSelectedStaff([]);
      const res = await staffService.getListStaff(payload);
      setStaff(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRedirect = (choose) => {
    props.router.navigate(`/staff/detail/${choose.id}`);
  };

  const handleUpdateStatus = async (id, active) => {
    try {
      const res = await staffService.updateStatusStaff(
        id,
        active === 1 ? 0 : 1
      );
      if (res.success) {
        toast.success(i18n.t("update_status_success"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListStaff();
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleGetListLocation = async () => {
    try {
      const response = await operatorService.getListLocationForOperator();
      if (response.success) {
        setListLocation(
          response.data.map((item) => {
            return { value: item.id, label: item.name };
          })
        );
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleGetListDepartment = async () => {
    try {
      const response = await departmentService.getListDepartments();
      if (response.success) {
        setListDepartment(
          response.data.map((item) => {
            return { value: item.id, label: item.name };
          })
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteAStaff = async (id) => {
    try {
      const res = await staffService.deleteAStaff(id);
      if (res.success) {
        toast.success(i18n.t("delete_staff_success"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListStaff();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setDeleteId("");
    }
  };
  const handleDeleteMulti = async () => {
    try {
      const res = await staffService.deleteMultiStaff(selectedStaff);
      if (res.success) {
        toast.success(i18n.t("delete_staff_success"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetListStaff();
      }
    } catch (e) {
      if (e.message && e.message === "staff_has_class_schedule") {
        toast.error(i18n.t("delete_staff_fail"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
      console.log(e);
    }
  };
  const handleDeleteModal = () => {
    if (deleteId) {
      handleDeleteAStaff(deleteId);
    } else {
      handleDeleteMulti();
    }
    setIsOpen(false);
  };

  const handleImportWorkSchedule = async (e) => {
    try {
      const files = Array.from(e.target.files);

      if (files.length) {
        const formData = new FormData();
        formData.append("file", files[0]);

        const response = await staffService.importSchedule(formData);
        console.log("response", response);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsOpenImport(false);
    }
  };
  const downloadTemplate = async () => {
    try {
      const response = await staffService.exportSchedule();
      const url = window.URL.createObjectURL(response);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "work_schedule_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.log("e", e);
    }
  };
  const handleExportExcel2 = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Timesheet");
      const res = await operatorService.getTimeSheetByLocation(locationExport, {
        start_date: startDate,
        end_date: endDate,
      });

      const locationData = await operatorService.getDetailLocation(
        locationExport || ""
      );
      const data = res?.data || [];
      if (res.data && locationData) {
        worksheet.mergeCells("A2:B2");

        worksheet.getCell("A2").value = "Bảng chấm công";
        worksheet.getCell("A2").style.font = { bold: true, size: 16 };
        worksheet.getCell("A3").value = `Email`;
        worksheet.getCell("B3").value = locationData?.data?.email;
        worksheet.getCell("A4").value = `Địa điểm`;
        worksheet.getCell("B4").value = locationData?.data?.address;
        worksheet.getCell("A5").value = `Thời gian`;
        worksheet.getCell("B5").value = `${startDate} đến ${endDate}`;
        worksheet.getCell("A6").value = `Số lượng nhân viên`;
        worksheet.getCell("B6").value = `${data.staff_number || 0}`;


        const headerRow = [
          "STT",
          "Ngày",
          "Phòng",
          "Tên",
          "ID Nhân viên",
          "Giờ vào theo lịch làm việc",
          "Giờ vào thực tế",
          "Vào trễ",
          "Giờ ra theo lịch làm việc",
          "Giờ ra thực tế",
          "Ra sớm",
          "Số giờ làm việc",
          "Ghi chú",
        ];

        // Add header row
        worksheet.addRow(headerRow);

        // Style header row: bold, center, border, blue background
        const headerRowExcel = worksheet.getRow(7);
        headerRowExcel.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF1D39C4" }, // blue
          };
        });

        data.timesheets.forEach((staff, index) => {
          const fullName = `${staff.last_name} ${staff.first_name}`;
          // const position = staff.position_name || "";
          const department = staff.department_name || "";
          const row = [
            index + 1,
            staff.date,
            department,
            fullName,
            staff.id,
            staff.from,
            staff.checkin_time || "",
            staff.is_late ? 1 : 0,
            staff.to,
            staff.checkout_time || "",
            staff.is_early_leave ? 1 : 0,
            staff.working_hours || "0:00",
          ];

          worksheet.addRow(row);
        });

        // Style (Header bold + borders)
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        worksheet.columns.forEach((col) => {
          col.width = 35;
        });

        // Generate file
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "timesheet.xlsx");
        toast.success(i18n.t("export_success"), {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.log("e", e);
      toast.error(i18n.t("export_fail"), {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        hideProgressBar: true,
      });
    }
  };

  const isAllChecked = useMemo(() => {
    return staff.length === selectedStaff.length;
  }, [selectedStaff, staff]);

  const titleModal = useMemo(() => {
    return deleteId
      ? i18n.t("popup_del_this_staff")
      : i18n.t("popup_del_selected_staff");
  }, [deleteId]);

  const canAddStaff = useMemo(() => {
    return permissionUser.includes("staff:create");
  }, [permissionUser]);

  const canUpdateStatus = useMemo(() => {
    return permissionUser.includes("staff:update_status");
  }, [permissionUser]);

  const canDelete = useMemo(() => {
    return permissionUser.includes("staff:delete");
  }, [permissionUser]);

  const isMobile = useMemo(() => {
    return window.innerWidth < 768;
  }, []);

  useEffect(() => {
    handleGetListDepartment();
    handleGetListLocation();
  }, []);

  useEffect(() => {
    if (listLocation.length && listDepartment.length) {
      handleGetListStaff();
    }
  }, [page, searchName, city, location, department, listLocation, listDepartment]);

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);

  useEffect(() => {
    if (staff.length === 0) return;

    const scrollContainer = tableContainerRef.current;
    const table = scrollContainer.querySelector('table');

    if (!scrollContainer || !table) return;

    const updateOverflow = () => {
      const isOverflowing = table.scrollWidth > scrollContainer.clientWidth;
      scrollContainer.style.overflowX = isOverflowing ? 'auto' : 'unset';
    };

    const debouncedUpdate = debounce(updateOverflow, 100); // 100ms debounce
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener("sidebar-toggled", debouncedUpdate);
    debouncedUpdate();

    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener("sidebar-toggled", debouncedUpdate);
      debouncedUpdate.cancel();
    };
  }, [staff]);

  return (
    <React.Fragment>
      <div className="!page-content">
        <div className="!content-container">
          <Breadcrumb title={i18n.t("staff")} />
          <div className="filter-container">
            <div className="filter-header">
              <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
                <button
                  className="filter-clear"
                >
                  {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
                </button>
                <h5 className="filter-title">{i18n.t("staff_list")}</h5>
              </div>
              <button
                className="filter-reset"
                onClick={handleResetFilter}
              >
                {i18n.t("reset")}
              </button>
            </div>
            <Collapse isOpen={filterOpen} className="filter-grid">
              <div className="filter-group">
                <label className="filter-label">{`${i18n.t("staff_id")}/${i18n.t("name")}/${i18n.t("phone")}/${i18n.t("email")}`}</label>
                <InputSearch
                  value={searchName}
                  onChange={(e) => setSearchName(e)}
                  placeholder={`${i18n.t("staff_id")}/${i18n.t(
                    "name"
                  )}/${i18n.t("phone")}/Email`}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">{i18n.t("location")}</label>
                <MyDropdown
                  options={listLocation}
                  selected={location}
                  displayEmpty={true}
                  setSelected={(e) => setLocation(e)}
                  placeholder={i18n.t("location")}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">{i18n.t("department")}</label>
                <MyDropdown
                  options={listDepartment}
                  selected={department}
                  displayEmpty={true}
                  setSelected={(e) => setDepartment(e)}
                  placeholder={i18n.t("department")}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">{i18n.t("status")}</label>
                <MyDropdown
                  options={listStatus}
                  selected={city}
                  displayEmpty={true}
                  setSelected={(e) => setCity(e)}
                  placeholder={i18n.t("status")}
                />
              </div>
            </Collapse>
          </div>
          <div className="page-container">
            {!hasOperator && props.type !== "create" ? (
              <div className="d-flex flex-column justify-content-center align-items-center">
                <p>{i18n.t("operator_info_missing")}</p>
                <Link to="/settings?tab=4">
                  <button className="btn btn-primary btn-block align-self-center rounded-3">
                    {i18n.t("create_operator")}
                  </button>
                </Link>
              </div>
            ) : (
              <div className="p-0">
                <div className="action-buttons">
                  <Link
                    to="create"
                    style={{
                      display: canAddStaff ? "block" : "none",
                      margin: 0,
                    }}
                  >
                    <button className="btn btn-primary btn-block d-flex gap-1">
                      <IcPlus />
                      <div className="" style={{ lineHeight: "17px" }}>
                        {i18n.t("add_new_staff")}
                      </div>
                    </button>
                  </Link>
                  <div
                    className="btn btn-primary btn-block d-flex gap-1"
                    onClick={() => setIsOpenImport(true)}
                  >
                    <i className="fa fa-file-import" style={{ padding: "0 5px" }}></i>
                    <div style={{ lineHeight: "17px" }}>
                      {i18n.t("import_work_schedule")}
                    </div>
                  </div>
                  <div
                    className="btn btn-primary btn-block d-flex gap-1"
                    onClick={() => setIsOpenExport(true)}
                  >
                    <i className="fa fa-file-export" style={{ padding: "0 5px" }}></i>
                    <div style={{ lineHeight: "17px" }}>
                      {i18n.t("export_timekeeping_data")}
                    </div>
                  </div>
                  <Button
                    color="danger"
                    outline={true}
                    disabled={selectedStaff.length === 0}
                    onClick={() => {
                      if (selectedStaff.length > 0) {
                        setIsOpen(true);
                      }
                    }}
                    style={{
                      lineHeight: "17px",
                      display: canDelete ? "block" : "none",
                    }}
                  >
                    {i18n.t("delete_selected")}
                  </Button>
                </div>
                {staff.length > 0 ? (
                  <>
                    <div className="before-table"></div>
                    <div className="table-container" ref={tableContainerRef}>
                      <Table className="table mb-0">
                        <thead>
                          <tr>
                            {canDelete && (
                              <th>
                                <div onClick={handleCheckAll}>
                                  <Input
                                    type="checkbox"
                                    checked={isAllChecked}
                                    onChange={() => { }}
                                  />
                                </div>
                              </th>
                            )}

                            <th>{i18n.t("staff_id")}</th>
                            <th>{i18n.t("staff_name")}</th>
                            {/* <th>{i18n.t("position")}</th> */}
                            <th>{i18n.t("department")}</th>
                            <th>Email</th>
                            <th>{i18n.t("phone")}</th>
                            <th>{i18n.t("location")}</th>
                            <th
                              style={{
                                width: i18n.language === "en" ? 130 : 195,
                              }}
                            >
                              {i18n.t("action")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {staff.map((item, index) => (
                            <tr key={index} onClick={() => handleRedirect(item)}>
                              {canDelete && (
                                <td>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCheckboxChange(item.id);
                                    }}
                                  >
                                    <Input
                                      type="checkbox"
                                      checked={selectedStaff.includes(item.id)}
                                      onChange={() => { }}
                                    />
                                  </div>
                                </td>
                              )}
                              <td>{item.id}</td>
                              <td>
                                {item.last_name} {item.first_name}
                              </td>
                              <td>
                                {listDepartment.find(
                                  (dep) => dep?.value === item?.department_id
                                )?.label || "-"}
                              </td>
                              <td>{item.email || "-"}</td>
                              <td>{item.phone || "-"}</td>
                              <td>
                                {listLocation.find(
                                  (loc) => loc?.value === item?.location_id
                                )?.label || "-"}
                              </td>
                              <td>
                                <div className="d-flex flex-row gap-1 justify-content-between">
                                  <div
                                    style={{
                                      cursor: canUpdateStatus
                                        ? "pointer"
                                        : "none"
                                    }}
                                    className="px-1"
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (canUpdateStatus) {
                                        handleUpdateStatus(item.id, item.active);
                                      }
                                    }}
                                  >
                                    {item.active === 0 ? (
                                      <Badge color="none" className="badge-error">{i18n.t("inactive")}</Badge>
                                    ) : (
                                      <Badge color="none" className="badge-success">{i18n.t("active")}</Badge>
                                    )}
                                  </div>
                                  <button
                                    className={"btn btn-" + (item.allow_del ? "delete-outline" : "outline-danger disabled")}
                                    style={{
                                      display: canDelete ? "block" : "none",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (item.allow_del) {
                                        setIsOpen(true);
                                        setDeleteId(item.id);
                                      }
                                    }}
                                  >
                                    {i18n.t("delete")}
                                  </button>
                                  <button
                                    className="btn btn-outline"
                                    onClick={() => handleRedirect(item)}
                                  >
                                    {i18n.t("update")}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <div className="d-flex justify-content-center d-flex align-items-center h-100">
                    <div>{i18n.t("no_staff_exist")}</div>
                  </div>
                )}
                <MyPagination
                  page={page}
                  totalRecord={totalRecord}
                  rowPerPage={20}
                  totalPage={totalPage}
                  onPrevious={() => {
                    if (page > 1) {
                      setPage(page - 1);
                    }
                  }}
                  onNext={() => {
                    if (page < totalPage) {
                      setPage(page + 1);
                    }
                  }}
                  onClick={(page) => {
                    setPage(page);
                  }}
                />
              </div>
            )}
          </div>
          <MyModalTemplate
            isOpen={isOpenExport}
            onClose={() => setIsOpenExport(false)}
          >
            <div className="d-flex flex-column gap-3">
              <h3>{i18n.t("export_timekeeping_data")}</h3>
              <div className="d-flex justify-content-between">
                <div className="d-flex flex-row gap-2 justify-content-between">
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    placeholder={i18n.t("start_date")}
                    // required
                    value={startDate}
                    // invalid={
                    onChange={(e) => {
                      setStartDate(e.target.value);
                    }}
                  />
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    placeholder={i18n.t("end_date")}
                    // required
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                    }}
                  />
                </div>
              </div>
              <MyDropdown
                options={listLocation}
                selected={locationExport}
                displayEmpty={true}
                setSelected={(e) => setLocationExport(e)}
                placeholder={i18n.t("location")}
                isForm={true}
              />
              <div className="d-flex align-items-end">
                <Button
                  disabled={
                    !startDate ||
                    !endDate ||
                    !locationExport ||
                    new Date(startDate) >= new Date(endDate)
                  }
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={handleExportExcel2}
                >
                  {i18n.t("export_excel")}
                </Button>
              </div>
            </div>
          </MyModalTemplate>
          <MyModalTemplate
            isOpen={isOpenImport}
            onClose={() => setIsOpenImport(false)}
          >
            <div className="d-flex flex-column gap-3">
              <div
                className=""
                style={{
                  border: "2px dashed #000",
                  borderRadius: "8px",
                  padding: "48px",
                  textAlign: "center",
                  color: "#000",
                  background: "#fff",
                }}
              >
                {/* {i18n.t("import_instruction") || "Drag and drop your file here or click to select a file."} */}

                <div>
                  <label className="m-0" htmlFor="import-work-schedule">
                    <div className=" px-2 d-flex flex-column gap-1 align-items-center justify-content-center">
                      <IcPlus color="#000" />
                      <div className="" style={{ lineHeight: "17px" }}>
                        {i18n.t("import_working_schedule_excel")}
                      </div>
                    </div>
                  </label>
                  <input
                    type="file"
                    id="import-work-schedule"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    style={{ display: "none" }}
                    onChange={handleImportWorkSchedule}
                  />
                </div>
              </div>
              <div className="d-flex items-start">
                <div
                  className="btn btn-primary btn-block px-2"
                  onClick={downloadTemplate}
                >
                  {i18n.t("download_template")}
                </div>
              </div>
            </div>
          </MyModalTemplate>

          <MyModalTemplate isOpen={isOpen} onClose={() => setIsOpen(false)} size="sm">
            <div className="d-flex flex-column gap-3">
              <div>{titleModal}</div>
              <div
                className="d-flex flex-row justify-content-center"
                style={{ gap: 50 }}
              >
                <Button
                  color="secondary"
                  outline
                  className="px-3"
                  onClick={() => {
                    setIsOpen(false);
                    setDeleteId("");
                  }}
                >
                  {i18n.t("cancel")}
                </Button>

                <button
                  className="btn btn-primary btn-block px-3 d-flex gap-1"
                  onClick={handleDeleteModal}
                >
                  <div className="">{i18n.t("delete")}</div>
                </button>
              </div>
            </div>
          </MyModalTemplate>
        </div>
      </div>
    </React.Fragment>
  );
};
StaffList.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
};
export default withRouter(StaffList);
