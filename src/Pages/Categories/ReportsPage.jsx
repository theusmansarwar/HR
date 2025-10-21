import { employeesData, payrollData, performanceData, finesData } from "../../Pages/Categories/Data";

const ReportsPage = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Reports Dashboard</h2>

      {/* Employees Report */}
      <section style={{ marginBottom: "30px" }}>
        <h3>Employees Report</h3>
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employeesData.map((emp) => (
              <tr key={emp.EmployeeID}>
                <td>{emp.EmployeeID}</td>
                <td>{emp.FullName}</td>
                <td>{emp.Email}</td>
                <td>{emp.DepartmentID}</td>
                <td>{emp.DesignationID}</td>
                <td>{emp.Status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Payroll Report */}
      <section style={{ marginBottom: "30px" }}>
        <h3>Payroll Report</h3>
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Payroll ID</th>
              <th>Employee ID</th>
              <th>Month</th>
              <th>Basic Salary</th>
              <th>Deductions</th>
              <th>Overtime</th>
              <th>Net Salary</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.map((pay) => (
              <tr key={pay.PayrollID}>
                <td>{pay.PayrollID}</td>
                <td>{pay.EmployeeID}</td>
                <td>{pay.Month}</td>
                <td>{pay.BasicSalary}</td>
                <td>{pay.Deductions}</td>
                <td>{pay.Overtime}</td>
                <td>{pay.NetSalary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Performance Report */}
      <section style={{ marginBottom: "30px" }}>
        <h3>Performance Report</h3>
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Performance ID</th>
              <th>Employee ID</th>
              <th>KPIs</th>
              <th>Appraisal Date</th>
              <th>Score</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {performanceData.map((perf) => (
              <tr key={perf.PerformanceID}>
                <td>{perf.PerformanceID}</td>
                <td>{perf.EmployeeID}</td>
                <td>{perf.KPIs}</td>
                <td>{perf.AppraisalDate}</td>
                <td>{perf.Score}</td>
                <td>{perf.Remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Fines Report */}
      <section>
        <h3>Fines Report</h3>
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Employee Name</th>
              <th>Fine Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {finesData.map((fine) => (
              <tr key={fine.ReportID}>
                <td>{fine.ReportID}</td>
                <td>{fine.EmployeeName}</td>
                <td>{fine.FineType}</td>
                <td>{fine.FineAmount}</td>
                <td>{fine.FineDate}</td>
                <td>{fine.Description}</td>
                <td>{fine.Status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ReportsPage;
