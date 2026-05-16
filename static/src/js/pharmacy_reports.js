/** @odoo-module **/

import { medicines } from "./data/medicine_data.js";
import { rpc } from "@web/core/network/rpc";

// Simple JavaScript class for Reports (not OWL Component)
class PharmacyReports {
  constructor() {
    console.log("PharmacyReports constructor() called");
    this.charts = {};
    this.dashboardData = {};
    this.metricsData = {};
    this.reportData = {};
    this.activeTab = "Daily Sales";
    this.rpc = rpc;

    // Set default date range (last 7 days)
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 6);

    this.fromDate = lastWeek.toISOString().split("T")[0];
    this.toDate = today.toISOString().split("T")[0];

    this.init();
  }

  async init() {
    await this.loadReportData();
    this.renderReports();
  }

  async loadReportData() {
    try {
      const data = await this.rpc("/pharmacy/reports/data", {
        from_date: this.fromDate,
        to_date: this.toDate,
        session_start: localStorage.getItem("pharmacy_session_start"),
        shift: localStorage.getItem("pharmacy_active_shift"),
      });

      if (data) {
        this.metricsData = data.metrics || {};
        this.reportData = {
          daily_sales: data.daily_sales || {
            labels: [],
            sales: [],
            profit: [],
          },
          fast_movers: data.fast_movers || [],
          expiry_report: data.expiry_report || [],
          stock_valuation: data.stock_valuation || { summary: {}, details: [] },
          cashier_summary: data.cashier_summary || [],
          expected_session_cash: data.expected_session_cash || 0,
        };
        console.log("Report data loaded from backend:", this.reportData);
      }
    } catch (error) {
      console.error("Error loading report data from backend:", error);
      this.setDefaultData();
    }
  }

  setDefaultData() {
    // Fallback data when JSON files are not available
    this.dashboardData = {
      total_sales: 0,
      net_sales: 0,
      total_discount: 0,
      total_returns: 0,
      tax_collected: 0,
    };

    this.metricsData = {
      gross_sales: 0,
      net_sales: 0,
      total_discount: 0,
      total_returns: 0,
      tax_collected: 0,
    };

    this.reportData = {
      daily_sales: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        sales: [35000, 48000, 42000, 61000, 78000, 72000, 48750],
        profit: [9500, 12000, 10500, 16000, 22000, 19500, 12400],
      },
      profit_report: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        profit: [9500, 12000, 10500, 16000, 22000, 19500, 12400],
      },
      fast_movers: [
        {
          rank: 1,
          medicine: "Panadol 500mg",
          qty_sold: 450,
          revenue: 29250,
          avg_per_day: 64,
        },
        {
          rank: 2,
          medicine: "Omeprazole 20mg",
          qty_sold: 220,
          revenue: 9240,
          avg_per_day: 31,
        },
        {
          rank: 3,
          medicine: "Augmentin 625",
          qty_sold: 85,
          revenue: 21250,
          avg_per_day: 12,
        },
        {
          rank: 4,
          medicine: "Vitamin C 1000",
          qty_sold: 180,
          revenue: 15300,
          avg_per_day: 26,
        },
        {
          rank: 5,
          medicine: "Cetirizine 10mg",
          qty_sold: 310,
          revenue: 6200,
          avg_per_day: 44,
        },
      ],
      expiry_report: [
        {
          medicine: "Alprazolam 0.5mg",
          batch: "BT2024033",
          expiry_date: "9/30/2025",
          days_left: -181,
          stock: 45,
          value_at_cost: 4275,
          action: "Discount",
        },
        {
          medicine: "Cetirizine 10mg",
          batch: "BT2024056",
          expiry_date: "10/31/2025",
          days_left: -150,
          stock: 22,
          value_at_cost: 264,
          action: "Discount",
        },
        {
          medicine: "Augmentin 625",
          batch: "BT2024045",
          expiry_date: "12/31/2025",
          days_left: -89,
          stock: 80,
          value_at_cost: 14800,
          action: "Discount",
        },
        {
          medicine: "Vitamin C 1000",
          batch: "BT2024110",
          expiry_date: "4/30/2026",
          days_left: 31,
          stock: 420,
          value_at_cost: 23100,
          action: "Discount",
        },
        {
          medicine: "Losartan 50mg",
          batch: "BT2024102",
          expiry_date: "6/30/2026",
          days_left: 92,
          stock: 340,
          value_at_cost: 22100,
          action: "Discount",
        },
        {
          medicine: "Panadol 50mg",
          batch: "BT2024001",
          expiry_date: "8/31/2026",
          days_left: 154,
          stock: 1200,
          value_at_cost: 54000,
          action: "Discount",
        },
      ],
      stock_valuation: {
        summary: {
          total_cost_value: 0,
          total_selling_value: 0,
          potential_profit: 0,
        },
        details: [],
      },
      cashier_summary: [
        {
          cashier: "Cashier 1",
          bills_processed: 18,
          total_sales: 28500,
          avg_bill_value: 1583,
          cash_collected: 18525,
          card_collected: 9975,
        },
        {
          cashier: "Cashier 2",
          bills_processed: 16,
          total_sales: 20250,
          avg_bill_value: 1266,
          cash_collected: 13163,
          card_collected: 7088,
        },
      ],
    };
  }

  renderReports() {
    console.log("PharmacyReports renderReports() called");
    const container = document.getElementById("dashboard_container");
    console.log("Container found:", !!container);

    if (!container) {
      console.error("Dashboard container not found!");
      return;
    }

    // Use current date for date pickers
    const today = new Date().toISOString().split("T")[0];
    console.log("Rendering Reports content...");

    // Use metrics from backend
    const metrics = this.metricsData;

    container.innerHTML = `
            <div class="dashboard reports-dashboard">
                <div class="reports-header-row">
                    <div class="reports-title-section">
                        <h2>Reports & Analytics</h2>
                        <span class="subtitle">Insights and data export</span>
                    </div>
                    <div class="reports-controls-bar">
                        <div class="date-range">
                            <input type="date" value="${this.fromDate}" class="date-input compact" id="reportFromDate" />
                            <span class="date-separator">to</span>
                            <input type="date" value="${this.toDate}" class="date-input compact" id="reportToDate" />
                        </div>
                        <div class="action-buttons">
                            <button class="action-btn-glass add-btn" id="btnExportCSV">
                                <span class="btn-icon">📄</span> Export CSV
                            </button>
                            <button class="action-btn-glass add-btn" id="btnPrintReport">
                                <span class="btn-icon">🖨️</span> Print
                            </button>
                        </div>
                    </div>
                </div>

                <div class="reports-tabs">
                    <button class="tab-btn active">Daily Sales</button>
                    <button class="tab-btn">Profit Report</button>
                    <button class="tab-btn">Fast Movers</button>
                    <button class="tab-btn">Expiry Report</button>
                    <button class="tab-btn">Stock Valuation</button>
                    <button class="tab-btn">Cashier Summary</button>
                </div>

                <div class="metrics-grid reports-metrics-grid">
                    <div class="metric-card success">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Gross Sales</h3>
                                <p class="metric-value">LKR ${(metrics.gross_sales || 0).toLocaleString()}</p>
                            </div>
                            <div class="metric-icon">💰</div>
                        </div>
                    </div>

                    <div class="metric-card info">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Net Sales</h3>
                                <p class="metric-value">LKR ${(metrics.net_sales || 0).toLocaleString()}</p>
                            </div>
                            <div class="metric-icon">💵</div>
                        </div>
                    </div>

                    <div class="metric-card warning">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Total Discount</h3>
                                <p class="metric-value">LKR ${(metrics.total_discount || 0).toLocaleString()}</p>
                            </div>
                            <div class="metric-icon">🏷️</div>
                        </div>
                    </div>

                    <div class="metric-card danger">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Total Returns</h3>
                                <p class="metric-value">LKR ${(metrics.total_returns || 0).toLocaleString()}</p>
                            </div>
                            <div class="metric-icon">🔄</div>
                        </div>
                    </div>

                    <div class="metric-card" style="border-left: 4px solid #8b5cf6">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Tax Collected</h3>
                                <p class="metric-value">LKR ${(metrics.tax_collected || 0).toLocaleString()}</p>
                            </div>
                            <div class="metric-icon">📋</div>
                        </div>
                    </div>
                </div>

                <div class="charts-grid reports-charts">
                    <div class="chart-card full-width reports-weekly-trend-card">
                        <div class="reports-weekly-trend-head">
                            <h3 class="chart-title reports-weekly-trend-title">Weekly Sales Trend</h3>
                            <div class="reports-weekly-trend-legend" aria-hidden="true">
                                <span class="reports-weekly-trend-legend-item"><i class="dot sales"></i>Sales</span>
                                <span class="reports-weekly-trend-legend-item"><i class="dot profit"></i>Profit</span>
                            </div>
                        </div>
                        <div class="reports-chart-container">
                            <canvas id="reportsTrendChart" aria-label="Weekly Sales Trend"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

    console.log("Reports content rendered");

    this.setupReportsHandlers();

    // Initialize chart after DOM is rendered
    setTimeout(() => {
      console.log("Initializing Reports chart...");
      this.initializeReportsChart();
    }, 100);
  }

  setupReportsHandlers() {
    // Tab switching
    const tabs = document.querySelectorAll(".reports-tabs .tab-btn");
    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        tabs.forEach((t) => t.classList.remove("active"));
        e.target.classList.add("active");

        // Change content based on active tab
        this.activeTab = e.target.textContent.trim();
        this.renderTabContent(this.activeTab);
      });
    });

    // Date filters
    const fromInput = document.getElementById("reportFromDate");
    const toInput = document.getElementById("reportToDate");

    if (fromInput) {
      fromInput.addEventListener("change", (e) => {
        this.fromDate = e.target.value;
        this.handleDateFilterChange();
      });
    }

    if (toInput) {
      toInput.addEventListener("change", (e) => {
        this.toDate = e.target.value;
        this.handleDateFilterChange();
      });
    }

    // Export CSV
    const btnExportCSV = document.getElementById("btnExportCSV");
    if (btnExportCSV) {
      btnExportCSV.addEventListener("click", () => {
        this.exportReportsCSV();
      });
    }

    // Print Report
    const btnPrintReport = document.getElementById("btnPrintReport");
    if (btnPrintReport) {
      btnPrintReport.addEventListener("click", () => {
        window.print();
      });
    }
  }

  renderTabContent(tabName) {
    const container = document.querySelector(".charts-grid");

    switch (tabName) {
      case "Daily Sales":
        this.renderDailySalesChart(container);
        break;
      case "Profit Report":
        this.renderProfitTrendChart(container);
        break;
      case "Fast Movers":
        this.renderFastMoversChart(container);
        break;
      case "Expiry Report":
        this.renderExpiryReport(container);
        break;
      case "Stock Valuation":
        this.renderStockValuation(container);
        break;
      case "Cashier Summary":
        this.renderCashierSummary(container);
        break;
      default:
        this.renderDailySalesChart(container);
    }
  }

  renderDailySalesChart(container) {
    container.innerHTML = `
            <div class="chart-card full-width reports-weekly-trend-card glass-card">
                <div class="reports-weekly-trend-head">
                    <div>
                        <h3 class="reports-weekly-trend-title">Weekly Sales Trend</h3>
                    </div>
                </div>
                <div class="reports-chart-container">
                    <canvas id="reportsTrendChart" aria-label="Weekly Sales Trend"></canvas>
                </div>
            </div>
        `;

    setTimeout(() => {
      this.initializeReportsChart();
    }, 100);
  }

  renderProfitTrendChart(container) {
    container.innerHTML = `
            <div class="chart-card full-width reports-weekly-trend-card glass-card">
                <div class="reports-weekly-trend-head">
                    <div>
                        <h3 class="reports-weekly-trend-title">Profit Trend (7 Days)</h3>
                    </div>
                </div>
                <div class="reports-chart-container">
                    <canvas id="profitTrendChart" aria-label="Profit Trend"></canvas>
                </div>
            </div>
        `;

    setTimeout(() => {
      this.initializeProfitChart();
    }, 100);
  }

  renderFastMoversChart(container) {
    // Get top selling items from backend
    const topSellingItems = this.reportData.fast_movers || [];

    container.innerHTML = `
            <div class="chart-card full-width">
                <div class="reports-weekly-trend-head">
                    <h3 class="chart-title reports-weekly-trend-title">Top Selling Items</h3>
                    <div class="reports-weekly-trend-legend" aria-hidden="true">
                        <span class="reports-weekly-trend-legend-item">Fast Moving Products</span>
                    </div>
                </div>
                <div class="chart-container" style="padding: 1rem;">
                    <table class="fast-movers-table" style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 2px solid #e5e7eb;">
                                <th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Rank</th>
                                <th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Medicine</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Category</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Stock</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Qty Sold</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Revenue (LKR)</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Avg/Day</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderTopSellingRows(topSellingItems)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
  }

  /**
   * Generate realistic top selling data from inventory items
   * Creates sales performance metrics based on inventory characteristics
   */
  generateTopSellingData(inventoryData) {
    // Load real sales data from localStorage
    const rawSales = localStorage.getItem("pharmacy_sales");
    const sales = rawSales ? JSON.parse(rawSales) : [];

    // Filter sales by date range
    const start = new Date(this.fromDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(this.toDate);
    end.setHours(23, 59, 59, 999);

    const filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.timestamp);
      return saleDate >= start && saleDate <= end;
    });

    // Aggressive aggregation - calculate real sales per product
    const productSales = {};
    filteredSales.forEach((sale) => {
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach((item) => {
          const productId = item.id;
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.name,
              qtySold: 0,
              revenue: 0,
            };
          }
          productSales[productId].qtySold += Number(item.quantity) || 0;
          productSales[productId].revenue += Number(item.total) || 0;
        });
      }
    });

    // If no sales yet, use the heuristic as a fallback for display
    if (Object.keys(productSales).length === 0) {
      if (!inventoryData || inventoryData.length === 0) {
        return [
          {
            rank: 1,
            name: "Panadol 500mg",
            generic: "Paracetamol",
            category: "Analgesics",
            stock: 1200,
            qtySold: 450,
            revenue: 29250,
            avgPerDay: 64,
          },
          {
            rank: 2,
            name: "Omeprazole 20mg",
            generic: "Omeprazole",
            category: "Gastro",
            stock: 450,
            qtySold: 220,
            revenue: 9240,
            avgPerDay: 31,
          },
          {
            rank: 3,
            name: "Augmentin 625",
            generic: "Amoxicillin",
            category: "Antibiotics",
            stock: 85,
            qtySold: 85,
            revenue: 21250,
            avgPerDay: 12,
          },
          {
            rank: 4,
            name: "Vitamin C 1000",
            generic: "Ascorbic Acid",
            category: "Vitamins",
            stock: 520,
            qtySold: 180,
            revenue: 15300,
            avgPerDay: 26,
          },
          {
            rank: 5,
            name: "Cetirizine 10mg",
            generic: "Cetirizine",
            category: "Allergy",
            stock: 240,
            qtySold: 310,
            revenue: 6200,
            avgPerDay: 44,
          },
        ];
      }

      // Fallback heuristics using inventory if no sales records
      return inventoryData
        .map((item, index) => ({
          rank: index + 1,
          name: item.name,
          generic: item.generic || "",
          category: item.category || "Unknown",
          stock: item.stock || 0,
          qtySold: Math.round((item.stock || 0) * (0.1 + Math.random() * 0.2)),
          revenue: Math.round((item.stock || 0) * (item.price || 0) * 0.15),
          avgPerDay: Math.round(Math.random() * 10 + 2),
        }))
        .sort((a, b) => b.qtySold - a.qtySold)
        .slice(0, 5)
        .map((item, idx) => ({ ...item, rank: idx + 1 }));
    }

    // Process real aggregated sales data
    const finalReportData = Object.keys(productSales).map((productId) => {
      const ps = productSales[productId];
      // Join with inventory details
      const inventoryItem = inventoryData
        ? inventoryData.find((i) => String(i.id) === String(productId))
        : null;

      return {
        id: productId,
        name: ps.name,
        generic: inventoryItem ? inventoryItem.generic : "",
        category: inventoryItem ? inventoryItem.category : "Misc",
        stock: inventoryItem ? inventoryItem.stock : 0,
        qtySold: ps.qtySold,
        revenue: ps.revenue,
        avgPerDay: Math.round(
          ps.qtySold / Math.max(1, new Date().getDate() || 1),
        ), // Simplified avg
      };
    });

    // Sort by revenue and return top 5
    return finalReportData
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }

  /**
   * Render table rows for top selling items
   */
  renderTopSellingRows(topSellingItems) {
    if (!topSellingItems || topSellingItems.length === 0) {
      return `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">
            <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">No Sales Data</div>
            <div style="font-size: 0.9rem;">No inventory data available for analysis</div>
          </td>
        </tr>
      `;
    }

    return topSellingItems
      .map((item, index) => {
        const rank = index + 1;
        const name = item.medicine || item.name || "Unknown";
        const qtySold = item.qty_sold || item.qtySold || 0;
        const revenue = item.revenue || 0;
        const rankColor = rank <= 3 ? "#059669" : "#6b7280";

        return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: ${rankColor}; border-bottom: 1px solid #f1f5f9;">${rank}</td>
          <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">
            <div style="font-weight: 600;">${name}</div>
            ${item.generic ? `<div style="font-size: 10px; color: #6b7280;">${item.generic}</div>` : ""}
          </td>
          <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">
             <span class="meta-pill neutral" style="font-size: 10px;">${item.category || "General"}</span>
          </td>
          <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: ${(item.stock || 0) < 10 ? "#dc2626" : "#1f2937"}; border-bottom: 1px solid #f1f5f9;">${item.stock || 0}</td>
          <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">${qtySold.toLocaleString()}</td>
          <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: #059669; border-bottom: 1px solid #f1f5f9;">LKR ${revenue.toLocaleString()}</td>
          <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">${item.avg_per_day || 0}/day</td>
        </tr>
      `;
      })
      .join("");
  }

  renderExpiryReport(container) {
    // Get expiring items from backend
    const expiringItems = this.reportData.expiry_report || [];

    container.innerHTML = `
        <div class="chart-card full-width">
            <div class="reports-weekly-trend-head">
                <h3 class="chart-title reports-weekly-trend-title">Expiring Medicines</h3>
                <div class="reports-weekly-trend-legend" aria-hidden="true">
                    <span class="reports-weekly-trend-legend-item">${expiringItems.length} items</span>
                </div>
            </div>
            <div class="chart-container" style="padding: 1rem; overflow-x: auto;">
                <table class="expiring-medicines-table" style="width: 100%; border-collapse: collapse; font-size: 11px; min-width: 800px;">
                    <thead>
                        <tr style="background: #fef2f2; border-bottom: 2px solid #ef4444;">
                            <th style="padding: 0.5rem; text-align: left; font-weight: 600; color: #991b1b; border-bottom: 1px solid #fecaca;">Medicine</th>
                            <th style="padding: 0.5rem; text-align: left; font-weight: 600; color: #991b1b; border-bottom: 1px solid #fecaca;">Batch</th>
                            <th style="padding: 0.5rem; text-align: center; font-weight: 600; color: #991b1b; border-bottom: 1px solid #fecaca;">Expiry Date</th>
                            <th style="padding: 0.5rem; text-align: center; font-weight: 600; color: #991b1b; border-bottom: 1px solid #fecaca;">Days Left</th>
                            <th style="padding: 0.5rem; text-align: center; font-weight: 600; color: #991b1b; border-bottom: 1px solid #fecaca;">Stock</th>
                            <th style="padding: 0.5rem; text-align: center; font-weight: 600; color: #991b1b; border-bottom: 1px solid #fecaca;">Value at Cost</th>
                            <th style="padding: 0.5rem; text-align: center; font-weight: 600; color: #991b1b; border-bottom: 1px solid #fecaca;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderExpiryReportRows(expiringItems)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
  }

  /**
   * Get items that are expiring within specified days (default 90 days)
   */
  getExpiringItems(inventoryData, days = 90) {
    if (!inventoryData || !inventoryData.length) {
      return [];
    }

    return inventoryData
      .filter((item) => {
        if (!item.expiryDate) return false;

        const expiry = this.parseISODate(item.expiryDate);
        if (!expiry) return false;

        const diffDays = Math.ceil(
          (expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        );
        return diffDays >= 0 && diffDays <= days;
      })
      .sort((a, b) => {
        const daysA = Math.ceil(
          (this.parseISODate(a.expiryDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        );
        const daysB = Math.ceil(
          (this.parseISODate(b.expiryDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return daysA - daysB; // Sort by earliest expiry first
      });
  }

  /**
   * Parse ISO date string to Date object
   */
  parseISODate(dateString) {
    const d = new Date(dateString);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  /**
   * Render table rows for expiry report with real inventory data
   */
  renderExpiryReportRows(expiringItems) {
    if (!expiringItems || expiringItems.length === 0) {
      return `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: #6b7280;">
            <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">No Expiring Medicines</div>
            <div style="font-size: 0.9rem;">All medicines are within safe expiry limits</div>
          </td>
        </tr>
      `;
    }

    return expiringItems
      .map((item) => {
        const expiryDate = item.expiry_date || item.expiryDate;
        const expiry = this.parseISODate(expiryDate);
        const diffDays = expiry
          ? Math.ceil(
              (expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
            )
          : 999;
        const isExpired = diffDays < 0;
        const isCritical = diffDays <= 30;
        const isWarning = diffDays <= 60;

        const stock = Number(item.stock) || 0;
        const cost = Number(item.cost) || 0;
        const valueAtCost = item.value_at_cost || stock * cost;

        // Determine row background and action based on expiry status
        let rowBackground = "";
        let actionBadge = "";
        let daysColor = "";

        if (isExpired) {
          rowBackground = "background: #fef2f2;";
          actionBadge = `<span style="background: #dc2626; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 10px; font-weight: 500;">Remove</span>`;
          daysColor = "#dc2626";
        } else if (isCritical) {
          rowBackground = "background: #fef2f2;";
          actionBadge = `<span style="background: #dc2626; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 10px; font-weight: 500;">Urgent</span>`;
          daysColor = "#dc2626";
        } else if (isWarning) {
          rowBackground = "background: #fef9c3;";
          actionBadge = `<span style="background: #f59e0b; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 10px; font-weight: 500;">Discount</span>`;
          daysColor = "#d97706";
        } else {
          rowBackground = "background: #f0fdf4;";
          actionBadge = `<span style="background: #059669; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 10px; font-weight: 500;">Monitor</span>`;
          daysColor = "#059669";
        }

        return `
        <tr style="border-bottom: 1px solid #fecaca; ${rowBackground}">
          <td style="padding: 0.5rem; font-weight: 500; color: #374151; border-bottom: 1px solid #fecaca;">
            <div style="font-weight: 600;">${item.medicine || item.name || "Unknown"}</div>
            ${item.generic ? `<div style="font-size: 10px; color: #6b7280;">${item.generic}</div>` : ""}
          </td>
          <td style="padding: 0.5rem; color: #374151; border-bottom: 1px solid #fecaca;">${item.batch || "N/A"}</td>
          <td style="padding: 0.5rem; text-align: center; color: #374151; border-bottom: 1px solid #fecaca;">${expiryDate || "N/A"}</td>
          <td style="padding: 0.5rem; text-align: center; font-weight: 600; color: ${daysColor}; border-bottom: 1px solid #fecaca;">${isExpired ? "EXPIRED" : diffDays + " days"}</td>
          <td style="padding: 0.5rem; text-align: center; color: #374151; border-bottom: 1px solid #fecaca;">${stock}</td>
          <td style="padding: 0.5rem; text-align: center; color: #374151; border-bottom: 1px solid #fecaca;">LKR ${valueAtCost.toLocaleString()}</td>
          <td style="padding: 0.5rem; text-align: center; border-bottom: 1px solid #fecaca;">${actionBadge}</td>
        </tr>
      `;
      })
      .join("");
  }

  renderStockValuation(container) {
    // Get stock valuation from backend
    const stockValuation = this.reportData.stock_valuation || {
      summary: {},
      details: [],
    };
    const stockSummary = stockValuation.summary || {
      total_cost_value: 0,
      total_selling_value: 0,
      potential_profit: 0,
    };
    const inventoryData = stockValuation.details || [];

    container.innerHTML = `
            <div class="chart-card full-width stock-valuation-card">
                <div class="stock-valuation-header">
                    <h3 class="chart-title reports-weekly-trend-title">Stock Valuation</h3>
                    <div class="stock-valuation-legend" aria-hidden="true">
                        <span class="reports-weekly-trend-legend-item">${inventoryData.length} items</span>
                    </div>
                </div>
                
                <!-- Summary Cards -->
                <div class="stock-summary-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; padding: 0 1rem;">
                    <div class="stock-summary-card" style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 1px solid #0ea5e9; border-radius: 0.375rem; padding: 0.75rem; text-align: center;">
                        <div style="font-size: 0.75rem; color: #0369a1; font-weight: 600; margin-bottom: 0.25rem;">Total Cost Value</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #0c4a6e;">LKR ${(stockSummary.total_cost_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="stock-summary-card" style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1px solid #22c55e; border-radius: 0.375rem; padding: 0.75rem; text-align: center;">
                        <div style="font-size: 0.75rem; color: #15803d; font-weight: 600; margin-bottom: 0.25rem;">Total Selling Value</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #14532d;">LKR ${(stockSummary.total_selling_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                    <div class="stock-summary-card" style="background: linear-gradient(135deg, #fefce8, #fef3c7); border: 1px solid #f59e0b; border-radius: 0.375rem; padding: 0.75rem; text-align: center;">
                        <div style="font-size: 0.75rem; color: #d97706; font-weight: 600; margin-bottom: 0.25rem;">Potential Profit</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #92400e;">LKR ${(stockSummary.potential_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                </div>
                
                <!-- Detailed Table -->
                <div class="stock-details-table" style="padding: 0 1rem 1rem; overflow-x: auto;">
                    <table class="stock-valuation-table" style="width: 100%; border-collapse: collapse; font-size: 0.875rem; min-width: 800px;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 2px solid #e5e7eb;">
                                <th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Medicine</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Stock</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Cost/Unit</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Sell/Unit</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Cost Value</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Sell Value</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Potential Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderStockValuationRows(inventoryData)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
  }

  renderStockValuationRows(inventoryData) {
    if (!inventoryData || inventoryData.length === 0) {
      return `
        <tr>
          <td colspan="7" style="padding: 2rem; text-align: center; color: #6b7280;">
            <div style="font-size: 1rem;">No inventory data available</div>
            <div style="font-size: 0.875rem; margin-top: 0.5rem;">Please add items to inventory to see stock valuation.</div>
          </td>
        </tr>
      `;
    }

    return inventoryData
      .map((item) => {
        const medicine = item.medicine || item.name || "Unknown";
        const stock = Number(item.stock) || 0;
        const costPerUnit = item.cost_per_unit || item.cost || 0;
        const sellPerUnit = item.sell_per_unit || item.price || 0;
        const costValue = item.cost_value || stock * costPerUnit;
        const sellValue = item.sell_value || stock * sellPerUnit;
        const potentialProfit = item.potential_profit || sellValue - costValue;

        return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1rem;">${item.icon || "💊"}</span>
              <div>
                <div style="font-weight: 600;">${medicine}</div>
                ${item.generic ? `<div style="font-size: 0.75rem; color: #6b7280;">${item.generic}</div>` : ""}
              </div>
            </div>
          </td>
          <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">${stock}</td>
          <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR ${costPerUnit.toFixed(2)}</td>
          <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR ${sellPerUnit.toFixed(2)}</td>
          <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR ${costValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR ${sellValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: ${potentialProfit >= 0 ? "#059669" : "#dc2626"}; border-bottom: 1px solid #f1f5f9;">
            LKR ${potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
        </tr>
      `;
      })
      .join("");
  }

  // ====================== INVENTORY DATA INTEGRATION ======================

  /**
   * Get inventory data from localStorage for stock valuation
   * Falls back to default medicine data if no saved data exists
   */
  getInventoryDataForValuation() {
    try {
      const savedItems = localStorage.getItem("pharmacy_pos_inventory_items");
      if (savedItems) {
        return JSON.parse(savedItems);
      }
    } catch (error) {
      console.warn("Error loading inventory data from localStorage:", error);
    }

    // Fallback to default medicine data
    if (medicines && medicines.length > 0) {
      return medicines;
    }

    // Final fallback - return empty array
    return [];
  }

  /**
   * Calculate stock valuation summary from inventory data
   */
  async handleDateFilterChange() {
    console.log("Date filter changed, reloading data...");
    await this.loadReportData();
    this.renderReports();
  }

  renderCashierSummary(container) {
    // Get cashier summary from backend
    const cashierData = this.reportData.cashier_summary || [];

    const cardsHtml =
      cashierData.length > 0
        ? cashierData
            .map((stats) => {
              const cashierId = stats.cashier;
              const totalSales = stats.total_sales || 0;
              const bills = stats.bills || 0;
              const cashCollected = stats.cash_collected || 0;
              const cardCollected = stats.card_collected || 0;
              const avgBill = bills > 0 ? totalSales / bills : 0;

              return `
                <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 1px solid #3b82f6; border-radius: 0.5rem; padding: 1rem;">
                    <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                        <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; margin-right: 0.5rem;"></div>
                        <h4 style="margin: 0; font-size: 1rem; font-weight: 600; color: #1f2937;">${cashierId}</h4>
                    </div>
                    <div style="font-size: 0.875rem; color: #6b7280; font-weight: 500; margin-bottom: 1rem;">Today's Performance</div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                        <div style="text-align: center; padding: 0.5rem; background: white; border-radius: 0.375rem;">
                            <div style="font-size: 1.25rem; font-weight: 700; color: #1f2937;">${bills}</div>
                            <div style="font-size: 0.75rem; color: #6b7280;">Bills Processed</div>
                        </div>
                        <div style="text-align: center; padding: 0.5rem; background: white; border-radius: 0.375rem;">
                            <div style="font-size: 1.25rem; font-weight: 700; color: #059669;">LKR ${Number(totalSales).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                            <div style="font-size: 0.75rem; color: #6b7280;">Total Sales</div>
                        </div>
                        <div style="text-align: center; padding: 0.5rem; background: white; border-radius: 0.375rem;">
                            <div style="font-size: 1.25rem; font-weight: 700; color: #3b82f6;">LKR ${Number(avgBill).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                            <div style="font-size: 0.75rem; color: #6b7280;">Avg. Bill Value</div>
                        </div>
                        <div style="text-align: center; padding: 0.5rem; background: white; border-radius: 0.375rem;">
                            <div style="font-size: 1.25rem; font-weight: 700; color: #059669;">LKR ${Number(cashCollected).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                            <div style="font-size: 0.75rem; color: #6b7280;">Cash Collected</div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 0.75rem; padding: 0.5rem; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 0.375rem; text-align: center;">
                        <div style="font-size: 1rem; font-weight: 600; color: #0369a1;">LKR ${Number(cardCollected).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                        <div style="font-size: 0.75rem; color: #64748b;">Card Collected</div>
                    </div>
                </div>
            `;
            })
            .join("")
        : `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
            <div style="font-size: 1.1rem; font-weight: 600; color: #475569;">No Cashier Performance Data</div>
            <p style="color: #64748b; margin-top: 0.5rem;">Sales data for today's active cashiers will appear here.</p>
        </div>
      `;

    // SESSION RECONCILIATION SECTION (NEW)
    const sessionClosingHtml = this.renderCurrentSessionReconciliation();

    container.innerHTML = `
            <div class="chart-card full-width">
                <div class="reports-weekly-trend-head">
                    <h3 class="chart-title reports-weekly-trend-title">Cashier Performance Summary</h3>
                    <div class="reports-weekly-trend-legend" aria-hidden="true">
                        <span class="reports-weekly-trend-legend-item">Today's Performance</span>
                    </div>
                </div>
                
                <!-- Cashier Performance Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 2rem; padding: 0 1rem;">
                    ${cardsHtml}
                </div>

                ${sessionClosingHtml}
            </div>
        `;

    // Setup input listeners if reconciliation section is present
    setTimeout(() => {
      const actualInput = document.getElementById("reportActualCash");
      if (actualInput) {
        actualInput.addEventListener("input", () =>
          this.updateReportCashDifference(),
        );
      }
    }, 100);
  }

  renderCurrentSessionReconciliation() {
    const activeCashier = localStorage.getItem("pharmacy_active_cashier_id");
    const sessionStart = localStorage.getItem("pharmacy_session_start");

    if (!activeCashier || !sessionStart) return "";

    const openingCash =
      parseFloat(localStorage.getItem("pharmacy_opening_cash")) || 0;
    const cashSales = this.getExpectedCashForCurrentSession();
    const totalExpected = openingCash + cashSales;
    const shift = localStorage.getItem("pharmacy_active_shift") || "Morning";

    return `
        <div style="margin: 0 1rem 2rem; padding: 1.5rem; background: white; border: 2px solid #3b82f6; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem;">
                <h3 style="margin: 0; font-size: 1.25rem; color: #1e3a8a;">🏁 Current Shift Reconciliation</h3>
                <span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">ACTIVE SESSION</span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                <!-- Left: Expected Breakdown -->
                <div>
                     <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; color: #64748b;">
                        <span>💰 Opening Cash:</span>
                        <span style="font-weight: 600;">LKR ${openingCash.toLocaleString()}</span>
                    </div>
                     <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; color: #64748b;">
                        <span>➕ Session Cash Sales:</span>
                        <span style="font-weight: 600;">LKR ${cashSales.toLocaleString()}</span>
                    </div>
                    <div style="height: 1px; background: #e2e8f0; margin: 12px 0;"></div>
                    <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800; color: #1e293b;">
                        <span>📊 Total Expected:</span>
                        <span id="reportExpectedTotal" data-val="${totalExpected}">LKR ${totalExpected.toLocaleString()}</span>
                    </div>
                </div>

                <!-- Right: Actual Input & Discrepancy -->
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div>
                        <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; color: #374151;">💵 Enter Actual Cash in Drawer</label>
                        <input type="number" id="reportActualCash" class="form-control" style="font-size: 1.25rem; font-weight: 700; padding: 12px; border: 2px solid #3b82f6; text-align: center;" placeholder="0.00" step="0.01">
                    </div>
                    
                    <div id="reportDiscrepancyBox" style="padding: 12px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; text-align: center;">
                        <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 4px;">Difference</div>
                        <div id="reportCashDifference" style="font-size: 1.25rem; font-weight: 800; color: #1e293b;">LKR 0.00</div>
                        <div id="reportDiscrepancyNote" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-top: 4px; color: #64748b;">Enter Amount</div>
                    </div>

                    <button class="btn btn-primary" onclick="pharmacyReports.finalizeShiftFromReport()" style="width: 100%; padding: 12px; font-size: 1rem; font-weight: 700; background: #1e40af;">
                        Finalize &amp; Close Shift
                    </button>
                </div>
            </div>
        </div>
    `;
  }

  updateReportCashDifference() {
    const expectedBox = document.getElementById("reportExpectedTotal");
    const actualInput = document.getElementById("reportActualCash");
    const diffBox = document.getElementById("reportCashDifference");
    const noteBox = document.getElementById("reportDiscrepancyNote");
    const box = document.getElementById("reportDiscrepancyBox");

    if (!expectedBox || !actualInput || !diffBox) return;

    const expected = parseFloat(expectedBox.getAttribute("data-val")) || 0;
    const actual = parseFloat(actualInput.value) || 0;
    const diff = actual - expected;

    diffBox.textContent = `LKR ${diff.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    if (diff === 0) {
      diffBox.style.color = "#059669";
      noteBox.textContent = "Perfect Match";
      noteBox.style.color = "#059669";
      box.style.borderColor = "#059669";
      box.style.background = "#f0fdf4";
    } else if (Math.abs(diff) < 100) {
      diffBox.style.color = "#d97706";
      noteBox.textContent = diff > 0 ? "Surplus" : "Minor Shortage";
      noteBox.style.color = "#d97706";
      box.style.borderColor = "#f59e0b";
      box.style.background = "#fffbeb";
    } else {
      diffBox.style.color = "#dc2626";
      noteBox.textContent = diff > 0 ? "Significant Surplus" : "Major Shortage";
      noteBox.style.color = "#dc2626";
      box.style.borderColor = "#ef4444";
      box.style.background = "#fef2f2";
    }
  }

  async finalizeShiftFromReport() {
    const actualInput = document.getElementById("reportActualCash");
    if (!actualInput || !actualInput.value) {
      alert("Please enter the actual cash amount in the drawer.");
      return;
    }

    const confirmClose = confirm(
      "Are you sure you want to finalize and close the current shift?",
    );
    if (!confirmClose) return;

    try {
      const shift = localStorage.getItem("pharmacy_active_shift") || "Morning";
      const start = localStorage.getItem("pharmacy_session_start");
      const openingCash = localStorage.getItem("pharmacy_opening_cash") || 0;
      const expectedCashSales = this.reportData.expected_session_cash || 0;
      const actualClosingCash = actualInput.value;

      const result = await this.rpc("/pharmacy/reports/finalize_shift", {
        shift: shift,
        start: start,
        end: new Date().toISOString(),
        openingCash: openingCash,
        expectedCashSales: expectedCashSales,
        actualClosingCash: actualClosingCash,
      });

      if (result.success) {
        alert("Shift successfully closed and finalized in the database.");

        // Clear local session info
        localStorage.removeItem("pharmacy_session_start");
        localStorage.removeItem("pharmacy_active_cashier_id");
        localStorage.removeItem("pharmacy_active_shift");
        localStorage.removeItem("pharmacy_opening_cash");

        // Reload to show empty state or redirect
        window.location.reload();
      } else {
        alert("Error closing shift: " + result.error);
      }
    } catch (error) {
      console.error("Finalize shift error:", error);
      alert("Failed to finalize shift. Please try again.");
    }
  }

  getExpectedCashForCurrentSession() {
    return this.reportData.expected_session_cash || 0;
  }

  /**
   * Helper to draw a rounded rectangle on a canvas context
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    if (height < 0) return; // Prevent drawing negative height
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Helper to create a vertical linear gradient
   */
  getVerticalGradient(ctx, x, y, height, colorTop, colorBottom) {
    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0, colorTop);
    grad.addColorStop(1, colorBottom);
    return grad;
  }

  initializeProfitChart() {
    const canvas = document.getElementById("profitTrendChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Clear previous instance if it exists
    if (this.charts.profit) {
      this.charts.profit.destroy();
    }

    // Get daily data from backend
    const metrics = this.reportData.daily_sales || {
      labels: [],
      sales: [],
      profit: [],
    };
    const labels = metrics.labels;
    const profitData = metrics.profit;

    // Create Premium Gradients
    const fillGradient = ctx.createLinearGradient(0, 0, 0, 260);
    fillGradient.addColorStop(0, "rgba(59, 130, 246, 0.25)");
    fillGradient.addColorStop(0.5, "rgba(59, 130, 246, 0.08)");
    fillGradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");

    const strokeGradient = ctx.createLinearGradient(0, 0, 400, 0);
    strokeGradient.addColorStop(0, "#60a5fa");
    strokeGradient.addColorStop(1, "#2563eb");

    this.charts.profit = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Profit",
            data: profitData,
            borderColor: strokeGradient,
            backgroundColor: fillGradient,
            borderWidth: 4,
            fill: true,
            tension: 0.4, // Smooth lines
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#3b82f6",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "#3b82f6",
            pointHoverBorderColor: "#ffffff",
            pointHoverBorderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // Hide default legend for custom one if needed
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            titleColor: "#1e293b",
            bodyColor: "#1e293b",
            padding: 12,
            borderColor: "rgba(59, 130, 246, 0.2)",
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: function (context) {
                return `Profit: LKR ${context.parsed.y.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#94a3b8",
              font: {
                family: "'Inter', sans-serif",
                size: 11,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(148, 163, 184, 0.08)",
              drawBorder: false,
            },
            ticks: {
              color: "#94a3b8",
              font: {
                family: "'Inter', sans-serif",
                size: 11,
              },
              callback: function (value) {
                if (value >= 1000)
                  return "LKR " + (value / 1000).toFixed(0) + "k";
                return "LKR " + value;
              },
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        animations: {
          tension: {
            duration: 1000,
            easing: "linear",
            from: 1,
            to: 0.4,
            loop: false,
          },
          y: {
            duration: 1500,
            easing: "easeOutQuart",
          },
        },
      },
    });
  }

  initializeCashierPerformanceChart() {
    const canvas = document.getElementById("cashierPerformanceChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const labels = [
      "Bills Processed",
      "Total Sales",
      "Cash Collected",
      "Card Collected",
    ];

    // Build real data from localStorage
    const rawSales = localStorage.getItem("pharmacy_sales");
    const sales = rawSales ? JSON.parse(rawSales) : [];

    // Filter sales by date range
    const start = new Date(this.fromDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(this.toDate);
    end.setHours(23, 59, 59, 999);

    const filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.timestamp);
      return saleDate >= start && saleDate <= end;
    });

    const cashierStats = {};
    filteredSales.forEach((sale) => {
      const cashierId = sale.cashierId || "Unknown";
      if (!cashierStats[cashierId]) {
        cashierStats[cashierId] = {
          bills: 0,
          totalSales: 0,
          cashCollected: 0,
          cardCollected: 0,
        };
      }
      cashierStats[cashierId].bills += 1;
      cashierStats[cashierId].totalSales += sale.total || 0;
      if (sale.paymentMethod === "cash")
        cashierStats[cashierId].cashCollected += sale.amountPaid || sale.total;
      else if (sale.paymentMethod === "card")
        cashierStats[cashierId].cardCollected += sale.total;
    });

    const activeCashier =
      localStorage.getItem("pharmacy_active_cashier_id") || "admin";

    let cashier1Name = "Cashier 1";
    let cashier2Name = "Cashier 2";
    let cashier1Data = [0, 0, 0, 0];
    let cashier2Data = [0, 0, 0, 0];

    const cashiers = Object.keys(cashierStats);

    if (activeCashier !== "admin") {
      // If single cashier logged in, show only them as Cashier 1
      cashier1Name = activeCashier;
      cashier2Name = ""; // Second cashier not shown
      const s = cashierStats[activeCashier];
      if (s) {
        cashier1Data = [
          s.bills,
          s.totalSales,
          s.cashCollected,
          s.cardCollected,
        ];
      }
    } else {
      // If admin, show the top two cashiers by total sales (or just first two)
      if (cashiers.length >= 1) {
        cashier1Name = cashiers[0];
        const s = cashierStats[cashiers[0]];
        cashier1Data = [
          s.bills,
          s.totalSales,
          s.cashCollected,
          s.cardCollected,
        ];
      }
      if (cashiers.length >= 2) {
        cashier2Name = cashiers[1];
        const s = cashierStats[cashiers[1]];
        cashier2Data = [
          s.bills,
          s.totalSales,
          s.cashCollected,
          s.cardCollected,
        ];
      }
      // Fallback for default display
      if (cashiers.length === 0) {
        cashier1Data = [18, 28500, 18525, 9975];
        cashier2Data = [16, 20250, 13163, 7088];
      }
    }

    this.drawCashierPerformanceChart(
      ctx,
      canvas,
      labels,
      cashier1Data,
      cashier2Data,
      cashier1Name,
      cashier2Name,
    );
  }

  drawCashierPerformanceChart(
    ctx,
    canvas,
    labels,
    cashier1Data,
    cashier2Data,
    cashier1Name = "Cashier 1",
    cashier2Name = "Cashier 2",
  ) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const logicalW = canvas.offsetWidth;
    const logicalH = canvas.offsetHeight;
    canvas.width = Math.round(logicalW * dpr);
    canvas.height = Math.round(logicalH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const padL = 45,
      padR = 15,
      padT = 20,
      padB = 35;
    const chartWidth = logicalW - padL - padR;
    const chartHeight = logicalH - padT - padB;
    const maxValue = 35000;

    // Clear canvas
    ctx.clearRect(0, 0, logicalW, logicalH);

    // Set font for labels
    ctx.font = "9px Inter";
    ctx.textAlign = "center";
    ctx.fillStyle = "#64748b";

    // Draw Y-axis range marks and labels
    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const y = padT + chartHeight - (i / ySteps) * chartHeight;
      const value = (i / ySteps) * maxValue;

      // Draw horizontal grid line
      ctx.strokeStyle = "rgba(0,0,0,0.03)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + chartWidth, y);
      ctx.stroke();

      // Draw Y-axis label
      ctx.fillStyle = "#94a3b8";
      ctx.font = "9px Inter";
      ctx.textAlign = "right";
      ctx.fillText((value / 1000).toFixed(0) + "k", padL - 5, y + 2);
    }

    // Draw X and Y axes
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + chartHeight);
    ctx.lineTo(padL + chartWidth, padT + chartHeight);
    ctx.stroke();

    // Grouped bar chart implementation
    const barWidth = chartWidth / (labels.length * 3);
    const gap = barWidth * 0.5;

    // Draw bars for each label
    labels.forEach((label, i) => {
      const x = padL + (chartWidth / labels.length) * i + gap;

      // Cashier 1 bar
      const cashier1Height = (cashier1Data[i] / maxValue) * chartHeight;
      if (cashier1Height > 2) {
        const y1 = padT + chartHeight - cashier1Height;
        ctx.fillStyle = this.getVerticalGradient(
          ctx,
          x,
          y1,
          cashier1Height,
          "#10b981",
          "#34d399",
        );
        this.drawRoundedRect(ctx, x, y1, barWidth, cashier1Height, 3);
        ctx.fill();
      }

      // Cashier 2 bar
      const cashier2Height = (cashier2Data[i] / maxValue) * chartHeight;
      if (cashier2Height > 2) {
        const x2 = x + barWidth + gap / 2;
        const y2 = padT + chartHeight - cashier2Height;
        ctx.fillStyle = this.getVerticalGradient(
          ctx,
          x2,
          y2,
          cashier2Height,
          "#3b82f6",
          "#60a5fa",
        );
        this.drawRoundedRect(ctx, x2, y2, barWidth, cashier2Height, 3);
        ctx.fill();
      }

      // Draw X-axis label
      const centerX = x + barWidth + gap / 4;
      ctx.fillStyle = "#64748b";
      ctx.font = "9px Inter";
      ctx.textAlign = "center";
      ctx.fillText(label, centerX, logicalH - 15);
    });

    // Draw axis titles
    ctx.fillStyle = "#334155";
    ctx.font = "500 10px Inter";

    // Y-axis title
    ctx.save();
    ctx.translate(12, padT + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("Amount (LKR)", 0, 0);
    ctx.restore();

    // X-axis title
    ctx.textAlign = "center";
    ctx.fillText("Performance Metrics", padL + chartWidth / 2, logicalH - 5);

    // Legend
    ctx.fillStyle = "#22c55e";
    this.drawRoundedRect(ctx, padL, 4, 8, 8, 2);
    ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.font = "9px Inter";
    ctx.textAlign = "left";
    ctx.fillText(cashier1Name, padL + 12, 11);

    if (cashier2Name) {
      const padOffset = padL + 12 + ctx.measureText(cashier1Name).width + 12;
      ctx.fillStyle = "#3b82f6";
      this.drawRoundedRect(ctx, padOffset, 4, 8, 8, 2);
      ctx.fill();
      ctx.fillStyle = "#64748b";
      ctx.fillText(cashier2Name, padOffset + 12, 11);
    }
  }

  exportReportsCSV() {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Report,Gross Sales,Net Sales,Total Discount,Total Returns,Tax Collected\\n" +
      "Summary,48750,47550,1200,1200,180\\n" +
      "\\n" +
      "Day,Sales,Profit\\n" +
      "Mon,35000,9500\\n" +
      "Tue,48000,12000\\n" +
      "Wed,42000,10500\\n" +
      "Thu,61000,16000\\n" +
      "Fri,78000,22000\\n" +
      "Sat,72000,19500\\n" +
      "Sun,48750,12400\\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pharmacy_reports.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  initializeReportsChart() {
    const canvas = document.getElementById("reportsTrendChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Clear previous instance if it exists
    if (this.charts.reports) {
      this.charts.reports.destroy();
    }

    const metrics = this.reportData.daily_sales || {
      labels: [],
      sales: [],
      profit: [],
    };
    const labels = metrics.labels;
    const salesData = metrics.sales;
    const profitData = metrics.profit;

    // Create Premium Vertical Gradients for Bars (Glass UI Feel)
    const salesGradient = ctx.createLinearGradient(0, 0, 0, 260);
    salesGradient.addColorStop(0, "rgba(16, 185, 129, 0.8)");
    salesGradient.addColorStop(1, "rgba(16, 185, 129, 0.2)");

    const profitGradient = ctx.createLinearGradient(0, 0, 0, 260);
    profitGradient.addColorStop(0, "rgba(59, 130, 246, 0.8)");
    profitGradient.addColorStop(1, "rgba(59, 130, 246, 0.2)");

    this.charts.reports = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Sales",
            data: salesData,
            backgroundColor: salesGradient,
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 1,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 20,
            maxBarThickness: 30,
          },
          {
            label: "Profit",
            data: profitData,
            backgroundColor: profitGradient,
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 20,
            maxBarThickness: 30,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              padding: 20,
              font: {
                family: "'Inter', sans-serif",
                size: 12,
                weight: "600",
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            titleColor: "#1e293b",
            bodyColor: "#1e293b",
            borderColor: "rgba(0, 0, 0, 0.1)",
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            displayColors: true,
            usePointStyle: true,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: LKR ${context.parsed.y.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#94a3b8",
              font: {
                family: "'Inter', sans-serif",
                size: 11,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(148, 163, 184, 0.08)",
              drawBorder: false,
            },
            ticks: {
              color: "#94a3b8",
              font: {
                family: "'Inter', sans-serif",
                size: 11,
              },
              callback: function (value) {
                if (value >= 1000)
                  return "LKR " + (value / 1000).toFixed(0) + "k";
                return "LKR " + value;
              },
            },
          },
        },
        animation: {
          duration: 2000,
          easing: "easeOutElastic",
          delay: (context) => context.dataIndex * 100,
        },
      },
    });
  }

  drawAnimatedBarChart(ctx, canvas, labels, salesData, profitData) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const logicalW = canvas.offsetWidth;
    const logicalH = canvas.offsetHeight;
    canvas.width = Math.round(logicalW * dpr);
    canvas.height = Math.round(logicalH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const padL = 45,
      padR = 15,
      padT = 20,
      padB = 35;
    const chartWidth = logicalW - padL - padR;
    const chartHeight = logicalH - padT - padB;

    // Dynamic max value
    const maxValInData = Math.max(...salesData, ...profitData, 1000);
    const maxValue = Math.ceil(maxValInData / 10000) * 10000 || 10000;

    // Clear canvas
    ctx.clearRect(0, 0, logicalW, logicalH);

    // Set font for labels
    ctx.font = "9px Inter";
    ctx.textAlign = "center";
    ctx.fillStyle = "#64748b";

    // Draw Y-axis range marks and labels
    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const y = padT + chartHeight - (i / ySteps) * chartHeight;
      const value = (i / ySteps) * maxValue;

      // Draw horizontal grid line
      ctx.strokeStyle = "rgba(0,0,0,0.03)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + chartWidth, y);
      ctx.stroke();

      // Draw Y-axis label
      ctx.fillStyle = "#94a3b8";
      ctx.font = "9px Inter";
      ctx.textAlign = "right";
      ctx.fillText((value / 1000).toFixed(0) + "k", padL - 5, y + 2);
    }

    // Draw X and Y axes
    ctx.strokeStyle = "#f1f5f9";
    ctx.font = "500 10px Inter";

    // Y-axis title
    ctx.save();
    ctx.translate(12, padT + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("Amount (LKR)", 0, 0);
    ctx.restore();

    // X-axis title
    ctx.textAlign = "center";
    ctx.fillText("Day of Week", padL + chartWidth / 2, logicalH - 5);

    // Legend
    ctx.fillStyle = "#10b981";
    this.drawRoundedRect(ctx, padL, 4, 8, 8, 2);
    ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.font = "9px Inter";
    ctx.textAlign = "left";
    ctx.fillText("Sales", padL + 12, 11);

    ctx.fillStyle = "#3b82f6";
    this.drawRoundedRect(ctx, padL + 50, 4, 8, 8, 2);
    ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.fillText("Profit", padL + 62, 11);
  }

  initializeStockValuationChart() {
    const canvas = document.getElementById("stockValuationChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Stock valuation data
    const medicines = [
      "Panadol 500mg",
      "Augmentin 625",
      "Omeprazole 20",
      "Losartan 50",
      "Cetirizine 10",
      "Metformin 500",
      "Alprazolam 0.5",
      "Vitamin C 1000",
    ];
    const costValues = [54000, 14800, 18200, 22100, 264, 7120, 4275, 23100];
    const sellValues = [78000, 20000, 27300, 32300, 440, 12460, 6750, 35700];
    const profitValues = [24000, 5200, 9100, 10200, 176, 5340, 2475, 12600];

    this.drawStockValuationChart(
      ctx,
      canvas,
      medicines,
      costValues,
      sellValues,
      profitValues,
    );
  }

  drawStockValuationChart(
    ctx,
    canvas,
    medicines,
    costValues,
    sellValues,
    profitValues,
  ) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const logicalW = canvas.offsetWidth;
    const logicalH = canvas.offsetHeight;
    canvas.width = Math.round(logicalW * dpr);
    canvas.height = Math.round(logicalH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const padL = 60,
      padR = 15,
      padT = 20,
      padB = 100;
    const chartWidth = logicalW - padL - padR;
    const chartHeight = logicalH - padT - padB;
    const maxValue = 80000;

    // Clear canvas
    ctx.clearRect(0, 0, logicalW, logicalH);

    // Grid lines
    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const y = padT + (i / ySteps) * chartHeight;
      const value = ((ySteps - i) / ySteps) * maxValue;

      ctx.strokeStyle = "rgba(0,0,0,0.03)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + chartWidth, y);
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "9px Inter";
      ctx.textAlign = "right";
      ctx.fillText((value / 1000).toFixed(0) + "k", padL - 8, y + 3);
    }

    // Axes
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + chartHeight);
    ctx.lineTo(padL + chartWidth, padT + chartHeight);
    ctx.stroke();

    const barGroupWidth = chartWidth / medicines.length;
    const barWidth = barGroupWidth * 0.25;
    const gap = barWidth * 0.2;

    medicines.forEach((med, i) => {
      const groupX =
        padL + i * barGroupWidth + (barGroupWidth - barWidth * 3 - gap * 2) / 2;

      // Cost bar
      const costH = (costValues[i] / maxValue) * chartHeight;
      if (costH > 2) {
        const y_cost = padT + chartHeight - costH;
        ctx.fillStyle = this.getVerticalGradient(
          ctx,
          groupX,
          y_cost,
          costH,
          "#6366f1",
          "#818cf8",
        );
        this.drawRoundedRect(ctx, groupX, y_cost, barWidth, costH, 2);
        ctx.fill();
      }

      // Sell bar
      const sellH = (sellValues[i] / maxValue) * chartHeight;
      const sellX = groupX + barWidth + gap;
      if (sellH > 2) {
        const y_sell = padT + chartHeight - sellH;
        ctx.fillStyle = this.getVerticalGradient(
          ctx,
          sellX,
          y_sell,
          sellH,
          "#22c55e",
          "#4ade80",
        );
        this.drawRoundedRect(ctx, sellX, y_sell, barWidth, sellH, 2);
        ctx.fill();
      }

      // Profit bar
      const profitH = (profitValues[i] / maxValue) * chartHeight;
      const profitX = sellX + barWidth + gap;
      if (profitH > 2) {
        const y_profit = padT + chartHeight - profitH;
        ctx.fillStyle = this.getVerticalGradient(
          ctx,
          profitX,
          y_profit,
          profitH,
          "#f59e0b",
          "#fbbf24",
        );
        this.drawRoundedRect(ctx, profitX, y_profit, barWidth, profitH, 2);
        ctx.fill();
      }

      // Rotate labels
      ctx.save();
      ctx.translate(groupX + barGroupWidth / 4, padT + chartHeight + 10);
      ctx.rotate(Math.PI / 4);
      ctx.textAlign = "left";
      ctx.fillStyle = "#64748b";
      ctx.font = "9px Inter";
      ctx.fillText(med.length > 15 ? med.substring(0, 15) + "..." : med, 0, 0);
      ctx.restore();
    });

    // Axis titles
    ctx.fillStyle = "#334155";
    ctx.font = "500 10px Inter";

    // Y-axis
    ctx.save();
    ctx.translate(12, padT + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("Value (LKR)", 0, 0);
    ctx.restore();

    // X-axis
    ctx.textAlign = "center";
    ctx.fillText("Medicines", padL + chartWidth / 2, logicalH - 5);

    // Legend
    const legendY = 6;
    ctx.font = "9px Inter";
    ctx.textAlign = "left";

    ctx.fillStyle = "#6366f1";
    this.drawRoundedRect(ctx, padL, legendY, 8, 8, 2);
    ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.fillText("Cost Value", padL + 12, legendY + 7);

    ctx.fillStyle = "#22c55e";
    this.drawRoundedRect(ctx, padL + 80, legendY, 8, 8, 2);
    ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.fillText("Sell Value", padL + 92, legendY + 7);

    ctx.fillStyle = "#f59e0b";
    this.drawRoundedRect(ctx, padL + 160, legendY, 8, 8, 2);
    ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.fillText("Profit", padL + 172, legendY + 7);
  }

  cleanup() {
    console.log("PharmacyReports cleanup() called");
    // Clean up charts if any
    if (this.charts && typeof this.charts === "object") {
      Object.values(this.charts).forEach((chart) => {
        if (chart && typeof chart.destroy === "function") {
          chart.destroy();
        }
      });
      this.charts = {};
    }
  }
}

// Make it available globally for dashboard.js
window.PharmacyReports = PharmacyReports;

export default PharmacyReports;
