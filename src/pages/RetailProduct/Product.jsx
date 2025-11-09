// Function Name : Product List
// Created date :  8/8/24             by :  NgVinh
// Updated date :                      by :  NgVinh
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Col, Collapse, Input, Row, Table } from "reactstrap";
import InputSearch from "../../components/Common/InputSearch";
import MyDropdown from "../../components/Common/MyDropdown";
import { listActive } from "../../constants/app.const";
import productService from "../../services/product.service";
import IcDot from "../../assets/icon/IcDot";
import IcTrash from "../../assets/icon/IcTrash";
import IcPlus from "../../assets/icon/IcPlus";
import MyModalTemplate from "../../components/Common/MyModalTemplate";
import ModalProduct from "./ModalProduct";
import { toast } from "react-toastify";
import MyPagination from "../../components/Common/Mypagination";
import i18n from "../../i18n";
import { formatNumberAsCurrency } from "../../utils/app";
import { useAppSelector } from "../../hook/store.hook";
import { debounce } from "lodash";

const Product = (props) => {
  const [searchName, setSearchName] = React.useState("");
  const [active, setActive] = React.useState("");
  const [selectedProduct, setSelectedProduct] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [totalRecord, setTotalRecord] = React.useState(0);
  const [totalPage, setTotalPage] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [isShow, setIsShow] = React.useState(false);
  const [idOption, setIdOption] = React.useState(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState("");
  const { permissionUser } = useAppSelector((state) => state.auth);

  const handleResetFilter = () => {
    setSearchName("");
    setActive("");
  }

  const createCategory = useMemo(() => {
    return permissionUser.includes("product:create");
  }, [permissionUser]);
  const updateStatus = useMemo(() => {
    return permissionUser.includes("product:update_status");
  }, [permissionUser]);
  const viewDetail = useMemo(() => {
    return permissionUser.includes("product:view_detail");
  }, [permissionUser]);
  const deleteProduct = useMemo(() => {
    return permissionUser.includes("product:delete");
  }, [permissionUser]);
  const handleAddOption = () => {
    setIdOption(null);
    setIsShow(true);
  };
  const handleRedirect = (item) => {
    if (viewDetail) {
      setIdOption(item.id);
      setIsShow(true);
    }
  };
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

  const handleGetProductList = async () => {
    try {
      const payload = {
        active: active,
        keyword: searchName,
        limit: 20,
        page: page,
      };
      setSelectedProduct([]);
      const res = await productService.getListProduct(payload);
      setProducts(res.data);
      setTotalRecord(res.meta.total);
      setTotalPage(res.meta.last_page);
    } catch (error) {
      console.log(error);
    }
  };
  const handleDeleteOption = async (id) => {
    try {
      const res = await productService.deleteProduct(id);
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
      const res = await productService.deleteMultiProducts(selectedProduct);
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

  const handleUpdateStatus = async (id, active) => {
    try {
      const res = await productService.updateStatusProduct(
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
        handleGetProductList();
      }
    } catch (e) { }
  };
  const titleModal = useMemo(() => {
    return deleteId
      ? i18n.t("popup_del_this_product")
      : i18n.t("popup_del_selected_product");
  }, [deleteId]);

  const isAllChecked = useMemo(() => {
    return products.length === selectedProduct.length;
  }, [selectedProduct, products]);

  useEffect(() => {
    handleGetProductList();
  }, [page, active, searchName]);

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
    <div className="d-flex flex-column flex-1">
      <div className="filter-container">
        <div className="filter-header">
          <div className="filter-title-group" onClick={() => setFilterOpen(!filterOpen)}>
            <button
              className="filter-clear"
            >
              {filterOpen ? <i className="fa fa-chevron-right" /> : <i className="fa fa-chevron-down" />}
            </button>
            <h5 className="filter-title">{i18n.t("product_list")}</h5>
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
            <label className="filter-label">{`ID, ${i18n.t("name")}`}</label>
            <InputSearch
              value={searchName}
              onChange={(e) => setSearchName(e)}
              placeholder={`ID, ${i18n.t("name")}`}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">{i18n.t("status")}</label>
            <MyDropdown
              options={listActive}
              selected={active}
              displayEmpty={true}
              setSelected={(e) => setActive(e)}
              placeholder={i18n.t("status")}
            />
          </div>
        </Collapse>
      </div>
      <div className="action-buttons">
        <div
          className="btn btn-primary btn-block px-2 d-flex gap-1"
          onClick={handleAddOption}
          style={{
            display: createCategory ? "block" : "none",
          }}
        >
          <IcPlus />
          <div className="" style={{ lineHeight: "17px" }}>
            {i18n.t("add_new_product")}
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
          style={{
            lineHeight: "17px",
            display: deleteProduct ? "block" : "none",
          }}
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
                  {deleteProduct && (
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

                  <th>{i18n.t("product_id")}</th>
                  <th>{i18n.t("product_name")}</th>
                  <th>{i18n.t("unit")}</th>
                  <th style={{ textAlign: 'right' }}>{i18n.t("price")}</th>
                  <th>{i18n.t("product_category")}</th>
                  <th style={{ width: i18n.language === "en" ? 130 : 195 }}>
                    {i18n.t("action")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, index) => (
                  <tr key={index} onClick={() => handleRedirect(item)}>
                    {deleteProduct && (
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
                    )}
                    <td>{item.product_number}</td>
                    <td>{item.name}</td>
                    <td>{item.unit.name}</td>
                    <td style={{ textAlign: "right", }}>
                      <div style={{ paddingRight: "0" }}>
                        {formatNumberAsCurrency(item.price)}
                      </div>
                    </td>
                    <td>{item.category?.name || "-"}</td>
                    <td>
                      <div className="d-flex flex-row gap-1 justify-content-between align-items-center">
                        <div
                          style={{
                            cursor: updateStatus
                              ? "pointer"
                              : "none",
                          }}
                          className="px-1"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (updateStatus) {
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
                          className="btn btn-delete-outline"
                          style={{ display: deleteProduct ? "block" : "none" }}
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
      ) : (
        <div className="d-flex justify-content-center d-flex align-items-center h-100 mt-4">
          <div>{i18n.t("no_product_exist")}</div>
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
      <ModalProduct
        isOpen={isShow}
        onClose={() => {
          setIsShow(false);
        }}
        onAdd={handleGetProductList}
        serviceInfo={idOption}
      />
    </div>
  );
};
export default Product;
