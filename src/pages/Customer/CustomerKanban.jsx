import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { extend } from "@syncfusion/ej2-base";
import { KanbanComponent } from "@syncfusion/ej2-react-kanban";
import i18n from "../../i18n";
import { listLabelCustomer } from "../../constants/app.const";
import { Badge } from "reactstrap";
import customerService from "../../services/customer.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CustomerKanban = ({ list, isActive, fetchData }) => {
  const navigate = useNavigate();

  const handleDrop = async (args) => {
    const customer = args.data[0];
    console.log(customer);
    const source = args.event.element;
    const sourceDataKey = source.closest('[data-key]');
    const target = args.event.target;
    const targetDataKey = target.closest('[data-key]');
    try {
      if (targetDataKey.dataset.key === sourceDataKey.dataset.key) {
        args.cancel = true;
        return;
      }

      const formData = new FormData();
      formData.append("first_name", customer.first_name || "-");
      formData.append("last_name", customer.last_name || "-");
      formData.append("email", customer.email || "");
      formData.append("phone", customer.phone || "");
      formData.append("invite", customer.invited ? 1 : 0 || 0);
      formData.append("stage_id", targetDataKey.dataset.key);
      formData.append("_method", "PUT");

      const response = await customerService.updateCustomer(formData, customer.id);
      if (response.success) {
        toast.success(i18n.t("update_customer_success"), {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          hideProgressBar: true,
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleCardRendered = (args) => {
    const cardElement = args.element;

    // Pour éviter les doublons
    if (!cardElement.dataset.clickBound) {
      cardElement.addEventListener("click", (e) => {
        e.stopPropagation(); // important si Syncfusion intercepte au-dessus

        const customer = args.data;
        if (customer?.id && customer?.c_id) {
          navigate(`/customer/detail/${customer.id}/${customer.customer_id}`);
        }
      });

      cardElement.dataset.clickBound = "true";
    }
  };

  const [expanded, setExpanded] = useState(true);
  const [expanded0, setExpanded0] = useState(true);
  const [expanded1, setExpanded1] = useState(true);
  const [expanded2, setExpanded2] = useState(true);
  const [expanded3, setExpanded3] = useState(true);

  const dataKanban = useMemo(() => {
    return extend(
      [],
      list.map((item) => ({
        ...item,
        name: `${item.last_name} ${item.first_name}`,
      })),
      null,
      true
    );
  }, [list]);

  const getLabel = (label) => {
    if (!label && label !== 0) return "-";
    const found = listLabelCustomer.find(
      (i) => i.value.toString() === label.toString()
    );
    return found ? found.label : "-";
  };

  const cardSettings = {
    contentField: "name",
    headerField: "c_id",
    tagsField: "label",
    template: (props) => (
      <>
        <div className="kanban-card-header-title">{props.c_id}</div>
        <div className="kanban-card-content-wrapper">
          <div className="kanban-card-tag badge-container">
            <Badge
              color="none"
              className={"badge-" + getLabel(props.label).toLowerCase()}
            >
              {getLabel(props.label)}
            </Badge>
          </div>
          <div className="kanban-card-content">
            <i className="fa fa-user" /> {props.name}
          </div>
          {props.email && (
            <div className="kanban-card-content">
              <a
                href={`mailto:${props.email}`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <i className="fa fa-envelope" /> {props.email || "-"}
              </a>
            </div>
          )}
          {props.phone && (
            <div className="kanban-card-content">
              <a
                href={`tel:${props.phone}`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <i className="fa fa-phone" /> {props.phone || "-"}
              </a>
            </div>
          )}
        </div>
      </>
    ),
  };

  const columns = [
    { headerText: i18n.t("new"), keyField: 0, allowToggle: true, isExpanded: expanded0 },
    { headerText: i18n.t("open"), keyField: 1, allowToggle: true, isExpanded: expanded1 },
    { headerText: i18n.t("potential"), keyField: 2, allowToggle: true, isExpanded: expanded2 },
    { headerText: i18n.t("active_status"), keyField: 3, allowToggle: true, isExpanded: expanded3 },
  ];

  const toggleAll = (e) => {
    setExpanded((prev) => !prev);

    setExpanded0(!expanded);
    setExpanded1(!expanded);
    setExpanded2(!expanded);
    setExpanded3(!expanded);
  };

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      const header0 = document.querySelector('.e-header-cells[data-key="0"]');
      header0.addEventListener("click", (e) => { setExpanded0((prev) => !prev) });

      const header1 = document.querySelector('.e-header-cells[data-key="1"]');
      header1.addEventListener("click", (e) => { setExpanded1((prev) => !prev) });

      const header2 = document.querySelector('.e-header-cells[data-key="2"]');
      header2.addEventListener("click", (e) => { setExpanded2((prev) => !prev) });

      const header3 = document.querySelector('.e-header-cells[data-key="3"]');
      header3.addEventListener("click", (e) => { setExpanded3((prev) => !prev) });

      return () => {
        header0.removeEventListener("click", (e) => { setExpanded0((prev) => !prev) });
        header1.removeEventListener("click", (e) => { setExpanded1((prev) => !prev) });
        header2.removeEventListener("click", (e) => { setExpanded2((prev) => !prev) });
        header3.removeEventListener("click", (e) => { setExpanded3((prev) => !prev) });
      };
    }
  }, [isLoaded, isActive, expanded, expanded0, expanded1, expanded2, expanded3]);

  const handleKanbanCreated = () => {
    setIsLoaded(true);
  }

  // Remove Syncfusion popup from the DOM
  useEffect(() => {
    const bodyLastChild = document.querySelector('div[style*="position: fixed"][style*="width: 100%"][style*="height: 100%"][style*="top: 0"][style*="left: 0"][style*="right: 0"][style*="bottom: 0"][style*="background-color: rgba(0, 0, 0, 0.5)"][style*="z-index: 99999"]');

    if (!bodyLastChild) return;

    const parent = bodyLastChild.parentElement;

    if (!parent) return;

    parent.remove();
  })

  return (
    <>
      <div className="action-buttons">
        <button className="btn btn-outline" onClick={toggleAll}>
          {expanded ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="before-table"></div>
      <KanbanComponent
        id="kanban"
        keyField="stage_id"
        dataSource={dataKanban}
        cardSettings={cardSettings}
        columns={columns}
        layout='swimlane'
        constraintType="swimlane"
        width="100%"
        height="100%"
        swimlaneSettings={{ allowDragAndDrop: true }}
        dataBound={handleKanbanCreated}
        dragStop={handleDrop}
        cardRendered={handleCardRendered}
      />
    </>
  );
};

CustomerKanban.propTypes = {
  list: PropTypes.array.isRequired,
};

export default CustomerKanban;
