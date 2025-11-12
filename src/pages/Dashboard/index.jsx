import React, { useEffect, useState } from "react";
import i18n from "../../i18n";
import { useAppSelector } from "../../hook/store.hook";
import dashboardService from "../../services/dashboard.service";
import { formatNumberAsCurrency } from "../../utils/app";

const Dashboard = () => {
  document.title = "Dashboard | Fitness CMS";

  const { operator } = useAppSelector((state) => state.operator);
  const [metrics, setMetrics] = useState({
    revenue: 0,
    totalMembers: 0,
    newCustomers: 0,
    packages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        const payload = {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        };
        const response = await dashboardService.getListDataStatistic(payload);

        if (response?.success) {
          const data = response.data || {};
          setMetrics({
            revenue: data?.revenue?.current ?? 0,
            totalMembers: data?.member?.current?.total ?? 0,
            newCustomers: data?.member?.current?.new ?? 0,
            packages: data?.package?.current ?? 0,
          });
        } else {
          setError("Không thể tải dữ liệu.");
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
        setError("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const cards = [
    {
      key: "revenue",
      label: "Tổng doanh số",
      value: `${formatNumberAsCurrency(metrics.revenue)} VND`,
    },
    {
      key: "totalMembers",
      label: "Tổng cộng thành viên",
      value: formatNumberAsCurrency(metrics.totalMembers),
    },
    {
      key: "newCustomers",
      label: "Khách hàng mới",
      value: formatNumberAsCurrency(metrics.newCustomers),
    },
    {
      key: "packages",
      label: "Gói tập",
      value: formatNumberAsCurrency(metrics.packages),
    },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="dashboard-title">
          {i18n.t("welcome_back")} {operator?.name}
        </div>
        <div className="row g-3">
          {cards.map((card) => (
            <div className="col-12 col-md-6 col-xl-3" key={card.key}>
              <div className="card h-100">
                <div className="card-body">
                  <p className="text-muted mb-2">{card.label}</p>
                  <h4 className="mb-0">
                    {loading ? "..." : card.value}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
        {error && (
          <div className="alert alert-danger mt-4" role="alert">
            {error}
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
