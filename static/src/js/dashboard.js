/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component, onMounted, onWillUnmount } from "@odoo/owl";
import { medicines } from "./data/medicine_data.js";

export class PharmacyDashboard extends Component {
  setup() {
    this.charts = {};
    this.refreshInterval = null;
    this.purchasingInstance = null;
    this.reportsInstance = null;
    this.customersInstance = null;
    this.posInstance = null;

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

    const colors = {
      success: "#22c55e",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  renderPOSPage() {
    if (this.posInstance && typeof this.posInstance.cleanup === "function") {
      this.posInstance.cleanup();
    }

    if (typeof window.PharmacyPOS === "function") {
      this.posInstance = new window.PharmacyPOS();
      this.posInstance.renderPharmacyPOS();
    } else {
      console.error("PharmacyPOS class not found");
      this.showNotification("Failed to load Sales POS module", "error");
    }

    const topbarTitle = document.querySelector(".page-title");
    if (topbarTitle) {
      topbarTitle.textContent = "Sales (POS)";
    }
  }

  renderDashboard() {
    const container = document.getElementById("dashboard_container");

    // Calculate dynamic metrics from localStorage
    const metrics = this.updateMetricsData() || {
      sales: "0",
      invoices: "0",
      transactions: "0",
      avgBill: "0",
      profit: "0",
      margin: "0",
      returns: "0",
      returnCount: "0",
    };

    container.innerHTML = `
            <div class="dashboard">
                <!-- Metrics Grid -->
                <div class="metrics-grid">
                    <div class="metric-card glass-card success">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Today's Sales</h3>
                                <p class="metric-value">${metrics.sales}</p>
                                <p class="metric-subtitle">${metrics.invoices} bills</p>
                            </div>
                            <div class="metric-icon">💰</div>
                        </div>
                        <div class="metric-change ${metrics.salesGrowth.startsWith("+") ? "positive" : "negative"}">
                            <span>${metrics.salesGrowth.startsWith("+") ? "📈" : "📉"}</span>
                            <span>${metrics.salesGrowth}</span>
                        </div>
                    </div>

                    <div class="metric-card glass-card info">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Transactions</h3>
                                <p class="metric-value">${metrics.transactions}</p>
                                <p class="metric-subtitle">Avg ${metrics.avgBill}</p>
                            </div>
                            <div class="metric-icon">👥</div>
                        </div>
                        <div class="metric-change ${Number(metrics.transactionsGrowth) >= 0 ? "positive" : "negative"}">
                            <span>${Number(metrics.transactionsGrowth) >= 0 ? "📊" : "📉"}</span>
                            <span>${Number(metrics.transactionsGrowth) >= 0 ? "+" : ""}${metrics.transactionsGrowth}</span>
                        </div>
                    </div>

                    <div class="metric-card glass-card success">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Gross Profit</h3>
                                <p class="metric-value">${metrics.profit}</p>
                                <p class="metric-subtitle">${metrics.margin}</p>
                            </div>
                            <div class="metric-icon">📈</div>
                        </div>
                        <div class="metric-change ${metrics.profitGrowth.startsWith("+") ? "positive" : "negative"}">
                            <span>${metrics.profitGrowth.startsWith("+") ? "💹" : "📉"}</span>
                            <span>${metrics.profitGrowth}</span>
                        </div>
                    </div>

                    <div class="metric-card glass-card danger">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Returns</h3>
                                <p class="metric-value">${metrics.returns}</p>
                                <p class="metric-subtitle">${metrics.returnCount}</p>
                            </div>
                            <div class="metric-icon">🔄</div>
                        </div>
                        <div class="metric-change negative">
                            <span>📉</span>
                            <span>-${metrics.returns}</span>
                        </div>
                    </div>
                </div>

                <!-- Main Charts Grid - One Line (7.5 / 3.5) -->
                <div class="charts-grid slim" style="height: 50px;">
                    <div class="chart-card glass-card">
                        <div class="chart-header">
                            <h3 class="chart-title">Weekly Trend</h3>
                        </div>
                        <div class="chart-container slim-locked" style="height: 50px;">
                            <canvas id="weeklyChart"></canvas>
                        </div>
                    </div>

                    <div class="chart-card glass-card">
                        <div class="chart-header">
                            <h3 class="chart-title">Categories</h3>
                        </div>
                        <div class="chart-container slim-locked" style="height: 50px;">
                            <canvas id="categoryChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

    setTimeout(() => this.initializeCharts(), 100);
    window.dashboard = this;
  }

  updateMetricsData() {
    const rawSales = localStorage.getItem("pharmacy_sales");
    const sales = rawSales ? JSON.parse(rawSales) : [];
    const rawInventory = localStorage.getItem("pharmacy_pos_inventory_items");
    const inventory = rawInventory ? JSON.parse(rawInventory) : [...medicines];

    const today = new Date().toDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toDateString();

    const getDayMetrics = (dayStr) => {
      const daySales = sales.filter(
        (s) => new Date(s.timestamp).toDateString() === dayStr,
      );

      let dayTotal = 0;
      let dayProfit = 0;
      let billCount = 0;
      let returnCount = 0;
      let returnTotal = 0;

      daySales.forEach((s) => {
        if (s.type === "RETURN") {
          returnCount++;
          returnTotal += Number(s.total) || 0;
          return;
        }

        billCount++;
        // Calculate total sales and profit from items to ensure consistency
        (s.items || []).forEach((item) => {
          const itemTotal = Number(item.total) || 0;
          const qty = Number(item.quantity) || 1;
          const price = Number(item.unitPrice || item.price) || 0;
          const cost =
            costMap[item.id] !== undefined ? costMap[item.id] : price * 0.7;

          dayTotal += itemTotal;
          dayProfit += (price - cost) * qty;
        });
      });

      return {
        total: dayTotal,
        profit: dayProfit,
        bills: billCount,
        returns: returnTotal,
        returnTrx: returnCount,
      };
    };

    const costMap = {};
    inventory.forEach((item) => (costMap[item.id] = Number(item.cost) || 0));

    const todayM = getDayMetrics(today);
    const yesterdayM = getDayMetrics(yesterday);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous <= 0) return current > 0 ? "New" : "0%";
      const growth = ((current - previous) / previous) * 100;
      return (growth >= 0 ? "+" : "") + growth.toFixed(1) + "%";
    };

    const formatValue = (num) => {
      if (num >= 10000) return `LKR ${(num / 1000).toFixed(1)}k`;
      return `LKR ${num.toLocaleString(undefined, { minimumFractionDigits: 1 })}`;
    };

    const avgBill = todayM.bills > 0 ? todayM.total / todayM.bills : 0;
    const margin = todayM.total > 0 ? (todayM.profit / todayM.total) * 100 : 0;

    return {
      sales: formatValue(todayM.total),
      salesGrowth: calculateGrowth(todayM.total, yesterdayM.total),
      invoices: String(todayM.bills),
      transactions: String(todayM.bills),
      transactionsGrowth: String(todayM.bills - yesterdayM.bills),
      avgBill: formatValue(avgBill),
      profit: formatValue(todayM.profit),
      profitGrowth: calculateGrowth(todayM.profit, yesterdayM.profit),
      margin: `${margin.toFixed(1)}% marg`,
      returns: formatValue(todayM.returns),
      returnCount: `${todayM.returnTrx} trx`,
    };
  }

  initializeCharts() {
    this.initializeWeeklyChart();
    this.initializeCategoryChart();
  }

  initializeWeeklyChart() {
    const canvas = document.getElementById("weeklyChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Clear previous instance if it exists
    if (this.charts.weekly) {
      this.charts.weekly.destroy();
    }

    const labels = [];
    const salesData = [];
    const profitData = [];

    const savedSales = localStorage.getItem("pharmacy_sales");
    const sales = savedSales ? JSON.parse(savedSales) : [];

    // Calculate the start of the current week (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday =
      today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diffToMonday));

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toDateString();

      const dayTransactions = sales.filter(
        (s) => new Date(s.timestamp).toDateString() === dateStr,
      );

      const dayTotal = dayTransactions.reduce((sum, s) => {
        const amt = Number(s.total) || 0;
        return s.type === "RETURN" ? sum - amt : sum + amt;
      }, 0);

      // Profit estimate: 30% margin for visual trend
      const dayProfit = dayTransactions.reduce((sum, s) => {
        if (s.type === "RETURN") return sum;
        return (
          sum +
          (s.items || []).reduce((iSum, item) => {
            return iSum + (item.total || 0) * 0.3;
          }, 0)
        );
      }, 0);

      labels.push(
        d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
      );
      salesData.push(dayTotal);
      profitData.push(dayProfit);
    }

    // High-end vertical gradients
    const salesGradient = ctx.createLinearGradient(0, 0, 0, 100);
    salesGradient.addColorStop(0, "rgba(0, 117, 19, 0.4)");
    salesGradient.addColorStop(1, "rgba(0, 117, 19, 0)");

    const profitGradient = ctx.createLinearGradient(0, 0, 0, 100);
    profitGradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
    profitGradient.addColorStop(1, "rgba(59, 130, 246, 0)");

    this.charts.weekly = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Sales",
            data: salesData,
            borderColor: "#007513",
            backgroundColor: salesGradient,
            borderWidth: 1.5,
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: "#007513",
          },
          {
            label: "Profit",
            data: profitData,
            borderColor: "#3b82f6",
            backgroundColor: profitGradient,
            borderWidth: 1.5,
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointBackgroundColor: "#3b82f6",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            padding: 8,
            titleFont: { size: 10, weight: "bold" },
            bodyFont: { size: 10 },
            callbacks: {
              label: (ctx) =>
                `${ctx.dataset.label}: LKR ${ctx.raw.toLocaleString()}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(148, 163, 184, 0.05)", drawBorder: false },
            ticks: {
              font: { size: 8 },
              color: "#94a3b8",
              callback: (val) => {
                if (val >= 1000) return (val / 1000).toFixed(0) + "k";
                return val;
              },
            },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 8 }, color: "#94a3b8" },
          },
        },
        animation: { duration: 1500, easing: "easeOutQuart" },
      },
    });
  }

  initializeCategoryChart() {
    const canvas = document.getElementById("categoryChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (this.charts.category) {
      this.charts.category.destroy();
    }

    const savedItems = localStorage.getItem("pharmacy_pos_inventory_items");
    const items = savedItems ? JSON.parse(savedItems) : [...medicines];

    const counts = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top4 = sorted.slice(0, 4);
    const otherCount = sorted.slice(4).reduce((sum, e) => sum + e[1], 0);

    const labels = top4.map((e) => e[0]);
    const chartData = top4.map((e) => e[1]);

    if (otherCount > 0) {
      labels.push("Other");
      chartData.push(otherCount);
    }

    // Create high-end gradients for each category segment
    const createGradient = (color1, color2) => {
      const grad = ctx.createLinearGradient(0, 0, 0, 50);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      return grad;
    };

    const colors = [
      createGradient("#007513", "#005a0e"), // Brand Green -> Dark Green
      createGradient("#3b82f6", "#2563eb"), // Blue -> Indigo
      createGradient("#f59e0b", "#d97706"), // Amber -> Orange
      createGradient("#8b5cf6", "#7c3aed"), // Violet -> Purple
      createGradient("#64748b", "#475569"), // Slate -> Gray
    ];

    this.charts.category = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: chartData,
            backgroundColor: colors.slice(0, chartData.length),
            borderWidth: 0,
            hoverOffset: 15,
            borderRadius: 4,
            spacing: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "80%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 6,
              boxHeight: 6,
              padding: 6,
              usePointStyle: true,
              pointStyle: "circle",
              font: { size: 8, weight: "600" },
              color: "#64748b",
            },
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            titleFont: { size: 10 },
            bodyFont: { size: 10 },
            padding: 8,
            cornerRadius: 4,
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2000,
          easing: "easeOutExpo",
        },
      },
    });
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

    menuLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = link.dataset.page;

        if (this.checkPageAccess(page)) {
          this.navigateToPage(link);
        } else {
          this.promptForAdminAccess(page, link);
        }
      });
    });
  }

  navigateToPage(link) {
    const topbarTitle = document.querySelector(".page-title");
    const menuItems = document.querySelectorAll(".menu-item");

    // Remove active class from all items and links
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
  }

  handlePageNavigation(page) {
    const container = document.getElementById("dashboard_container");

    switch (page) {
      case "dashboard":
        this.renderDashboard();
        break;
      case "sales":
        this.renderPOSPage();
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

  checkPageAccess(page) {
    const role = localStorage.getItem("pharmacy_active_role");
    // Admin has full access
    if (role === "Administrator") return true;

    const permissionsRaw = localStorage.getItem("pharmacy_active_permissions");
    let permissions = [];
    try {
      permissions = JSON.parse(permissionsRaw || "[]");
    } catch (e) {
      console.error("Error parsing permissions", e);
    }

    if (permissions.includes("all")) return true;

    // Map pages to required permissions
    const pagePermissions = {
      dashboard: null, // Public
      sales: "sales",
      inventory: "inventory",
      customers: "sales",
      purchasing: "purchasing",
      reports: "reports",
      settings: "all",
    };

    const required = pagePermissions[page];
    if (!required) return true;

    return permissions.includes(required);
  }

  promptForAdminAccess(page, link) {
    if (document.getElementById("adminAccessModal")) return;

    const modal = document.createElement("div");
    modal.id = "adminAccessModal";
    modal.className = "inventory-modal-overlay";
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

    modal.innerHTML = `
            <div class="inventory-modal glass-card" style="width: 360px; padding: 2rem; border-radius: 16px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="width: 60px; height: 60px; background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 2rem;">🔒</div>
                    <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a;">Restricted Access</h3>
                    <p style="margin: 0.5rem 0 0; font-size: 0.85rem; color: #64748b;">This module requires admin permission. Please enter password to continue.</p>
                </div>

                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <input type="password" id="adminPasswordInput" placeholder="Enter admin password" 
                           style="width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.95rem; outline: none; transition: border-color 0.2s; box-sizing: border-box;">
                    <p id="accessErrorMessage" style="color: #ef4444; font-size: 0.75rem; margin-top: 0.5rem; display: none;">Invalid password. Access denied.</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <button id="cancelAccessBtn" style="padding: 0.75rem; border-radius: 8px; border: 1px solid #e2e8f0; background: white; font-weight: 600; color: #64748b; cursor: pointer;">Cancel</button>
                    <button id="confirmAccessBtn" style="padding: 0.75rem; border-radius: 8px; border: none; background: #007513; color: white; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px rgba(0,117,19,0.2);">Verify Access</button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    const input = modal.querySelector("#adminPasswordInput");
    const confirmBtn = modal.querySelector("#confirmAccessBtn");
    const cancelBtn = modal.querySelector("#cancelAccessBtn");
    const errorMsg = modal.querySelector("#accessErrorMessage");

    input.focus();

    const verify = () => {
      const pwd = input.value;
      // Default admin password is '123' as seen in pharmacy_login.js
      if (pwd === "123") {
        this.closeAdminAccessModal();
        this.navigateToPage(link);
        this.showNotification("Admin access granted", "success");
      } else {
        errorMsg.style.display = "block";
        input.style.borderColor = "#ef4444";
        input.value = "";
        input.focus();
        setTimeout(() => {
          errorMsg.style.display = "none";
          input.style.borderColor = "#e2e8f0";
        }, 2000);
      }
    };

    confirmBtn.onclick = verify;
    cancelBtn.onclick = () => this.closeAdminAccessModal();
    input.onkeydown = (e) => {
      if (e.key === "Enter") verify();
      if (e.key === "Escape") this.closeAdminAccessModal();
    };

    modal.onclick = (e) => {
      if (e.target === modal) this.closeAdminAccessModal();
    };
  }

  closeAdminAccessModal() {
    const modal = document.getElementById("adminAccessModal");
    if (modal) modal.remove();
  }

  renderSettings() {
    // Update topbar title
    const topbarTitle = document.querySelector(".page-title");
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
      window.pharmacyReports = this.reportsInstance;
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
    const topbarTitle = document.querySelector(".page-title");
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
    const topbarTitle = document.querySelector(".page-title");
    if (topbarTitle) {
      topbarTitle.textContent = "Purchasing";
    }
  }

  navigateToFarmacyInventory() {
    // Navigate to inventory by clearing container and letting inventory.js handle it
    const container = document.getElementById("dashboard_container");

    // Update the topbar title
    const topbarTitle = document.querySelector(".page-title");
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
    const sidebar = document.querySelector(".sidebar");
    if (isDark) {
      if (app) app.classList.add("dark-mode");
      document.body.classList.add("dark-mode");
      if (sidebar) sidebar.classList.remove("dark-mode");
      document.documentElement.style.setProperty("--bg-main", "#0f172a");
      document.documentElement.style.setProperty("--bg-card", "#1e293b");
      document.documentElement.style.setProperty("--border-color", "#334155");
      document.documentElement.style.setProperty("--text-primary", "#f1f5f9");
    } else {
      if (app) app.classList.remove("dark-mode");
      document.body.classList.remove("dark-mode");
      if (sidebar) sidebar.classList.remove("dark-mode");
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
    // Clear local storage if needed, but keep theme
    // Call the global logout method from pharmacy_login.js if it exists
    if (window.pharmacyLogout) {
      window.pharmacyLogout();
    } else {
      window.location.reload();
    }
  }







  // barcode search (supports base medicines data + localStorage items)




















  renderCustomersPage() {
    // Clean up previous customers instance if exists
    if (this.customersInstance) {
      this.customersInstance.cleanup();
    }
    // Create new customers instance using global class
    this.customersInstance = new window.PharmacyCustomers();

    // Update topbar title
    const topbarTitle = document.querySelector(".page-title");
    if (topbarTitle) {
      topbarTitle.textContent = "Customers";
    }
  }

  renderEmptyPage() {
    const container = document.getElementById("dashboard_container");
    const topbarTitle = document.querySelector(".page-title");

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

    // Clean up POS instance
    if (this.posInstance && typeof this.posInstance.cleanup === "function") {
      this.posInstance.cleanup();
      this.posInstance = null;
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

// Removed registry registration, it is now in pharmacy_login.js
