import React, { useEffect, useState } from "react";
import { HiMiniUsers } from "react-icons/hi2";
import { FaBook, FaRegEye, FaRegUser } from "react-icons/fa6";
import { IoMdStats } from "react-icons/io";
import { MdOutlineArticle, MdOutlineInsertComment } from "react-icons/md";

import "./Dashboard.css";
import { fetchDashboard } from "../../DAL/fetch";
import Areachart from "../../Components/Areachart";

const Dashboard = () => {
  const [data, setData] = useState(null);

  const getStats = async () => {
    try {
      const response = await fetchDashboard();
      console.log("DASHBOARD DATA IS ", response);
      setData(response);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  return (
    <>
      <h2 className="dashboard-text">Dashboard</h2>
      
      {/* ✅ Only Render When Data is Available */}
      {data && (
        <>
          <div className="cards">
            <div className="card0">
              <HiMiniUsers className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.todayLeads}</h3>
                <p>Today Leads</p>
              </div>
            </div>
            <div className="card2">
              <HiMiniUsers className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.yesterdayLeads}</h3>
                <p>Yesterday Leads</p>
              </div>
            </div>
            <div className="card3">
              <HiMiniUsers className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalLeads}</h3>
                <p>Total Leads</p>
              </div>
            </div>
            <div className="card4">
              <MdOutlineArticle className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalBlogs}</h3>
                <p>Total Blogs</p>
              </div>
            </div>
            <div className="card5">
              <MdOutlineInsertComment className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalComments}</h3>
                <p>Total Comments</p>
              </div>
            </div>
            <div className="card0">
              <FaRegEye className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.todayImpression}</h3>
                <p>Today Impressions</p>
              </div>
            </div>
            <div className="card2">
              <FaRegEye className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.yesterdayImpression}</h3>
                <p>Yesterday Impressions</p>
              </div>
            </div>
            <div className="card3">
              <FaRegEye className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalImpressions}</h3>
                <p>All Time Impressions</p>
              </div>
            </div>
            <div className="card4">
              <FaRegUser className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="card5">
              <IoMdStats className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalServices}</h3>
                <p>Total Services</p>
              </div>
            </div>
          </div>

          {/* ✅ Render Areachart in the Correct Div */}
          <div className="charts-areas">
              <Areachart />
           
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
