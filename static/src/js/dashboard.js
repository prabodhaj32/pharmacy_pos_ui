/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component, onMounted, onWillUnmount } from "@odoo/owl";
import { medicines } from "./data/medicine_data.js";


class PharmacyDashboard extends Component {
    setup() {
        this.charts = {};
        this.refreshInterval = null;
        this.customers = [];
        this.selectedCustomer = null;
        
        // Initialize customer data
        this.initializeCustomerData();
        
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
        const currentDate = new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
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
        const canvas = document.getElementById('weeklyChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Generate sample data for the last 7 days
        const labels = [];
        const salesData = [];
        const profitData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            salesData.push(Math.floor(Math.random() * 20000) + 30000);
            profitData.push(Math.floor(Math.random() * 10000) + 10000);
        }

        // Simple line chart drawing (without Chart.js library)
        this.drawSimpleLineChart(ctx, canvas, labels, salesData, profitData);
    }

    initializeCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Category data
        const data = [
            { label: 'Antibiotics', value: 28, color: '#22c55e' },
            { label: 'Analgesics', value: 22, color: '#3b82f6' },
            { label: 'Vitamins', value: 18, color: '#f59e0b' },
            { label: 'Antidiabetics', value: 15, color: '#8b5cf6' },
            { label: 'Others', value: 17, color: '#ec4899' }
        ];

        // Simple donut chart drawing
        this.drawSimpleDonutChart(ctx, canvas, data);
    }

    drawSimpleLineChart(ctx, canvas, labels, salesData, profitData) {
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        const padding = 40;
        const chartWidth = canvas.offsetWidth - padding * 2;
        const chartHeight = canvas.offsetHeight - padding * 2;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = '#e5e7eb';
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
        ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.beginPath();
        salesData.forEach((value, i) => {
            const x = padding + (chartWidth / (salesData.length - 1)) * i;
            const y = padding + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
            
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
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.beginPath();
        profitData.forEach((value, i) => {
            const x = padding + (chartWidth / (profitData.length - 1)) * i;
            const y = padding + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
            
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
        this.drawLine(ctx, labels, salesData, padding, chartWidth, chartHeight, '#22c55e', 2, maxValue, minValue);
        
        // Draw profit line
        this.drawLine(ctx, labels, profitData, padding, chartWidth, chartHeight, '#3b82f6', 2, maxValue, minValue);

        // Draw labels
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter';
        labels.forEach((label, i) => {
            const x = padding + (chartWidth / (labels.length - 1)) * i;
            ctx.fillText(label, x - 15, canvas.offsetHeight - 10);
        });

        // Draw legend
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(padding, 10, 10, 10);
        ctx.fillStyle = '#64748b';
        ctx.fillText('Sales', padding + 15, 18);

        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(padding + 60, 10, 10, 10);
        ctx.fillStyle = '#64748b';
        ctx.fillText('Profit', padding + 75, 18);
    }

    drawLine(ctx, labels, data, padding, chartWidth, chartHeight, color, lineWidth, maxValue, minValue) {
        const range = maxValue - minValue;

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();

        data.forEach((value, i) => {
            const x = padding + (chartWidth / (data.length - 1)) * i;
            const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
            
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
            const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawSimpleDonutChart(ctx, canvas, data) {
        const width = canvas.width = canvas.offsetWidth * 2;
        const height = canvas.height = canvas.offsetHeight * 2;
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
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            ctx.closePath();
            ctx.fill();

            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 20);
            
            ctx.fillStyle = '#64748b';
            ctx.font = '10px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${segment.value}%`, labelX, labelY);

            currentAngle += sliceAngle;
        });

        // Draw center text
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Categories', centerX, centerY);
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
        const metrics = document.querySelectorAll('.metric-value');
        metrics.forEach(metric => {
            const currentValue = metric.textContent;
            if (currentValue.includes('LKR')) {
                const value = parseInt(currentValue.replace(/[^\d]/g, ''));
                const variation = Math.floor(Math.random() * 1000) - 500;
                metric.textContent = `LKR ${(value + variation).toLocaleString()}`;
            }
        });

        // Only metrics are refreshed - charts have been removed
    }

    initializeMenuHandlers() {
        const menuLinks = document.querySelectorAll('.menu-link');
        const topbarTitle = document.querySelector('.topbar h1');
        
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all items and links
                const menuItems = document.querySelectorAll('.menu-item');
                menuItems.forEach(mi => mi.classList.remove('active'));
                
                // Add active class to parent item
                const menuItem = link.closest('.menu-item');
                if (menuItem) {
                    menuItem.classList.add('active');
                }
                
                // Update page title
                const pageName = link.querySelector('.menu-text').textContent;
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
        
        switch(page) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'sales':
                this.renderPharmacyPOS();
                break;
            case 'inventory':
                this.navigateToFarmacyInventory();
                break;
            case 'customers':
                this.renderCustomers();
                break;
            case 'purchasing':
                this.renderPurchasing();
                break;
            case 'reports':
                this.renderReports();
                break;
            case 'settings':
                container.innerHTML = `
                    <div class="dashboard">
                        <h2>Settings</h2>
                        <div class="settings-content">
                            <p>System settings interface will be implemented here.</p>
                        </div>
                    </div>
                `;
                break;
            default:
                this.renderDashboard();
        }
    }

    renderReports() {
        const container = document.getElementById("dashboard_container");
        
        // Use current date for date pickers in correct format
        const today = new Date().toISOString().split('T')[0];
        
        // Format LKR correctly for exact requirements
        const formatValue = (val) => `LKR ${val.toLocaleString()}`;

        container.innerHTML = `
            <div class="dashboard reports-dashboard">
                <div class="reports-header-row">
                    <div class="reports-title-section">
                        <h2>Reports & Analytics</h2>
                        <span class="subtitle">Insights and data export</span>
                    </div>

                    <div class="reports-controls-bar">
                        <div class="date-range">
                            <input type="date" value="${today}" class="date-input compact" />
                            <span class="date-separator">to</span>
                            <input type="date" value="${today}" class="date-input compact" />
                        </div>
                        <div class="action-buttons">
                            <button class="btn btn-secondary compact" id="btnExportCSV">
                                <span class="btn-icon">📄</span> Export CSV
                            </button>
                            <button class="btn btn-secondary compact" id="btnPrintReport">
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
                                <p class="metric-value">LKR 48,750</p>
                            </div>
                            <div class="metric-icon">💰</div>
                        </div>
                    </div>

                    <div class="metric-card info">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Net Sales</h3>
                                <p class="metric-value">LKR 47,550</p>
                            </div>
                            <div class="metric-icon">💵</div>
                        </div>
                    </div>

                    <div class="metric-card warning">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Total Discount</h3>
                                <p class="metric-value">LKR 1,200</p>
                            </div>
                            <div class="metric-icon">🏷️</div>
                        </div>
                    </div>

                    <div class="metric-card danger">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Total Returns</h3>
                                <p class="metric-value">LKR 1,200</p>
                            </div>
                            <div class="metric-icon">🔄</div>
                        </div>
                    </div>

                    <div class="metric-card" style="border-left: 4px solid #8b5cf6">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Tax Collected</h3>
                                <p class="metric-value">LKR 180</p>
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
                        <div class="chart-container reports-weekly-trend-canvas-wrap">
                            <canvas id="reportsTrendChart" aria-label="Weekly Sales Trend"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupReportsHandlers();

        // Initialize reports chart after rendering
        setTimeout(() => {
            this.initializeReportsChart();
        }, 100);
    }

    setupReportsHandlers() {
        const tabs = document.querySelectorAll('.reports-tabs .tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                // Could refresh data based on tab here
            });
        });

        // Add event listeners for Export and Print buttons
        const btnExportCSV = document.getElementById('btnExportCSV');
        if (btnExportCSV) {
            btnExportCSV.addEventListener('click', () => {
                this.exportReportsCSV();
            });
        }

        const btnPrintReport = document.getElementById('btnPrintReport');
        if (btnPrintReport) {
            btnPrintReport.addEventListener('click', () => {
                window.print();
            });
        }
    }

    exportReportsCSV() {
        const csvContent = "data:text/csv;charset=utf-8," + 
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
        const canvas = document.getElementById('reportsTrendChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Exact requested data spanning Monday to Sunday
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        // Data ranging between 0 and 80k roughly as requested
        const salesData = [35000, 48000, 42000, 61000, 78000, 72000, 48750];
        const profitData = [9500, 12000, 10500, 16000, 22000, 19500, 12400];

        // Draw animated modern bar chart
        this.drawAnimatedBarChart(ctx, canvas, labels, salesData, profitData);
    }

    drawAnimatedBarChart(ctx, canvas, labels, salesData, profitData) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const logicalW = canvas.offsetWidth;
        const logicalH = canvas.offsetHeight;
        canvas.width = Math.round(logicalW * dpr);
        canvas.height = Math.round(logicalH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const padL = 40;
        const padR = 15;
        const padT = 12;
        const padB = 30;

        const chartWidth = logicalW - padL - padR;
        const chartHeight = logicalH - padT - padB;

        const maxValue = 80000;
        const minValue = 0;

        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        const easeOutElastic = (t) => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0
                ? 0
                : t === 1
                ? 1
                : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        };
        const stagger = 0.08;
        const barRadius = 6;
        const totalFrames = 64;
        let frame = 0;

        const colorSalesTop = '#5eead4';
        const colorSalesMid = '#14b8a6';
        const colorSalesBot = '#0d9488';
        const colorProfitTop = '#86efac';
        const colorProfitMid = '#16a34a';
        const colorProfitBot = '#15803d';

        const fillBarRoundedTop = (x, y, w, h, r, gradient) => {
            if (h <= 0.5) return;
            const rad = Math.min(r, w / 2, h);
            ctx.save();
            ctx.fillStyle = gradient;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 2;
            ctx.beginPath();
            ctx.moveTo(x, y + h);
            ctx.lineTo(x, y + rad);
            ctx.quadraticCurveTo(x, y, x + rad, y);
            ctx.lineTo(x + w - rad, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
            ctx.lineTo(x + w, y + h);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };

        const createGradient = (ctx, x, y, h, colorTop, colorMid, colorBot) => {
            const gradient = ctx.createLinearGradient(0, y, 0, y + h);
            gradient.addColorStop(0, colorTop);
            gradient.addColorStop(0.5, colorMid);
            gradient.addColorStop(1, colorBot);
            return gradient;
        };

        const groupProgress = (globalT, index) => {
            const raw = (globalT - index * stagger) / (1 - stagger * (labels.length - 1));
            return Math.max(0, Math.min(1, raw));
        };

        const renderFrame = () => {
            frame += 1;
            const linearT = Math.min(1, frame / totalFrames);
            const easedGlobal = easeOutCubic(linearT);

            const appEl = document.getElementById('pharmacy_app');
            const isDark = appEl && appEl.classList.contains('dark-mode');
            const plotBg = isDark ? 'rgba(30, 41, 59, 0.35)' : 'rgba(248, 250, 252, 0.8)';
            const gridMajor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.25)';
            const gridMinor = isDark ? 'rgba(71, 85, 105, 0.25)' : 'rgba(203, 213, 225, 0.35)';
            const axisColor = isDark ? 'rgba(148, 163, 184, 0.7)' : 'rgba(100, 116, 139, 0.6)';
            const labelMuted = isDark ? '#94a3b8' : '#64748b';
            const labelPrimary = isDark ? '#e2e8f0' : '#334155';

            ctx.clearRect(0, 0, logicalW, logicalH);

            // Draw plot background with gradient
            const bgGradient = ctx.createLinearGradient(padL, padT, padL, padT + chartHeight);
            bgGradient.addColorStop(0, isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(248, 250, 252, 0.9)');
            bgGradient.addColorStop(1, isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(241, 245, 249, 0.7)');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(padL, padT, chartWidth, chartHeight);

            ctx.fillStyle = labelMuted;
            ctx.font = '10px Inter, system-ui, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';

            for (let i = 0; i <= 4; i++) {
                const stepY = padT + (chartHeight / 4) * i;
                const value = 80 - i * 20;

                if (i < 4) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.setLineDash([3, 5]);
                    ctx.strokeStyle = gridMajor;
                    ctx.lineWidth = 1;
                    ctx.moveTo(padL, stepY);
                    ctx.lineTo(padL + chartWidth, stepY);
                    ctx.stroke();
                    ctx.restore();
                }

                ctx.beginPath();
                ctx.strokeStyle = axisColor;
                ctx.lineWidth = 1;
                ctx.moveTo(padL - 3, stepY);
                ctx.lineTo(padL, stepY);
                ctx.stroke();

                const labelText = i === 4 ? '0' : `${value}k`;
                ctx.fillText(labelText, padL - 6, stepY);
            }

            const segmentWidth = chartWidth / labels.length;
            const barWidth = Math.min(segmentWidth * 0.32, 22);
            const groupWidth = barWidth * 2 + 3;
            const gapBetweenPairs = 3;

            ctx.save();
            ctx.setLineDash([3, 5]);
            ctx.strokeStyle = gridMinor;
            ctx.lineWidth = 1;
            labels.forEach((_, i) => {
                const centerX = padL + segmentWidth * i + segmentWidth / 2;
                ctx.beginPath();
                ctx.moveTo(centerX, padT);
                ctx.lineTo(centerX, padT + chartHeight);
                ctx.stroke();
            });
            ctx.restore();

            ctx.beginPath();
            ctx.strokeStyle = axisColor;
            ctx.lineWidth = 1;
            ctx.moveTo(padL, padT);
            ctx.lineTo(padL, padT + chartHeight);
            ctx.lineTo(padL + chartWidth, padT + chartHeight);
            ctx.stroke();

            labels.forEach((label, i) => {
                const gp = easeOutElastic(groupProgress(easedGlobal, i));
                const groupX = padL + segmentWidth * i + (segmentWidth - groupWidth) / 2;

                const sFull = ((salesData[i] - minValue) / (maxValue - minValue)) * chartHeight;
                const sHeight = sFull * gp;
                const sY = padT + chartHeight - sHeight;
                if (sHeight > 0) {
                    const salesGradient = createGradient(ctx, groupX, sY, sHeight, colorSalesTop, colorSalesMid, colorSalesBot);
                    ctx.save();
                    ctx.shadowColor = 'rgba(13, 148, 136, 0.3)';
                    ctx.shadowBlur = 10;
                    ctx.shadowOffsetY = 3;
                    fillBarRoundedTop(groupX, sY, barWidth, sHeight, barRadius, salesGradient);
                    ctx.restore();
                }

                const pFull = ((profitData[i] - minValue) / (maxValue - minValue)) * chartHeight;
                const pHeight = pFull * gp;
                const pY = padT + chartHeight - pHeight;
                const px = groupX + barWidth + gapBetweenPairs;
                if (pHeight > 0) {
                    const profitGradient = createGradient(ctx, px, pY, pHeight, colorProfitTop, colorProfitMid, colorProfitBot);
                    ctx.save();
                    ctx.shadowColor = 'rgba(22, 163, 74, 0.25)';
                    ctx.shadowBlur = 8;
                    ctx.shadowOffsetY = 2;
                    fillBarRoundedTop(px, pY, barWidth, pHeight, barRadius, profitGradient);
                    ctx.restore();
                }

                // Enhanced axis ticks
                const centerX = padL + segmentWidth * i + segmentWidth / 2;
                ctx.beginPath();
                ctx.strokeStyle = axisColor;
                ctx.lineWidth = 2;
                ctx.moveTo(centerX, padT + chartHeight);
                ctx.lineTo(centerX, padT + chartHeight + 4);
                ctx.stroke();

                // Enhanced labels
                ctx.fillStyle = labelPrimary;
                ctx.font = '11px Inter, system-ui, sans-serif';
                ctx.fontWeight = '500';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(label, centerX, padT + chartHeight + 8);
            });

            if (frame < totalFrames) {
                requestAnimationFrame(renderFrame);
            }
        };

        requestAnimationFrame(renderFrame);
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

    navigateToFarmacyInventory() {
        // Navigate to inventory by clearing container and letting inventory.js handle it
        const container = document.getElementById("dashboard_container");
        
        // Update the topbar title
        const topbarTitle = document.querySelector('.topbar h1');
        if (topbarTitle) {
            topbarTitle.textContent = 'Inventory';
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
        if (typeof window.PharmacyInventory !== 'undefined') {
            try {
                // Clean up previous instance if exists
                if (window.pharmacyInventory) {
                    window.pharmacyInventory.cleanup();
                }
                
                // Create new instance
                window.pharmacyInventory = new window.PharmacyInventory();
                window.pharmacyInventory.renderInventory();
            } catch (error) {
                console.error('Error initializing inventory component:', error);
                this.loadInventoryContent();
            }
        } else {
            // If not available, try to wait a bit more
            setTimeout(() => {
                if (typeof window.PharmacyInventory !== 'undefined') {
                    this.initializeInventoryComponent();
                } else {
                    console.warn('PharmacyInventory class not found, using fallback');
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
                            <p class="stat-value">${medicines.filter(m => m.stock <= 20).length}</p>
                        </div>
                    </div>
                    <div class="stat-card compact danger">
                        <div class="stat-icon">⌛</div>
                        <div class="stat-content">
                            <h3>Expiring (&lt;90d)</h3>
                            <p class="stat-value">${medicines.filter(m => {
                                const expiry = new Date(m.expiryDate);
                                const days = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                return days >= 0 && days <= 90;
                            }).length}</p>
                        </div>
                    </div>
                    <div class="stat-card compact success">
                        <div class="stat-icon">LKR</div>
                        <div class="stat-content">
                            <h3>Stock Value</h3>
                            <p class="stat-value">LKR ${medicines.reduce((sum, m) => sum + (m.stock * m.price), 0).toLocaleString()}</p>
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
                                ${medicines.map(item => {
                                    const lowStock = item.stock <= 20;
                                    const expiring = (() => {
                                        const expiry = new Date(item.expiryDate);
                                        const days = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                        return days >= 0 && days <= 90;
                                    })();
                                    const marginPct = item.price > 0 ? ((item.price - item.cost) / item.price) * 100 : 0;
                                    
                                    const statusPill = expiring
                                        ? `<span class="meta-pill profit">Expiring</span>`
                                        : lowStock
                                            ? `<span class="meta-pill neutral">Low Stock</span>`
                                            : `<span class="meta-pill sales">In Stock</span>`;
                                    
                                    const rxPill = item.rxOnly ? `<span class="meta-pill rx-only">Rx</span>` : "";
                                    const controlledPill = item.controlled ? `<span class="meta-pill controlled">Controlled</span>` : "";
                                    
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
                                            <td class="unit-price">${marginPct.toFixed(0)}%</td>
                                            <td>${statusPill}</td>
                                        </tr>
                                    `;
                                }).join('')}
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
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                this.toggleDarkMode(e.target.checked);
                this.saveThemePreference(e.target.checked);
            });
        }
    }

    toggleDarkMode(isDark) {
        const app = document.getElementById('pharmacy_app');
        if (isDark) {
            app.classList.add('dark-mode');
            document.documentElement.style.setProperty('--bg-main', '#0f172a');
            document.documentElement.style.setProperty('--bg-card', '#1e293b');
            document.documentElement.style.setProperty('--border-color', '#334155');
            document.documentElement.style.setProperty('--text-primary', '#f1f5f9');
        } else {
            app.classList.remove('dark-mode');
            document.documentElement.style.setProperty('--bg-main', '#f8fafc');
            document.documentElement.style.setProperty('--bg-card', '#ffffff');
            document.documentElement.style.setProperty('--border-color', '#e2e8f0');
            document.documentElement.style.setProperty('--text-primary', '#1e293b');
        }
    }

    saveThemePreference(isDark) {
        localStorage.setItem('pharmacy_pos_dark_mode', isDark);
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('pharmacy_pos_dark_mode');
        const darkModeToggle = document.getElementById('darkModeToggle');
        
        if (savedTheme === 'true') {
            darkModeToggle.checked = true;
            this.toggleDarkMode(true);
        }
    }

    initializeLogout() {
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    this.handleLogout();
                }
            });
        }
    }

    handleLogout() {
        // Clear local storage
        localStorage.removeItem('pharmacy_pos_dark_mode');
        
        // Redirect to login page or perform logout action
        window.location.href = '/web/session/logout';
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
                            <button class="action-btn customer-btn" onclick="pharmacyPOS.selectWalkInCustomer()" title="Walk-in Customer">
                                🧍 Walk-in Customer
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
        const tableContainer = document.querySelector('.cart-table-container');
        if (tableContainer) {
            // Reset scroll position first
            tableContainer.scrollTop = 0;
            
            // Force reflow to ensure scroll calculation works
            tableContainer.offsetHeight;
            
            // Smooth scroll to bottom
            setTimeout(() => {
                tableContainer.scrollTo({
                    top: tableContainer.scrollHeight,
                    behavior: 'smooth'
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
            isWalkIn: true
        };
        
        // Initialize held bills
        this.heldBills = [];
        
        // Barcode reader state
        this.isScanning = false;
        this.barcodeBuffer = '';
        
        // Render products grid
        this.renderProducts(this.products);
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
        this.barcodeBuffer = '';
        
        // Update button to show scanning state
        const cameraBtn = document.querySelector('.camera-btn');
        if (cameraBtn) {
            cameraBtn.textContent = '⏹ Stop Scanner';
            cameraBtn.style.background = '#fee2e2';
            cameraBtn.style.borderColor = '#dc2626';
            cameraBtn.style.color = '#dc2626';
        }
        
        // Show scanning interface
        this.showBarcodeScannerInterface();
        
        // Simulate barcode input (in real implementation, this would connect to actual barcode scanner)
        this.simulateBarcodeScanning();
    }
    
    stopBarcodeScanner() {
        this.isScanning = false;
        this.barcodeBuffer = '';
        
        // Reset button
        const cameraBtn = document.querySelector('.camera-btn');
        if (cameraBtn) {
            cameraBtn.textContent = '📷 Barcode Scanner';
            cameraBtn.style.background = '';
            cameraBtn.style.borderColor = '';
            cameraBtn.style.color = '';
        }
        
        // Hide scanning interface
        this.hideBarcodeScannerInterface();
    }
    
    showBarcodeScannerInterface() {
        const container = document.getElementById('dashboard_container');
        const scannerOverlay = document.createElement('div');
        scannerOverlay.id = 'barcodeScannerOverlay';
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
        const overlay = document.getElementById('barcodeScannerOverlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    simulateBarcodeScanning() {
        // Simulate barcode scanning with sample barcodes
        const sampleBarcodes = [
            '1234567890123', // Paracetamol
            '2345678901234', // Ibuprofen
            '3456789012345', // Amoxicillin
            '4567890123456', // Cough Syrup
            '5678901234567'  // Vitamin C
        ];
        
        if (this.isScanning) {
            // Simulate a barcode scan after 2-4 seconds
            const scanDelay = Math.random() * 2000 + 2000;
            setTimeout(() => {
                if (this.isScanning) {
                    const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
                    this.processBarcode(randomBarcode);
                }
            }, scanDelay);
        }
    }
    
    processBarcode(barcode) {
        // Update display
        const barcodeDisplay = document.getElementById('barcodeDisplay');
        if (barcodeDisplay) {
            barcodeDisplay.textContent = barcode;
        }
        
        // Find product by barcode (mock implementation)
        const product = this.findProductByBarcode(barcode);
        
        if (product) {
            this.addProductToCart(product);
            this.showNotification(`✅ ${product.name} added to cart`, 'success');
            
            // Continue scanning
            setTimeout(() => {
                if (this.isScanning) {
                    this.simulateBarcodeScanning();
                }
            }, 1000);
        } else {
            this.showNotification(`❌ Product not found for barcode: ${barcode}`, 'error');
            
            // Continue scanning
            setTimeout(() => {
                if (this.isScanning) {
                    this.simulateBarcodeScanning();
                }
            }, 1500);
        }
    }
    // barcode search (supports base medicines data)
    findProductByBarcode(barcode) {
        const searchKey = String(barcode || "").trim();
        if (!searchKey) return null;

        const dataset = medicines;

        // Prefer exact barcode match first
        const byBarcode = dataset.find(m => String(m.barcode) === searchKey);
        if (byBarcode) return byBarcode;

        // Fallback to ID match (numeric or string)
        return dataset.find(m => String(m.id) === searchKey);
    }

    addProductToCart(product) {
        // Check if product already exists in cart
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            // Increment quantity if already exists
            existingItem.quantity += 1;
            existingItem.total = existingItem.unitPrice * existingItem.quantity;
        } else {
            // Add new item to cart
            const cartItem = {
                id: product.id,
                name: product.name,
                batch: product.batch,
                expiry: product.expiry,
                quantity: 1,
                unitPrice: product.price,
                discount: 0,
                total: product.price,
                icon: product.icon
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
        const cartBadge = document.getElementById('cartItemCount');
        if (cartBadge) {
            cartBadge.textContent = itemCount;
        }
    }
    
    updateSalesTable() {
        const tableBody = document.getElementById('cartTableBody');
        if (!tableBody) return;
        
        // Clear existing content
        tableBody.innerHTML = '';
        
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
            const row = document.createElement('tr');
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            row.style.transition = 'all 0.3s ease';
            
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
                <td class="price-cell">$${(item.unitPrice || 0).toFixed(2)}</td>
                <td class="discount-cell">${item.discount || 0}%</td>
                <td class="total-cell">$${(item.total || 0).toFixed(2)}</td>
                <td class="actions-cell">
                    <button class="action-btn delete" onclick="pharmacyPOS.removeItem(${index})" title="Remove item">
                        🗑️
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
            
            // Animate row appearance
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    updateCartSummary() {
        const itemCount = this.cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const subtotal = this.cart.reduce((sum, item) => sum + ((item.unitPrice || 0) * (item.quantity || 0)), 0);
        const totalDiscount = this.cart.reduce((sum, item) => sum + ((item.unitPrice || 0) * (item.quantity || 0) * ((item.discount || 0) / 100)), 0);
        const grandTotal = subtotal - totalDiscount;

        document.getElementById('cartItemCount').textContent = itemCount;
        document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('cartDiscount').textContent = `$${totalDiscount.toFixed(2)}`;
        document.getElementById('cartTotal').textContent = `$${grandTotal.toFixed(2)}`;
    }
    
    updateQuantity(index, change) {
        const item = this.cart[index];
        if (!item) return;
        
        item.quantity = (item.quantity || 0) + change;
        
        if (item.quantity <= 0) {
            this.removeItem(index);
            return;
        }
        
        item.total = (item.unitPrice || 0) * item.quantity;
        
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
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
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
            success: '#22c55e',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    selectWalkInCustomer() {
        this.showCustomerDropdown();
    }

    showCustomerDropdown() {
        const customerBtn = document.querySelector('.customer-btn');
        if (!customerBtn) return;

        // Remove existing dropdown
        this.closeCustomerDropdown();

        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'customer-dropdown';
        dropdown.innerHTML = `
            <div class="customer-dropdown-header">
                <input type="text" placeholder="Search customers..." id="customerSearchDropdown" class="customer-dropdown-search">
            </div>
            <div class="customer-dropdown-list" id="customerDropdownList">
                ${this.renderCustomerDropdownList()}
            </div>
            <div class="customer-dropdown-footer">
                <div class="customer-dropdown-item walk-in-item" onclick="pharmacyPOS.selectWalkInCustomerByName()">
                    <div class="customer-item-avatar">🧍</div>
                    <div class="customer-item-info">
                        <div class="customer-item-name">Walk-in Customer</div>
                        <div class="customer-item-phone">Anonymous customer</div>
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
            
            // Close dropdown when clicking outside
            document.addEventListener('click', this.handleDropdownClickOutside);
        }, 100);
    }

    renderCustomerDropdownList() {
        return this.customers.map(customer => `
            <div class="customer-dropdown-item" onclick="pharmacyPOS.selectCustomerFromDropdown(${customer.id})">
                <div class="customer-item-avatar">
                    ${customer.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
                <div class="customer-item-info">
                    <div class="customer-item-name">${customer.name}</div>
                    <div class="customer-item-phone">${customer.phone}</div>
                    <div class="customer-item-tier">
                        <span class="tier-badge tier-${customer.tier.toLowerCase()}">${customer.tier}</span>
                        <span class="customer-item-points">${customer.loyaltyPoints} pts</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupCustomerDropdownSearch() {
        const searchInput = document.getElementById('customerSearchDropdown');
        const customerList = document.getElementById('customerDropdownList');
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredCustomers = this.customers.filter(customer => 
                customer.name.toLowerCase().includes(searchTerm) ||
                customer.phone.includes(searchTerm) ||
                customer.email.toLowerCase().includes(searchTerm)
            );
            
            customerList.innerHTML = filteredCustomers.map(customer => `
                <div class="customer-dropdown-item" onclick="pharmacyPOS.selectCustomerFromDropdown(${customer.id})">
                    <div class="customer-item-avatar">
                        ${customer.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                    </div>
                    <div class="customer-item-info">
                        <div class="customer-item-name">${customer.name}</div>
                        <div class="customer-item-phone">${customer.phone}</div>
                        <div class="customer-item-tier">
                            <span class="tier-badge tier-${customer.tier.toLowerCase()}">${customer.tier}</span>
                            <span class="customer-item-points">${customer.loyaltyPoints} pts</span>
                        </div>
                    </div>
                </div>
            `).join('');
        });
    }

    handleDropdownClickOutside = (e) => {
        const dropdown = document.querySelector('.customer-dropdown');
        const customerBtn = document.querySelector('.customer-btn');
        
        if (dropdown && !dropdown.contains(e.target) && !customerBtn.contains(e.target)) {
            this.closeCustomerDropdown();
        }
    }

    selectCustomerFromDropdown(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            this.currentCustomer = {
                ...customer,
                isWalkIn: false
            };
            this.updateCustomerDisplay();
            this.closeCustomerDropdown();
            alert(`🧍 Customer selected: ${customer.name}\n📱 ${customer.phone}\n⭐ ${customer.tier} - ${customer.loyaltyPoints} points`);
        }
    }

    selectWalkInCustomerByName() {
        const customerName = prompt('Enter customer name (leave blank for Walk-in):', 'Walk-in Customer');
        if (customerName !== null) {
            this.currentCustomer = {
                name: customerName || 'Walk-in Customer',
                isWalkIn: customerName === '' || customerName === 'Walk-in Customer'
            };
            this.updateCustomerDisplay();
            this.closeCustomerDropdown();
            alert(`🧍 Customer selected: ${this.currentCustomer.name}`);
        }
    }

    updateCustomerDisplay() {
        const customerDisplay = document.querySelector('.current-customer');
        if (customerDisplay) {
            customerDisplay.innerHTML = `
                <strong>🧍 Customer:</strong> ${this.currentCustomer.name}
                ${!this.currentCustomer.isWalkIn ? `<br><small>📱 ${this.currentCustomer.phone}</small>` : ''}
            `;
        }
    }

    closeCustomerDropdown() {
        const dropdown = document.querySelector('.customer-dropdown');
        if (dropdown) {
            dropdown.remove();
        }
        document.removeEventListener('click', this.handleDropdownClickOutside);
    }
    
    holdBill() {
        if (this.cart.length === 0) {
            alert('⏸ Cart is empty. Add items before holding a bill.');
            return;
        }
        
        const billName = prompt('Enter bill reference name:', `Bill_${Date.now()}`);
        if (billName) {
            this.heldBills.push({
                id: Date.now(),
                name: billName,
                items: [...this.cart],
                total: this.getCartTotal(),
                timestamp: new Date().toLocaleString()
            });
            
            alert(`⏸ Bill held successfully!\n\nBill: ${billName}\nItems: ${this.cart.length}\nTotal: $${this.getCartTotal().toFixed(2)}`);
            this.clearCart();
        }
    }
    
    handleReturns() {
        if (this.heldBills.length === 0) {
            alert('🔁 No held bills available for returns.');
            return;
        }
        
        let billsList = 'Available Bills for Returns:\n\n';
        this.heldBills.forEach((bill, index) => {
            billsList += `${index + 1}. ${bill.name} - $${bill.total.toFixed(2)} (${bill.timestamp})\n`;
        });
        
        const billIndex = prompt(billsList + '\nEnter bill number (or cancel):');
        
        if (billIndex && !isNaN(billIndex)) {
            const index = parseInt(billIndex) - 1;
            if (index >= 0 && index < this.heldBills.length) {
                const bill = this.heldBills[index];
                alert(`🔁 Processing return for: ${bill.name}\n\nOriginal Items: ${bill.items.length}\nReturn Amount: $${bill.total.toFixed(2)}`);
                this.heldBills.splice(index, 1);
            }
        }
    }
    
    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    loadProducts() {
         // Load from centralized dataset
         this.products = medicines;
    }

    renderProducts(productsToRender) {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        productsGrid.innerHTML = productsToRender.map(product => `
            <div class="product-card" data-category="${product.category}">
                <div class="product-icon">${product.icon}</div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-category">Category: ${this.getCategoryName(product.category)}</p>
                    <p class="product-price">💰 Price: $${product.price.toFixed(2)}</p>
                    <p class="product-stock ${product.stock < 20 ? 'low-stock' : ''}">
                        📦 Stock: ${product.stock} in stock
                        ${product.stock < 20 ? '⚠️ Low Stock' : ''}
                    </p>
                    ${product.prescription ? '<p class="prescription-required">⚠️ Prescription Required</p>' : ''}
                </div>
                <div class="product-actions">
                    <button class="btn btn-add-cart" onclick="pharmacyPOS.addToCart(${product.id})">
                        ➕ Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
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
            chronic: "Chronic Care"
        };
        return categoryNames[category] || category;
    }

    searchMedicines(query) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        
        if (!query.trim()) {
            suggestionsContainer.innerHTML = '';
            return;
        }
        
        const filtered = this.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
        
        if (filtered.length === 0) {
            suggestionsContainer.innerHTML = '<div class="suggestion-item no-results">No products found</div>';
            return;
        }
        
        suggestionsContainer.innerHTML = filtered.map(product => `
            <div class="suggestion-item" onclick="pharmacyPOS.addToCartFromSearch(${product.id}, '${product.name.replace(/'/g, "\\'")}')">
                <div class="suggestion-icon">${product.icon}</div>
                <div class="suggestion-info">
                    <div class="suggestion-name">${product.name}</div>
                    <div class="suggestion-details">
                        💰 $${product.price.toFixed(2)} | 📦 ${product.stock} in stock
                    </div>
                </div>
                <div class="suggestion-action">➕</div>
            </div>
        `).join('');
    }
    
    filterByCategory(category) {
        let filtered = this.products;
        if (category !== 'all') {
            filtered = this.products.filter(product => product.category === category);
        }
        this.renderProducts(filtered);
    }
    
    addToCartFromSearch(productId, productName) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        this.addToCart(productId);
        
        // Clear search and show confirmation
        const searchInput = document.getElementById('medicineSearch');
        searchInput.value = '';
        document.getElementById('searchSuggestions').innerHTML = '';
        
        // Show brief notification
        const notification = document.createElement('div');
        notification.className = 'add-notification';
        notification.textContent = `✅ ${productName} added to cart`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push({
                ...product,
                quantity: 1,
                discount: 0 // Default discount percentage
            });
        }

        this.updateCartDisplay();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartDisplay();
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.updateCartDisplay();
            }
        }
    }

    updateCartDisplay() {
        const cartTableBody = document.getElementById('cartTableBody');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartDiscount = document.getElementById('cartDiscount');
        const cartTotal = document.getElementById('cartTotal');
        const cartItemCount = document.getElementById('cartItemCount');
        
        if (!cartTableBody || !cartSubtotal || !cartDiscount || !cartTotal) return;

        if (this.cart.length === 0) {
            cartTableBody.innerHTML = `
                <tr class="cart-empty-row">
                    <td colspan="7" class="cart-empty">
                        <p>Cart is empty</p>
                    </td>
                </tr>
            `;
            cartSubtotal.textContent = '$0.00';
            cartDiscount.textContent = '$0.00';
            cartTotal.textContent = '$0.00';
            if (cartItemCount) cartItemCount.textContent = '0';
            return;
        }

        // Generate table rows
        cartTableBody.innerHTML = this.cart.map(item => {
            const itemTotal = item.price * item.quantity;
            const discountAmount = itemTotal * (item.discount / 100);
            const finalTotal = itemTotal - discountAmount;
            
            return `
                <tr class="cart-row" data-item-id="${item.id}">
                    <td class="item-name">
                        <div class="product-info">
                            <span class="name">${item.name}</span>
                            <span class="icon">${item.icon}</span>
                        </div>
                    </td>
                    <td class="batch-expiry">
                        <div class="batch-info">
                            <span class="batch">${item.batch}</span>
                            <span class="expiry">${this.formatDate(item.expiry)}</span>
                        </div>
                    </td>
                    <td class="quantity">
                        <div class="quantity-controls">
                            <button class="btn-quantity" onclick="pharmacyPOS.updateQuantity(${item.id}, -1)">-</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="btn-quantity" onclick="pharmacyPOS.updateQuantity(${item.id}, 1)">+</button>
                        </div>
                    </td>
                    <td class="unit-price">$${item.price.toFixed(2)}</td>
                    <td class="discount">
                        <div class="discount-controls">
                            <input type="number" 
                                   class="discount-input" 
                                   value="${item.discount}" 
                                   min="0" 
                                   max="100" 
                                   step="0.1"
                                   onchange="pharmacyPOS.updateDiscount(${item.id}, this.value)"
                                   onclick="this.select()">
                            <span>%</span>
                        </div>
                    </td>
                    <td class="item-total">$${finalTotal.toFixed(2)}</td>
                    <td class="actions">
                        <button class="btn-remove" onclick="pharmacyPOS.removeFromCart(${item.id})" title="Remove item">
                            🗑️
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Calculate totals
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalDiscount = this.cart.reduce((sum, item) => {
            const itemTotal = item.price * item.quantity;
            return sum + (itemTotal * (item.discount / 100));
        }, 0);
        const grandTotal = subtotal - totalDiscount;

        // Update totals display
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        cartDiscount.textContent = `$${totalDiscount.toFixed(2)}`;
        cartTotal.textContent = `$${grandTotal.toFixed(2)}`;
        if (cartItemCount) cartItemCount.textContent = String(this.cart.reduce((sum, item) => sum + item.quantity, 0));
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
        });
    }

    updateDiscount(productId, discountValue) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.discount = Math.max(0, Math.min(100, parseFloat(discountValue) || 0));
            this.updateCartDisplay();
        }
    }

    clearCart(askConfirm = true) {
        if (!askConfirm || confirm('Are you sure you want to clear the cart?')) {
            this.cart = [];
            this.updateCartDisplay();
        }
    }

    checkout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        const total = this.calculateGrandTotal();
        const existingDropdown = document.getElementById('paymentDropdown');
        
        if (existingDropdown) {
            existingDropdown.remove();
            return;
        }
        
        // Hide cart-totals and default cart-actions to free up vertical space
        const cartTotals = document.querySelector('.pos-cart-35 .cart-totals');
        const defaultActions = document.querySelector('.pos-cart-35 .cart-actions');
        if (cartTotals) cartTotals.style.display = 'none';
        if (defaultActions) defaultActions.style.display = 'none';
        
        // Create dropdown within the cart
        const dropdown = document.createElement('div');
        dropdown.id = 'paymentDropdown';
        dropdown.className = 'modern-payment-panel';
        dropdown.innerHTML = `
            <div class="payment-panel-content">
                <div class="payment-header">
                    <h4>💳 Payment Details</h4>
                    <button class="close-payment" type="button" onclick="pharmacyPOS.closePaymentDropdown()" aria-label="Close payment panel">×</button>
                </div>

                <div class="payment-total-modern">
                    <div class="total-label">TOTAL</div>
                    <div class="total-amount-large">LKR ${total.toFixed(2)}</div>
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
                        <input class="amount-input-modern" type="number" id="amountPaid" value="${total.toFixed(2)}" step="0.01" min="0" inputmode="decimal">
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
                        <span class="balance-value" id="balanceAmount">LKR ${total.toFixed(2)} (due)</span>
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
        const cartSummary = document.querySelector('.pos-cart-35 .cart-summary');
        if (cartSummary) {
            cartSummary.appendChild(dropdown);
        }
        
        // Setup payment calculation
        this.setupPaymentCalculation();
    }

    closePaymentDropdown() {
        const dropdown = document.getElementById('paymentDropdown');
        if (dropdown) {
            dropdown.remove();
        }
        
        // Show cart-totals and default cart-actions again
        const cartTotals = document.querySelector('.pos-cart-35 .cart-totals');
        const defaultActions = document.querySelector('.pos-cart-35 .cart-actions');
        if (cartTotals) cartTotals.style.display = '';
        if (defaultActions) defaultActions.style.display = '';
    }

    setupPaymentCalculation() {
        const amountPaid = document.getElementById('amountPaid');
        const balanceAmount = document.getElementById('balanceAmount');
        const total = this.calculateGrandTotal();
        
        const updateBalance = () => {
            const paid = parseFloat(amountPaid.value) || 0;
            const balance = total - paid;
            balanceAmount.textContent = balance > 0 ? 
                `LKR ${balance.toFixed(2)} (due)` : 
                `LKR ${Math.abs(balance).toFixed(2)} (change)`;
        };
        
        amountPaid.addEventListener('input', updateBalance);
        updateBalance();
    }

    setAmount(amount) {
        document.getElementById('amountPaid').value = amount;
        this.setupPaymentCalculation();
    }

    completeSale() {
        const total = this.calculateGrandTotal();
        const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        
        if (amountPaid < total && paymentMethod !== 'credit') {
            alert('Insufficient payment amount!');
            return;
        }
        
        // Process sale
        const sale = {
            id: Date.now(),
            items: [...this.cart],
            total: total,
            amountPaid: amountPaid,
            paymentMethod: paymentMethod,
            customer: this.currentCustomer,
            timestamp: new Date().toLocaleString()
        };
        
        // Store sale (in real implementation, save to database)
        if (!this.salesHistory) this.salesHistory = [];
        this.salesHistory.push(sale);
        
        this.showNotification(`🧾 Sale completed - LKR ${total.toFixed(2)}`, 'success');
        this.clearCart(false);
        this.closePaymentDropdown();
        
        // Print receipt (simulation)
        this.printReceipt(sale);
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
                    </div>
                    
                    <div class="receipt-info">
                        <div class="receipt-info-item">
                            <div class="receipt-info-label">Customer</div>
                            <div>${sale.customer.name}</div>
                        </div>
                        <div class="receipt-info-item">
                            <div class="receipt-info-label">Payment Method</div>
                            <div>${sale.paymentMethod.toUpperCase()}</div>
                        </div>
                    </div>
                    
                    <div class="receipt-items">
                        ${sale.items.map(item => `
                            <div class="receipt-item">
                                <div class="receipt-item-name">
                                    ${item.name}
                                    <div class="receipt-batch">Batch: ${item.batch || 'N/A'} | Exp: ${item.expiry || 'N/A'}</div>
                                </div>
                                <div class="receipt-item-details">
                                    ${item.quantity} × LKR ${(item.price || 0).toFixed(2)}<br>
                                    <strong>LKR ${((item.price || 0) * item.quantity).toFixed(2)}</strong>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="receipt-totals">
                        <div class="receipt-total-row">
                            <span>Items (${sale.items.length}):</span>
                            <span>${sale.items.length}</span>
                        </div>
                        <div class="receipt-total-row">
                            <span>Subtotal:</span>
                            <span>LKR ${sale.total.toFixed(2)}</span>
                        </div>
                        <div class="receipt-total-row">
                            <span>Discount:</span>
                            <span>LKR 0.00</span>
                        </div>
                        <div class="receipt-grand-total">
                            <span>GRAND TOTAL:</span>
                            <span>LKR ${sale.total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="receipt-payment">
                        <div class="receipt-payment-row">
                            <span>Amount Paid:</span>
                            <span>LKR ${sale.amountPaid.toFixed(2)}</span>
                        </div>
                        <div class="receipt-payment-row">
                            <span>Change:</span>
                            <span>LKR ${(sale.amountPaid - sale.total).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="receipt-footer">
                        <div class="receipt-thank">Thank You For Your Purchase!</div>
                        <div class="receipt-contact">📞 +94 123 456 7890</div>
                        <div class="receipt-contact">📍 123 Pharmacy Street, Colombo</div>
                        <div class="receipt-barcode">|||${sale.receiptNumber}|||</div>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        // Method 1: Auto-download as HTML file
        const blob = new Blob([receiptContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `Receipt_${sale.receiptNumber}.html`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        
        // Method 2: Auto-print using hidden iframe
        setTimeout(() => {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            iframe.style.visibility = 'hidden';
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
        this.showNotification(`📥 Receipt downloaded and printing - ${sale.receiptNumber}`, 'success');
    }

    backToCart() {
        this.closePaymentDropdown();
    }

    // Helper methods for calculations
    calculateSubtotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    calculateTotalDiscount() {
        return this.cart.reduce((sum, item) => {
            const itemTotal = item.price * item.quantity;
            return sum + (itemTotal * (item.discount / 100));
        }, 0);
    }

    calculateGrandTotal() {
        return this.calculateSubtotal() - this.calculateTotalDiscount();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
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
            success: '#22c55e',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    payNow() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        alert('Payment functionality would be implemented here');
    }

    startNewSale() {
        // Navigate to POS interface
        window.location.href = '/pos/web';
    }

    initializeCustomerData() {
        // Load customers from localStorage, or use default sample data
        const savedCustomers = localStorage.getItem('pharmacy_customers');
        if (savedCustomers) {
            try {
                this.customers = JSON.parse(savedCustomers);
            } catch (error) {
                console.error('Error loading customers from localStorage:', error);
                this.customers = this.getDefaultCustomers();
            }
        } else {
            this.customers = this.getDefaultCustomers();
        }
    }

    getDefaultCustomers() {
        return [
            {
                id: 1,
                name: "Dilani Fernando",
                phone: "+94774567890",
                email: "dilani.fernando@email.com",
                tier: "Bronze",
                loyaltyPoints: 50,
                creditUsed: 0,
                creditLimit: 0,
                memberSince: "Feb 2026",
                address: "123 Main St, Colombo",
                totalPurchases: 12500
            },
            {
                id: 2,
                name: "Kumari Jayawardena",
                phone: "+94771234567",
                email: "kumari.j@email.com",
                tier: "Silver",
                loyaltyPoints: 450,
                creditUsed: 5000,
                creditLimit: 15000,
                memberSince: "Jan 2025",
                address: "456 Park Ave, Kandy",
                totalPurchases: 45000
            },
            {
                id: 3,
                name: "Mahinda Rajapaksa",
                phone: "+94772345678",
                email: "mahinda.r@email.com",
                tier: "Bronze",
                loyaltyPoints: 120,
                creditUsed: 0,
                creditLimit: 5000,
                memberSince: "Mar 2026",
                address: "789 Queen St, Galle",
                totalPurchases: 18000
            },
            {
                id: 4,
                name: "Nishantha Silva",
                phone: "+94775678901",
                email: "nishantha.s@email.com",
                tier: "Platinum",
                loyaltyPoints: 2500,
                creditUsed: 12000,
                creditLimit: 50000,
                memberSince: "Dec 2024",
                address: "321 King St, Jaffna",
                totalPurchases: 125000
            },
            {
                id: 5,
                name: "Saman Perera",
                phone: "+94773456789",
                email: "saman.p@email.com",
                tier: "Gold",
                loyaltyPoints: 1200,
                creditUsed: 8000,
                creditLimit: 30000,
                memberSince: "Nov 2024",
                address: "654 Beach Rd, Matara",
                totalPurchases: 85000
            }
        ];
    }

    saveCustomersToStorage() {
        try {
            localStorage.setItem('pharmacy_customers', JSON.stringify(this.customers));
        } catch (error) {
            console.error('Error saving customers to localStorage:', error);
            this.showNotification('Failed to save customer data to local storage.', 'error');
        }
    }

    renderCustomers() {
        const container = document.getElementById("dashboard_container");
        
        container.innerHTML = `
            <div class="dashboard">

                <div class="customers-search-section">
                    <div class="search-bar">
                        <input
                            type="text"
                            id="customerSearchInput"
                            placeholder="🔍 Name or phone..."
                            class="search-input"
                        >
                    </div>
                    <div class="filter-tabs">
                        <button class="filter-tab active" data-tier="all">All</button>
                        <button class="filter-tab" data-tier="platinum">Platinum</button>
                        <button class="filter-tab" data-tier="gold">Gold</button>
                        <button class="filter-tab" data-tier="silver">Silver</button>
                        <button class="filter-tab" data-tier="bronze">Bronze</button>
                    </div>
                     <div class="customers-header-actions">
                        <button class="btn btn-primary" id="addCustomerBtn">
                            <span class="btn-icon">➕</span>
                            Add Customer
                        </button>
                    </div>
                </div>

                <div class="customers-content">
                    <div class="customers-list" id="customersList">
                        ${this.renderCustomerList(this.customers)}
                    </div>
                    
                    <div class="customer-details" id="customerDetails">
                        ${this.selectedCustomer ? this.renderCustomerDetails(this.selectedCustomer) : `
                            <div class="no-customer-selected">
                                <div class="no-customer-icon">👥</div>
                                <h3>Select a Customer</h3>
                                <p>Choose a customer from the list to view their details</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        this.setupCustomerHandlers();
    }

    renderCustomerList(customers) {
        if (!customers || customers.length === 0) {
            return `
                <div class="no-customers">
                    <div class="no-customers-icon">🔍</div>
                    <h3>No customers found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
        }

        return customers.map(customer => `
            <div class="customer-card ${this.selectedCustomer?.id === customer.id ? 'selected' : ''}" 
                 data-customer-id="${customer.id}">
                <div class="customer-card-header">
                    <div class="customer-avatar">
                        <span class="avatar-text">${customer.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div class="customer-info">
                        <h4 class="customer-name">${customer.name}</h4>
                        <div class="customer-tier">
                            <span class="tier-badge tier-${customer.tier.toLowerCase()}">${customer.tier}</span>
                            <span class="customer-phone">${customer.phone}</span>
                        </div>
                    </div>
                </div>
                <div class="customer-stats">
                    <div class="customer-stat">
                        <span class="stat-label">Loyalty Points</span>
                        <span class="stat-value">${customer.loyaltyPoints.toLocaleString()} pts</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCustomerDetails(customer) {
        const creditPercentage = customer.creditLimit > 0 ? (customer.creditUsed / customer.creditLimit) * 100 : 0;
        
        return `
            <div class="customer-details-content">
                <div class="customer-details-header">
                    <div class="customer-avatar large">
                        <span class="avatar-text">${customer.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div class="customer-details-info">
                        <h3 class="customer-name">${customer.name}</h3>
                        <div class="customer-tier">
                            <span class="tier-badge tier-${customer.tier.toLowerCase()}">⭐ ${customer.tier}</span>
                        </div>
                        <div class="customer-contact">
                            <div class="contact-item">
                                <span class="contact-label">📱</span>
                                <span class="contact-value">${customer.phone}</span>
                            </div>
                            <div class="contact-item">
                                <span class="contact-label">✉️</span>
                                <span class="contact-value">${customer.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="customer-metrics">
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-icon">💎</span>
                            <span class="metric-title">Loyalty Points</span>
                        </div>
                        <div class="metric-value">${customer.loyaltyPoints.toLocaleString()}</div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-icon">💳</span>
                            <span class="metric-title">Credit Used</span>
                        </div>
                        <div class="metric-value">LKR ${customer.creditUsed.toLocaleString()}</div>
                        <div class="metric-subtitle">of LKR ${customer.creditLimit.toLocaleString()} limit</div>
                        <div class="credit-progress">
                            <div class="credit-progress-bar" style="width: ${creditPercentage}%"></div>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-icon">📅</span>
                            <span class="metric-title">Member Since</span>
                        </div>
                        <div class="metric-value">${customer.memberSince}</div>
                    </div>
                </div>

                <div class="customer-actions">
                    <button class="btn btn-primary" onclick="dashboard.startNewSaleForCustomer(${customer.id})">
                        <span class="btn-icon">🛒</span>
                        New Sale for Customer
                    </button>
                    <button class="btn btn-secondary" onclick="dashboard.editCustomer(${customer.id})">
                        <span class="btn-icon">✏️</span>
                        Edit Profile
                    </button>
                    <button class="btn btn-danger" onclick="dashboard.confirmDeleteCustomer(${customer.id}, '${customer.name.replace(/'/g, "\\'")}')">
                        <span class="btn-icon">🗑️</span>
                        Delete Customer
                    </button>
                </div>

                <div class="customer-history">
                    <h4>Recent Purchases</h4>
                    <div class="purchase-history">
                        <div class="purchase-item">
                            <div class="purchase-date">Mar 25, 2026</div>
                            <div class="purchase-items">Antibiotics, Vitamins</div>
                            <div class="purchase-amount">LKR 2,450</div>
                        </div>
                        <div class="purchase-item">
                            <div class="purchase-date">Mar 18, 2026</div>
                            <div class="purchase-items">Pain Relief</div>
                            <div class="purchase-amount">LKR 1,200</div>
                        </div>
                        <div class="purchase-item">
                            <div class="purchase-date">Mar 10, 2026</div>
                            <div class="purchase-items">Diabetes Medication</div>
                            <div class="purchase-amount">LKR 3,800</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupCustomerHandlers() {
        const searchInput = document.getElementById("customerSearchInput");
        const filterTabs = document.querySelectorAll(".filter-tab");
        const addCustomerBtn = document.getElementById("addCustomerBtn");

        // Search functionality
        searchInput?.addEventListener("input", () => {
            this.filterCustomers();
        });

        // Filter tabs
        filterTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                filterTabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                this.filterCustomers();
            });
        });

        // Customer card selection
        const customerCards = document.querySelectorAll(".customer-card");
        customerCards.forEach(card => {
            card.addEventListener("click", () => {
                const customerId = parseInt(card.dataset.customerId);
                this.selectCustomer(customerId);
            });
        });

        // Add customer button
        addCustomerBtn?.addEventListener("click", () => {
            this.showAddCustomerModal();
        });
    }

    filterCustomers() {
        const searchInput = document.getElementById("customerSearchInput");
        const activeTab = document.querySelector(".filter-tab.active");
        const searchTerm = (searchInput?.value || "").toLowerCase();
        const tierFilter = activeTab?.dataset.tier || "all";

        let filteredCustomers = this.customers.filter(customer => {
            const matchesSearch = customer.name.toLowerCase().includes(searchTerm) ||
                                customer.phone.includes(searchTerm);
            
            const matchesTier = tierFilter === "all" || customer.tier.toLowerCase() === tierFilter;
            
            return matchesSearch && matchesTier;
        });

        this.updateCustomerList(filteredCustomers);
    }

    updateCustomerList(customers) {
        const customersList = document.getElementById("customersList");
        if (customersList) {
            customersList.innerHTML = this.renderCustomerList(customers);
            
            // Re-attach click handlers to new customer cards
            const customerCards = customersList.querySelectorAll(".customer-card");
            customerCards.forEach(card => {
                card.addEventListener("click", () => {
                    const customerId = parseInt(card.dataset.customerId);
                    this.selectCustomer(customerId);
                });
            });
        }
    }

    selectCustomer(customerId) {
        this.selectedCustomer = this.customers.find(c => c.id === customerId);
        
        // Update selected state in customer list
        const customerCards = document.querySelectorAll(".customer-card");
        customerCards.forEach(card => {
            card.classList.toggle("selected", parseInt(card.dataset.customerId) === customerId);
        });

        // Update customer details
        const customerDetails = document.getElementById("customerDetails");
        if (customerDetails && this.selectedCustomer) {
            customerDetails.innerHTML = this.renderCustomerDetails(this.selectedCustomer);
        }
    }

    startNewSaleForCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            // Navigate to POS with selected customer
            this.currentCustomer = customer;
            this.showNotification(`Starting new sale for ${customer.name}`, "success");
            // In a real implementation, this would navigate to the POS interface
            setTimeout(() => {
                this.handlePageNavigation('sales');
            }, 1000);
        }
    }

    editCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) {
            this.showNotification('Customer not found.', 'error');
            return;
        }

        this.showEditCustomerModal(customer);
    }

    showEditCustomerModal(customer) {
        if (document.getElementById("editCustomerModal")) return;

        const modal = document.createElement("div");
        modal.id = "editCustomerModal";
        modal.className = "inventory-modal-overlay";
        modal.innerHTML = `
            <div class="inventory-modal" role="dialog" aria-modal="true" aria-labelledby="editCustomerTitle">
                <div class="inventory-modal-header">
                    <h3 id="editCustomerTitle">Edit Customer</h3>
                    <button type="button" class="inventory-modal-close" aria-label="Close edit customer form">×</button>
                </div>
                <form id="editCustomerForm" class="inventory-form-grid">
                    <input type="hidden" name="customerId" value="${customer.id}">
                    <label class="inventory-form-field">
                        <span>Name *</span>
                        <input type="text" name="name" required value="${customer.name}" placeholder="e.g. John Doe">
                    </label>
                    <label class="inventory-form-field">
                        <span>Phone *</span>
                        <input type="tel" name="phone" required value="${customer.phone}" placeholder="e.g. +94771234567">
                    </label>
                    <label class="inventory-form-field">
                        <span>Email</span>
                        <input type="email" name="email" value="${customer.email || ''}" placeholder="e.g. john.doe@email.com">
                    </label>
                    <label class="inventory-form-field">
                        <span>Address</span>
                        <input type="text" name="address" value="${customer.address || ''}" placeholder="e.g. 123 Main St, Colombo">
                    </label>
                    <label class="inventory-form-field">
                        <span>Tier</span>
                        <select name="tier">
                            <option value="Bronze" ${customer.tier === 'Bronze' ? 'selected' : ''}>Bronze</option>
                            <option value="Silver" ${customer.tier === 'Silver' ? 'selected' : ''}>Silver</option>
                            <option value="Gold" ${customer.tier === 'Gold' ? 'selected' : ''}>Gold</option>
                            <option value="Platinum" ${customer.tier === 'Platinum' ? 'selected' : ''}>Platinum</option>
                        </select>
                    </label>
                    <label class="inventory-form-field">
                        <span>Credit Limit (LKR)</span>
                        <input type="number" name="creditLimit" min="0" step="100" value="${customer.creditLimit || 0}" placeholder="0">
                    </label>
                    <div class="inventory-form-actions">
                        <button type="button" class="btn btn-secondary compact" id="cancelEditCustomerBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary compact">Update Customer</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const close = () => this.closeEditCustomerModal();
        modal.querySelector(".inventory-modal-close")?.addEventListener("click", close);
        modal.querySelector("#cancelEditCustomerBtn")?.addEventListener("click", close);
        modal.addEventListener("click", (ev) => {
            if (ev.target === modal) close();
        });

        const form = modal.querySelector("#editCustomerForm");
        form?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            this.updateCustomerFromForm(form);
        });
    }

    closeEditCustomerModal() {
        const modal = document.getElementById("editCustomerModal");
        if (modal) modal.remove();
    }

    updateCustomerFromForm(form) {
        const formData = new FormData(form);
        const customerId = Number(formData.get("customerId"));
        const name = String(formData.get("name") || "").trim();
        const phone = String(formData.get("phone") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const address = String(formData.get("address") || "").trim();
        const tier = String(formData.get("tier") || "Bronze");
        const creditLimit = Number(formData.get("creditLimit") || 0);

        if (!name || !phone) {
            this.showNotification("Please fill required fields (Name and Phone).", "warning");
            return;
        }

        // Validate phone number format (basic validation)
        if (!phone.match(/^\+?[0-9\s\-\(\)]+$/)) {
            this.showNotification("Please enter a valid phone number.", "warning");
            return;
        }

        // Find and update the customer
        const customerIndex = this.customers.findIndex(c => c.id === customerId);
        if (customerIndex === -1) {
            this.showNotification("Customer not found.", "error");
            return;
        }

        // Update customer data
        this.customers[customerIndex] = {
            ...this.customers[customerIndex],
            name: name,
            phone: phone,
            email: email || "",
            address: address || "",
            tier: tier,
            creditLimit: creditLimit
        };

        // Save to localStorage
        this.saveCustomersToStorage();

        // Close modal
        this.closeEditCustomerModal();

        // Show success notification
        this.showNotification(`Customer "${name}" updated successfully!`, "success");

        // Refresh the customers page to show the updated customer
        this.renderCustomers();
    }

    confirmDeleteCustomer(customerId, customerName) {
        if (confirm(`Are you sure you want to delete customer "${customerName}"? This action cannot be undone.`)) {
            this.deleteCustomer(customerId);
        }
    }

    deleteCustomer(customerId) {
        const customerIndex = this.customers.findIndex(c => c.id === customerId);
        if (customerIndex === -1) {
            this.showNotification("Customer not found.", "error");
            return;
        }

        const customerName = this.customers[customerIndex].name;

        // Remove customer from array
        this.customers.splice(customerIndex, 1);

        // Save to localStorage
        this.saveCustomersToStorage();

        // Show success notification
        this.showNotification(`Customer "${customerName}" deleted successfully!`, "success");

        // Refresh the customers page
        this.renderCustomers();

        // Clear customer details if the deleted customer was selected
        if (this.selectedCustomer && this.selectedCustomer.id === customerId) {
            this.selectedCustomer = null;
            const customerDetails = document.getElementById("customerDetails");
            if (customerDetails) {
                customerDetails.innerHTML = `
                    <div class="no-customer-selected">
                        <div class="no-customer-icon">👥</div>
                        <h3>Select a Customer</h3>
                        <p>Choose a customer from the list to view their details</p>
                    </div>
                `;
            }
        }
    }

    showAddCustomerModal() {
        if (document.getElementById("addCustomerModal")) return;

        const modal = document.createElement("div");
        modal.id = "addCustomerModal";
        modal.className = "inventory-modal-overlay";
        modal.innerHTML = `
            <div class="inventory-modal" role="dialog" aria-modal="true" aria-labelledby="addCustomerTitle">
                <div class="inventory-modal-header">
                    <h3 id="addCustomerTitle">Add New Customer</h3>
                    <button type="button" class="inventory-modal-close" aria-label="Close add customer form">×</button>
                </div>
                <form id="addCustomerForm" class="inventory-form-grid">
                    <label class="inventory-form-field">
                        <span>Name *</span>
                        <input type="text" name="name" required placeholder="e.g. John Doe">
                    </label>
                    <label class="inventory-form-field">
                        <span>Phone *</span>
                        <input type="tel" name="phone" required placeholder="e.g. +94771234567">
                    </label>
                    <label class="inventory-form-field">
                        <span>Email</span>
                        <input type="email" name="email" placeholder="e.g. john.doe@email.com">
                    </label>
                    <label class="inventory-form-field">
                        <span>Address</span>
                        <input type="text" name="address" placeholder="e.g. 123 Main St, Colombo">
                    </label>
                    <label class="inventory-form-field">
                        <span>Tier</span>
                        <select name="tier">
                            <option value="Bronze">Bronze</option>
                            <option value="Silver">Silver</option>
                            <option value="Gold">Gold</option>
                            <option value="Platinum">Platinum</option>
                        </select>
                    </label>
                    <label class="inventory-form-field">
                        <span>Credit Limit (LKR)</span>
                        <input type="number" name="creditLimit" min="0" step="100" placeholder="0">
                    </label>
                    <div class="inventory-form-actions">
                        <button type="button" class="btn btn-secondary compact" id="cancelAddCustomerBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary compact">Add Customer</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const close = () => this.closeAddCustomerModal();
        modal.querySelector(".inventory-modal-close")?.addEventListener("click", close);
        modal.querySelector("#cancelAddCustomerBtn")?.addEventListener("click", close);
        modal.addEventListener("click", (ev) => {
            if (ev.target === modal) close();
        });

        const form = modal.querySelector("#addCustomerForm");
        form?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            this.createCustomerFromForm(form);
        });
    }

    closeAddCustomerModal() {
        const modal = document.getElementById("addCustomerModal");
        if (modal) modal.remove();
    }

    createCustomerFromForm(form) {
        const formData = new FormData(form);
        const name = String(formData.get("name") || "").trim();
        const phone = String(formData.get("phone") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const address = String(formData.get("address") || "").trim();
        const tier = String(formData.get("tier") || "Bronze");
        const creditLimit = Number(formData.get("creditLimit") || 0);

        if (!name || !phone) {
            this.showNotification("Please fill required fields (Name and Phone).", "warning");
            return;
        }

        // Validate phone number format (basic validation)
        if (!phone.match(/^\+?[0-9\s\-\(\)]+$/)) {
            this.showNotification("Please enter a valid phone number.", "warning");
            return;
        }

        // Create new customer
        const newCustomer = {
            id: Math.max(...this.customers.map(c => c.id)) + 1,
            name: name,
            phone: phone,
            email: email || "",
            address: address || "",
            tier: tier,
            loyaltyPoints: 0,
            creditUsed: 0,
            creditLimit: creditLimit,
            memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            totalPurchases: 0
        };

        // Add to customers array
        this.customers.push(newCustomer);

        // Save to localStorage
        this.saveCustomersToStorage();

        // Close modal
        this.closeAddCustomerModal();

        // Show success notification
        this.showNotification(`Customer "${name}" added successfully!`, "success");

        // Refresh the customers page to show the new customer
        this.renderCustomers();
    }

    renderPurchasing() {
        const container = document.getElementById("dashboard_container");
        
        // Ensure global reference is available
        window.pharmacyPOS = this;
        
        // Initialize purchase orders data
        this.loadPurchaseOrders();
        this.loadSuppliers();
        this.currentPurchasingTab = 'orders';
        this.purchaseOrdersSearchQuery = '';

        container.innerHTML = `
            <div class="dashboard">
                <!-- Purchase Order Statistics -->
                <div class="inventory-stats" style="display: flex; gap: 1rem; margin-bottom: 1rem; padding-top: 4px;">
                    <div class="stat-card compact total" style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background: #fff; border-radius: 0.5rem; border: 1px solid var(--border-color, #e5e7eb); flex: 1;">
                        <div class="stat-icon" aria-hidden="true" style="font-size: 1.25rem; background: #e0f2fe; color: #0284c7; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">📦</div>
                        <div class="stat-content">
                            <h3 style="margin: 0; font-size: 0.75rem; color: #64748b; font-weight: 500;">Total Orders</h3>
                            <p class="stat-value" id="totalOrdersCount" style="margin: 0.1rem 0 0; font-size: 1.25rem; font-weight: 600; color: #1e293b;">0</p>
                            <span class="text-muted text-xs" style="font-size: 0.65rem; color: #94a3b8;">All time</span>
                        </div>
                    </div>
                    <div class="stat-card compact warning" style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background: #fff; border-radius: 0.5rem; border: 1px solid var(--border-color, #e5e7eb); flex: 1;">
                        <div class="stat-icon" aria-hidden="true" style="font-size: 1.25rem; background: #fef3c7; color: #d97706; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">⏳</div>
                        <div class="stat-content">
                            <h3 style="margin: 0; font-size: 0.75rem; color: #64748b; font-weight: 500;">Pending</h3>
                            <p class="stat-value" id="pendingOrdersCount" style="margin: 0.1rem 0 0; font-size: 1.25rem; font-weight: 600; color: #1e293b;">0</p>
                            <span class="text-muted text-xs" style="font-size: 0.65rem; color: #94a3b8;">Awaiting delivery</span>
                        </div>
                    </div>
                    <div class="stat-card compact info" style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background: #fff; border-radius: 0.5rem; border: 1px solid var(--border-color, #e5e7eb); flex: 1;">
                        <div class="stat-icon" aria-hidden="true" style="font-size: 1.25rem; background: #dbeafe; color: #2563eb; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">🏢</div>
                        <div class="stat-content">
                            <h3 style="margin: 0; font-size: 0.75rem; color: #64748b; font-weight: 500;">Active Suppliers</h3>
                            <p class="stat-value" id="activeSuppliersCount" style="margin: 0.1rem 0 0; font-size: 1.25rem; font-weight: 600; color: #1e293b;">0</p>
                            <span class="text-muted text-xs" id="totalSuppliersText" style="font-size: 0.65rem; color: #94a3b8;">0 total</span>
                        </div>
                    </div>
                    <div class="stat-card compact success" style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background: #fff; border-radius: 0.5rem; border: 1px solid var(--border-color, #e5e7eb); flex: 1;">
                        <div class="stat-icon" aria-hidden="true" style="font-size: 1.25rem; background: #dcfce7; color: #16a34a; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">✅</div>
                        <div class="stat-content">
                            <h3 style="margin: 0; font-size: 0.75rem; color: #64748b; font-weight: 500;">Received</h3>
                            <p class="stat-value" id="receivedOrdersCount" style="margin: 0.1rem 0 0; font-size: 1.25rem; font-weight: 600; color: #1e293b;">0</p>
                            <span class="text-muted text-xs" style="font-size: 0.65rem; color: #94a3b8;">Completed</span>
                        </div>
                    </div>
                </div>
                
                <!-- Controls Section -->
                <div class="inventory-controls compact" style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.5rem; width: 100%; background: #ffffff; padding: 0.5rem 0.75rem; border-radius: 0.5rem; border: 1px solid var(--border-color, #e5e7eb); box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                    <!-- Segmented Tabs -->
                    <div style="display: flex; align-items: center; flex: 1;">
                        <div style="display: flex; background: #f1f5f9; padding: 2px; border-radius: 6px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); width: max-content;">
                            <button id="ordersTabBtn" style="padding: 4px 12px; border: none; background: #fff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-weight: 600; font-size: 0.65rem; color: #0f172a; cursor: pointer; transition: all 0.2s ease;">Orders</button>
                            <button id="grnTabBtn" style="padding: 4px 12px; border: none; background: transparent; font-weight: 500; font-size: 0.65rem; color: #64748b; cursor: pointer; transition: all 0.2s ease;">GRN</button>
                            <button id="suppliersTabBtn" style="padding: 4px 12px; border: none; background: transparent; font-weight: 500; font-size: 0.65rem; color: #64748b; cursor: pointer; transition: all 0.2s ease;">Suppliers</button>
                        </div>
                    </div>
                    
                    <!-- Search & Action -->
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="position: relative; width: 160px;">
                            <span style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 0.65rem; color: #94a3b8; pointer-events: none;">🔍</span>
                            <input
                                id="purchaseOrdersSearchInput"
                                type="text"
                                placeholder="Search orders..."
                                style="width: 100%; padding: 4px 8px 4px 22px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.65rem; outline: none; color: #334155; box-sizing: border-box; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);"
                                onfocus="this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, 0.1)'"
                                onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='0 1px 2px rgba(0,0,0,0.02)'"
                            >
                        </div>
                        <button id="newPurchaseOrderBtn" style="padding: 4px 10px; font-size: 0.65rem; border-radius: 6px; background: linear-gradient(to bottom, #22c55e, #16a34a); border: 1px solid #14532d; border-top-color: #166534; border-bottom-color: #052e16; color: white; font-weight: 600; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2); display: flex; align-items: center; gap: 4px; transition: all 0.2s ease;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='brightness(1)'">
                            <span style="font-size: 0.6rem;">➕</span> New Purchase Order
                        </button>
                    </div>
                </div>
                
                <!-- Content Area -->
                <div class="inventory-content compact" style="margin-top: 0.5rem;">
                    <div id="purchasingContentArea">
                        <!-- Dynamic content will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        // Initialize purchasing functionality
        setTimeout(() => {
            // Ensure global reference is set again
            window.pharmacyPOS = this;
            this.initializePurchasingHandlers();
            this.updatePurchasingStats();
            this.renderPurchasingContent();
        }, 100);
    }

    // Purchase Orders Data Management
    loadPurchaseOrders() {
        const savedOrders = localStorage.getItem('pharmacy_pos_purchase_orders');
        this.purchaseOrders = savedOrders ? JSON.parse(savedOrders) : [];
    }

    savePurchaseOrders() {
        localStorage.setItem('pharmacy_pos_purchase_orders', JSON.stringify(this.purchaseOrders));
    }

    loadSuppliers() {
        const savedSuppliers = localStorage.getItem('pharmacy_pos_suppliers');
        this.suppliers = savedSuppliers ? JSON.parse(savedSuppliers) : [
            { id: 1, name: 'MediSupply Ltd', email: 'info@medisupply.lk', phone: '0112-345678', address: 'Colombo 01', status: 'active' },
            { id: 2, name: 'PharmaDistributors', email: 'orders@pharmadist.lk', phone: '0112-987654', address: 'Kandy', status: 'active' },
            { id: 3, name: 'GlobalHealth Supplies', email: 'contact@globalhealth.lk', phone: '0112-456789', address: 'Galle', status: 'active' }
        ];
    }

    saveSuppliers() {
        localStorage.setItem('pharmacy_pos_suppliers', JSON.stringify(this.suppliers));
    }

    // Purchasing Handlers Initialization
    initializePurchasingHandlers() {
        const ordersTabBtn = document.getElementById('ordersTabBtn');
        const grnTabBtn = document.getElementById('grnTabBtn');
        const suppliersTabBtn = document.getElementById('suppliersTabBtn');
        const newPurchaseOrderBtn = document.getElementById('newPurchaseOrderBtn');
        const searchInput = document.getElementById('purchaseOrdersSearchInput');

        ordersTabBtn?.addEventListener('click', () => this.switchPurchasingTab('orders'));
        grnTabBtn?.addEventListener('click', () => this.switchPurchasingTab('grn'));
        suppliersTabBtn?.addEventListener('click', () => this.switchPurchasingTab('suppliers'));
        newPurchaseOrderBtn?.addEventListener('click', () => this.openNewPurchaseOrderModal());
        
        // Add search input event listener with proper debouncing
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                this.purchaseOrdersSearchQuery = query;
                this.renderPurchasingContent();
            });
            
            // Also handle keyup for better responsiveness
            searchInput.addEventListener('keyup', (e) => {
                const query = e.target.value.toLowerCase().trim();
                this.purchaseOrdersSearchQuery = query;
                this.renderPurchasingContent();
            });
        }
    }

    // Tab Switching
    switchPurchasingTab(tab) {
        this.currentPurchasingTab = tab;
        
        // Update tab styles
        const tabs = ['ordersTabBtn', 'grnTabBtn', 'suppliersTabBtn'];
        tabs.forEach(tabId => {
            const btn = document.getElementById(tabId);
            if (btn) {
                if (tabId === `${tab}TabBtn`) {
                    btn.style.background = '#fff';
                    btn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    btn.style.fontWeight = '600';
                    btn.style.color = '#0f172a';
                } else {
                    btn.style.background = 'transparent';
                    btn.style.boxShadow = 'none';
                    btn.style.fontWeight = '500';
                    btn.style.color = '#64748b';
                }
            }
        });

        // Update search placeholder
        const searchInput = document.getElementById('purchaseOrdersSearchInput');
        if (searchInput) {
            const placeholders = {
                orders: 'Search orders...',
                grn: 'Search GRN...',
                suppliers: 'Search suppliers...'
            };
            searchInput.placeholder = placeholders[this.currentPurchasingTab] || 'Search...';
        }

        this.renderPurchasingContent();
    }

    // Update Statistics
    updatePurchasingStats() {
        const totalOrders = this.purchaseOrders.length;
        const pendingOrders = this.purchaseOrders.filter(order => order.status === 'pending').length;
        const receivedOrders = this.purchaseOrders.filter(order => order.status === 'received').length;
        const activeSuppliers = this.suppliers.filter(supplier => supplier.status === 'active').length;

        // Update DOM elements
        const totalOrdersEl = document.getElementById('totalOrdersCount');
        const pendingOrdersEl = document.getElementById('pendingOrdersCount');
        const receivedOrdersEl = document.getElementById('receivedOrdersCount');
        const activeSuppliersEl = document.getElementById('activeSuppliersCount');
        const totalSuppliersText = document.getElementById('totalSuppliersText');

        if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
        if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
        if (receivedOrdersEl) receivedOrdersEl.textContent = receivedOrders;
        if (activeSuppliersEl) activeSuppliersEl.textContent = activeSuppliers;
        if (totalSuppliersText) totalSuppliersText.textContent = `${this.suppliers.length} total`;
    }

    // Render Content Based on Active Tab
    renderPurchasingContent() {
        const contentArea = document.getElementById('purchasingContentArea');
        if (!contentArea) return;

        switch (this.currentPurchasingTab) {
            case 'orders':
                this.renderOrdersTab(contentArea);
                break;
            case 'grn':
                this.renderGRNTab(contentArea);
                break;
            case 'suppliers':
                this.renderSuppliersTab(contentArea);
                break;
        }
    }

    // Orders Tab
    renderOrdersTab(container) {
        const filteredOrders = this.getFilteredPurchaseOrders();
        
        container.innerHTML = `
            <div class="cart-table-container inventory-table-container compact" style="background: #ffffff; border: 1px solid var(--border-color, #e5e7eb); border-radius: 0.375rem; overflow: hidden;">
                <table class="cart-table compact" style="width: 100%; text-align: left; border-collapse: collapse;">
                    <thead style="background: #f8fafc; border-bottom: 1px solid var(--border-color, #e5e7eb);">
                        <tr>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 100px;">Order No.</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 150px;">Supplier</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 100px;">Date</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 100px; text-align: right;">Total (LKR)</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 100px;">Status</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 80px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredOrders.length === 0 ? `
                            <tr class="cart-empty-row">
                                <td colspan="6" class="cart-empty" style="text-align: center; padding: 2rem 1rem;">
                                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                        <div style="font-size: 2rem; margin-bottom: 0.5rem; color: #cbd5e1;">🛒</div>
                                        <p style="font-size: 0.875rem; color: #64748b; font-weight: 500; margin: 0;">No purchase orders found</p>
                                    </div>
                                </td>
                            </tr>
                        ` : filteredOrders.map(order => this.renderPurchaseOrderRow(order)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderPurchaseOrderRow(order) {
        const statusBadge = this.getStatusBadge(order.status);
        const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        return `
            <tr class="cart-row" style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.75rem; font-size: 0.75rem; font-weight: 600; color: #1e293b;">${order.orderNumber}</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; color: #475569;">${order.supplierName}</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; color: #64748b;">${orderDate}</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; text-align: right; font-weight: 600; color: #0f172a;">${this.formatLKR(order.totalAmount)}</td>
                <td style="padding: 0.75rem;">${statusBadge}</td>
                <td style="padding: 0.75rem;">
                    <div style="display: flex; gap: 0.25rem;">
                        <button onclick="pharmacyPOS.viewPurchaseOrder('${order.id}')" style="padding: 2px 6px; font-size: 0.65rem; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 4px; cursor: pointer; color: #475569;" title="View">👁</button>
                        <button onclick="pharmacyPOS.editPurchaseOrder('${order.id}')" style="padding: 2px 6px; font-size: 0.65rem; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 4px; cursor: pointer; color: #475569;" title="Edit">✏️</button>
                        ${order.status === 'pending' ? `
                            <button onclick="pharmacyPOS.receivePurchaseOrder('${order.id}')" style="padding: 2px 6px; font-size: 0.65rem; border: 1px solid #22c55e; background: #dcfce7; border-radius: 4px; cursor: pointer; color: #16a34a;" title="Receive">✓</button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }

    getStatusBadge(status) {
        const badges = {
            pending: '<span style="padding: 2px 8px; font-size: 0.65rem; background: #fef3c7; color: #d97706; border-radius: 12px; font-weight: 500;">⏳ Pending</span>',
            received: '<span style="padding: 2px 8px; font-size: 0.65rem; background: #dcfce7; color: #16a34a; border-radius: 12px; font-weight: 500;">✅ Received</span>',
            cancelled: '<span style="padding: 2px 8px; font-size: 0.65rem; background: #fee2e2; color: #dc2626; border-radius: 12px; font-weight: 500;">❌ Cancelled</span>'
        };
        return badges[status] || badges.pending;
    }

    // GRN Tab
    renderGRNTab(container) {
        const grnOrders = this.purchaseOrders.filter(order => order.status === 'received');
        
        container.innerHTML = `
            <div class="cart-table-container inventory-table-container compact" style="background: #ffffff; border: 1px solid var(--border-color, #e5e7eb); border-radius: 0.375rem; overflow: hidden;">
                <table class="cart-table compact" style="width: 100%; text-align: left; border-collapse: collapse;">
                    <thead style="background: #f8fafc; border-bottom: 1px solid var(--border-color, #e5e7eb);">
                        <tr>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase;">GRN No.</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Order No.</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Supplier</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Received Date</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Items</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; text-align: right;">Value (LKR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${grnOrders.length === 0 ? `
                            <tr class="cart-empty-row">
                                <td colspan="6" class="cart-empty" style="text-align: center; padding: 2rem 1rem;">
                                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                        <div style="font-size: 2rem; margin-bottom: 0.5rem; color: #cbd5e1;">📋</div>
                                        <p style="font-size: 0.875rem; color: #64748b; font-weight: 500; margin: 0;">No GRN records found</p>
                                    </div>
                                </td>
                            </tr>
                        ` : grnOrders.map(order => this.renderGRNRow(order)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderGRNRow(order) {
        const receivedDate = new Date(order.receivedDate || order.orderDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        return `
            <tr class="cart-row" style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.75rem; font-size: 0.75rem; font-weight: 600; color: #1e293b;">GRN-${order.orderNumber.split('-')[1]}</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; color: #475569;">${order.orderNumber}</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; color: #475569;">${order.supplierName}</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; color: #64748b;">${receivedDate}</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; color: #64748b;">${order.items ? order.items.length : 0} items</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; text-align: right; font-weight: 600; color: #0f172a;">${this.formatLKR(order.totalAmount)}</td>
            </tr>
        `;
    }

    // Suppliers Tab
    renderSuppliersTab(container) {
        const filteredSuppliers = this.getFilteredSuppliers();
        
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h3 style="margin: 0; font-size: 0.875rem; color: #1e293b; font-weight: 600;">🏢 Supplier Management</h3>
                <button id="addSupplierBtn" style="padding: 4px 10px; font-size: 0.65rem; border-radius: 6px; background: linear-gradient(to bottom, #3b82f6, #2563eb); border: 1px solid #1e40af; color: white; font-weight: 600; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 4px; transition: all 0.2s ease;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='brightness(1)'">
                    <span>➕</span> Add Supplier
                </button>
            </div>
            <div class="cart-table-container inventory-table-container compact" style="background: #ffffff; border: 1px solid var(--border-color, #e5e7eb); border-radius: 0.375rem; overflow: hidden;">
                <table class="cart-table compact" style="width: 100%; text-align: left; border-collapse: collapse;">
                    <thead style="background: #f8fafc; border-bottom: 1px solid var(--border-color, #e5e7eb);">
                        <tr>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 180px;">Supplier Details</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 150px;">Contact Information</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 120px;">Location</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 100px;">Payment Terms</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 80px;">Status</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 80px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredSuppliers.length === 0 ? `
                            <tr class="cart-empty-row">
                                <td colspan="6" class="cart-empty" style="text-align: center; padding: 2rem 1rem;">
                                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                        <div style="font-size: 2rem; margin-bottom: 0.5rem; color: #cbd5e1;">🏢</div>
                                        <p style="font-size: 0.875rem; color: #64748b; font-weight: 500; margin: 0;">No suppliers found</p>
                                        <p style="font-size: 0.75rem; color: #94a3b8; margin: 0.25rem 0 0;">Click "Add Supplier" to create your first supplier</p>
                                    </div>
                                </td>
                            </tr>
                        ` : filteredSuppliers.map(supplier => this.renderSupplierRow(supplier)).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Add event listener for the Add Supplier button
        const addSupplierBtn = container.querySelector('#addSupplierBtn');
        if (addSupplierBtn) {
            addSupplierBtn.addEventListener('click', () => this.openAddSupplierModal());
        }

        // Add event listeners for supplier action buttons
        filteredSuppliers.forEach(supplier => {
            const viewBtn = container.querySelector(`#view-${supplier.id}`);
            const editBtn = container.querySelector(`#edit-${supplier.id}`);
            const toggleBtn = container.querySelector(`#toggle-${supplier.id}`);
            const deleteBtn = container.querySelector(`#delete-${supplier.id}`);

            if (viewBtn) viewBtn.addEventListener('click', () => this.viewSupplier(supplier.id));
            if (editBtn) editBtn.addEventListener('click', () => this.editSupplier(supplier.id));
            if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggleSupplierStatus(supplier.id));
            if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteSupplier(supplier.id));
        });
    }

    renderSupplierRow(supplier) {
        const statusBadge = supplier.status === 'active' 
            ? '<span style="padding: 2px 8px; font-size: 0.6rem; background: #dcfce7; color: #16a34a; border-radius: 12px; font-weight: 500;">✅ Active</span>'
            : '<span style="padding: 2px 8px; font-size: 0.6rem; background: #fee2e2; color: #dc2626; border-radius: 12px; font-weight: 500;">❌ Inactive</span>';

        const paymentTermsMap = {
            'COD': 'Cash on Delivery',
            '7days': '7 Days',
            '14days': '14 Days', 
            '30days': '30 Days',
            '60days': '60 Days',
            '90days': '90 Days'
        };

        return `
            <tr class="cart-row" style="border-bottom: 1px solid #f1f5f9; transition: background-color 0.2s ease;" onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor='transparent'">
                <td style="padding: 0.75rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <div style="font-weight: 600; color: #1e293b; font-size: 0.75rem;">${supplier.name}</div>
                        ${supplier.registration ? `<div style="font-size: 0.65rem; color: #64748b;">Reg: ${supplier.registration}</div>` : ''}
                        ${supplier.contactPerson ? `<div style="font-size: 0.65rem; color: #64748b;">👤 ${supplier.contactPerson}${supplier.designation ? ` - ${supplier.designation}` : ''}</div>` : ''}
                    </div>
                </td>
                <td style="padding: 0.75rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <div style="font-size: 0.7rem; color: #475569;">📧 ${supplier.email}</div>
                        <div style="font-size: 0.7rem; color: #64748b;">📱 ${supplier.phone}</div>
                        ${supplier.mobile ? `<div style="font-size: 0.65rem; color: #64748b;">📞 ${supplier.mobile}</div>` : ''}
                        ${supplier.fax ? `<div style="font-size: 0.65rem; color: #64748b;">📠 ${supplier.fax}</div>` : ''}
                    </div>
                </td>
                <td style="padding: 0.75rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <div style="font-size: 0.7rem; color: #475569; font-weight: 500;">📍 ${supplier.city}</div>
                        <div style="font-size: 0.65rem; color: #64748b;">${supplier.address}</div>
                        ${supplier.postalCode ? `<div style="font-size: 0.65rem; color: #64748b;">${supplier.postalCode}, ${supplier.country || 'Sri Lanka'}</div>` : ''}
                    </div>
                </td>
                <td style="padding: 0.75rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <div style="font-size: 0.7rem; color: #475569; font-weight: 500;">${paymentTermsMap[supplier.paymentTerms] || supplier.paymentTerms}</div>
                        ${supplier.creditLimit ? `<div style="font-size: 0.65rem; color: #64748b;">Limit: ${this.formatLKR(supplier.creditLimit)}</div>` : ''}
                    </div>
                </td>
                <td style="padding: 0.75rem;">${statusBadge}</td>
                <td style="padding: 0.75rem;">
                    <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
                        <button id="view-${supplier.id}" style="padding: 3px 6px; font-size: 0.6rem; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 4px; cursor: pointer; color: #475569; transition: all 0.2s ease;" onmouseover="this.style.background='#e2e8f0'; this.style.color='#1e293b'" onmouseout="this.style.background='#f8fafc'; this.style.color='#475569'" title="View Details">👁</button>
                        <button id="edit-${supplier.id}" style="padding: 3px 6px; font-size: 0.6rem; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 4px; cursor: pointer; color: #475569; transition: all 0.2s ease;" onmouseover="this.style.background='#e2e8f0'; this.style.color='#1e293b'" onmouseout="this.style.background='#f8fafc'; this.style.color='#475569'" title="Edit Supplier">✏️</button>
                        <button id="toggle-${supplier.id}" style="padding: 3px 6px; font-size: 0.6rem; border: 1px solid ${supplier.status === 'active' ? '#fbbf24' : '#22c55e'}; background: ${supplier.status === 'active' ? '#fef3c7' : '#dcfce7'}; border-radius: 4px; cursor: pointer; color: ${supplier.status === 'active' ? '#d97706' : '#16a34a'}; transition: all 0.2s ease;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='brightness(1)'" title="${supplier.status === 'active' ? 'Deactivate' : 'Activate'}">🔄</button>
                        <button id="delete-${supplier.id}" style="padding: 3px 6px; font-size: 0.6rem; border: 1px solid #fca5a5; background: #fee2e2; border-radius: 4px; cursor: pointer; color: #dc2626; transition: all 0.2s ease;" onmouseover="this.style.background='#fecaca'; this.style.color='#b91c1c'" onmouseout="this.style.background='#fee2e2'; this.style.color='#dc2626'" title="Delete Supplier">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }

    // Filter Methods
    getFilteredPurchaseOrders() {
        if (!this.purchaseOrdersSearchQuery || this.purchaseOrdersSearchQuery.trim() === '') {
            return this.purchaseOrders;
        }
        
        const query = this.purchaseOrdersSearchQuery.toLowerCase().trim();
        return this.purchaseOrders.filter(order => 
            (order.orderNumber && order.orderNumber.toLowerCase().includes(query)) ||
            (order.supplierName && order.supplierName.toLowerCase().includes(query)) ||
            (order.status && order.status.toLowerCase().includes(query))
        );
    }

    getFilteredSuppliers() {
        if (!this.purchaseOrdersSearchQuery || this.purchaseOrdersSearchQuery.trim() === '') {
            return this.suppliers;
        }
        
        const query = this.purchaseOrdersSearchQuery.toLowerCase().trim();
        return this.suppliers.filter(supplier => 
            (supplier.name && supplier.name.toLowerCase().includes(query)) ||
            (supplier.email && supplier.email.toLowerCase().includes(query)) ||
            (supplier.phone && supplier.phone.includes(query)) ||
            (supplier.address && supplier.address.toLowerCase().includes(query)) ||
            (supplier.city && supplier.city.toLowerCase().includes(query)) ||
            (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(query))
        );
    }

    // Purchase Order Modal
    openNewPurchaseOrderModal() {
        if (document.getElementById('purchaseOrderModal')) return;

        const modal = document.createElement('div');
        modal.id = 'purchaseOrderModal';
        modal.className = 'inventory-modal-overlay';
        modal.innerHTML = `
            <div class="inventory-modal" style="max-width: 800px; max-height: 90vh; overflow-y: auto;" role="dialog" aria-modal="true" aria-labelledby="purchaseOrderTitle">
                <div class="inventory-modal-header">
                    <h3 id="purchaseOrderTitle">New Purchase Order</h3>
                    <button type="button" class="inventory-modal-close" aria-label="Close purchase order form">×</button>
                </div>
                <form id="purchaseOrderForm" class="inventory-form-grid">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <label class="inventory-form-field">
                            <span>Supplier *</span>
                            <select name="supplierId" required style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.875rem;">
                                <option value="">Select Supplier</option>
                                ${this.suppliers.filter(s => s.status === 'active').map(s => 
                                    `<option value="${s.id}">${s.name}</option>`
                                ).join('')}
                            </select>
                        </label>
                        <label class="inventory-form-field">
                            <span>Order Date *</span>
                            <input type="date" name="orderDate" required style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.875rem;">
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #374151; font-weight: 600;">Order Items</h4>
                        <div id="purchaseOrderItems" style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.75rem; background: #f9fafb;">
                            <div class="purchase-order-item" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 80px; gap: 0.5rem; margin-bottom: 0.5rem; align-items: end;">
                                <label class="inventory-form-field" style="margin: 0;">
                                    <span style="font-size: 0.75rem;">Item Name</span>
                                    <input type="text" name="itemName[]" placeholder="Medicine name" required style="width: 100%; padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 0.75rem;">
                                </label>
                                <label class="inventory-form-field" style="margin: 0;">
                                    <span style="font-size: 0.75rem;">Quantity</span>
                                    <input type="number" name="quantity[]" min="1" required style="width: 100%; padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 0.75rem;">
                                </label>
                                <label class="inventory-form-field" style="margin: 0;">
                                    <span style="font-size: 0.75rem;">Unit Cost</span>
                                    <input type="number" name="unitCost[]" min="0" step="0.01" required style="width: 100%; padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 0.75rem;">
                                </label>
                                <label class="inventory-form-field" style="margin: 0;">
                                    <span style="font-size: 0.75rem;">Batch</span>
                                    <input type="text" name="batch[]" placeholder="Batch no" required style="width: 100%; padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 0.75rem;">
                                </label>
                                <button type="button" onclick="this.parentElement.remove()" style="padding: 6px; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Remove</button>
                            </div>
                        </div>
                        <button type="button" onclick="pharmacyPOS.addPurchaseOrderItem()" style="margin-top: 0.5rem; padding: 6px 12px; background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; border-radius: 4px; cursor: pointer; font-size: 0.75rem; font-weight: 500;">+ Add Item</button>
                    </div>
                    
                    <div class="inventory-form-actions">
                        <button type="button" class="btn btn-secondary compact" id="cancelPurchaseOrderBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary compact">Create Purchase Order</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const close = () => this.closePurchaseOrderModal();
        modal.querySelector('.inventory-modal-close')?.addEventListener('click', close);
        modal.querySelector('#cancelPurchaseOrderBtn')?.addEventListener('click', close);
        modal.addEventListener('click', (ev) => {
            if (ev.target === modal) close();
        });

        const form = modal.querySelector('#purchaseOrderForm');
        form?.addEventListener('submit', (ev) => {
            ev.preventDefault();
            this.createPurchaseOrderFromForm(form);
        });

        // Set today's date as default
        const orderDateInput = modal.querySelector('input[name="orderDate"]');
        if (orderDateInput) {
            orderDateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    addPurchaseOrderItem() {
        const itemsContainer = document.getElementById('purchaseOrderItems');
        if (!itemsContainer) return;

        const newItem = document.createElement('div');
        newItem.className = 'purchase-order-item';
        newItem.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 80px; gap: 0.5rem; margin-bottom: 0.5rem; align-items: end;';
        newItem.innerHTML = `
            <label class="inventory-form-field" style="margin: 0;">
                <span style="font-size: 0.75rem;">Item Name</span>
                <input type="text" name="itemName[]" placeholder="Medicine name" required style="width: 100%; padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 0.75rem;">
            </label>
            <label class="inventory-form-field" style="margin: 0;">
                <span style="font-size: 0.75rem;">Quantity</span>
                <input type="number" name="quantity[]" min="1" required style="width: 100%; padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 0.75rem;">
            </label>
            <label class="inventory-form-field" style="margin: 0;">
                <span style="font-size: 0.75rem;">Unit Cost</span>
                <input type="number" name="unitCost[]" min="0" step="0.01" required style="width: 100%; padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 0.75rem;">
            </label>
            <label class="inventory-form-field" style="margin: 0;">
                <span style="font-size: 0.75rem;">Batch</span>
                <input type="text" name="batch[]" placeholder="Batch no" required style="width: 100%; padding: 6px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 0.75rem;">
            </label>
            <button type="button" onclick="this.parentElement.remove()" style="padding: 6px; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Remove</button>
        `;

        itemsContainer.appendChild(newItem);
    }

    closePurchaseOrderModal() {
        const modal = document.getElementById('purchaseOrderModal');
        if (modal) modal.remove();
    }

    createPurchaseOrderFromForm(form) {
        const formData = new FormData(form);
        const supplierId = formData.get('supplierId');
        const orderDate = formData.get('orderDate');

        if (!supplierId || !orderDate) {
            this.showNotification('Please fill all required fields', 'warning');
            return;
        }

        // Get items
        const itemNames = formData.getAll('itemName[]');
        const quantities = formData.getAll('quantity[]');
        const unitCosts = formData.getAll('unitCost[]');
        const batches = formData.getAll('batch[]');

        if (itemNames.length === 0) {
            this.showNotification('Please add at least one item', 'warning');
            return;
        }

        const supplier = this.suppliers.find(s => s.id == supplierId);
        if (!supplier) {
            this.showNotification('Invalid supplier selected', 'warning');
            return;
        }

        // Create items array
        const items = [];
        let totalAmount = 0;

        for (let i = 0; i < itemNames.length; i++) {
            const quantity = Number(quantities[i]) || 0;
            const unitCost = Number(unitCosts[i]) || 0;
            const itemTotal = quantity * unitCost;
            
            items.push({
                name: itemNames[i],
                quantity,
                unitCost,
                batch: batches[i],
                total: itemTotal
            });
            
            totalAmount += itemTotal;
        }

        // Generate order number
        const orderNumber = `PO-${Date.now().toString().slice(-6)}`;

        // Create purchase order
        const newOrder = {
            id: Date.now().toString(),
            orderNumber,
            supplierId: supplier.id,
            supplierName: supplier.name,
            orderDate,
            items,
            totalAmount,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Add to purchase orders
        this.purchaseOrders.unshift(newOrder);
        this.savePurchaseOrders();

        // Update UI
        this.updatePurchasingStats();
        this.renderPurchasingContent();
        this.closePurchaseOrderModal();
        
        this.showNotification(`Purchase Order ${orderNumber} created successfully!`, 'success');
    }

    // Purchase Order Actions
    viewPurchaseOrder(orderId) {
        const order = this.purchaseOrders.find(o => o.id === orderId);
        if (!order) return;

        this.showNotification(`Viewing order ${order.orderNumber}`, 'info');
        // TODO: Implement detailed view modal
    }

    editPurchaseOrder(orderId) {
        const order = this.purchaseOrders.find(o => o.id === orderId);
        if (!order) return;

        if (order.status !== 'pending') {
            this.showNotification('Only pending orders can be edited', 'warning');
            return;
        }

        this.showNotification(`Editing order ${order.orderNumber}`, 'info');
        // TODO: Implement edit modal
    }

    receivePurchaseOrder(orderId) {
        const order = this.purchaseOrders.find(o => o.id === orderId);
        if (!order) return;

        if (order.status !== 'pending') {
            this.showNotification('Only pending orders can be received', 'warning');
            return;
        }

        // Update order status
        order.status = 'received';
        order.receivedDate = new Date().toISOString();
        
        this.savePurchaseOrders();
        this.updatePurchasingStats();
        this.renderPurchasingContent();
        
        this.showNotification(`Order ${order.orderNumber} received successfully!`, 'success');
    }

    // Supplier Management
    openAddSupplierModal() {
        if (document.getElementById('supplierModal')) return;

        const modal = document.createElement('div');
        modal.id = 'supplierModal';
        modal.className = 'inventory-modal-overlay';
        modal.innerHTML = `
            <div class="inventory-modal" style="max-width: 700px;" role="dialog" aria-modal="true" aria-labelledby="supplierTitle">
                <div class="inventory-modal-header">
                    <h3 id="supplierTitle">🏢 Add New Supplier</h3>
                    <button type="button" class="inventory-modal-close" aria-label="Close supplier form">×</button>
                </div>
                <form id="supplierForm" class="inventory-form-grid">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <label class="inventory-form-field">
                            <span>Supplier Name *</span>
                            <input type="text" name="name" required placeholder="e.g. MediSupply Ltd" style="font-size: 0.875rem;">
                        </label>
                        <label class="inventory-form-field">
                            <span>Company Registration</span>
                            <input type="text" name="registration" placeholder="e.g. PV-2023-1234" style="font-size: 0.875rem;">
                        </label>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <label class="inventory-form-field">
                            <span>Email *</span>
                            <input type="email" name="email" required placeholder="supplier@example.com" style="font-size: 0.875rem;">
                        </label>
                        <label class="inventory-form-field">
                            <span>Phone *</span>
                            <input type="tel" name="phone" required placeholder="0112-345678" style="font-size: 0.875rem;">
                        </label>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <label class="inventory-form-field">
                            <span>Mobile</span>
                            <input type="tel" name="mobile" placeholder="077-1234567" style="font-size: 0.875rem;">
                        </label>
                        <label class="inventory-form-field">
                            <span>Fax</span>
                            <input type="tel" name="fax" placeholder="0112-345679" style="font-size: 0.875rem;">
                        </label>
                    </div>
                    
                    <label class="inventory-form-field" style="margin-bottom: 1rem;">
                        <span>Address *</span>
                        <textarea name="address" required placeholder="123 Main Street, Colombo 01, Sri Lanka" rows="2" style="font-size: 0.875rem; resize: vertical; min-height: 60px;"></textarea>
                    </label>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <label class="inventory-form-field">
                            <span>City *</span>
                            <input type="text" name="city" required placeholder="Colombo" style="font-size: 0.875rem;">
                        </label>
                        <label class="inventory-form-field">
                            <span>Postal Code</span>
                            <input type="text" name="postalCode" placeholder="00100" style="font-size: 0.875rem;">
                        </label>
                        <label class="inventory-form-field">
                            <span>Country</span>
                            <input type="text" name="country" placeholder="Sri Lanka" style="font-size: 0.875rem;">
                        </label>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <label class="inventory-form-field">
                            <span>Contact Person</span>
                            <input type="text" name="contactPerson" placeholder="Mr. John Doe" style="font-size: 0.875rem;">
                        </label>
                        <label class="inventory-form-field">
                            <span>Designation</span>
                            <input type="text" name="designation" placeholder="Sales Manager" style="font-size: 0.875rem;">
                        </label>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <label class="inventory-form-field">
                            <span>Payment Terms</span>
                            <select name="paymentTerms" style="font-size: 0.875rem;">
                                <option value="COD">Cash on Delivery</option>
                                <option value="7days">7 Days</option>
                                <option value="14days">14 Days</option>
                                <option value="30days" selected>30 Days</option>
                                <option value="60days">60 Days</option>
                                <option value="90days">90 Days</option>
                            </select>
                        </label>
                        <label class="inventory-form-field">
                            <span>Credit Limit (LKR)</span>
                            <input type="number" name="creditLimit" min="0" step="1000" placeholder="500000" style="font-size: 0.875rem;">
                        </label>
                    </div>
                    
                    <label class="inventory-form-field" style="margin-bottom: 1rem;">
                        <span>Notes</span>
                        <textarea name="notes" placeholder="Additional notes about the supplier..." rows="2" style="font-size: 0.875rem; resize: vertical; min-height: 60px;"></textarea>
                    </label>
                    
                    <div class="inventory-form-actions">
                        <button type="button" class="btn btn-secondary compact" id="cancelSupplierBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary compact">🏢 Add Supplier</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const close = () => this.closeSupplierModal();
        modal.querySelector('.inventory-modal-close')?.addEventListener('click', close);
        modal.querySelector('#cancelSupplierBtn')?.addEventListener('click', close);
        modal.addEventListener('click', (ev) => {
            if (ev.target === modal) close();
        });

        const form = modal.querySelector('#supplierForm');
        form?.addEventListener('submit', (ev) => {
            ev.preventDefault();
            this.createSupplierFromForm(form);
        });
    }

    closeSupplierModal() {
        const modal = document.getElementById('supplierModal');
        if (modal) modal.remove();
    }

    createSupplierFromForm(form) {
        const formData = new FormData(form);
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const phone = String(formData.get('phone') || '').trim();
        const address = String(formData.get('address') || '').trim();
        const city = String(formData.get('city') || '').trim();

        if (!name || !email || !phone || !address || !city) {
            this.showNotification('Please fill all required fields', 'warning');
            return;
        }

        const newSupplier = {
            id: Date.now().toString(),
            name,
            registration: String(formData.get('registration') || '').trim(),
            email,
            phone,
            mobile: String(formData.get('mobile') || '').trim(),
            fax: String(formData.get('fax') || '').trim(),
            address,
            city,
            postalCode: String(formData.get('postalCode') || '').trim(),
            country: String(formData.get('country') || 'Sri Lanka').trim(),
            contactPerson: String(formData.get('contactPerson') || '').trim(),
            designation: String(formData.get('designation') || '').trim(),
            paymentTerms: String(formData.get('paymentTerms') || '30days').trim(),
            creditLimit: Number(formData.get('creditLimit')) || 0,
            notes: String(formData.get('notes') || '').trim(),
            status: 'active',
            createdAt: new Date().toISOString(),
            totalOrders: 0,
            totalPurchases: 0
        };

        this.suppliers.push(newSupplier);
        this.saveSuppliers();

        this.updatePurchasingStats();
        this.renderPurchasingContent();
        this.closeSupplierModal();
        
        this.showNotification(`🏢 Supplier "${name}" added successfully!`, 'success');
    }

    editSupplier(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (!supplier) return;

        this.openEditSupplierModal(supplier);
    }

    openEditSupplierModal(supplier) {
        if (document.getElementById('supplierModal')) return;

        const modal = document.createElement('div');
        modal.id = 'supplierModal';
        modal.className = 'inventory-modal-overlay';
        modal.innerHTML = `
            <div class="inventory-modal" style="max-width: 700px;" role="dialog" aria-modal="true" aria-labelledby="supplierTitle">
                <div class="inventory-modal-header">
                    <h3 id="supplierTitle">✏️ Edit Supplier</h3>
                    <button type="button" class="inventory-modal-close" aria-label="Close supplier form">×</button>
                </div>
                <form id="supplierForm" class="inventory-form-grid">
                    <input type="hidden" name="supplierId" value="${supplier.id}">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <label class="inventory-form-field">
                            <span>Supplier Name *</span>
                            <input type="text" name="name" required value="${supplier.name}" style="font-size: 0.875rem;">
                        </label>
                        <label class="inventory-form-field">
                            <span>Company Registration</span>
                            <input type="text" name="registration" value="${supplier.registration || ''}" placeholder="e.g. PV-2023-1234" style="font-size: 0.875rem;">
                        </label>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <label class="inventory-form-field">
                            <span>Email *</span>
                            <input type="email" name="email" required value="${supplier.email}" style="font-size: 0.875rem;">
                        </label>
                        <label class="inventory-form-field">
                            <span>Phone *</span>
                            <input type="tel" name="phone" required value="${supplier.phone}" style="font-size: 0.875rem;">
                        </label>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <label class="inventory-form-field">
                            <span>Mobile</span>
                            <input type="tel" name="mobile" value="${supplier.mobile || ''}" placeholder="077-1234567" style="font-size: 0.875rem;">
                        </label>
                        <label class="inventory-form-field">
                            <span>Fax</span>
                            <input type="tel" name="fax" value="${supplier.fax || ''}" placeholder="0112-345679" style="font-size: 0.875rem;">
                        </label>
                    </div>
                    
                    <label class="inventory-form-field" style="margin-bottom: 1rem;">
                        <span>Address *</span>
                        <textarea name="address" required style="font-size: 0.875rem; resize: vertical; min-height: 60px;">${supplier.address}</textarea>
                    </label>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <label class="inventory-form-field">
                            <span>City *</span>
                            <input type="text" name="city" required value="${supplier.city}" style="font-size: 0.875rem;">
                        </label>
                        <label class="inventory-form-field">
                            <span>Postal Code</span>
                            <input type="text" name="postalCode" value="${supplier.postalCode || ''}" placeholder="00100" style="font-size: 0.875rem;">
                        </label>
                        <label class="inventory-form-field">
                            <span>Country</span>
                            <input type="text" name="country" value="${supplier.country || 'Sri Lanka'}" style="font-size: 0.875rem;">
                        </label>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <label class="inventory-form-field">
                            <span>Contact Person</span>
                            <input type="text" name="contactPerson" value="${supplier.contactPerson || ''}" placeholder="Mr. John Doe" style="font-size: 0.875rem;">
                        </label>
                        <label class="inventory-form-field">
                            <span>Designation</span>
                            <input type="text" name="designation" value="${supplier.designation || ''}" placeholder="Sales Manager" style="font-size: 0.875rem;">
                        </label>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <label class="inventory-form-field">
                            <span>Payment Terms</span>
                            <select name="paymentTerms" style="font-size: 0.875rem;">
                                <option value="COD" ${supplier.paymentTerms === 'COD' ? 'selected' : ''}>Cash on Delivery</option>
                                <option value="7days" ${supplier.paymentTerms === '7days' ? 'selected' : ''}>7 Days</option>
                                <option value="14days" ${supplier.paymentTerms === '14days' ? 'selected' : ''}>14 Days</option>
                                <option value="30days" ${supplier.paymentTerms === '30days' ? 'selected' : ''}>30 Days</option>
                                <option value="60days" ${supplier.paymentTerms === '60days' ? 'selected' : ''}>60 Days</option>
                                <option value="90days" ${supplier.paymentTerms === '90days' ? 'selected' : ''}>90 Days</option>
                            </select>
                        </label>
                        <label class="inventory-form-field">
                            <span>Credit Limit (LKR)</span>
                            <input type="number" name="creditLimit" min="0" step="1000" value="${supplier.creditLimit || 0}" style="font-size: 0.875rem;">
                        </label>
                    </div>
                    
                    <label class="inventory-form-field" style="margin-bottom: 1rem;">
                        <span>Notes</span>
                        <textarea name="notes" style="font-size: 0.875rem; resize: vertical; min-height: 60px;">${supplier.notes || ''}</textarea>
                    </label>
                    
                    <div class="inventory-form-actions">
                        <button type="button" class="btn btn-secondary compact" id="cancelSupplierBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary compact">💾 Update Supplier</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const close = () => this.closeSupplierModal();
        modal.querySelector('.inventory-modal-close')?.addEventListener('click', close);
        modal.querySelector('#cancelSupplierBtn')?.addEventListener('click', close);
        modal.addEventListener('click', (ev) => {
            if (ev.target === modal) close();
        });

        const form = modal.querySelector('#supplierForm');
        form?.addEventListener('submit', (ev) => {
            ev.preventDefault();
            this.updateSupplierFromForm(form);
        });
    }

    updateSupplierFromForm(form) {
        const formData = new FormData(form);
        const supplierId = String(formData.get('supplierId') || '').trim();
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const phone = String(formData.get('phone') || '').trim();
        const address = String(formData.get('address') || '').trim();
        const city = String(formData.get('city') || '').trim();

        if (!supplierId || !name || !email || !phone || !address || !city) {
            this.showNotification('Please fill all required fields', 'warning');
            return;
        }

        const supplierIndex = this.suppliers.findIndex(s => s.id === supplierId);
        if (supplierIndex === -1) {
            this.showNotification('Supplier not found', 'error');
            return;
        }

        // Update supplier
        this.suppliers[supplierIndex] = {
            ...this.suppliers[supplierIndex],
            name,
            registration: String(formData.get('registration') || '').trim(),
            email,
            phone,
            mobile: String(formData.get('mobile') || '').trim(),
            fax: String(formData.get('fax') || '').trim(),
            address,
            city,
            postalCode: String(formData.get('postalCode') || '').trim(),
            country: String(formData.get('country') || 'Sri Lanka').trim(),
            contactPerson: String(formData.get('contactPerson') || '').trim(),
            designation: String(formData.get('designation') || '').trim(),
            paymentTerms: String(formData.get('paymentTerms') || '30days').trim(),
            creditLimit: Number(formData.get('creditLimit')) || 0,
            notes: String(formData.get('notes') || '').trim(),
            updatedAt: new Date().toISOString()
        };

        this.saveSuppliers();
        this.updatePurchasingStats();
        this.renderPurchasingContent();
        this.closeSupplierModal();
        
        this.showNotification(`✏️ Supplier "${name}" updated successfully!`, 'success');
    }

    viewSupplier(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (!supplier) return;

        const modal = document.createElement('div');
        modal.id = 'supplierViewModal';
        modal.className = 'inventory-modal-overlay';
        modal.innerHTML = `
            <div class="inventory-modal" style="max-width: 600px;" role="dialog" aria-modal="true" aria-labelledby="supplierViewTitle">
                <div class="inventory-modal-header">
                    <h3 id="supplierViewTitle">🏢 ${supplier.name}</h3>
                    <button type="button" class="inventory-modal-close" aria-label="Close supplier view">×</button>
                </div>
                <div style="padding: 1rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div style="padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <h4 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #374151; font-weight: 600;">📋 Company Details</h4>
                            <div style="font-size: 0.75rem; color: #6b7280; line-height: 1.5;">
                                ${supplier.registration ? `<div><strong>Registration:</strong> ${supplier.registration}</div>` : ''}
                                <div><strong>Status:</strong> ${supplier.status === 'active' ? '✅ Active' : '❌ Inactive'}</div>
                                <div><strong>Created:</strong> ${new Date(supplier.createdAt).toLocaleDateString()}</div>
                                ${supplier.updatedAt ? `<div><strong>Updated:</strong> ${new Date(supplier.updatedAt).toLocaleDateString()}</div>` : ''}
                            </div>
                        </div>
                        <div style="padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <h4 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #374151; font-weight: 600;">💰 Payment Info</h4>
                            <div style="font-size: 0.75rem; color: #6b7280; line-height: 1.5;">
                                <div><strong>Payment Terms:</strong> ${supplier.paymentTerms}</div>
                                <div><strong>Credit Limit:</strong> ${this.formatLKR(supplier.creditLimit || 0)}</div>
                                <div><strong>Total Orders:</strong> ${supplier.totalOrders || 0}</div>
                                <div><strong>Total Purchases:</strong> ${this.formatLKR(supplier.totalPurchases || 0)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 1rem;">
                        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #374151; font-weight: 600;">👤 Contact Person</h4>
                        <div style="font-size: 0.75rem; color: #6b7280; line-height: 1.5;">
                            ${supplier.contactPerson ? `<div><strong>Name:</strong> ${supplier.contactPerson}</div>` : '<div style="color: #9ca3af;">No contact person specified</div>'}
                            ${supplier.designation ? `<div><strong>Designation:</strong> ${supplier.designation}</div>` : ''}
                        </div>
                    </div>
                    
                    <div style="padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 1rem;">
                        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #374151; font-weight: 600;">📍 Address</h4>
                        <div style="font-size: 0.75rem; color: #6b7280; line-height: 1.5;">
                            <div>${supplier.address}</div>
                            <div>${supplier.city}${supplier.postalCode ? `, ${supplier.postalCode}` : ''}${supplier.country ? `, ${supplier.country}` : ''}</div>
                        </div>
                    </div>
                    
                    ${supplier.notes ? `
                    <div style="padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #374151; font-weight: 600;">📝 Notes</h4>
                        <div style="font-size: 0.75rem; color: #6b7280; line-height: 1.5;">${supplier.notes}</div>
                    </div>
                    ` : ''}
                    
                    <div class="inventory-form-actions" style="margin-top: 1rem;">
                        <button type="button" class="btn btn-secondary compact" onclick="pharmacyPOS.closeSupplierViewModal()">Close</button>
                        <button type="button" class="btn btn-primary compact" onclick="pharmacyPOS.openEditSupplierModal(pharmacyPOS.suppliers.find(s => s.id === '${supplier.id}'))">✏️ Edit Supplier</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const close = () => this.closeSupplierViewModal();
        modal.querySelector('.inventory-modal-close')?.addEventListener('click', close);
        modal.addEventListener('click', (ev) => {
            if (ev.target === modal) close();
        });
    }

    closeSupplierViewModal() {
        const modal = document.getElementById('supplierViewModal');
        if (modal) modal.remove();
    }

    deleteSupplier(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (!supplier) return;

        if (confirm(`Are you sure you want to delete supplier "${supplier.name}"? This action cannot be undone.`)) {
            const supplierIndex = this.suppliers.findIndex(s => s.id === supplierId);
            if (supplierIndex !== -1) {
                this.suppliers.splice(supplierIndex, 1);
                this.saveSuppliers();
                this.updatePurchasingStats();
                this.renderPurchasingContent();
                this.showNotification(`🗑️ Supplier "${supplier.name}" deleted successfully!`, 'success');
            }
        }
    }

    toggleSupplierStatus(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (!supplier) return;

        supplier.status = supplier.status === 'active' ? 'inactive' : 'active';
        this.saveSuppliers();
        this.updatePurchasingStats();
        this.renderPurchasingContent();
        
        const statusText = supplier.status === 'active' ? 'activated' : 'deactivated';
        this.showNotification(`Supplier "${supplier.name}" ${statusText}`, 'success');
    }

    cleanup() {
        // Clear auto-refresh interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Clean up charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
        
        // Clean up global dashboard reference
        if (window.dashboard === this) {
            delete window.dashboard;
        }
        
        // Clean up event listeners
        const menuLinks = document.querySelectorAll('.menu-link');
        menuLinks.forEach(link => {
            link.replaceWith(link.cloneNode(true));
        });
    }
}

PharmacyDashboard.template = "pharmacy_dashboard_layout";

registry.category("actions").add("pharmacy_dashboard_action", PharmacyDashboard);