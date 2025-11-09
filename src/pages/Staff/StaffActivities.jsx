import { useState } from "react";
import { Button } from "reactstrap";
import { formatNumberAsCurrency } from "../../utils/app";
import { listStatusSaleOrder } from "../../constants/app.const";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import i18n from "../../i18n";
import StaffClass from "./StaffClass";
import StaffSaleOrder from "./StaffSaleOrder";

const StaffActivities = (props) => {
  const [saleOrders, setSaleOrders] = useState([]);
  const [classes, setClasses] = useState([]);

  const getStatus = (status) => {
    return listStatusSaleOrder.find((item) => (item.value === status));
  };

  function formatScheduleDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  };

  function formatScheduleDateTime(dateStr, startMinutes, endMinutes) {
    const baseDate = new Date(dateStr);
    const start = new Date(baseDate.getTime() + startMinutes * 60000);
    const end = new Date(baseDate.getTime() + endMinutes * 60000);
    const startTime = start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const endTime = end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

    return `${startTime} - ${endTime}`;
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Actiwell";
    workbook.created = new Date();

    // =============================
    // 1) Sales Orders Sheet
    // =============================
    const saleSheet = workbook.addWorksheet("Sale Orders");

    saleSheet.columns = [
      { header: "Order ID", key: "id" },
      { header: "Date", key: "date" },
      { header: "Contact", key: "contact" },
      { header: "Phone", key: "phone" },
      { header: "Salespersons", key: "salespersons" },
      { header: "Amount Due", key: "due" },
      { header: "Amount Paid", key: "paid" },
      { header: "Total", key: "total" },
      { header: "Location", key: "location" },
      { header: "Status", key: "status" },
    ];

    saleOrders.forEach((sale) => {
      saleSheet.addRow({
        id: sale.sale_order_number,
        date: formatScheduleDate(sale.created_at),
        contact: `${sale?.customer?.last_name ?? ""} ${sale?.customer?.first_name ?? ""}`,
        phone: sale?.customer?.phone ?? "",
        salespersons: sale.sale_persons
          .map((sp) => `${sp.last_name} ${sp.first_name}`)
          .join(", "),
        due: formatNumberAsCurrency(sale.total_amount - sale.paid_amount),
        paid: formatNumberAsCurrency(sale.paid_amount),
        total: formatNumberAsCurrency(sale.total_amount),
        location: sale.location?.name ?? "",
        status: getStatus(sale.status)?.label,
      });
    });

    // =============================
    // 2) Staff Classes Sheet
    // =============================
    const classSheet = workbook.addWorksheet("Classes");

    classSheet.columns = [
      { header: "Class Name", key: "className" },
      { header: "Date", key: "date" },
      { header: "Time", key: "time" },
      { header: "Commission", key: "commission" },
    ];

    classes.forEach((group) => {
      group.forEach((schedule) => {
        classSheet.addRow({
          className: schedule.class?.name ?? "",
          date: formatScheduleDate(schedule.date),
          time: formatScheduleDateTime(schedule.date, schedule.start_time, schedule.end_time),
          commission: formatNumberAsCurrency(schedule.trainer_session_gains),
        });
      });
    });

    // =============================
    // 3) Global Styling
    // =============================
    [saleSheet, classSheet].forEach((sheet) => {
      // Font
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.font = { name: "Calibri", size: 11 };
        });
      });

      // Headers
      sheet.getRow(1).eachCell((cell) => {
        cell.font = { name: "Calibri", size: 11, bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF3A3B5C" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Column auto ajustment
      sheet.columns.forEach((col) => {
        let maxLength = 0;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const len = cell.value ? cell.value.toString().length : 10;
          if (len > maxLength) maxLength = len;
        });
        col.width = maxLength + 2;
      });
    });

    // =============================
    // 4) Specific formatting
    // =============================
    // Gains
    classSheet.getColumn("commission").eachCell((cell, rowNumber) => {
      if (rowNumber === 1) return;
      if (cell.value && cell.value !== "0") {
        cell.font = { name: "Calibri", size: 11, color: { argb: "FF16A34A" } };
      }
    });

    saleSheet.getColumn("due").alignment = { horizontal: "right" };
    saleSheet.getColumn("paid").alignment = { horizontal: "right" };
    saleSheet.getColumn("total").alignment = { horizontal: "right" };
    classSheet.getColumn("commission").alignment = { horizontal: "right" };

    // =============================
    // 5) Generate & Download
    // =============================
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `staff_activities_${props.staff?.last_name}_${props.staff?.first_name}.xlsx`
    );
  };

  return (
    <>
      <Button
        className="secondary mb-4"
        outline
        onClick={() => { exportToExcel() }}
        style={{ width: 'fit-content' }}
      >
        {i18n.t("export_excel")}
      </Button>
      <StaffSaleOrder
        staffId={props.staff?.id}
        isActive={props.activeTab}
        onDataLoaded={setSaleOrders}
      />
      <StaffClass
        staffId={props.staff?.id}
        isActive={props.activeTab}
        onDataLoaded={setClasses}
      />
    </>
  );
};

export default StaffActivities;