/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component, onMounted, onWillUnmount } from "@odoo/owl";
import { medicines } from "./data/medicine_data.js";

class PharmacyDashboard extends Component {
  setup() {
    this.charts = {};
    this.refreshInterval = null;
    this.purchasingInstance = null;
    this.reportsInstance = null;
    this.customersInstance = null;

    onMounted(() => {
      this.renderDashboard();
      this.initializeMenuHandlers();
      this.initializeThemeToggle();
      this.initializeLogout();
      this.loadSavedTheme();
      this.startAutoRefresh();
    });

    onWillUnmount(() => {
      this.cleanup();
    });
  }

  renderDashboard() {
    const container = document.getElementById("dashboard_container");
    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    container.innerHTML = `
            <div class="dashboard">
                <!-- Metrics Section -->
                <div class="metrics-grid">
                    <div class="metric-card success">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Today's Sales</h3>
                                <p class="metric-value">LKR 48,750</p>
                                <p class="metric-subtitle">34 invoices</p>
                            </div>
                            <div class="metric-icon">💰</div>
                        </div>
                        <div class="metric-change positive">
                            <span>📈</span>
                            <span>+12.4% vs yesterday</span>
                        </div>
                    </div>

                    <div class="metric-card info">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Transactions Today</h3>
                                <p class="metric-value">28</p>
                                <p class="metric-subtitle">Avg. LKR 1,433.82/bill</p>
                            </div>
                            <div class="metric-icon">👥</div>
                        </div>
                        <div class="metric-change positive">
                            <span>📊</span>
                            <span>+5 transactions vs yesterday</span>
                        </div>
                    </div>

                    <div class="metric-card success">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Gross Profit</h3>
                                <p class="metric-value">LKR 18,420</p>
                                <p class="metric-subtitle">37.8% margin</p>
                            </div>
                            <div class="metric-icon">📈</div>
                        </div>
                        <div class="metric-change positive">
                            <span>💹</span>
                            <span>+8.2% vs yesterday</span>
                        </div>
                    </div>

                    <div class="metric-card danger">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Returns Today</h3>
                                <p class="metric-value">LKR 1,200</p>
                                <p class="metric-subtitle">2 return transactions</p>
                            </div>
                            <div class="metric-icon">🔄</div>
                        </div>
                        <div class="metric-change negative">
                            <span>📉</span>
                            <span>-LKR 300 vs yesterday</span>
                        </div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="charts-grid">
                    <div class="chart-card">
                        <div class="chart-header">
                            <div>
                                <h3 class="chart-title">Weekly Sales & Profit</h3>
                                <p class="chart-subtitle">Last 7 days performance</p>
                            </div>
                            <select class="chart-filter" aria-label="Filter chart data" onchange="dashboard.updateWeeklyChart(this.value)">
                                <option value="both">Both</option>
                                <option value="sales">Sales</option>
                                <option value="profit">Profit</option>
                            </select>
                        </div>
                        <div class="chart-container">
                            <canvas id="weeklyChart" aria-label="Weekly sales and profit chart"></canvas>
                        </div>
                    </div>

                    <div class="chart-card">
                        <div class="chart-header">
                            <div>
                                <h3 class="chart-title">Sales by Category</h3>
                                <p class="chart-subtitle">Today's sales by category</p>
                            </div>
                        </div>
                        <div class="chart-container">
                            <canvas id="categoryChart" aria-label="Sales by category donut chart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Additional Stats -->
                <div class="dashboard-grid">
                    <div class="card">
                        <h3>Low Stock Alerts</h3>
                        <p>12 medicines need restocking</p>
                    </div>
                    <div class="card">
                        <h3>Expiring Soon</h3>
                        <p>8 medicines expire in 30 days</p>
                    </div>
                    <div class="card">
                        <h3>Pending Orders</h3>
                        <p>5 supplier orders pending</p>
                    </div>
                </div>
            </div>
        `;

    // Initialize charts after dashboard is rendered
    setTimeout(() => {
      this.initializeCharts();
    }, 100);

    // Make dashboard instance globally available
    setTimeout(() => {
      window.dashboard = this;
    }, 200);
  }

  initializeCharts() {
    this.initializeWeeklyChart();
    this.initializeCategoryChart();
  }

  initializeWeeklyChart() {
    const canvas = document.getElementById("weeklyChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Generate sample data for the last 7 days
    const labels = [];
    const salesData = [];
    const profitData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));
      salesData.push(Math.floor(Math.random() * 20000) + 30000);
      profitData.push(Math.floor(Math.random() * 10000) + 10000);
    }

    // Simple line chart drawing (without Chart.js library)
    this.drawSimpleLineChart(ctx, canvas, labels, salesData, profitData);
  }

  initializeCategoryChart() {
    const canvas = document.getElementById("categoryChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Category data
    const data = [
      { label: "Antibiotics", value: 28, color: "#22c55e" },
      { label: "Analgesics", value: 22, color: "#3b82f6" },
      { label: "Vitamins", value: 18, color: "#f59e0b" },
      { label: "Antidiabetics", value: 15, color: "#8b5cf6" },
      { label: "Others", value: 17, color: "#ec4899" },
    ];

    // Simple donut chart drawing
    this.drawSimpleDonutChart(ctx, canvas, data);
  }

  drawSimpleLineChart(ctx, canvas, labels, salesData, profitData) {
    const width = (canvas.width = canvas.offsetWidth * 2);
    const height = (canvas.height = canvas.offsetHeight * 2);
    ctx.scale(2, 2);

    const padding = 40;
    const chartWidth = canvas.offsetWidth - padding * 2;
    const chartHeight = canvas.offsetHeight - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Find max value for scaling
    const allValues = [...salesData, ...profitData];
    const maxValue = Math.max(...allValues);
    const minValue = 0;

    // Draw sales area (filled area)
    ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
    ctx.beginPath();
    salesData.forEach((value, i) => {
      const x = padding + (chartWidth / (salesData.length - 1)) * i;
      const y =
        padding +
        chartHeight -
        ((value - minValue) / (maxValue - minValue)) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, padding + chartHeight);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.closePath();
    ctx.fill();

    // Draw profit area (filled area)
    ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
    ctx.beginPath();
    profitData.forEach((value, i) => {
      const x = padding + (chartWidth / (profitData.length - 1)) * i;
      const y =
        padding +
        chartHeight -
        ((value - minValue) / (maxValue - minValue)) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, padding + chartHeight);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.closePath();
    ctx.fill();

    // Draw sales line
    this.drawLine(
      ctx,
      labels,
      salesData,
      padding,
      chartWidth,
      chartHeight,
      "#22c55e",
      2,
      maxValue,
      minValue,
    );

    // Draw profit line
    this.drawLine(
      ctx,
      labels,
      profitData,
      padding,
      chartWidth,
      chartHeight,
      "#3b82f6",
      2,
      maxValue,
      minValue,
    );

    // Draw labels
    ctx.fillStyle = "#64748b";
    ctx.font = "10px Inter";
    labels.forEach((label, i) => {
      const x = padding + (chartWidth / (labels.length - 1)) * i;
      ctx.fillText(label, x - 15, canvas.offsetHeight - 10);
    });

    // Draw legend
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(padding, 10, 10, 10);
    ctx.fillStyle = "#64748b";
    ctx.fillText("Sales", padding + 15, 18);

    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(padding + 60, 10, 10, 10);
    ctx.fillStyle = "#64748b";
    ctx.fillText("Profit", padding + 75, 18);
  }

  drawLine(
    ctx,
    labels,
    data,
    padding,
    chartWidth,
    chartHeight,
    color,
    lineWidth,
    maxValue,
    minValue,
  ) {
    const range = maxValue - minValue;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    data.forEach((value, i) => {
      const x = padding + (chartWidth / (data.length - 1)) * i;
      const y =
        padding + chartHeight - ((value - minValue) / range) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    ctx.fillStyle = color;
    data.forEach((value, i) => {
      const x = padding + (chartWidth / (data.length - 1)) * i;
      const y =
        padding + chartHeight - ((value - minValue) / range) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawSimpleDonutChart(ctx, canvas, data) {
    const width = (canvas.width = canvas.offsetWidth * 2);
    const height = (canvas.height = canvas.offsetHeight * 2);
    ctx.scale(2, 2);

    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;
    const radius = Math.min(centerX, centerY) - 30;
    const innerRadius = radius * 0.6;

    ctx.clearRect(0, 0, width, height);

    let currentAngle = -Math.PI / 2;
    const total = data.reduce((sum, item) => sum + item.value, 0);

    data.forEach((segment, i) => {
      const sliceAngle = (segment.value / total) * Math.PI * 2;

      // Draw segment
      ctx.fillStyle = segment.color;
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        radius,
        currentAngle,
        currentAngle + sliceAngle,
      );
      ctx.arc(
        centerX,
        centerY,
        innerRadius,
        currentAngle + sliceAngle,
        currentAngle,
        true,
      );
      ctx.closePath();
      ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 20);

      ctx.fillStyle = "#64748b";
      ctx.font = "10px Inter";
      ctx.textAlign = "center";
      ctx.fillText(`${segment.value}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Draw center text
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 14px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Categories", centerX, centerY);
  }

  updateWeeklyChart(filter) {
    // Re-render chart with different data based on filter
    this.initializeWeeklyChart();
  }

  startAutoRefresh() {
    // Auto-refresh dashboard data every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.refreshDashboardData();
    }, 30000);
  }

  refreshDashboardData() {
    // Simulate data refresh with random variations
    const metrics = document.querySelectorAll(".metric-value");
    metrics.forEach((metric) => {
      const currentValue = metric.textContent;
      if (currentValue.includes("LKR")) {
        const value = parseInt(currentValue.replace(/[^\d]/g, ""));
        const variation = Math.floor(Math.random() * 1000) - 500;
        metric.textContent = `LKR ${(value + variation).toLocaleString()}`;
      }
    });

    // Only metrics are refreshed - charts have been removed
  }

  initializeMenuHandlers() {
    const menuLinks = document.querySelectorAll(".menu-link");
    const topbarTitle = document.querySelector(".topbar h1");

    menuLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        // Remove active class from all items and links
        const menuItems = document.querySelectorAll(".menu-item");
        menuItems.forEach((mi) => mi.classList.remove("active"));

        // Add active class to parent item
        const menuItem = link.closest(".menu-item");
        if (menuItem) {
          menuItem.classList.add("active");
        }

        // Update page title
        const pageName = link.querySelector(".menu-text").textContent;
        if (topbarTitle) {
          topbarTitle.textContent = pageName;
        }

        // Handle page navigation
        this.handlePageNavigation(link.dataset.page);
      });
    });
  }

  handlePageNavigation(page) {
    const container = document.getElementById("dashboard_container");

    switch (page) {
      case "dashboard":
        this.renderDashboard();
        break;
      case "sales":
        this.renderPharmacyPOS();
        break;
      case "inventory":
        this.navigateToFarmacyInventory();
        break;
      case "customers":
        this.renderCustomersPage();
        break;
      case "purchasing":
        this.renderPurchasing();
        break;
      case "reports":
        this.renderReports();
        break;
      case "settings":
        this.renderSettings();
        break;
      default:
        this.renderDashboard();
    }
  }

  renderSettings() {
    // Update topbar title
    const topbarTitle = document.querySelector(".topbar h1");
    if (topbarTitle) {
      topbarTitle.textContent = "Settings";
    }

    // Initialize settings component
    if (typeof window.PharmacySettings === "function") {
      // Clean up previous instance if exists
      if (
        window.pharmacySettings &&
        typeof window.pharmacySettings.cleanup === "function"
      ) {
        window.pharmacySettings.cleanup();
      }

      // Create new instance using static method
      window.pharmacySettings = window.PharmacySettings.createInstance();
    } else {
      // Fallback if PharmacySettings is not available
      const container = document.getElementById("dashboard_container");
      container.innerHTML = `
        <div class="dashboard">
          <div class="error-message">
            <h3>Settings Component Not Available</h3>
            <p>Please refresh the page and try again.</p>
          </div>
        </div>
      `;
    }
  }

  renderReports() {
    const container = document.getElementById("dashboard_container");

    // Debug: Check if PharmacyReports is available
    console.log("PharmacyReports available:", typeof window.PharmacyReports);

    // Clean up previous reports instance if exists
    if (this.reportsInstance) {
      this.reportsInstance.cleanup();
    }

    // Create new reports instance using global class
    if (typeof window.PharmacyReports === "function") {
      this.reportsInstance = new window.PharmacyReports();
    } else {
      // Fallback: Show error message
      container.innerHTML = `
                <div class="dashboard">
                    <div class="error-message">
                        <h3>Reports Component Not Available</h3>
                        <p>Please refresh the page and try again.</p>
                    </div>
                </div>
            `;
      return;
    }

    // Update topbar title
    const topbarTitle = document.querySelector(".topbar h1");
    if (topbarTitle) {
      topbarTitle.textContent = "Reports";
    }
  }

  roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  parseISODate(dateString) {
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  formatLKR(amount) {
    const v = Number(amount) || 0;
    return `LKR ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  renderPurchasing() {
    // Clean up previous purchasing instance if exists
    if (this.purchasingInstance) {
      this.purchasingInstance.cleanup();
    }

    // Create new purchasing instance using global class
    this.purchasingInstance = new window.PharmacyPurchasing();

    // Update topbar title
    const topbarTitle = document.querySelector(".topbar h1");
    if (topbarTitle) {
      topbarTitle.textContent = "Purchasing";
    }
  }

  navigateToFarmacyInventory() {
    // Navigate to inventory by clearing container and letting inventory.js handle it
    const container = document.getElementById("dashboard_container");

    // Update the topbar title
    const topbarTitle = document.querySelector(".topbar h1");
    if (topbarTitle) {
      topbarTitle.textContent = "Inventory";
    }

    // Clear container and show loading
    container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner">⏳ Loading Inventory...</div>
            </div>
        `;

    // Wait a bit for inventory.js to be available, then initialize
    setTimeout(() => {
      this.initializeInventoryComponent();
    }, 200);
  }

  initializeInventoryComponent() {
    // Check if PharmacyInventory is available globally
    if (typeof window.PharmacyInventory !== "undefined") {
      try {
        // Clean up previous instance if exists
        if (window.pharmacyInventory) {
          window.pharmacyInventory.cleanup();
        }

        // Create new instance
        window.pharmacyInventory = new window.PharmacyInventory();
        window.pharmacyInventory.renderInventory();
      } catch (error) {
        console.error("Error initializing inventory component:", error);
        this.loadInventoryContent();
      }
    } else {
      // If not available, try to wait a bit more
      setTimeout(() => {
        if (typeof window.PharmacyInventory !== "undefined") {
          this.initializeInventoryComponent();
        } else {
          console.warn("PharmacyInventory class not found, using fallback");
          this.loadInventoryContent();
        }
      }, 300);
    }
  }

  loadInventoryContent() {
    // Fallback method that provides basic inventory functionality
    const container = document.getElementById("dashboard_container");

    // Import medicines data for basic functionality
    const medicines = window.medicines || [];

    container.innerHTML = `
            <div class="dashboard">
                <div class="inventory-header">
                    <h2>📦 Inventory Management</h2>
                </div>
                
                <div class="inventory-stats">
                    <div class="stat-card compact total">
                        <div class="stat-icon">◈</div>
                        <div class="stat-content">
                            <h3>Total Items</h3>
                            <p class="stat-value">${medicines.length}</p>
                        </div>
                    </div>
                    <div class="stat-card compact warning">
                        <div class="stat-icon">!</div>
                        <div class="stat-content">
                            <h3>Low Stock</h3>
                            <p class="stat-value">${medicines.filter((m) => m.stock <= 20).length}</p>
                        </div>
                    </div>
                    <div class="stat-card compact danger">
                        <div class="stat-icon">⌛</div>
                        <div class="stat-content">
                            <h3>Expiring (&lt;90d)</h3>
                            <p class="stat-value">${
                              medicines.filter((m) => {
                                const expiry = new Date(m.expiryDate);
                                const days = Math.ceil(
                                  (expiry.getTime() - new Date().getTime()) /
                                    (1000 * 60 * 60 * 24),
                                );
                                return days >= 0 && days <= 90;
                              }).length
                            }</p>
                        </div>
                    </div>
                    <div class="stat-card compact success">
                        <div class="stat-icon">LKR</div>
                        <div class="stat-content">
                            <h3>Stock Value</h3>
                            <p class="stat-value">LKR ${medicines.reduce((sum, m) => sum + m.stock * m.price, 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                
                <div class="inventory-content compact">
                    <div class="cart-table-container inventory-table-container compact">
                        <table class="cart-table compact">
                            <thead>
                                <tr>
                                    <th style="min-width: 220px;">MEDICINE</th>
                                    <th style="min-width: 120px;">CATEGORY</th>
                                    <th style="min-width: 140px;">BATCH / EXPIRY</th>
                                    <th style="min-width: 80px;">STOCK</th>
                                    <th style="min-width: 80px;">COST</th>
                                    <th style="min-width: 80px;">PRICE</th>
                                    <th style="min-width: 70px;">MARGIN</th>
                                    <th style="min-width: 90px;">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${medicines
                                  .map((item) => {
                                    const lowStock = item.stock <= 20;
                                    const expiring = (() => {
                                      const expiry = new Date(item.expiryDate);
                                      const days = Math.ceil(
                                        (expiry.getTime() -
                                          new Date().getTime()) /
                                          (1000 * 60 * 60 * 24),
                                      );
                                      return days >= 0 && days <= 90;
                                    })();
                                    const marginPct =
                                      item.price > 0
                                        ? ((item.price - item.cost) /
                                            item.price) *
                                          100
                                        : 0;

                                    const statusPill = expiring
                                      ? `<span class="meta-pill profit">Expiring</span>`
                                      : lowStock
                                        ? `<span class="meta-pill neutral">Low Stock</span>`
                                        : `<span class="meta-pill sales">In Stock</span>`;

                                    const rxPill = item.rxOnly
                                      ? `<span class="meta-pill rx-only">Rx</span>`
                                      : "";
                                    const controlledPill = item.controlled
                                      ? `<span class="meta-pill controlled">Controlled</span>`
                                      : "";

                                    return `
                                        <tr class="cart-row inventory-row${lowStock ? " low-stock" : ""}${expiring ? " expiring" : ""}${item.controlled ? " controlled" : ""}">
                                            <td>
                                                <div class="product-info">
                                                    <span class="icon" aria-hidden="true">${item.icon || ""}</span>
                                                    <div class="inventory-medicine-text">
                                                        <div class="inventory-medicine-title">
                                                            <span class="name">${item.name}</span>
                                                            ${rxPill}
                                                            ${controlledPill}
                                                        </div>
                                                        <div class="inventory-medicine-generic">${item.generic || ""}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>${item.category}</td>
                                            <td>
                                                <div class="batch-info">
                                                    <span class="batch">${item.batch || ""}</span>
                                                    <span class="expiry">${item.expiryLabel || ""}</span>
                                                </div>
                                            </td>
                                            <td>${item.stock}</td>
                                            <td class="unit-price">${Number(item.cost || 0).toFixed(2)}</td>
                                            <td class="unit-price">${Number(item.price || 0).toFixed(2)}</td>
                                            <td class="unit-price">${Number(marginPct).toFixed(0)}%</td>
                                            <td>${statusPill}</td>
                                        </tr>
                                    `;
                                  })
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div style="margin: 20px; text-align: center; color: #64748b;">
                    <p>📋 Basic Inventory View (Advanced features available when fully loaded)</p>
                </div>
            </div>
        `;
  }

  initializeThemeToggle() {
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
      darkModeToggle.addEventListener("change", (e) => {
        this.toggleDarkMode(e.target.checked);
        this.saveThemePreference(e.target.checked);
      });
    }
  }

  toggleDarkMode(isDark) {
    const app = document.getElementById("pharmacy_app");
    if (isDark) {
      if (app) app.classList.add("dark-mode");
      document.body.classList.add("dark-mode");
      document.documentElement.style.setProperty("--bg-main", "#0f172a");
      document.documentElement.style.setProperty("--bg-card", "#1e293b");
      document.documentElement.style.setProperty("--border-color", "#334155");
      document.documentElement.style.setProperty("--text-primary", "#f1f5f9");
    } else {
      if (app) app.classList.remove("dark-mode");
      document.body.classList.remove("dark-mode");
      document.documentElement.style.setProperty("--bg-main", "#f8fafc");
      document.documentElement.style.setProperty("--bg-card", "#ffffff");
      document.documentElement.style.setProperty("--border-color", "#e2e8f0");
      document.documentElement.style.setProperty("--text-primary", "#1e293b");
    }
  }

  saveThemePreference(isDark) {
    localStorage.setItem("pharmacy_pos_dark_mode", isDark);
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem("pharmacy_pos_dark_mode");
    const darkModeToggle = document.getElementById("darkModeToggle");

    if (savedTheme === "true") {
      darkModeToggle.checked = true;
      this.toggleDarkMode(true);
    }
  }

  initializeLogout() {
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
          this.handleLogout();
        }
      });
    }
  }

  handleLogout() {
    // Clear local storage
    localStorage.removeItem("pharmacy_pos_dark_mode");

    // Redirect to login page or perform logout action
    window.location.href = "/web/session/logout";
  }

  renderPharmacyPOS() {
    const container = document.getElementById("dashboard_container");

    container.innerHTML = `
          <div class="pharmacy-pos">
                <!-- Main Content Grid: Sales Table + Cart Split -->
                <div class="pos-main-grid-split-75-35 pos-main-grid-right-rail">
                    <div class="pos-left-top">
                        <div class="pos-actions-buttons" aria-label="POS actions">
                            <button class="action-btn camera-btn" onclick="pharmacyPOS.openCamera()" title="Open Barcode Scanner">
                                📷 Barcode Scanner
                            </button>
                            <button class="action-btn customer-btn" onclick="pharmacyPOS.selectWalkInCustomer()" title="Select Customer">
                                <span id="customerButtonIcon">🧍</span>
                                <span id="customerButtonText">Select Customer</span>
                            </button>
                            <button class="action-btn hold-btn" onclick="pharmacyPOS.holdBill()" title="Hold Bill">
                                ⏸ Hold Bill
                            </button>
                            <button class="action-btn returns-btn" onclick="pharmacyPOS.handleReturns()" title="Returns">
                                🔁 Returns
                            </button>
                        </div>
                        <section class="pos-actions-search" aria-label="Search items">
                            <div class="search-container">
                                <input 
                                    type="text" 
                                    class="search-input" 
                                    placeholder="🔍 Scan or search to add items"
                                    id="medicineSearch"
                                    onkeyup="pharmacyPOS.searchMedicines(this.value)"
                                    onkeypress="if(event.key==='Enter') pharmacyPOS.handleSearchEnter(event)"
                                />
                                <div class="search-suggestions" id="searchSuggestions"></div>
                            </div>
                        </section>

                        <!-- Sales Table Section (Left - 75%) -->
                    <div class="pos-sales-table-75">
                        <div class="sales-table-container">
                            <h3>🛒 Sales Table</h3>
                            <div class="cart-table-container">
                                <table class="cart-table" id="cartTable">
                                    <thead>
                                        <tr>
                                            <th>Item Name</th>
                                            <th>Batch/Expiry</th>
                                            <th>Qty</th>
                                            <th>Unit Price</th>
                                            <th>Disc%</th>
                                            <th>Total</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="cartTableBody">
                                        <tr class="cart-empty-row">
                                            <td colspan="7" class="cart-empty">
                                                <p>Table is empty</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    </div>
                    
                    

                    <!-- Right Rail (Top Corner): Actions + Search + Cart (35%) -->
                    
                    <div class="pos-cart-35 pos-right-rail">
                        <div class="cart-container modern-cart-container">
                            <div class="cart-header">
                                <h2><span class="emoji-icon">🛒</span> Sales Cart</h2>
                                <span class="cart-badge"><span id="cartItemCount">0</span> items</span>
                            </div>
                            <div class="cart-summary modern-summary">
                                <div class="cart-totals">
                                    <div class="summary-row">
                                        <span class="summary-label">Subtotal</span>
                                        <span class="summary-value" id="cartSubtotal">$0.00</span>
                                    </div>
                                    <div class="summary-row">
                                        <span class="summary-label">Discount</span>
                                        <span class="summary-value discount-value" id="cartDiscount">$0.00</span>
                                    </div>
                                    <div class="summary-divider"></div>
                                    <div class="summary-row grand-total-row">
                                        <span class="summary-label">Grand Total</span>
                                        <span class="summary-value total-value" id="cartTotal">$0.00</span>
                                    </div>
                                </div>
                                <div class="cart-actions cart-actions-modern">
                                    <button class="btn-modern btn-pay" onclick="pharmacyPOS.checkout()">
                                        🧾 Pay
                                    </button>
                                    <button class="btn-modern btn-clear" onclick="pharmacyPOS.clearCart()">
                                        🧹 Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
        `;

    // Initialize POS functionality
    setTimeout(() => {
      this.initializePOS();
    }, 100);

    // Auto-scroll the table after rendering
    setTimeout(() => {
      this.autoScrollTable();
    }, 500);
  }

  autoScrollTable() {
    const tableContainer = document.querySelector(".cart-table-container");
    if (tableContainer) {
      // Reset scroll position first
      tableContainer.scrollTop = 0;

      // Force reflow to ensure scroll calculation works
      tableContainer.offsetHeight;

      // Smooth scroll to bottom
      setTimeout(() => {
        tableContainer.scrollTo({
          top: tableContainer.scrollHeight,
          behavior: "smooth",
        });
      }, 200);
    }
  }

  initializePOS() {
    // Make pharmacyPOS globally available
    window.pharmacyPOS = this;

    // Load products
    this.loadProducts();

    // Initialize cart
    this.cart = [];
    this.updateCartDisplay();

    // Initialize customer
    this.currentCustomer = {
      name: "Walk-in Customer",
      isWalkIn: true,
    };

    // Load held bills from localStorage
    this.loadHeldBills();

    // Update held bills count display
    this.updateHeldBillsCount();

    // Barcode reader state
    this.isScanning = false;
    this.barcodeBuffer = "";

    // Render products grid
    this.renderProducts(this.products);
  }

  loadHeldBills() {
    const savedHeldBills = localStorage.getItem("pharmacy_pos_held_bills");
    if (savedHeldBills) {
      try {
        this.heldBills = JSON.parse(savedHeldBills);
      } catch (error) {
        console.error("Error loading held bills from localStorage:", error);
        this.heldBills = [];
      }
    } else {
      this.heldBills = [];
    }
  }

  saveHeldBills() {
    try {
      localStorage.setItem(
        "pharmacy_pos_held_bills",
        JSON.stringify(this.heldBills),
      );
    } catch (error) {
      console.error("Error saving held bills to localStorage:", error);
      this.showNotification(
        "Failed to save held bills to local storage.",
        "error",
      );
    }
  }

  openCamera() {
    this.startBarcodeScanner();
  }

  startBarcodeScanner() {
    if (this.isScanning) {
      this.stopBarcodeScanner();
      return;
    }

    this.isScanning = true;
    this.barcodeBuffer = "";

    // Update button to show scanning state
    const cameraBtn = document.querySelector(".camera-btn");
    if (cameraBtn) {
      cameraBtn.textContent = "⏹ Stop Scanner";
      cameraBtn.style.background = "#fee2e2";
      cameraBtn.style.borderColor = "#dc2626";
      cameraBtn.style.color = "#dc2626";
    }

    // Show scanning interface
    this.showBarcodeScannerInterface();

    // Simulate barcode input (in real implementation, this would connect to actual barcode scanner)
    this.simulateBarcodeScanning();
  }

  stopBarcodeScanner() {
    this.isScanning = false;
    this.barcodeBuffer = "";

    // Reset button
    const cameraBtn = document.querySelector(".camera-btn");
    if (cameraBtn) {
      cameraBtn.textContent = "📷 Barcode Scanner";
      cameraBtn.style.background = "";
      cameraBtn.style.borderColor = "";
      cameraBtn.style.color = "";
    }

    // Hide scanning interface
    this.hideBarcodeScannerInterface();
  }

  showBarcodeScannerInterface() {
    const container = document.getElementById("dashboard_container");
    const scannerOverlay = document.createElement("div");
    scannerOverlay.id = "barcodeScannerOverlay";
    scannerOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

    scannerOverlay.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 16px; text-align: center; max-width: 400px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📷</div>
                <h2 style="margin: 0 0 10px 0; color: #1f2937;">Barcode Scanner Active</h2>
                <p style="margin: 0 0 20px 0; color: #6b7280;">Scan barcode to add product to cart</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Barcode:</div>
                    <div id="barcodeDisplay" style="font-size: 18px; font-weight: 600; color: #059669; min-height: 24px;">Waiting for scan...</div>
                </div>
                <button onclick="pharmacyPOS.stopBarcodeScanner()" style="background: #dc2626; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    Stop Scanner
                </button>
            </div>
        `;

    container.appendChild(scannerOverlay);
  }

  hideBarcodeScannerInterface() {
    const overlay = document.getElementById("barcodeScannerOverlay");
    if (overlay) {
      overlay.remove();
    }
  }

  simulateBarcodeScanning() {
    // Simulate barcode scanning with actual barcodes from medicine data
    const sampleBarcodes = [
      "8901234567002", // Amoxicillin 500
      "8901234557003", // Augmentin 625
      "8901234557004", // Cetirizine 10
      "8901234557005", // Diazepam 5
      "8901234557006", // Losartan 50
      "8901234557007", // Metformin 500
      "8901234557008", // Omeprazole 20
      "8901234557011", // Vitamin C 500
    ];

    if (this.isScanning) {
      // Simulate a barcode scan after 2-4 seconds
      const scanDelay = Math.random() * 2000 + 2000;
      setTimeout(() => {
        if (this.isScanning) {
          const randomBarcode =
            sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
          this.processBarcode(randomBarcode);
        }
      }, scanDelay);
    }
  }

  processBarcode(barcode) {
    // Update display
    const barcodeDisplay = document.getElementById("barcodeDisplay");
    if (barcodeDisplay) {
      barcodeDisplay.textContent = barcode;
    }

    // Find product by barcode (mock implementation)
    const product = this.findProductByBarcode(barcode);

    if (product) {
      this.addProductToCart(product);
      this.showNotification(`✅ ${product.name} added to cart`, "success");

      // Continue scanning
      setTimeout(() => {
        if (this.isScanning) {
          this.simulateBarcodeScanning();
        }
      }, 1000);
    } else {
      this.showNotification(
        `❌ Product not found for barcode: ${barcode}`,
        "error",
      );

      // Continue scanning
      setTimeout(() => {
        if (this.isScanning) {
          this.simulateBarcodeScanning();
        }
      }, 1500);
    }
  }
  // barcode search (supports base medicines data + localStorage items)
  findProductByBarcode(barcode) {
    const searchKey = String(barcode || "").trim();
    if (!searchKey) return null;

    // Use same data source as other methods (localStorage + default)
    const savedItems = localStorage.getItem("pharmacy_pos_inventory_items");
    const dataset = savedItems ? JSON.parse(savedItems) : medicines;

    // Prefer exact barcode match first
    const byBarcode = dataset.find((m) => String(m.barcode) === searchKey);
    if (byBarcode) return byBarcode;

    // Fallback to ID match (numeric or string)
    return dataset.find((m) => String(m.id) === searchKey);
  }

  addProductToCart(product) {
    // Check if product already exists in cart
    const existingItem = this.cart.find((item) => item.id === product.id);

    if (existingItem) {
      // Increment quantity if already exists
      existingItem.quantity += 1;
      existingItem.total =
        Number(existingItem.unitPrice || 0) * existingItem.quantity;
    } else {
      // Add new item to cart
      const cartItem = {
        id: product.id,
        name: product.name,
        batch: product.batch || "N/A",
        expiry: product.expiryLabel || product.expiry || "N/A",
        quantity: 1,
        unitPrice: Number(product.price) || 0,
        discount: 0,
        total: Number(product.price) || 0,
        icon: product.icon || "💊",
      };

      this.cart.push(cartItem);
    }

    // Update displays
    this.updateCartDisplay();
    this.updateSalesTable();
    this.updateCartSummary();

    // Auto-scroll to show new item
    this.autoScrollTable();
  }

  updateCartDisplay() {
    // Update cart item count
    const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.getElementById("cartItemCount");
    if (cartBadge) {
      cartBadge.textContent = itemCount;
    }
  }

  updateSalesTable() {
    const tableBody = document.getElementById("cartTableBody");
    if (!tableBody) return;

    // Clear existing content
    tableBody.innerHTML = "";

    if (this.cart.length === 0) {
      tableBody.innerHTML = `
                <tr class="cart-empty-row">
                    <td colspan="7" class="cart-empty">
                        <p>Table is empty</p>
                    </td>
                </tr>
            `;
      return;
    }

    // Add cart items to table
    this.cart.forEach((item, index) => {
      const row = document.createElement("tr");
      row.style.opacity = "0";
      row.style.transform = "translateY(20px)";
      row.style.transition = "all 0.3s ease";

      row.innerHTML = `
                <td>
                    <div class="product-name">
                        <span class="product-text">${item.name}</span>
                    </div>
                </td>
                <td>
                    <div class="batch-expiry">
                        <span class="batch-code">${item.batch}</span>
                        <span class="expiry-date">${item.expiry}</span>
                    </div>
                </td>
                <td class="quantity-cell">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="pharmacyPOS.updateQuantity(${index}, -1)">−</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="pharmacyPOS.updateQuantity(${index}, 1)">+</button>
                    </div>
                </td>
                <td class="price-cell">LKR ${Number(item.unitPrice || 0).toFixed(2)}</td>
                <td class="discount-cell">${Number(item.discount || 0)}%</td>
                <td class="total-cell">LKR ${Number(item.total || 0).toFixed(2)}</td>
                <td class="actions-cell">
                    <button class="action-btn delete" onclick="pharmacyPOS.removeItem(${index})" title="Remove item">
                        🗑️
                    </button>
                </td>
            `;

      tableBody.appendChild(row);

      // Animate row appearance
      setTimeout(() => {
        row.style.opacity = "1";
        row.style.transform = "translateY(0)";
      }, index * 50);
    });
  }

  updateCartSummary() {
    const itemCount = this.cart.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );
    const subtotal = this.cart.reduce(
      (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0),
      0,
    );
    const totalDiscount = this.cart.reduce(
      (sum, item) =>
        sum +
        (item.unitPrice || 0) *
          (item.quantity || 0) *
          ((item.discount || 0) / 100),
      0,
    );
    const grandTotal = subtotal - totalDiscount;

    document.getElementById("cartItemCount").textContent = itemCount;
    document.getElementById("cartSubtotal").textContent =
      `LKR ${Number(subtotal).toFixed(2)}`;
    document.getElementById("cartDiscount").textContent =
      `LKR ${Number(totalDiscount).toFixed(2)}`;
    document.getElementById("cartTotal").textContent =
      `LKR ${Number(grandTotal).toFixed(2)}`;
  }

  updateQuantity(index, change) {
    const item = this.cart[index];
    if (!item) return;

    item.quantity = (item.quantity || 0) + change;

    if (item.quantity <= 0) {
      this.removeItem(index);
      return;
    }

    item.total = Number(item.unitPrice || 0) * item.quantity;

    this.updateCartDisplay();
    this.updateSalesTable();
    this.updateCartSummary();
  }

  removeItem(index) {
    this.cart.splice(index, 1);

    this.updateCartDisplay();
    this.updateSalesTable();
    this.updateCartSummary();
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

    // Set background color based on type
    const colors = {
      success: "#22c55e",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  holdBill() {
    if (this.cart.length === 0) {
      this.showNotification(
        "⏸ Cart is empty. Add items before holding a bill.",
        "warning",
      );
      return;
    }

    const billName = prompt(
      "Enter bill reference name:",
      `Bill_${Date.now().toString().slice(-6)}`,
    );
    if (billName && billName.trim()) {
      const heldBill = {
        id: Date.now(),
        name: billName.trim(),
        customer: this.currentCustomer,
        items: [...this.cart],
        total: this.getCartTotal(),
        timestamp: new Date().toISOString(),
        displayTimestamp: new Date().toLocaleString(),
      };

      this.heldBills.push(heldBill);
      this.saveHeldBills();

      this.showNotification(
        `⏸ Bill "${billName}" held successfully! (${this.cart.length} items, LKR ${Number(this.getCartTotal()).toFixed(2)})`,
        "success",
      );
      this.clearCart();

      // Update held bills count display
      this.updateHeldBillsCount();
    }
  }

  handleReturns() {
    if (this.heldBills.length === 0) {
      this.showNotification("🔁 No held bills available for returns.", "info");
      return;
    }

    this.showReturnsModal();
  }

  showReturnsModal() {
    // Remove existing modal
    this.closeReturnsModal();

    const modal = document.createElement("div");
    modal.id = "returnsModal";
    modal.className = "inventory-modal-overlay";
    modal.innerHTML = `
            <div class="inventory-modal returns-modal" role="dialog" aria-modal="true" aria-labelledby="returnsTitle">
                <div class="inventory-modal-header">
                    <h3 id="returnsTitle">🔁 Process Returns / Retrieve Held Bills</h3>
                    <button type="button" class="inventory-modal-close" aria-label="Close returns modal">×</button>
                </div>
                <div class="returns-content">
                    <div class="held-bills-list">
                        ${
                          this.heldBills.length > 0
                            ? `
                            <h4>Available Held Bills</h4>
                            <div class="bills-grid">
                                ${this.heldBills
                                  .map(
                                    (bill, index) => `
                                    <div class="held-bill-card" data-bill-index="${index}">
                                        <div class="bill-header">
                                            <div class="bill-name">${bill.name}</div>
                                            <div class="bill-customer">${bill.customer?.name || "Walk-in Customer"}</div>
                                        </div>
                                        <div class="bill-details">
                                            <div class="bill-info">
                                                <span class="bill-items">${bill.items.length} items</span>
                                                <span class="bill-total">LKR ${Number(bill.total).toFixed(2)}</span>
                                            </div>
                                            <div class="bill-date">${bill.displayTimestamp}</div>
                                        </div>
                                        <div class="bill-actions">
                                            <button class="btn btn-primary btn-sm" onclick="pharmacyPOS.retrieveBill(${index})">
                                                🛒 Retrieve
                                            </button>
                                            <button class="btn btn-secondary btn-sm" onclick="pharmacyPOS.processReturn(${index})">
                                                🔁 Return
                                            </button>
                                            <button class="btn btn-danger btn-sm" onclick="pharmacyPOS.deleteHeldBill(${index})">
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        `
                            : `
                            <div class="empty-state">
                                <div class="empty-state-icon">📋</div>
                                <div class="empty-state-title">No Held Bills Available</div>
                                <div class="empty-state-text">
                                    There are currently no held bills to process returns or retrieve.<br>
                                    Hold bills from the cart to see them appear here.
                                </div>
                            </div>
                        `
                        }
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Setup modal close handlers
    const close = () => this.closeReturnsModal();
    modal
      .querySelector(".inventory-modal-close")
      ?.addEventListener("click", close);
    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) close();
    });
  }
  closeReturnsModal() {
    const modal = document.getElementById("returnsModal");
    if (modal) modal.remove();
  }

  retrieveBill(billIndex) {
    const bill = this.heldBills[billIndex];
    if (!bill) return;

    // Clear current cart if not empty
    if (this.cart.length > 0) {
      if (
        !confirm("Current cart is not empty. Clear it and retrieve held bill?")
      ) {
        return;
      }
      this.clearCart(false);
    }

    // Restore cart items
    this.cart = [...bill.items];

    // Restore customer information
    if (bill.customer) {
      this.currentCustomer = { ...bill.customer };
      this.updateCustomerButton();
    } else {
      this.currentCustomer = {
        name: "Walk-in Customer",
        isWalkIn: true,
      };
      this.updateCustomerButton();
    }

    // Update displays
    this.updateCartDisplay();
    this.updateSalesTable();
    this.updateCartSummary();

    // Remove the held bill
    this.heldBills.splice(billIndex, 1);
    this.saveHeldBills();

    const customerInfo =
      bill.customer && !bill.customer.isWalkIn
        ? ` for ${bill.customer.name}`
        : "";

    this.showNotification(
      `🛒 Retrieved bill "${bill.name}" with ${bill.items.length} items${customerInfo}`,
      "success",
    );
    this.closeReturnsModal();
    this.updateHeldBillsCount();
  }

  processReturn(billIndex) {
    const bill = this.heldBills[billIndex];
    if (!bill) return;

    if (
      confirm(
        `Process return for "${bill.name}"?\n\nItems: ${bill.items.length}\nTotal Refund: LKR ${Number(bill.total).toFixed(2)}`,
      )
    ) {
      // Process return logic
      const returnTransaction = {
        id: Date.now(),
        originalBillId: bill.id,
        originalBillName: bill.name,
        items: [...bill.items],
        totalAmount: bill.total,
        refundAmount: bill.total,
        timestamp: new Date().toLocaleString(),
        type: "RETURN",
      };

      // Add to sales history as a return
      if (!this.salesHistory) this.salesHistory = [];
      this.salesHistory.push(returnTransaction);

      // Show return receipt
      this.printReturnReceipt(returnTransaction);

      // Remove the held bill
      this.heldBills.splice(billIndex, 1);
      this.saveHeldBills();

      this.showNotification(
        `🔁 Return processed for "${bill.name}" - Refund: LKR ${Number(bill.total).toFixed(2)}`,
        "success",
      );
      this.closeReturnsModal();
      this.updateHeldBillsCount();
    }
  }

  deleteHeldBill(billIndex) {
    const bill = this.heldBills[billIndex];
    if (!bill) return;

    if (
      confirm(`Delete held bill "${bill.name}"? This action cannot be undone.`)
    ) {
      this.heldBills.splice(billIndex, 1);
      this.saveHeldBills();

      this.showNotification(`🗑️ Held bill "${bill.name}" deleted`, "info");
      this.closeReturnsModal();
      this.updateHeldBillsCount();
    }
  }

  updateHeldBillsCount() {
    // Update held bills count display if exists
    const heldBillsCount = document.getElementById("heldBillsCount");
    if (heldBillsCount) {
      heldBillsCount.textContent = this.heldBills.length;
    }

    // Update returns button text to show count
    const returnsBtn = document.querySelector(".returns-btn");
    if (returnsBtn) {
      returnsBtn.innerHTML = `🔁 Returns ${this.heldBills.length > 0 ? `(${this.heldBills.length})` : ""}`;
    }
  }

  printReturnReceipt(returnTransaction) {
    const receiptContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>RETURN Receipt - ${returnTransaction.id}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Courier New', monospace;
                        background: white;
                        margin: 0;
                        padding: 20px;
                        max-width: 400px;
                    }
                    .receipt-container {
                        background: white;
                        padding: 30px;
                        border: 1px solid #333;
                    }
                    .receipt-header {
                        text-align: center;
                        border-bottom: 3px double #333;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                    }
                    .receipt-title {
                        font-size: 28px;
                        font-weight: bold;
                        color: #dc2626;
                        margin: 10px 0;
                    }
                    .receipt-subtitle {
                        font-size: 14px;
                        color: #6c757d;
                        margin: 5px 0;
                        font-weight: 600;
                    }
                    .receipt-info {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        margin: 15px 0;
                        font-size: 13px;
                        color: #495057;
                    }
                    .receipt-info-item {
                        display: flex;
                        flex-direction: column;
                    }
                    .receipt-info-label {
                        font-weight: 600;
                        color: #6c757d;
                        margin-bottom: 3px;
                    }
                    .receipt-items {
                        margin: 25px 0;
                        border-top: 2px solid #e9ecef;
                        padding-top: 15px;
                    }
                    .receipt-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin: 8px 0;
                        padding: 10px 0;
                        border-bottom: 1px dashed #e9ecef;
                    }
                    .receipt-item:last-child {
                        border-bottom: none;
                    }
                    .receipt-item-name {
                        flex: 1;
                        font-weight: 600;
                        color: #2c3e50;
                        line-height: 1.4;
                    }
                    .receipt-batch {
                        font-size: 10px;
                        color: #6c757d;
                        margin-top: 2px;
                    }
                    .receipt-item-details {
                        text-align: right;
                        min-width: 120px;
                        font-size: 12px;
                        color: #495057;
                    }
                    .receipt-totals {
                        background: #fef2f2;
                        border: 2px solid #dc2626;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .receipt-total-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 8px 0;
                        font-size: 14px;
                    }
                    .receipt-grand-total {
                        font-size: 18px;
                        font-weight: bold;
                        color: #dc2626;
                        border-top: 2px solid #e9ecef;
                        padding-top: 10px;
                        margin-top: 10px;
                    }
                    .receipt-payment {
                        background: #dc2626;
                        color: white;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 8px;
                        text-align: center;
                    }
                    .receipt-payment-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 5px 0;
                        font-size: 13px;
                    }
                    .receipt-footer {
                        text-align: center;
                        margin-top: 30px;
                        padding: 20px;
                        background: #f8f9fa;
                        border-radius: 8px;
                        border: 1px solid #e9ecef;
                    }
                    .receipt-thank {
                        font-size: 16px;
                        font-weight: bold;
                        color: #dc2626;
                        margin-bottom: 10px;
                    }
                    .receipt-contact {
                        font-size: 12px;
                        color: #6c757d;
                        margin: 5px 0;
                    }
                    .receipt-barcode {
                        text-align: center;
                        margin: 20px 0;
                        font-family: 'Code 128', monospace;
                        font-size: 14px;
                        letter-spacing: 2px;
                    }
                    @media print {
                        body { margin: 0; padding: 10px; }
                        .receipt-container { 
                            border: 1px solid #333; 
                            margin: 0; 
                            max-width: 100%; 
                        }
                    }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="receipt-header">
                        <div class="receipt-title">🏥 PHARMACY</div>
                        <div class="receipt-subtitle">RETURN RECEIPT</div>
                    </div>
                    
                    <div class="receipt-info">
                        <div class="receipt-info-item">
                            <div class="receipt-info-label">Return #</div>
                            <div>RET${returnTransaction.id}</div>
                        </div>
                        <div class="receipt-info-item">
                            <div class="receipt-info-label">Date & Time</div>
                            <div>${returnTransaction.timestamp}</div>
                        </div>
                    </div>
                    
                    <div class="receipt-info">
                        <div class="receipt-info-item">
                            <div class="receipt-info-label">Original Bill</div>
                            <div>${returnTransaction.originalBillName}</div>
                        </div>
                        <div class="receipt-info-item">
                            <div class="receipt-info-label">Customer</div>
                            <div>Walk-in Customer</div>
                        </div>
                    </div>
                    
                    <div class="receipt-items">
                        ${returnTransaction.items
                          .map(
                            (item) => `
                            <div class="receipt-item">
                                <div class="receipt-item-name">
                                    ${item.name}
                                    <div class="receipt-batch">Batch: ${item.batch || "N/A"} | Exp: ${item.expiry || "N/A"}</div>
                                </div>
                                <div class="receipt-item-details">
                                    ${item.quantity} × LKR ${Number(item.unitPrice || 0).toFixed(2)}<br>
                                    <strong>LKR ${Number((item.unitPrice || 0) * item.quantity).toFixed(2)}</strong>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                    
                    <div class="receipt-totals">
                        <div class="receipt-total-row">
                            <span>Items Returned (${returnTransaction.items.length}):</span>
                            <span>${returnTransaction.items.length}</span>
                        </div>
                        <div class="receipt-total-row">
                            <span>Original Total:</span>
                            <span>LKR ${Number(returnTransaction.totalAmount).toFixed(2)}</span>
                        </div>
                        <div class="receipt-grand-total">
                            <span>REFUND AMOUNT:</span>
                            <span>LKR ${Number(returnTransaction.refundAmount).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="receipt-payment">
                        <div class="receipt-payment-row">
                            <span>Refund Processed</span>
                            <span>✓ COMPLETED</span>
                        </div>
                    </div>
                    
                    <div class="receipt-footer">
                        <div class="receipt-thank">Return Processed Successfully!</div>
                        <div class="receipt-contact"> +94 123 456 7890</div>
                        <div class="receipt-contact"> 123 Pharmacy Street, Colombo</div>
                        <div class="receipt-contact">📞 +94 123 456 7890</div>
                        <div class="receipt-contact">📍 123 Pharmacy Street, Colombo</div>
                        <div class="receipt-barcode">|||RET${returnTransaction.id}|||</div>
                    </div>
                </div>
            </body>
            </html>
        `;

    // Auto-download return receipt
    const blob = new Blob([receiptContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `Return_Receipt_RET${returnTransaction.id}.html`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    // Show notification
    this.showNotification(
      `📥 Return receipt downloaded - RET${returnTransaction.id}`,
      "success",
    );
  }

  getCartTotal() {
    return this.cart.reduce(
      (total, item) =>
        total + Number(item.unitPrice || 0) * Number(item.quantity || 0),
      0,
    );
  }

  loadProducts() {
    // Load from localStorage (includes default + new products)
    const savedItems = localStorage.getItem("pharmacy_pos_inventory_items");
    this.products = savedItems ? JSON.parse(savedItems) : medicines;
  }

  renderProducts(productsToRender) {
    const productsGrid = document.getElementById("productsGrid");
    if (!productsGrid) return;

    productsGrid.innerHTML = productsToRender
      .map(
        (product) => `
            <div class="product-card" data-category="${product.category}">
                <div class="product-icon">${product.icon}</div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-category">Category: ${this.getCategoryName(product.category)}</p>
                    <p class="product-price">💰 Price: LKR ${Number(product.price || 0).toFixed(2)}</p>
                    <p class="product-stock ${product.stock < 20 ? "low-stock" : ""}">
                        📦 Stock: ${product.stock} in stock
                        ${product.stock < 20 ? "⚠️ Low Stock" : ""}
                    </p>
                    ${product.prescription ? '<p class="prescription-required">⚠️ Prescription Required</p>' : ""}
                </div>
                <div class="product-actions">
                    <button class="btn btn-add-cart" onclick="pharmacyPOS.addToCart(${product.id})">
                        ➕ Add to Cart
                    </button>
                </div>
            </div>
        `,
      )
      .join("");
  }

  getCategoryName(category) {
    const categoryNames = {
      tablets: "Tablets",
      syrups: "Syrups",
      injections: "Injections",
      ointments: "Ointments",
      supplements: "Supplements",
      devices: "Medical Devices",
      firstaid: "First Aid",
      personal: "Personal Care",
      antibiotics: "Antibiotics",
      chronic: "Chronic Care",
    };
    return categoryNames[category] || category;
  }

  handleSearchEnter(event) {
    const query = event.target.value.trim();
    const suggestionsContainer = document.getElementById("searchSuggestions");

    if (!query) return;

    // Check if there's exactly one suggestion and add it
    const suggestions = suggestionsContainer.querySelectorAll(
      ".suggestion-item:not(.no-results)",
    );
    if (suggestions.length === 1) {
      suggestions[0].click();
    } else if (suggestions.length > 1) {
      // If multiple suggestions, do nothing and let user choose
      return;
    } else {
      // No suggestions, check if it's a barcode
      if (/^\d{9,}$/.test(query)) {
        const product = this.findProductByBarcode(query);
        if (product) {
          this.addProductToCart(product);
          event.target.value = "";
          suggestionsContainer.innerHTML = "";
          this.showNotification(
            `✅ ${product.name} added via barcode scan`,
            "success",
          );
        } else {
          this.showNotification(
            `❌ No product found for barcode: ${query}`,
            "error",
          );
        }
      }
    }
  }

  searchMedicines(query) {
    const suggestionsContainer = document.getElementById("searchSuggestions");

    if (!query.trim()) {
      suggestionsContainer.innerHTML = "";
      return;
    }

    // Check if input looks like a barcode (all numbers and longer than 8 digits)
    if (/^\d{9,}$/.test(query.trim())) {
      // Try to find product by barcode
      const product = this.findProductByBarcode(query.trim());
      if (product) {
        this.addProductToCart(product);
        // Clear search after successful barcode scan
        const searchInput = document.getElementById("medicineSearch");
        searchInput.value = "";
        suggestionsContainer.innerHTML = "";
        this.showNotification(
          `✅ ${product.name} added via barcode scan`,
          "success",
        );
        return;
      }
    }

    // Use localStorage data (pharmacy_pos_inventory_items) - includes default + new products
    const savedItems = localStorage.getItem("pharmacy_pos_inventory_items");
    const allProducts = savedItems ? JSON.parse(savedItems) : medicines;

    const filtered = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.barcode === query.trim(),
    );

    if (filtered.length === 0) {
      suggestionsContainer.innerHTML =
        '<div class="suggestion-item no-results">No products found</div>';
      return;
    }

    suggestionsContainer.innerHTML = filtered
      .map(
        (product) => `
            <div class="suggestion-item" onclick="pharmacyPOS.addToCartFromSearch(${product.id}, '${product.name.replace(/'/g, "\\'")}')">
                <div class="suggestion-icon">${product.icon}</div>
                <div class="suggestion-info">
                    <div class="suggestion-name">${product.name}</div>
                    <div class="suggestion-details">
                        💰 LKR ${Number(product.price || 0).toFixed(2)} | 📦 ${product.stock} in stock
                        ${product.barcode ? ` | 📊 ${product.barcode}` : ""}
                    </div>
                </div>
                <div class="suggestion-action">➕</div>
            </div>
        `,
      )
      .join("");
  }

  filterByCategory(category) {
    let filtered = this.products;
    if (category !== "all") {
      filtered = this.products.filter(
        (product) => product.category === category,
      );
    }
    this.renderProducts(filtered);
  }

  addToCartFromSearch(productId, productName) {
    // Use same data source as search (localStorage + default)
    const savedItems = localStorage.getItem("pharmacy_pos_inventory_items");
    const allProducts = savedItems ? JSON.parse(savedItems) : medicines;
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    this.addToCart(productId);

    // Clear search and show confirmation
    const searchInput = document.getElementById("medicineSearch");
    searchInput.value = "";
    document.getElementById("searchSuggestions").innerHTML = "";

    // Show brief notification
    const notification = document.createElement("div");
    notification.className = "add-notification";
    notification.textContent = `✅ ${productName} added to cart`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }

  addToCart(productId) {
    // Use same data source as search (localStorage + default)
    const savedItems = localStorage.getItem("pharmacy_pos_inventory_items");
    const allProducts = savedItems ? JSON.parse(savedItems) : medicines;
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    // Use the same logic as addProductToCart for consistency
    this.addProductToCart(product);
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter((item) => item.id !== productId);
    this.updateCartDisplay();
    this.updateSalesTable();
    this.updateCartSummary();
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }

  updateDiscount(productId, discountValue) {
    const item = this.cart.find((item) => item.id === productId);
    if (item) {
      item.discount = Math.max(
        0,
        Math.min(100, parseFloat(discountValue) || 0),
      );
      this.updateCartDisplay();
      this.updateSalesTable();
      this.updateCartSummary();
    }
  }

  clearCart(askConfirm = true) {
    if (!askConfirm || confirm("Are you sure you want to clear the cart?")) {
      this.cart = [];
      this.updateCartDisplay();
      this.updateSalesTable();
      this.updateCartSummary();
    }
  }

  checkout() {
    if (this.cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const total = this.calculateGrandTotal();
    const existingDropdown = document.getElementById("paymentDropdown");

    if (existingDropdown) {
      existingDropdown.remove();
      return;
    }

    // Hide cart-totals and default cart-actions to free up vertical space
    const cartTotals = document.querySelector(".pos-cart-35 .cart-totals");
    const defaultActions = document.querySelector(".pos-cart-35 .cart-actions");
    if (cartTotals) cartTotals.style.display = "none";
    if (defaultActions) defaultActions.style.display = "none";

    // Create dropdown within the cart
    const dropdown = document.createElement("div");
    dropdown.id = "paymentDropdown";
    dropdown.className = "modern-payment-panel";
    dropdown.innerHTML = `
            <div class="payment-panel-content">
                <div class="payment-header">
                    <h4>💳 Payment Details</h4>
                    <button class="close-payment" type="button" onclick="pharmacyPOS.closePaymentDropdown()" aria-label="Close payment panel">×</button>
                </div>

                <div class="payment-total-modern">
                    <div class="total-label">TOTAL</div>
                    <div class="total-amount-large">LKR ${Number(total).toFixed(2)}</div>
                </div>

                <div class="payment-methods-modern" role="radiogroup" aria-label="Payment method">
                    <label class="method-card">
                        <input type="radio" name="payment" value="cash" checked>
                        <div class="method-content">
                            <div class="method-icon">💵</div>
                            <div class="method-name">Cash</div>
                        </div>
                    </label>
                    <label class="method-card">
                        <input type="radio" name="payment" value="card">
                        <div class="method-content">
                            <div class="method-icon">💳</div>
                            <div class="method-name">Card</div>
                        </div>
                    </label>
                    <label class="method-card">
                        <input type="radio" name="payment" value="credit">
                        <div class="method-content">
                            <div class="method-icon">🏦</div>
                            <div class="method-name">Credit</div>
                        </div>
                    </label>
                </div>

                <div class="payment-amount-modern">
                    <label for="amountPaid">Amount Paid</label>
                    <div class="amount-input-wrapper">
                        <span class="currency-prefix">LKR</span>
                        <input class="amount-input-modern" type="number" id="amountPaid" value="${Number(total).toFixed(2)}" step="0.01" min="0" inputmode="decimal">
                    </div>
                    <div class="quick-amounts-modern">
                        <button class="quick-amt-btn" type="button" onclick="pharmacyPOS.setAmount(10)">10</button>
                        <button class="quick-amt-btn" type="button" onclick="pharmacyPOS.setAmount(100)">100</button>
                        <button class="quick-amt-btn" type="button" onclick="pharmacyPOS.setAmount(500)">500</button>
                        <button class="quick-amt-btn" type="button" onclick="pharmacyPOS.setAmount(1000)">1000</button>
                    </div>
                </div>

                <div class="payment-balance-modern">
                    <div class="balance-card">
                        <span class="balance-label">Balance</span>
                        <span class="balance-value" id="balanceAmount">LKR ${Number(total).toFixed(2)} (due)</span>
                    </div>
                </div>

                <div class="payment-actions-modern">
                    <button class="btn-complete-sale" type="button" onclick="pharmacyPOS.completeSale()">
                        Complete Sale & Print Receipt <span class="arrow-icon">→</span>
                    </button>
                </div>

                <div class="cart-actions cart-actions-modern" style="grid-template-columns: 1fr 1fr; margin-top: 6px;">
                    <button class="btn-modern btn-clear" type="button" onclick="pharmacyPOS.closePaymentDropdown()">
                        ← Back
                    </button>
                    <button class="btn-modern btn-clear" type="button" onclick="pharmacyPOS.clearCart(); pharmacyPOS.closePaymentDropdown();">
                      Clear Cart
                    </button>
                </div>
        `;

    // Insert dropdown after cart summary
    const cartSummary = document.querySelector(".pos-cart-35 .cart-summary");
    if (cartSummary) {
      cartSummary.appendChild(dropdown);
    }

    // Setup payment calculation
    this.setupPaymentCalculation();
  }

  closePaymentDropdown() {
    const dropdown = document.getElementById("paymentDropdown");
    if (dropdown) {
      dropdown.remove();
    }

    // Show cart-totals and default cart-actions again
    const cartTotals = document.querySelector(".pos-cart-35 .cart-totals");
    const defaultActions = document.querySelector(".pos-cart-35 .cart-actions");
    if (cartTotals) cartTotals.style.display = "";
    if (defaultActions) defaultActions.style.display = "";
  }

  setupPaymentCalculation() {
    const amountPaid = document.getElementById("amountPaid");
    const balanceAmount = document.getElementById("balanceAmount");
    const total = this.calculateGrandTotal();

    const updateBalance = () => {
      const paid = parseFloat(amountPaid.value) || 0;
      const balance = total - paid;
      balanceAmount.textContent =
        balance > 0
          ? `LKR ${Number(balance).toFixed(2)} (due)`
          : `LKR ${Number(Math.abs(balance)).toFixed(2)} (change)`;
    };

    amountPaid.addEventListener("input", updateBalance);
    updateBalance();
  }

  setAmount(amount) {
    document.getElementById("amountPaid").value = amount;
    this.setupPaymentCalculation();
  }

  completeSale() {
    const total = this.calculateGrandTotal();
    const amountPaid =
      parseFloat(document.getElementById("amountPaid").value) || 0;
    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked',
    ).value;

    if (amountPaid < total && paymentMethod !== "credit") {
      alert("Insufficient payment amount!");
      return;
    }

    // Generate receipt number
    const receiptNumber = "R" + Date.now().toString().slice(-8);

    // Create sale record
    const sale = {
      id: Date.now(),
      receiptNumber: receiptNumber,
      items: [...this.cart],
      total: total,
      amountPaid: amountPaid,
      paymentMethod: paymentMethod,
      timestamp: new Date().toISOString(),
      displayTimestamp: new Date().toLocaleString(),
      customer: this.currentCustomer ? { ...this.currentCustomer } : null,
    };

    // Store sale (in real implementation, save to database)
    if (!this.salesHistory) this.salesHistory = [];
    this.salesHistory.push(sale);

    // Update customer's purchase history if customer is selected
    if (this.currentCustomer && !this.currentCustomer.isWalkIn) {
      this.updateCustomerPurchaseHistory(this.currentCustomer.id, sale);
    }

    const customerInfo =
      this.currentCustomer && !this.currentCustomer.isWalkIn
        ? ` for ${this.currentCustomer.name}`
        : "";

    this.showNotification(
      `🧾 Sale completed${customerInfo} - LKR ${Number(total).toFixed(2)}`,
      "success",
    );
    this.clearCart(false);
    this.closePaymentDropdown();

    // Reset customer to walk-in after sale
    this.currentCustomer = {
      name: "Walk-in Customer",
      isWalkIn: true,
    };
    this.updateCustomerButton();

    // Print receipt (simulation)
    this.printReceipt(sale);
  }

  updateCustomerPurchaseHistory(customerId, sale) {
    // Load customers from localStorage
    const customers = this.loadCustomersFromStorage();
    const customerIndex = customers.findIndex((c) => c.id === customerId);

    if (customerIndex !== -1) {
      // Add sale to customer's purchase history
      if (!customers[customerIndex].recentPurchases) {
        customers[customerIndex].recentPurchases = [];
      }

      // Create purchase record
      const purchaseRecord = {
        saleId: sale.id,
        receiptNumber: sale.receiptNumber,
        items: sale.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.price,
          total: item.total || item.quantity * (item.unitPrice || item.price),
          batch: item.batch,
          expiry: item.expiry,
        })),
        totalAmount: sale.total,
        paymentMethod: sale.paymentMethod,
        timestamp: sale.timestamp,
        displayTimestamp: sale.displayTimestamp,
      };

      // Add to recent purchases (keep only last 10 purchases)
      customers[customerIndex].recentPurchases.unshift(purchaseRecord);
      if (customers[customerIndex].recentPurchases.length > 10) {
        customers[customerIndex].recentPurchases = customers[
          customerIndex
        ].recentPurchases.slice(0, 10);
      }

      // Update total purchases amount
      customers[customerIndex].totalPurchases += sale.total;

      // Save updated customers back to localStorage
      try {
        localStorage.setItem("pharmacy_customers", JSON.stringify(customers));
        console.log(
          "Customer purchase history updated for:",
          customers[customerIndex].name,
        );
      } catch (error) {
        console.error("Error saving customer purchase history:", error);
      }
    }
  }

  printReceipt(sale) {
    // Create enhanced receipt content for auto-download and print
    const receiptContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - ${sale.receiptNumber}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Courier New', monospace;
                        background: white;
                        margin: 0;
                        padding: 20px;
                        max-width: 400px;
                    }
                    .receipt-container {
                        background: white;
                        padding: 30px;
                        border: 1px solid #333;
                    }
                    .receipt-header {
                        text-align: center;
                        border-bottom: 3px double #333;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                    }
                    .receipt-title {
                        font-size: 28px;
                        font-weight: bold;
                        color: #2c3e50;
                        margin: 10px 0;
                    }
                    .receipt-subtitle {
                        font-size: 14px;
                        color: #6c757d;
                        margin: 5px 0;
                        font-weight: 600;
                    }
                    .receipt-info {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        margin: 15px 0;
                        font-size: 13px;
                        color: #495057;
                    }
                    .receipt-info-item {
                        display: flex;
                        flex-direction: column;
                    }
                    .receipt-info-label {
                        font-weight: 600;
                        color: #6c757d;
                        margin-bottom: 3px;
                    }
                    .receipt-items {
                        margin: 25px 0;
                        border-top: 2px solid #e9ecef;
                        padding-top: 15px;
                    }
                    .receipt-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin: 8px 0;
                        padding: 10px 0;
                        border-bottom: 1px dashed #e9ecef;
                    }
                    .receipt-item:last-child {
                        border-bottom: none;
                    }
                    .receipt-item-name {
                        flex: 1;
                        font-weight: 600;
                        color: #2c3e50;
                        line-height: 1.4;
                    }
                    .receipt-batch {
                        font-size: 10px;
                        color: #6c757d;
                        margin-top: 2px;
                    }
                    .receipt-item-details {
                        text-align: right;
                        min-width: 120px;
                        font-size: 12px;
                        color: #495057;
                    }
                    .receipt-totals {
                        background: #f8f9fa;
                        border: 2px solid #e9ecef;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .receipt-total-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 8px 0;
                        font-size: 14px;
                    }
                    .receipt-grand-total {
                        font-size: 18px;
                        font-weight: bold;
                        color: #2c3e50;
                        border-top: 2px solid #e9ecef;
                        padding-top: 10px;
                        margin-top: 10px;
                    }
                    .receipt-payment {
                        background: #e8f5e8;
                        border-left: 4px solid #28a745;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 0 8px 8px 0;
                    }
                    .receipt-payment-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 5px 0;
                        font-size: 13px;
                    }
                    .receipt-footer {
                        text-align: center;
                        margin-top: 30px;
                        padding: 20px;
                        background: #f8f9fa;
                        border-radius: 8px;
                        border: 1px solid #e9ecef;
                    }
                    .receipt-thank {
                        font-size: 16px;
                        font-weight: bold;
                        color: #28a745;
                        margin-bottom: 10px;
                    }
                    .receipt-contact {
                        font-size: 12px;
                        color: #6c757d;
                        margin: 5px 0;
                    }
                    .receipt-barcode {
                        text-align: center;
                        margin: 20px 0;
                        font-family: 'Code 128', monospace;
                        font-size: 14px;
                        letter-spacing: 2px;
                    }
                    @media print {
                        body { margin: 0; padding: 10px; }
                        .receipt-container { 
                            border: 1px solid #333; 
                            margin: 0; 
                            max-width: 100%; 
                        }
                    }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="receipt-header">
                        <div class="receipt-title">🏥 PHARMACY</div>
                        <div class="receipt-subtitle">SALES RECEIPT</div>
                    </div>
                    
                    <div class="receipt-info">
                        <div class="receipt-info-item">
                            <div class="receipt-info-label">Receipt #</div>
                            <div>${sale.receiptNumber}</div>
                        </div>
                        <div class="receipt-info-item">
                            <div class="receipt-info-label">Date & Time</div>
                            <div>${sale.timestamp}</div>
                        </div>
                        ${
                          sale.customer && !sale.customer.isWalkIn
                            ? `
                        <div class="receipt-info-item" style="grid-column: 1 / -1;">
                            <div class="receipt-info-label">Customer</div>
                            <div>${sale.customer.name}</div>
                        </div>
                        `
                            : ""
                        }
                    </div>
                    
                    <div class="receipt-items">
                        ${sale.items
                          .map(
                            (item) => `
                            <div class="receipt-item">
                                <div class="receipt-item-name">
                                    ${item.name}
                                    <div class="receipt-batch">Batch: ${item.batch || "N/A"} | Exp: ${item.expiry || "N/A"}</div>
                                </div>
                                <div class="receipt-item-details">
                                    ${item.quantity} × LKR ${Number(item.price || 0).toFixed(2)}<br>
                                    <strong>LKR ${Number((item.price || 0) * item.quantity).toFixed(2)}</strong>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                    
                    <div class="receipt-totals">
                        <div class="receipt-total-row">
                            <span>Items (${sale.items.length}):</span>
                            <span>${sale.items.length}</span>
                        </div>
                        <div class="receipt-total-row">
                            <span>Subtotal:</span>
                            <span>LKR ${Number(sale.total).toFixed(2)}</span>
                        </div>
                        <div class="receipt-total-row">
                            <span>Discount:</span>
                            <span>LKR 0.00</span>
                        </div>
                        <div class="receipt-grand-total">
                            <span>GRAND TOTAL:</span>
                            <span>LKR ${Number(sale.total).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="receipt-payment">
                        <div class="receipt-payment-row">
                            <span>Amount Paid:</span>
                            <span>LKR ${Number(sale.amountPaid).toFixed(2)}</span>
                        </div>
                        <div class="receipt-payment-row">
                            <span>Change:</span>
                            <span>LKR ${Number(sale.amountPaid - sale.total).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="receipt-footer">
                        <div class="receipt-thank">Thank You For Your Purchase!</div>
                        <div class="receipt-contact"> +94 123 456 7890</div>
                        <div class="receipt-contact"> 123 Pharmacy Street, Colombo</div>
                        <div class="receipt-contact">📞 +94 123 456 7890</div>
                        <div class="receipt-contact">📍 123 Pharmacy Street, Colombo</div>
                        <div class="receipt-barcode">|||${sale.receiptNumber}|||</div>
                    </div>
                </div>
            </body>
            </html>
        `;

    // Method 1: Auto-download as HTML file
    const blob = new Blob([receiptContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `Receipt_${sale.receiptNumber}.html`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    // Method 2: Auto-print using hidden iframe
    setTimeout(() => {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(receiptContent);
      iframeDoc.close();

      // Auto-print and cleanup
      setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }, 1000);

    // Show notification
    this.showNotification(
      `📥 Receipt downloaded and printing - ${sale.receiptNumber}`,
      "success",
    );
  }

  backToCart() {
    this.closePaymentDropdown();
  }

  // Helper methods for calculations
  calculateSubtotal() {
    return this.cart.reduce(
      (sum, item) =>
        sum + Number(item.unitPrice || 0) * Number(item.quantity || 0),
      0,
    );
  }

  calculateTotalDiscount() {
    return this.cart.reduce((sum, item) => {
      const itemTotal =
        Number(item.unitPrice || 0) * Number(item.quantity || 0);
      return sum + itemTotal * (Number(item.discount || 0) / 100);
    }, 0);
  }

  calculateGrandTotal() {
    return this.calculateSubtotal() - this.calculateTotalDiscount();
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

    // Set background color based on type
    const colors = {
      success: "#22c55e",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  payNow() {
    if (this.cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    alert("Payment functionality would be implemented here");
  }

  selectWalkInCustomer() {
    this.toggleCustomerDropdown();
  }

  toggleCustomerDropdown() {
    const existingDropdown = document.querySelector(
      ".customer-button-dropdown",
    );
    if (existingDropdown) {
      this.closeCustomerDropdown();
      return;
    }

    this.showCustomerDropdown();
  }

  showCustomerDropdown() {
    const customerBtn = document.querySelector(".customer-btn");
    if (!customerBtn) return;

    // Remove existing dropdown
    this.closeCustomerDropdown();

    // Create dropdown
    const dropdown = document.createElement("div");
    dropdown.className = "customer-dropdown customer-button-dropdown";
    dropdown.innerHTML = `
            <div class="customer-dropdown-header" style="padding: 8px;">
                <input type="text" placeholder="Search..." id="customerSearchDropdown" class="customer-dropdown-search" style="font-size: 12px; padding: 6px;">
            </div>
            <div class="customer-dropdown-list" id="customerDropdownList" style="max-height: 150px; overflow-y: auto;">
                ${this.renderCustomerDropdownList()}
            </div>
            <div class="customer-dropdown-footer" style="padding: 6px;">
                <div class="customer-dropdown-item walk-in-item" onclick="window.pharmacyPOS.selectWalkInCustomerByName()" style="display: flex; align-items: center; justify-content: center; text-align: center; padding: 8px; font-size: 12px;">
                    <div class="customer-item-avatar" style="margin-right: 6px; font-size: 14px;">🧍</div>
                    <div class="customer-item-info">
                        <div class="customer-item-name" style="font-size: 12px; font-weight: 600;">Walk-in Customer</div>
                    </div>
                </div>
            </div>
        `;

    // Position dropdown below the button
    const rect = customerBtn.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + window.scrollY + 5}px`;
    dropdown.style.left = `${rect.left + window.scrollX}px`;
    dropdown.style.width = `${rect.width}px`;

    document.body.appendChild(dropdown);

    // Setup search functionality
    setTimeout(() => {
      this.setupCustomerDropdownSearch();

      // Close dropdown when clicking outside - bind the method to this instance
      this.boundHandleDropdownClickOutside =
        this.handleDropdownClickOutside.bind(this);
      document.addEventListener("click", this.boundHandleDropdownClickOutside);
    }, 100);
  }

  loadCustomersFromStorage() {
    const savedCustomers = localStorage.getItem("pharmacy_customers");
    if (savedCustomers) {
      try {
        return JSON.parse(savedCustomers);
      } catch (error) {
        console.error("Error loading customers:", error);
        return [];
      }
    }
    return [];
  }

  renderCustomerDropdownList() {
    const customers = this.loadCustomersFromStorage();
    if (!customers || customers.length === 0) {
      return '<div class="no-customers-found" style="padding: 8px; font-size: 11px; text-align: center;">No customers found</div>';
    }

    return customers
      .map(
        (customer) => `
            <div class="customer-dropdown-item" onclick="window.pharmacyPOS.selectCustomerFromDropdown(${customer.id})" style="padding: 6px 8px; font-size: 11px;">
                <div class="customer-item-avatar" style="font-size: 10px; width: 24px; height: 24px; line-height: 24px;">
                    ${customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                </div>
                <div class="customer-item-info">
                    <div class="customer-item-name" style="font-size: 11px; font-weight: 600;">${customer.name}</div>
                    <div class="customer-item-phone" style="font-size: 10px; color: #666;">${customer.phone}</div>
                </div>
            </div>
        `,
      )
      .join("");
  }
  selectCustomerFromDropdown(customerId) {
    const customers = this.loadCustomersFromStorage();
    const customer = customers.find((c) => c.id === customerId);

    if (customer) {
      this.currentCustomer = { ...customer, isWalkIn: false };
      this.updateCustomerButton();
      this.showNotification(`Customer selected: ${customer.name}`, "success");
      this.closeCustomerDropdown();
      this.updateCurrentSaleWithCustomer();
    }
  }

  selectWalkInCustomerByName() {
    this.currentCustomer = {
      name: "Walk-in Customer",
      isWalkIn: true,
    };
    this.updateCustomerButton();
    this.showNotification("Walk-in customer selected", "info");
    this.closeCustomerDropdown();
    this.updateCurrentSaleWithCustomer();
  }

  setupCustomerDropdownSearch() {
    const searchInput = document.getElementById("customerSearchDropdown");
    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      const customers = this.loadCustomersFromStorage();

      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.phone.includes(searchTerm) ||
          (customer.email && customer.email.toLowerCase().includes(searchTerm)),
      );

      const listContainer = document.getElementById("customerDropdownList");
      if (listContainer) {
        if (filtered.length === 0 && searchTerm) {
          listContainer.innerHTML =
            '<div class="no-customers-found" style="padding: 8px; font-size: 11px; text-align: center;">No matches found</div>';
        } else {
          listContainer.innerHTML =
            this.renderCustomerDropdownListFiltered(filtered);
        }
      }
    });
  }

  renderCustomerDropdownListFiltered(customers) {
    if (!customers || customers.length === 0) {
      return '<div class="no-customers-found" style="padding: 8px; font-size: 11px; text-align: center;">No customers found</div>';
    }

    return customers
      .map(
        (customer) => `
            <div class="customer-dropdown-item" onclick="window.pharmacyPOS.selectCustomerFromDropdown(${customer.id})" style="padding: 6px 8px; font-size: 11px;">
                <div class="customer-item-avatar" style="font-size: 10px; width: 24px; height: 24px; line-height: 24px;">
                    ${customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                </div>
                <div class="customer-item-info">
                    <div class="customer-item-name" style="font-size: 11px; font-weight: 600;">${customer.name}</div>
                    <div class="customer-item-phone" style="font-size: 10px; color: #666;">${customer.phone}</div>
                </div>
            </div>
        `,
      )
      .join("");
  }

  handleDropdownClickOutside(event) {
    const dropdown = document.querySelector(
      ".customer-dropdown, .customer-button-dropdown",
    );
    const customerBtn = document.querySelector(".customer-btn");

    if (
      dropdown &&
      !dropdown.contains(event.target) &&
      !customerBtn.contains(event.target)
    ) {
      this.closeCustomerDropdown();
    }
  }

  filterCustomersInDropdown() {
    const searchTerm = (
      document.getElementById("customerDropdownSearch")?.value || ""
    ).toLowerCase();
    const customers = this.loadCustomersFromStorage();

    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm)),
    );

    const listContainer = document.getElementById("customerDropdownList");
    if (listContainer) {
      listContainer.innerHTML = this.renderCustomerDropdownList(filtered);
    }
  }

  selectCustomer(customerId) {
    const customers = this.loadCustomersFromStorage();
    const customer = customers.find((c) => c.id === customerId);

    if (customer) {
      this.currentCustomer = { ...customer, isWalkIn: false };
      this.updateCustomerButton();
      this.showNotification(`Customer selected: ${customer.name}`, "success");
      this.closeCustomerDropdown();

      // Update current sale with customer info
      this.updateCurrentSaleWithCustomer();
    }
  }

  setWalkInCustomer() {
    this.currentCustomer = {
      name: "Walk-in Customer",
      isWalkIn: true,
    };
    this.updateCustomerButton();
    this.showNotification("Walk-in customer selected", "info");
    this.closeCustomerDropdown();
    this.updateCurrentSaleWithCustomer();
  }

  addNewCustomer() {
    this.closeCustomerDropdown();
    // Navigate to customers page to add new customer
    if (
      window.dashboard &&
      typeof window.dashboard.handlePageNavigation === "function"
    ) {
      window.dashboard.handlePageNavigation("customers");
    }
  }

  closeCustomerDropdown() {
    const dropdown = document.querySelector(
      ".customer-dropdown, .customer-button-dropdown",
    );
    if (dropdown) {
      dropdown.remove();
    }
    // Remove outside click listener if it exists
    if (this.boundHandleDropdownClickOutside) {
      document.removeEventListener(
        "click",
        this.boundHandleDropdownClickOutside,
      );
      this.boundHandleDropdownClickOutside = null;
    }
  }

  updateCustomerButton() {
    const iconElement = document.getElementById("customerButtonIcon");
    const textElement = document.getElementById("customerButtonText");

    if (this.currentCustomer) {
      if (this.currentCustomer.isWalkIn) {
        iconElement.textContent = "🧍";
        textElement.textContent = "Walk-in Customer";
      } else {
        iconElement.textContent = "👤";
        textElement.textContent = this.currentCustomer.name;
      }
    } else {
      iconElement.textContent = "🧍";
      textElement.textContent = "Select Customer";
    }
  }

  updateCurrentSaleWithCustomer() {
    // This will update the current sale/cart with customer information
    // The customer info will be included when holding bills or completing sales
    console.log("Current sale updated with customer:", this.currentCustomer);
  }

  startNewSale() {
    // Navigate to POS interface
    window.location.href = "/pos/web";
  }

  renderCustomersPage() {
    // Clean up previous customers instance if exists
    if (this.customersInstance) {
      this.customersInstance.cleanup();
    }

    // Create new customers instance using global class
    this.customersInstance = new window.PharmacyCustomers();

    // Update topbar title
    const topbarTitle = document.querySelector(".topbar h1");
    if (topbarTitle) {
      topbarTitle.textContent = "Customers";
    }
  }

  renderEmptyPage() {
    const container = document.getElementById("dashboard_container");
    const topbarTitle = document.querySelector(".topbar h1");

    if (topbarTitle) {
      topbarTitle.textContent = "Customers";
    }

    container.innerHTML = `
            <div class="dashboard">
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <h2>Customers Module</h2>
                    <p>This module has been removed from the system.</p>
                    <p>Please use other available modules for your needs.</p>
                </div>
            </div>
        `;
  }

  cleanup() {
    // Clear auto-refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Clean up purchasing instance
    if (this.purchasingInstance) {
      this.purchasingInstance.cleanup();
      this.purchasingInstance = null;
    }

    // Clean up reports instance
    if (this.reportsInstance) {
      this.reportsInstance.cleanup();
      this.reportsInstance = null;
    }

    // Clean up customers instance
    if (this.customersInstance) {
      this.customersInstance.cleanup();
      this.customersInstance = null;
    }

    // Clean up charts
    Object.values(this.charts).forEach((chart) => {
      if (chart && typeof chart.destroy === "function") {
        chart.destroy();
      }
    });
    this.charts = {};

    // Clean up global dashboard reference
    if (window.dashboard === this) {
      delete window.dashboard;
    }

    // Clean up event listeners
    const menuLinks = document.querySelectorAll(".menu-link");
    menuLinks.forEach((link) => {
      link.replaceWith(link.cloneNode(true));
    });
  }
}

PharmacyDashboard.template = "pharmacy_dashboard_layout";

registry
  .category("actions")
  .add("pharmacy_dashboard_action", PharmacyDashboard);
