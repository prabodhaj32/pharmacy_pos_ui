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
                this.renderInventory();
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

    ensureInventoryData() {
        if (this.inventoryItems && this.inventoryItems.length) return;
        this.inventoryItems = [];
        this.loadInventoryItems();
    }

    loadInventoryItems() {
        // Sample inventory data for UI rendering.
        // In real usage, this should come from Odoo models / RPC calls.
        this.inventoryItems = [
            {
                id: 1,
                icon: "💊",
                name: "Amoxicillin 500",
                generic: "Amoxicillin (Capsule)",
                barcode: "8901234567002",
                category: "Antibiotics",
                batch: "BT-AMO-2025-001",
                expiryDate: "2027-04-30",
                expiryLabel: "30 Apr 2027",
                stock: 200,
                cost: 15.0,
                price: 30.0,
                rxOnly: true,
                controlled: false,
            },
            {
                id: 2,
                icon: "💊",
                name: "Augmentin 625",
                generic: "Amoxicillin/Clavulanate Tablet",
                barcode: "8901234557003",
                category: "Antibiotics",
                batch: "BT-AUG-2025-001",
                expiryDate: "2026-12-31",
                expiryLabel: "31 Dec 2026",
                stock: 120,
                cost: 85.0,
                price: 145.0,
                rxOnly: true,
                controlled: false,
            },
            {
                id: 3,
                icon: "💊",
                name: "Cetirizine 10",
                generic: "Cetirizine HCl",
                barcode: "8901234557004",
                category: "Allergy",
                batch: "BT-CET-2025-001",
                expiryDate: "2027-08-31",
                expiryLabel: "31 Aug 2027",
                stock: 348,
                cost: 5.0,
                price: 10.0,
                rxOnly: false,
                controlled: false,
            },
            {
                id: 4,
                icon: "💊",
                name: "Diazepam 5",
                generic: "Diazepam Tablet",
                barcode: "8901234557005",
                category: "Sedatives",
                batch: "BT-DIA-2025-001",
                expiryDate: "2026-08-31",
                expiryLabel: "31 Aug 2026",
                stock: 30,
                cost: 18.0,
                price: 40.0,
                rxOnly: true,
                controlled: true,
            },
            {
                id: 5,
                icon: "💊",
                name: "Losartan 50",
                generic: "Losartan Potassium Tablet",
                barcode: "8901234557006",
                category: "Cardiovascular",
                batch: "BT-LOS-2025-001",
                expiryDate: "2027-09-30",
                expiryLabel: "30 Sep 2027",
                stock: 300,
                cost: 12.0,
                price: 25.0,
                rxOnly: false,
                controlled: false,
            },
            {
                id: 6,
                icon: "💊",
                name: "Metformin 500",
                generic: "Metformin Tablet",
                barcode: "8901234557007",
                category: "Antidiabetics",
                batch: "BT-MET-2025-001",
                expiryDate: "2026-06-15",
                expiryLabel: "15 Jun 2026",
                stock: 18,
                cost: 6.0,
                price: 12.0,
                rxOnly: false,
                controlled: false,
            },
            {
                id: 7,
                icon: "💊",
                name: "Omeprazole 20",
                generic: "Omeprazole Capsule",
                barcode: "8901234557008",
                category: "Gastrointestinal",
                batch: "BT-OME-2025-001",
                expiryDate: "2026-07-20",
                expiryLabel: "20 Jul 2026",
                stock: 52,
                cost: 8.5,
                price: 18.0,
                rxOnly: false,
                controlled: false,
            },
            {
                id: 8,
                icon: "💊",
                name: "Amoxicillin 250",
                generic: "Amoxicillin Capsule",
                barcode: "8901234557009",
                category: "Antibiotics",
                batch: "BT-AMO-2025-002",
                expiryDate: "2027-01-10",
                expiryLabel: "10 Jan 2027",
                stock: 75,
                cost: 3.5,
                price: 8.0,
                rxOnly: true,
                controlled: false,
            },
            {
                id: 9,
                icon: "💉",
                name: "Insulin Injection",
                generic: "Insulin (Injection)",
                barcode: "8901234557010",
                category: "Hormones",
                batch: "BT-INS-2025-001",
                expiryDate: "2026-05-30",
                expiryLabel: "30 May 2026",
                stock: 10,
                cost: 45.0,
                price: 90.0,
                rxOnly: true,
                controlled: true,
            },
            {
                id: 10,
                icon: "🧪",
                name: "Vitamin C 500",
                generic: "Ascorbic Acid",
                barcode: "8901234557011",
                category: "Vitamins",
                batch: "BT-VITC-2025-001",
                expiryDate: "2026-08-05",
                expiryLabel: "05 Aug 2026",
                stock: 420,
                cost: 2.5,
                price: 6.0,
                rxOnly: false,
                controlled: false,
            },
        ];
    }

    parseISODate(dateString) {
        // `new Date('YYYY-MM-DD')` works consistently and avoids parsing localized strings.
        const d = new Date(dateString);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    isExpiringWithinDays(item, days) {
        const expiry = this.parseISODate(item.expiryDate);
        if (!expiry) return false;
        const now = new Date();
        const diffMs = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= days;
    }

    isLowStock(item, threshold = 20) {
        return Number(item.stock) <= threshold;
    }

    getMarginPct(item) {
        const price = Number(item.price) || 0;
        const cost = Number(item.cost) || 0;
        if (price <= 0) return 0;
        return ((price - cost) / price) * 100;
    }

    formatLKR(amount) {
        const v = Number(amount) || 0;
        return `LKR ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    formatLKRCompact(amount) {
        const v = Number(amount) || 0;
        const abs = Math.abs(v);
        if (abs >= 1000000) return `LKR ${(v / 1000000).toFixed(1)}M`;
        if (abs >= 1000) return `LKR ${(v / 1000).toFixed(0)}K`;
        return `LKR ${v.toFixed(0)}`;
    }

    formatLKROneDecimal(amount) {
        const v = Number(amount) || 0;
        return `LKR ${v.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
    }

    renderInventory() {
        this.ensureInventoryData();

        const container = document.getElementById("dashboard_container");

        const categories = [...new Set(this.inventoryItems.map(i => i.category))].sort();
        const categoryOptionsHtml = categories.map(c => `<option value="${c}">${c}</option>`).join("");

        container.innerHTML = `
            <div class="dashboard">
                <div class="inventory-header">
                </div>
                
                <div class="inventory-actions">
                    <button class="btn btn-primary compact">Adjust Stock</button>
                    <button class="btn btn-secondary compact">➕ Add Item</button>
                </div>
                
                <div class="inventory-stats">
                    <div class="stat-card compact">
                        <div class="stat-icon">📦</div>
                        <div class="stat-content">
                            <h3>Total Items</h3>
                            <p class="stat-value" id="inventoryTotalItemsValue">0</p>
                        </div>
                    </div>
                    <div class="stat-card compact warning">
                        <div class="stat-icon">⚠️</div>
                        <div class="stat-content">
                            <h3>Low Stock</h3>
                            <p class="stat-value" id="inventoryLowStockValue">0</p>
                        </div>
                    </div>
                    <div class="stat-card compact danger">
                        <div class="stat-icon">⏰</div>
                        <div class="stat-content">
                            <h3>Expiring (&lt;90d)</h3>
                            <p class="stat-value" id="inventoryExpiringValue">0</p>
                        </div>
                    </div>
                    <div class="stat-card compact success">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <h3>Stock Value</h3>
                            <p class="stat-value" id="inventoryStockValueValue">LKR 0</p>
                        </div>
                    </div>
                </div>
                
                <div class="inventory-controls compact">
                    <div class="search-bar compact">
                        <input
                            id="inventorySearchInput"
                            type="text"
                            placeholder="🔍 Search inventory..."
                            class="search-input compact"
                        >
                    </div>
                    
                    <div class="filters compact">
                        <select class="filter-select compact" id="inventoryCategorySelect">
                            <option value="All">All Categories</option>
                            ${categoryOptionsHtml}
                        </select>

                        <select class="filter-select compact" id="inventoryTypeSelect">
                            <option value="all">All Types</option>
                            <option value="rx_only">Rx Only</option>
                            <option value="controlled">Controlled</option>
                        </select>

                        <button class="filter-btn compact" data-inventory-filter="low_stock">⚠ Low</button>
                        <button class="filter-btn compact" data-inventory-filter="expiring">⏱ Expiring</button>
                        <button class="filter-btn compact" data-inventory-filter="controlled">🔒 Controlled</button>
                        <button class="filter-btn compact" data-inventory-filter="rx_only">💊 Rx</button>
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
                            <tbody id="inventoryTableBody">
                                <tr class="cart-empty-row">
                                    <td colspan="8" class="cart-empty">
                                        <p>Loading inventory...</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.inventoryActiveFilter = "low_stock";
        this.inventoryLowStockThreshold = 20;

        this.setupInventoryHandlers();
        this.updateInventoryStatsAndTable();
    }

    setupInventoryHandlers() {
        const container = document.getElementById("dashboard_container");
        if (!container) return;

        const searchInput = document.getElementById("inventorySearchInput");
        const categorySelect = document.getElementById("inventoryCategorySelect");
        const typeSelect = document.getElementById("inventoryTypeSelect");
        const filterButtons = container.querySelectorAll("[data-inventory-filter]");

        const setActiveButton = (filter) => {
            filterButtons.forEach(btn => {
                btn.classList.toggle("active", btn.dataset.inventoryFilter === filter);
            });
        };

        setActiveButton(this.inventoryActiveFilter);

        searchInput?.addEventListener("input", () => this.updateInventoryStatsAndTable());
        categorySelect?.addEventListener("change", () => this.updateInventoryStatsAndTable());

        typeSelect?.addEventListener("change", () => {
            const v = typeSelect.value;
            if (v === "rx_only" || v === "controlled") {
                this.inventoryActiveFilter = v;
                setActiveButton(v);
            } else {
                this.inventoryActiveFilter = "all";
                setActiveButton("all");
            }
            this.updateInventoryStatsAndTable();
        });

        filterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const filter = btn.dataset.inventoryFilter;
                this.inventoryActiveFilter = filter;

                // Keep the dropdown in sync with the selected filter.
                if (typeSelect) {
                    if (filter === "rx_only" || filter === "controlled") typeSelect.value = filter;
                    else typeSelect.value = "all";
                }

                setActiveButton(filter);
                this.updateInventoryStatsAndTable();
            });
        });
    }

    updateInventoryStatsAndTable() {
        const inventoryTableBody = document.getElementById("inventoryTableBody");
        if (!inventoryTableBody) return;

        const allItems = this.inventoryItems || [];

        const totalItems = allItems.length;
        const lowStockCount = allItems.filter(i => this.isLowStock(i, this.inventoryLowStockThreshold)).length;
        const expiringCount = allItems.filter(i => this.isExpiringWithinDays(i, 90)).length;
        const stockValue = allItems.reduce((sum, i) => sum + (Number(i.stock) || 0) * (Number(i.price) || 0), 0);

        const inventorySummary = document.getElementById("inventorySummary");
        const totalItemsValue = document.getElementById("inventoryTotalItemsValue");
        const lowStockValue = document.getElementById("inventoryLowStockValue");
        const expiringValue = document.getElementById("inventoryExpiringValue");
        const stockValueValue = document.getElementById("inventoryStockValueValue");

        if (inventorySummary) inventorySummary.textContent = `${totalItems} items · ${this.formatLKROneDecimal(stockValue)} stock value`;
        if (totalItemsValue) totalItemsValue.textContent = totalItems;
        if (lowStockValue) lowStockValue.textContent = lowStockCount;
        if (expiringValue) expiringValue.textContent = expiringCount;
        if (stockValueValue) stockValueValue.textContent = this.formatLKRCompact(stockValue);

        const filtered = this.applyInventoryFilters();
        this.renderInventoryTable(filtered);
    }

    applyInventoryFilters() {
        const allItems = this.inventoryItems || [];

        const searchInput = document.getElementById("inventorySearchInput");
        const categorySelect = document.getElementById("inventoryCategorySelect");
        const typeSelect = document.getElementById("inventoryTypeSelect");

        const query = (searchInput?.value || "").trim().toLowerCase();
        const category = categorySelect?.value || "All";
        const typeValue = typeSelect?.value || "all";

        let filter = this.inventoryActiveFilter || "all";
        if (typeValue === "rx_only" || typeValue === "controlled") filter = typeValue;

        return allItems.filter(item => {
            if (category !== "All" && item.category !== category) return false;

            if (query) {
                const haystack = `${item.name} ${item.generic} ${item.barcode}`.toLowerCase();
                if (!haystack.includes(query)) return false;
            }

            if (filter === "low_stock") {
                return this.isLowStock(item, this.inventoryLowStockThreshold);
            }
            if (filter === "expiring") {
                return this.isExpiringWithinDays(item, 90);
            }
            if (filter === "controlled") {
                return !!item.controlled;
            }
            if (filter === "rx_only") {
                return !!item.rxOnly;
            }

            // 'all' or unknown
            return true;
        });
    }

    renderInventoryTable(items) {
        const tableBody = document.getElementById("inventoryTableBody");
        if (!tableBody) return;

        tableBody.innerHTML = "";

        if (!items || !items.length) {
            tableBody.innerHTML = `
                <tr class="cart-empty-row">
                    <td colspan="8" class="cart-empty">
                        <p>No matching inventory items found.</p>
                    </td>
                </tr>
            `;
            return;
        }

        items.forEach(item => {
            const lowStock = this.isLowStock(item, this.inventoryLowStockThreshold);
            const expiring = this.isExpiringWithinDays(item, 90);
            const marginPct = this.getMarginPct(item);

            const statusPill = expiring
                ? `<span class="meta-pill profit">Expiring</span>`
                : lowStock
                    ? `<span class="meta-pill neutral">Low Stock</span>`
                    : `<span class="meta-pill sales">In Stock</span>`;

            const rxPill = item.rxOnly ? `<span class="meta-pill rx-only">Rx</span>` : "";
            const controlledPill = item.controlled ? `<span class="meta-pill controlled">Controlled</span>` : "";

            const rowClass = `cart-row inventory-row${lowStock ? " low-stock" : ""}${expiring ? " expiring" : ""}${item.controlled ? " controlled" : ""}`;

            const row = document.createElement("tr");
            row.className = rowClass;
            row.innerHTML = `
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
            `;

            tableBody.appendChild(row);
        });
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
    
    findProductByBarcode(barcode) {
        // Mock barcode to product mapping
        const barcodeMap = {
            '1234567890123': {
                id: 1,
                name: 'Paracetamol 500mg',
                batch: 'BCH001',
                expiry: 'Dec 2025',
                price: 2.00,
                icon: '💊'
            },
            '2345678901234': {
                id: 2,
                name: 'Ibuprofen 400mg',
                batch: 'BCH002',
                expiry: 'Jan 2026',
                price: 3.50,
                icon: '💊'
            },
            '3456789012345': {
                id: 3,
                name: 'Amoxicillin 250mg',
                batch: 'BCH003',
                expiry: 'Mar 2025',
                price: 8.75,
                icon: '💊'
            },
            '4567890123456': {
                id: 4,
                name: 'Cough Syrup 100ml',
                batch: 'BCH004',
                expiry: 'Feb 2026',
                price: 12.00,
                icon: '🧴'
            },
            '5678901234567': {
                id: 5,
                name: 'Vitamin C 500mg',
                batch: 'BCH005',
                expiry: 'Apr 2026',
                price: 5.25,
                icon: '🧪'
            }
        };
        
        return barcodeMap[barcode];
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
        const customerName = prompt('Enter customer name (leave blank for Walk-in):', 'Walk-in Customer');
        if (customerName !== null) {
            this.currentCustomer = {
                name: customerName || 'Walk-in Customer',
                isWalkIn: customerName === '' || customerName === 'Walk-in Customer'
            };
            alert(`🧍 Customer selected: ${this.currentCustomer.name}`);
        }
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
        this.products = [
            {
                id: 1,
                name: "Paracetamol 500mg",
                category: "tablets",
                price: 2.00,
                stock: 120,
                icon: "💊",
                prescription: false,
                batch: "BCH001",
                expiry: "2025-12-31"
            },
            {
                id: 2,
                name: "Amoxicillin 250mg",
                category: "antibiotics",
                price: 5.00,
                stock: 80,
                icon: "💊",
                prescription: true,
                batch: "BCH002",
                expiry: "2024-08-15"
            },
            {
                id: 3,
                name: "Cough Syrup (Benylin)",
                category: "syrups",
                price: 4.00,
                stock: 60,
                icon: "💊",
                prescription: false,
                batch: "BCH003",
                expiry: "2025-03-20"
            },
            {
                id: 4,
                name: "Insulin Injection",
                category: "injections",
                price: 25.00,
                stock: 15,
                icon: "💉",
                prescription: true,
                batch: "BCH004",
                expiry: "2024-06-10"
            },
            {
                id: 5,
                name: "Burn Cream",
                category: "ointments",
                price: 3.00,
                stock: 40,
                icon: "🧴",
                prescription: false,
                batch: "BCH005",
                expiry: "2025-09-30"
            },
            {
                id: 6,
                name: "Vitamin C Tablets",
                category: "supplements",
                price: 6.00,
                stock: 200,
                icon: "🧪",
                prescription: false,
                batch: "BCH006",
                expiry: "2026-01-15"
            },
            {
                id: 7,
                name: "Bandage Roll",
                category: "firstaid",
                price: 1.50,
                stock: 150,
                icon: "🚑",
                prescription: false,
                batch: "BCH007",
                expiry: "2025-11-25"
            }
        ];
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