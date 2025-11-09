import {
  Button,
  Col,
  Modal,
  ModalHeader,
  Row,
  Table,
} from "reactstrap";
import { useEffect, useMemo, useState } from "react";
import dashboardService from "../../services/dashboard.service";
import InputSearch from "../../components/Common/InputSearch";
import MyPagination from "../../components/Common/Mypagination";
import { CSVLink } from "react-csv";
import i18n from "../../i18n";

const headers = [
  { label: "Customer", key: "name" },
  { label: "Completion Rate", key: "completion_rate" },
  { label: "Cancellation Rate", key: "cancel_rate" },
  { label: "Absence Rate", key: "absence_rate" },
  { label: "Days Since Last Booking", key: "day_last_booking" },
  { label: "Training Frequency", key: "training_frequency" },
];

const ModalCustomerPrediction = ({ isOpen, onClose, isRisk, date, data }) => {
  const labelMetric = useMemo(() => {
    return isRisk ? i18n.t('risk_customers') : i18n.t('potential_customers');
  }, [isRisk]);

  const [dataTable, setDataTable] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(1);

  const dataExport = useMemo(() => {
    return dataTable.map((item) => {
      return {
        name: `${item.last_name} ${item.first_name}`,
        completion_rate: `${item.completion_rate} %`,
        cancel_rate: `${item.cancel_rate} %`,
        absence_rate: `${item.absence_rate} %`,
        day_last_booking: `${item.day_last_booking || 0} days ago`,
        training_frequency: `${item.training_frequency}`,
      };
    });
  }, [dataTable]);
  const handleDataTable = async () => {
    try {
      const payload = {
        type: isRisk ? "risk" : "potential",
        keyword: searchName,
        start_date: date.startDate,
        end_date: date.endDate,
        limit: 20,
        page: currentPage,
      };
      const res = await dashboardService.getListPrediction(payload);
      if (res.success) {
        setDataTable(res.data);
        setTotalRecord(res.meta.total);
        setTotalPage(res.meta.last_page);
      }
    } catch (e) {
      console.log("e", e);
    }
  };

  const colorTableItem = (rateRisk, ratePotential, value) => {
    if((!rateRisk &&rateRisk !== 0)||(!ratePotential &&ratePotential !== 0) ||(!value &&value !== 0)){
      return   "#000"
    }
    if (isRisk) {
      return value < rateRisk ? "rgba(255, 0, 0, 0.71)" : "#000";
    } else {
      return value > ratePotential ? "rgba(7, 192, 47, 0.72)" : "#000";
    }
  };

  const colorTableItemReverse = (rateRisk, ratePotential, value) => {
    if((!rateRisk &&rateRisk !== 0)||(!ratePotential &&ratePotential !== 0) ||(!value &&value !== 0)){
      return   "#000"
    }
    if (isRisk) {
      return value > rateRisk ? "rgba(255, 0, 0, 0.71)" : "#000";
    } else {
      return value < ratePotential ? "rgba(7, 192, 47, 0.72)" : "#000";
    }
  };
  useEffect(() => {
    handleDataTable();
  }, [currentPage, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      size="xl"
      autoFocus={true}
      centered
      data-toggle="modal"
      toggle={() => {
        onClose();
      }}
    >
      <ModalHeader
        className="border-bottom-0 pb-0"
        toggle={() => {
          onClose();
        }}
      >
        <h4>{labelMetric}</h4>
      </ModalHeader>
      <p style={{ color: "#BABABA", padding: "0 20px" }}>
        {isRisk ? i18n.t('risk_description') : i18n.t('potential_description')}
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0 20px 20px 20px",
        }}
      >
        <Row>
          <Col md={5}>
            <InputSearch
              value={searchName}
              onChange={(e) => setSearchName(e)}
              placeholder={i18n.t('search_customer')}
            />
          </Col>
          <Col md={1}>
            <Button
              onClick={() => {
                handleDataTable();
              }}
              outline
            >
              {i18n.t('search')}
            </Button>
          </Col>
          <Col md={4}></Col>
          <Col md={2} style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button outline>
              <CSVLink
                data={dataExport}
                headers={headers}
                filename={"my-ai-prediction.csv"}
              >
                {i18n.t('export_csv')}
              </CSVLink>
            </Button>
          </Col>
        </Row>
        <Table hover responsive style={{ backgroundColor: "#fafafa", marginTop: 16 }}>
          <thead>
            <tr>
              <th>{i18n.t('customer')}</th>
              <th>{i18n.t('completion_rate')}</th>
              <th>{i18n.t('cancellation_rate')}</th>
              <th>{i18n.t('absence_rate')}</th>
              <th>{i18n.t('days_since_last_booking')}</th>
              <th>{i18n.t('training_frequency')}</th>
            </tr>
          </thead>
          <tbody>
            {dataTable.length > 0 ? (
              dataTable.map((item, index) => (
                <tr key={index}>
                  <td>{item.last_name + " " + item.first_name}</td>
                  <td
                    style={{
                      color: colorTableItem(
                        data?.riskRate?.completion_rate,
                        data?.potentialRate?.completion_rate,
                        item.completion_rate
                      ),
                    }}
                  >
                    {item.completion_rate}%
                  </td>
                  <td
                    style={{
                      color: colorTableItemReverse(
                        data?.riskRate?.cancel_rate,
                        data?.potentialRate?.cancel_rate,
                        item.cancel_rate
                      ),
                    }}
                  >
                    {item.cancel_rate}%
                  </td>
                  <td
                    style={{
                      color: colorTableItemReverse(
                        data?.riskRate?.absence_rate,
                        data?.potentialRate?.absence_rate,
                        item.absence_rate
                      ),
                    }}
                  >
                    {item.absence_rate}%
                  </td>
                  <td
                    style={{
                      color: colorTableItemReverse(
                        data?.riskRate?.day_last_booking,
                        data?.potentialRate?.day_last_booking,
                        item?.day_last_booking
                      ),
                    }}
                  >
                    {item?.day_last_booking || 0} {i18n.t('day_ago')}
                  </td>
                  <td
                    style={{
                      color: colorTableItem(
                        data?.riskRate?.training_frequency,
                        data?.potentialRate?.training_frequency,
                        item?.training_frequency
                      ),
                    }}
                  >
                    {item?.training_frequency}
                  </td>
                </tr>
              ))
            ) : (
              <tr
                className="text-center item-center"
                style={{ height: 100, verticalAlign: "middle" }}
              >
                <td colSpan="6">{i18n.t('there_are_no_data_exist')}</td>
              </tr>
            )}
          </tbody>
        </Table>
        <MyPagination
          page={currentPage}
          totalRecord={totalRecord}
          rowPerPage={20}
          totalPage={totalPage}
          onPrevious={() => {
            if (page > 1) {
              setCurrentPage(page - 1);
            }
          }}
          onNext={() => {
            if (page < totalPage) {
              setCurrentPage(page + 1);
            }
          }}
          onClick={(page) => {
            setCurrentPage(page);
          }}
        />
      </div>
    </Modal>
  );
};
export default ModalCustomerPrediction;
