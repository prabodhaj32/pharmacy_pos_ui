/** @odoo-module **/
import { registry } from "@web/core/registry";
import { Component, onMounted, onWillUnmount } from "@odoo/owl";
import { medicines } from "./data/medicine_data.js";

class PharmacyDashboard extends Component {
    setup() {
        this.charts = {};
        this.refreshInterval = null;

        onMounted(() => {
            this.renderDashboard();
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
                                <h3 class="metric-title">Customers Served</h3>
                                <p class="metric-value">28</p>
                                <p class="metric-subtitle">Avg. LKR 1,433.82/bill</p>
                            </div>
                            <div class="metric-icon">👥</div>
                        </div>
                        <div class="metric-change positive">
                            <span>📊</span>
                            <span>+5 customers vs yesterday</span>
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

            </div>
        `;

        // Initialize charts after rendering
        setTimeout(() => {
            this.initializeCharts();
            window.dashboard = this;   // Make dashboard globally accessible
        }, 100);
    }

    initializeCharts() {
        this.initializeWeeklyChart();
        this.initializeCategoryChart();
    }

    initializeWeeklyChart() {
        const canvas = document.getElementById("weeklyChart");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

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

        this.drawSimpleLineChart(ctx, canvas, labels, salesData, profitData);
    }

    initializeCategoryChart() {
        const canvas = document.getElementById("categoryChart");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const data = [
            { label: "Antibiotics", value: 28, color: "#22c55e" },
            { label: "Analgesics", value: 22, color: "#3b82f6" },
            { label: "Vitamins", value: 18, color: "#f59e0b" },
            { label: "Antidiabetics", value: 15, color: "#8b5cf6" },
            { label: "Others", value: 17, color: "#ec4899" },
        ];

        this.drawSimpleDonutChart(ctx, canvas, data);
    }

    // === Chart Drawing Functions (kept as they were) ===
    drawSimpleLineChart(ctx, canvas, labels, salesData, profitData) {
        const width = (canvas.width = canvas.offsetWidth * 2);
        const height = (canvas.height = canvas.offsetHeight * 2);
        ctx.scale(2, 2);
        const padding = 40;
        const chartWidth = canvas.offsetWidth - padding * 2;
        const chartHeight = canvas.offsetHeight - padding * 2;

        ctx.clearRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }

        const allValues = [...salesData, ...profitData];
        const maxValue = Math.max(...allValues);
        const minValue = 0;

        // Sales area
        ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
        ctx.beginPath();
        salesData.forEach((value, i) => {
            const x = padding + (chartWidth / (salesData.length - 1)) * i;
            const y = padding + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
            if (i === 0) ctx.moveTo(x, padding + chartHeight);
            ctx.lineTo(x, y);
        });
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.closePath();
        ctx.fill();

        // Profit area
        ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
        ctx.beginPath();
        profitData.forEach((value, i) => {
            const x = padding + (chartWidth / (profitData.length - 1)) * i;
            const y = padding + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
            if (i === 0) ctx.moveTo(x, padding + chartHeight);
            ctx.lineTo(x, y);
        });
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.closePath();
        ctx.fill();

        // Draw lines
        this.drawLine(ctx, labels, salesData, padding, chartWidth, chartHeight, "#22c55e", 2, maxValue, minValue);
        this.drawLine(ctx, labels, profitData, padding, chartWidth, chartHeight, "#3b82f6", 2, maxValue, minValue);

        // X-axis labels
        ctx.fillStyle = "#64748b";
        ctx.font = "10px Inter";
        labels.forEach((label, i) => {
            const x = padding + (chartWidth / (labels.length - 1)) * i;
            ctx.fillText(label, x - 15, canvas.offsetHeight - 10);
        });

        // Legend
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(padding, 10, 10, 10);
        ctx.fillStyle = "#64748b";
        ctx.fillText("Sales", padding + 15, 18);

        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(padding + 60, 10, 10, 10);
        ctx.fillStyle = "#64748b";
        ctx.fillText("Profit", padding + 75, 18);
    }

    drawLine(ctx, labels, data, padding, chartWidth, chartHeight, color, lineWidth, maxValue, minValue) {
        const range = maxValue - minValue;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();

        data.forEach((value, i) => {
            const x = padding + (chartWidth / (data.length - 1)) * i;
            const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Points
        ctx.fillStyle = color;
        data.forEach((value, i) => {
            const x = padding + (chartWidth / (data.length - 1)) * i;
            const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
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

        data.forEach((segment) => {
            const sliceAngle = (segment.value / total) * Math.PI * 2;

            ctx.fillStyle = segment.color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            ctx.closePath();
            ctx.fill();

            // Label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 20);

            ctx.fillStyle = "#64748b";
            ctx.font = "10px Inter";
            ctx.textAlign = "center";
            ctx.fillText(`${segment.value}%`, labelX, labelY);

            currentAngle += sliceAngle;
        });

        // Center text
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 14px Inter";
        ctx.textAlign = "center";
        ctx.fillText("Categories", centerX, centerY);
    }

    updateWeeklyChart(filter) {
        // Re-draw weekly chart when filter changes
        this.initializeWeeklyChart();
    }

    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.refreshDashboardData();
        }, 30000); // Refresh every 30 seconds
    }

    refreshDashboardData() {
        // Simulate live update on metric values
        const metrics = document.querySelectorAll(".metric-value");
        metrics.forEach((metric) => {
            if (metric.textContent.includes("LKR")) {
                let value = parseInt(metric.textContent.replace(/[^\d]/g, "")) || 0;
                const variation = Math.floor(Math.random() * 800) - 400;
                metric.textContent = `LKR ${(value + variation).toLocaleString()}`;
            }
        });
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
            app?.classList.add("dark-mode");
            document.body.classList.add("dark-mode");
            document.documentElement.style.setProperty("--bg-main", "#0f172a");
            document.documentElement.style.setProperty("--bg-card", "#1e293b");
            document.documentElement.style.setProperty("--border-color", "#334155");
            document.documentElement.style.setProperty("--text-primary", "#f1f5f9");
        } else {
            app?.classList.remove("dark-mode");
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
        if (savedTheme === "true" && darkModeToggle) {
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
        localStorage.removeItem("pharmacy_pos_dark_mode");
        window.location.href = "/web/session/logout";
    }

    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        if (window.dashboard === this) {
            delete window.dashboard;
        }
    }
}

PharmacyDashboard.template = "pharmacy_dashboard_layout";

registry.category("actions").add("pharmacy_dashboard_action", PharmacyDashboard);