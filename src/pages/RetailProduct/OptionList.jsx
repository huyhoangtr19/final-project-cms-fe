// Function Name : Option List
// Created date :  7/8/24             by :  NgVinh
// Updated date :                      by :  NgVinh
import React, { useEffect, useMemo, useRef, useState } from "react";
import ModalOption from "./ModalOption";
import optionService from "../../services/option.service";
import { Badge, Button, Col, Collapse, Input, Row, Table } from "reactstrap";
import InputSearch from "../../components/Common/InputSearch";
import IcPlus from "../../assets/icon/IcPlus";
import IcDot from "../../assets/icon/IcDot";
import IcTrash from "../../assets/icon/IcTrash";
import MyPagination from "../../components/Common/Mypagination";
import MyModalTemplate from "../../components/Common/MyModalTemplate";
import { toast } from "react-toastify";
import i18n from "../../i18n";
import { debounce } from "lodash";

const OptionList = (props) => {
  const [searchName, setSearchName] = React.useState("");
  const [selectedProduct, setSelectedProduct] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [totalRecord, setTotalRecord] = React.useState(0);
  const [totalPage, setTotalPage] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [isShow, setIsShow] = React.useState(false);
  const [idOption, setIdOption] = React.useState(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState("");

  const handleCheckAll = () => {
    if (!isAllChecked) {
      setSelectedProduct(products.map((item) => item.id));
    } else {
      setSelectedProduct([]);
    }
  };
  const handleCheckboxChange = (choose) => {
    setSelectedProduct((prevSelected) => {
      if (prevSelected.includes(choose)) {
        return prevSelected.filter((no) => no !== choose);
      } else {
        return [...prevSelected, choose];
      }
    });
  };

  const handleAddOption = () => {
    console.log("ad");
    setIsShow(true);
    setIdOption(null);
  };

  const handleRedirect = (item) => {
    setIsShow(true);
    setIdOption(item.id);
  };

  const handleGetProductList = async () => {
    try {
      const payload = {
        keyword: searchName,
        limit: 20,
        page: page,
      };
      setSelectedProduct([]);
      const res = await optionService.getListOptions(payload);
      setProducts(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };
  const handleDeleteOption = async (id) => {
    try {
      const res = await optionService.deleteOption(id);
      if (res.success) {
        handleGetProductList();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setDeleteId("");
    }
  };
  const handleDeleteMulti = async () => {
    try {
      const res = await optionService.deleteMultiOptions(selectedProduct);
      if (res.success) {
        handleGetProductList();
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleDeleteModal = () => {
    if (deleteId) {
      handleDeleteOption(deleteId);
    } else {
      handleDeleteMulti();
    }
    setIsOpen(false);
  };

  const titleModal = useMemo(() => {
    return deleteId
      ? i18n.t("popup_del_this_option")
      : i18n.t("popup_del_selected_option");
  }, [deleteId]);

  const isAllChecked = useMemo(() => {
    return products.length === selectedProduct.length;
  }, [selectedProduct, products]);

  useEffect(() => {
    handleGetProductList();
  }, [page, searchName]);

  const [filterOpen, setFilterOpen] = useState(false);

  // Sticky table header
  const tableContainerRef = useRef(null);
  const beforeTableRef = useRef(null);

  useEffect(() => {
    if (!props.isActive || products.length === 0) return;

    const scrollContainer = tableContainerRef.current;
    const table = scrollContainer.querySelector('table');
    const theads = table.querySelectorAll('thead');
    const beforeTable = beforeTableRef.current;

    if (!scrollContainer || !table) return;

    const updateOverflow = () => {
      const isOverflowing = table.scrollWidth > scrollContainer.clientWidth;
      scrollContainer.style.overflowX = isOverflowing ? 'auto' : 'unset';
      if (beforeTable) {
        beforeTable.style.position = isOverflowing ? 'relative' : 'sticky';
      }
      if (isOverflowing) {
        theads.forEach(el => {
          el.style.top = 0;
        });
      } else {
        theads.forEach(el => {
          el.style.top = '0.9375rem';
        });
      }
    };

    const debouncedUpdate = debounce(updateOverflow, 100); // 100ms debounce
    window.addEventListener('resize', updateOverflow);
    window.addEventListener("sidebar-toggled", debouncedUpdate);
    debouncedUpdate();

    return () => {
      window.removeEventListener('resize', updateOverflow);
      window.removeEventListener("sidebar-toggled", debouncedUpdate);
      debouncedUpdate.cancel();
    };
  }, [props.isActive, products]);

  return (
    <>
      <div className="filter-container">
        <div className="filter-header">
          <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
            <button
              className="filter-clear"
            >
              {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
            </button>
            <h5 className="filter-title">{i18n.t("option_list")}</h5>
          </div>
          <button
            className="filter-reset"
            onClick={() => setSearchName("")}
          >
            {i18n.t("reset")}
          </button>
        </div>
        <Collapse isOpen={filterOpen} className="filter-grid">
          <div className="filter-group">
            <label className="filter-label">{i18n.t("name")}</label>
            <InputSearch
              value={searchName}
              onChange={(e) => setSearchName(e)}
              placeholder={i18n.t("name")}
            />
          </div>
        </Collapse>
      </div>
      <div className="action-buttons">
        <div
          className="btn btn-primary btn-block px-2 d-flex gap-1"
          onClick={handleAddOption}
        >
          <IcPlus />
          <div className="" style={{ lineHeight: "17px" }}>
            {i18n.t("add_new_option")}
          </div>
        </div>
        <Button
          color="danger"
          outline={true}
          disabled={selectedProduct.length === 0}
          onClick={() => {
            if (selectedProduct.length > 0) {
              setIsOpen(true);
            }
          }}
          style={{ lineHeight: "17px" }}
        >
          {i18n.t("delete_selected")}
        </Button>
      </div>
      {products.length > 0 ? (
        <>
          <div className="before-table" ref={beforeTableRef}></div>
          <div className="table-container" ref={tableContainerRef}>
            <Table className="table mb-0">
              <thead>
                <tr>
                  <th>
                    <div onClick={handleCheckAll}>
                      <Input
                        type="checkbox"
                        checked={isAllChecked}
                        onChange={() => { }}
                      />
                    </div>
                  </th>
                  <th>{i18n.t("no")}</th>
                  <th>{i18n.t("option_name")}</th>
                  <th>{i18n.t("option_value")}</th>
                  <th style={{ width: 130 }}>{i18n.t("action")}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, index) => (
                  <tr key={index} onClick={() => handleRedirect(item)}>
                    <td>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckboxChange(item.id);
                        }}
                      >
                        <Input
                          type="checkbox"
                          checked={selectedProduct.includes(item.id)}
                          onChange={() => { }}
                        />
                      </div>
                    </td>
                    <td>{page * (index + 1)}</td>
                    <td>{item.name}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        {item.variants.map((variant, index) => (
                          <div
                            key={index}
                            className=""
                            style={{
                              padding: "2px 5px",
                              backgroundColor: "#F5F5F5",
                              color: "#000",
                              fontSize: "10px",
                            }}
                          >
                            {variant.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-row gap-1 justify-content-between align-items-center">
                        {/*  <div
                        style={{
                          cursor: "pointer",
                          display: "inline-block",
                          border: `1px solid ${
                            item.active === 0 ? "#FF0000" : "#1EAD07"
                          }`,

                          borderRadius: "20px",
                          color: item.active === 0 ? "#FF0000" : "#1EAD07",
                        }}
                        className="px-1"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(item.id, item.active);
                        }}
                      >
                        {item.active === 0 ? (
                          <Badge color="none" className="badge-error">{i18n.t("inactive")}</Badge>
                        ) : (
                          <Badge color="none" className="badge-success">{i18n.t("active")}</Badge>
                        )}
                      </div> */}
                        <button
                          className="btn btn-delete-outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(true);
                            setDeleteId(item.id);
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
          <div>{i18n.t("no_option_exist")}</div>
        </div>
      )}

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
      <ModalOption
        isOpen={isShow}
        onClose={() => setIsShow(false)}
        onAdd={handleGetProductList}
        serviceInfo={idOption}
      />
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
    </>
  );
};
export default OptionList;
