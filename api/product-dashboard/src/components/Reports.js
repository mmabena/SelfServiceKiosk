useEffect(() => {
  const fetchReport = async () => {
    try {
      const response = await fetch("http://localhost:5219/api/reports/summary");
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
  };

  fetchReport();
}, []);

<div className="report-wrapper">
  <h2>📊 Dashboard Reports</h2>
  <p>Total Products in Carts: {reportData.totalProductsInCarts}</p>
  <p>Average Sales/Week: R{reportData.averageSalesPerWeek}</p>

  <h3>Most Popular Products</h3>
  <ul>
    {reportData.mostPopularProducts?.map((p) => (
      <li key={p.name}>
        {p.name} - {p.timesAdded} times
      </li>
    ))}
  </ul>

  <h3>Weekly Sales</h3>
  <ul>
    {reportData.weeklySales?.map((w) => (
      <li key={w.week}>
        {w.week}: R{w.totalSales}
      </li>
    ))}
  </ul>
</div>;
