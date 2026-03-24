/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component, onMounted, onWillUnmount } from "@odoo/owl";

class PharmacyDashboard extends Component {
    setup() {
        this.charts = {};
        this.refreshInterval = null;
        
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
                                <div class="chart-meta">
                                    <span class="meta-pill sales">Sales LKR 47.6K</span>
                                    <span class="meta-pill profit">Profit LKR 12.9K</span>
                                </div>
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
                                <div class="chart-meta">
                                    <span class="meta-pill neutral">5 active categories</span>
                                </div>
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
        this.initializeWeeklyChart('both');
        this.initializeCategoryChart();
    }

    initializeWeeklyChart(filter = 'both') {
        const canvas = document.getElementById('weeklyChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Mon-Sun weekly area chart sample data
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const salesData = [41200, 43800, 42100, 46700, 45200, 48900, 47600];
        const profitData = [9800, 11200, 10100, 12600, 11900, 13800, 12900];

        // Simple line chart drawing (without Chart.js library)
        this.drawSimpleLineChart(ctx, canvas, labels, salesData, profitData, filter);
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

    prepareCanvas(ctx, canvas) {
        const width = Math.max(canvas.offsetWidth || 300, 300);
        const height = Math.max(canvas.offsetHeight || 200, 200);
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { width, height };
    }

    drawSimpleLineChart(ctx, canvas, labels, salesData, profitData, filter = 'both') {
        const { width, height } = this.prepareCanvas(ctx, canvas);

        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = '#dbeafe';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }

        // Find max value for scaling
        const activeValues = filter === 'sales'
            ? salesData
            : filter === 'profit'
                ? profitData
                : [...salesData, ...profitData];
        const allValues = activeValues.length ? activeValues : [...salesData, ...profitData];
        const maxValue = Math.max(...allValues);
        const minValue = 0;

        if (filter === 'sales' || filter === 'both') {
            const salesGradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
            salesGradient.addColorStop(0, 'rgba(74, 222, 128, 0.35)');
            salesGradient.addColorStop(1, 'rgba(74, 222, 128, 0.05)');
            this.drawAreaSeries(ctx, salesData, padding, chartWidth, chartHeight, minValue, maxValue, salesGradient);
        }

        if (filter === 'profit' || filter === 'both') {
            const profitGradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
            profitGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
            profitGradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
            this.drawAreaSeries(ctx, profitData, padding, chartWidth, chartHeight, minValue, maxValue, profitGradient);
        }

        if (filter === 'sales' || filter === 'both') {
            // Draw sales line
            this.drawLine(ctx, labels, salesData, padding, chartWidth, chartHeight, '#4ade80', 2, maxValue, minValue);
        }
        
        if (filter === 'profit' || filter === 'both') {
            // Draw profit line
            this.drawLine(ctx, labels, profitData, padding, chartWidth, chartHeight, '#3b82f6', 2, maxValue, minValue);
        }

        // Draw labels
        ctx.fillStyle = '#64748b';
        ctx.font = '11px Inter';
        labels.forEach((label, i) => {
            const x = padding + (chartWidth / (labels.length - 1)) * i;
            ctx.fillText(label, x - 12, height - 10);
        });

        // Draw legend
        let legendX = padding;
        if (filter === 'sales' || filter === 'both') {
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(legendX, 10, 10, 10);
            ctx.fillStyle = '#64748b';
            ctx.fillText('Sales', legendX + 15, 18);
            legendX += 66;
        }

        if (filter === 'profit' || filter === 'both') {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(legendX, 10, 10, 10);
            ctx.fillStyle = '#64748b';
            ctx.fillText('Profit', legendX + 15, 18);
        }
    }

    drawAreaSeries(ctx, data, padding, chartWidth, chartHeight, minValue, maxValue, fillStyle) {
        const range = Math.max(maxValue - minValue, 1);
        const points = data.map((value, index) => ({
            x: padding + (chartWidth / (data.length - 1)) * index,
            y: padding + chartHeight - ((value - minValue) / range) * chartHeight
        }));

        ctx.beginPath();
        ctx.moveTo(points[0].x, padding + chartHeight);
        ctx.lineTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const point = points[i];
            const cx = (prev.x + point.x) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, cx, (prev.y + point.y) / 2);
        }
        const last = points[points.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.lineTo(last.x, padding + chartHeight);
        ctx.closePath();
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }

    drawLine(ctx, labels, data, padding, chartWidth, chartHeight, color, lineWidth, maxValue, minValue) {
        const range = Math.max(maxValue - minValue, 1);

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        const points = data.map((value, index) => ({
            x: padding + (chartWidth / (data.length - 1)) * index,
            y: padding + chartHeight - ((value - minValue) / range) * chartHeight
        }));

        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const point = points[i];
            const cx = (prev.x + point.x) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, cx, (prev.y + point.y) / 2);
        }
        const last = points[points.length - 1];
        ctx.lineTo(last.x, last.y);

        ctx.stroke();

        // Draw points
        ctx.fillStyle = color;
        points.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawSimpleDonutChart(ctx, canvas, data) {
        const { width, height } = this.prepareCanvas(ctx, canvas);

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 52;
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
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw label (percentage)
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 35);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 35);
            
            ctx.fillStyle = '#64748b';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${segment.value}%`, labelX, labelY);

            currentAngle += sliceAngle;
        });

        // Draw center text
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 18px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Categories', centerX, centerY);

    }

    updateWeeklyChart(filter) {
        // Re-render chart with different data based on filter
        this.initializeWeeklyChart(filter);
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
                container.innerHTML = `
                    <div class="dashboard">
                        <h2>Sales (POS)</h2>
                        <div class="sales-content">
                            <p>Sales management interface will be implemented here.</p>
                            <button class="btn" onclick="this.startNewSale()">🧾 Start New Sale</button>
                        </div>
                    </div>
                `;
                break;
            case 'inventory':
                container.innerHTML = `
                    <div class="dashboard">
                        <h2>Inventory Management</h2>
                        <div class="inventory-content">
                            <p>Inventory management interface will be implemented here.</p>
                        </div>
                    </div>
                `;
                break;
            case 'customers':
                container.innerHTML = `
                    <div class="dashboard">
                        <h2>Customer Management</h2>
                        <div class="customers-content">
                            <p>Customer management interface will be implemented here.</p>
                        </div>
                    </div>
                `;
                break;
            case 'purchasing':
                container.innerHTML = `
                    <div class="dashboard">
                        <h2>Purchasing</h2>
                        <div class="purchasing-content">
                            <p>Purchasing management interface will be implemented here.</p>
                        </div>
                    </div>
                `;
                break;
            case 'reports':
                container.innerHTML = `
                    <div class="dashboard">
                        <h2>Reports</h2>
                        <div class="reports-content">
                            <p>Reports and analytics interface will be implemented here.</p>
                        </div>
                    </div>
                `;
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

    startNewSale() {
        // Navigate to POS interface
        window.location.href = '/pos/web';
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
