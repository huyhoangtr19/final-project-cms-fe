const ChartHoverLabel = ({ label, value }) => {
  return (
    <div className="chart-hover-label">
      {label}: <strong>{value}</strong>
    </div>
  );
};

export default ChartHoverLabel;