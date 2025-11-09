import { useEffect, useState, useMemo, useCallback } from "react";
import i18n from "i18next";
import { toast } from "react-toastify";
import MyModalTemplate from "../../../components/Common/MyModalTemplate";
import departmentService from "../../../services/department.service";
import operatorService from "../../../services/operator.service";
import TreeComponent from "../TreeComponent";
import { Modal, ModalHeader } from "reactstrap";

const ModalDepartmentList = (props) => {
  const [departments, setDepartments] = useState([]);
  const [listLocations, setListLocations] = useState([]);

  const treeData = useMemo(() => buildSegmentTreeByLocation(departments), [departments]);

  const handleGetDepartments = async () => {
    try {
      const res = await departmentService.getListDepartments({});
      if (res.success) {
        setDepartments(res.data);
      } else {
        console.log("fail: ", res);
        toast.error("Error fetching data", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        })
      }
    } catch (err) {
      console.log(err);
    }
  };
  const HandleGetListLocation = async () => {
    try {
      const res = await operatorService.getListLocationForOperator();
      if (res.success) {
        if (props.isMultiLocations) {
          setListLocations(
            res.data.map((el) => {
              return {
                value: el.id,
                label: el.name,
              };
            })
          );
        } else {
          setListLocations(
            res.data.map((el) => {
              return {
                value: el.id,
                label: el.name,
              };
            }).filter((el) => (props.selectedLocation.map((el) => Number(el)).includes(Number(el.value))))
          )
        }
      } else {
        console.log("fail: ", res)
      }
    } catch (err) {
      console.log("error: ", err);
    }
  }

  function buildSegmentTreeByLocation(departments) {
    const groupedTrees = {};

    const groups = departments.reduce((acc, dept) => {
      const locId = dept.location_id ?? 'null';
      if (!acc[locId]) acc[locId] = [];
      acc[locId].push(dept);
      return acc;
    }, {});

    for (const [locId, deptGroup] of Object.entries(groups)) {
      const map = new Map();
      const tree = [];

      deptGroup.forEach((seg) => {
        map.set(seg.id, { ...seg, children: [] });
      });

      deptGroup.forEach((seg) => {
        if (seg.upper_id) {
          const parent = map.get(seg.upper_id);
          if (parent) parent.children.push(map.get(seg.id));
        } else {
          tree.push(map.get(seg.id));
        }
      });

      groupedTrees[locId === 'null' ? null : locId] = tree.sort((a, b) => a.id - b.id);
    }
    return groupedTrees;
  }

  useEffect(() => {
    HandleGetListLocation();
    if (!props.isOpen) {
      handleGetDepartments();
    }
  }, [props.isOpen, props.isMultiLocations, props.selectedLocation]);

  return (
    <Modal
      isOpen={props.isOpen}
      toggle={props.onClose}
      centered
      size="xl"
    >
      <ModalHeader toggle={props.onClose} className="bg-light border-bottom-0">
        {departments.length <= 1 ? i18n.t("department") : i18n.t("departments")}
      </ModalHeader>

      <div className="tab-content">
        {props.displayEmpty && (
          <div className="tree-scroller mb-3">
            {console.log(treeData['null'])}
            <div className="tree-container">
              <TreeComponent
                items={[{ id: null, name: i18n.t("no_department"), upper_id: null, children: [], customer_groups: [] }]}
                isListDisplay={true}
                setSelectedDepartment={props.setSelectedDepartment}
                selectedItem={props.selected}
              />
            </div>
          </div>
        )}
        {treeData['null'] && (
          <div className="tree-scroller">
            <div className="tree-container">
              <TreeComponent
                items={treeData['null']}
                isListDisplay={true}
                setSelectedDepartment={props.setSelectedDepartment}
                selectedItem={props.selected}
              />
            </div>
          </div>
        )}

        <div>
          <div>
            {listLocations.map((el) => {
              return (
                <div>
                  <div className="staff-label" style={{ textAlign: "left" }}>
                    {el.label}
                  </div>
                  <div>
                    {treeData[el.value] ? (
                      <div className="tree-scroller">
                        <div className="tree-container">
                          <TreeComponent
                            items={treeData[el.value]}
                            isListDisplay={true}
                            setSelectedDepartment={props.setSelectedDepartment}
                            selectedItem={props.selected}
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center" }}>
                        {i18n.t("there_are_no_data_exist")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalDepartmentList;
