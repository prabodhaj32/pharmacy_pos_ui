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

    renderPharmacyPOS() {
        const container = document.getElementById("dashboard_container");
        
        container.innerHTML = `
            <div class="pharmacy-pos">
                <!-- POS Action Bar (Top) -->
                <section class="pos-action-bar">
                    <button class="action-btn camera-btn" onclick="pharmacyPOS.openCamera()" title="Open Camera">
                        📷 Camera
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
                </section>

                <!-- Top Section: Search -->
                <div class="pos-top-section">
                    <!-- Search Section (Full Width) -->
                    <section class="search-section-full">
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
                </div>

                <!-- Main Content Grid: Sales Table + Cart Split -->
                <div class="pos-main-grid-split-75-35">
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

                    <!-- Cart Component (Right - 35%) -->
                    <div class="pos-cart-35">
                        <div class="cart-container">
                            <h2>🛒 Sales Cart</h2>
                            <div class="cart-summary">
                                <div class="cart-totals">
                                    <div class="subtotal-row">
                                        <span>Subtotal:</span>
                                        <span id="cartSubtotal">$0.00</span>
                                    </div>
                                    <div class="discount-row">
                                        <span>Total Discount:</span>
                                        <span id="cartDiscount">$0.00</span>
                                    </div>
                                    <div class="total-row">
                                        <strong>Grand Total:</strong>
                                        <strong id="cartTotal">$0.00</strong>
                                    </div>
                                </div>
                                <div class="cart-actions">
                                    <button class="btn btn-primary" onclick="pharmacyPOS.checkout()">
                                        🧾 Pay
                                    </button>
                                    <button class="btn btn-secondary" onclick="pharmacyPOS.clearCart()">
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
        
        // Render products grid
        this.renderProducts(this.products);
    }
    
    openCamera() {
        alert('📷 Camera feature - Open barcode scanner\n\nIntegrate with camera/barcode scanning device.');
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

    clearCart() {
        if (confirm('Are you sure you want to clear the cart?')) {
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
        
        // Create dropdown within the cart
        const dropdown = document.createElement('div');
        dropdown.id = 'paymentDropdown';
        dropdown.className = 'payment-dropdown';
        dropdown.innerHTML = `
            <div class="payment-dropdown-content">
                <div class="payment-dropdown-header">
                    <h4>💳 Payment Details</h4>
                </div>
                <div class="payment-dropdown-body">
                    <div class="payment-total">
                        <div class="total-row">
                            <span>TOTAL</span>
                            <span class="total-amount">LKR ${total.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="payment-methods">
                        <div class="payment-method active" data-method="cash">
                            <label>
                                <input type="radio" name="payment" value="cash" checked>
                                <span>💵 Cash</span>
                            </label>
                        </div>
                        <div class="payment-method" data-method="card">
                            <label>
                                <input type="radio" name="payment" value="card">
                                <span>💳 Card</span>
                            </label>
                        </div>
                        <div class="payment-method" data-method="credit">
                            <label>
                                <input type="radio" name="payment" value="credit">
                                <span>🏦 Credit</span>
                            </label>
                        </div>
                    </div>
                    <div class="payment-amount">
                        <label>Amount Paid (LKR)</label>
                        <input type="number" id="amountPaid" value="${total.toFixed(2)}" step="0.01" min="0">
                        <div class="quick-amounts">
                            <button onclick="pharmacyPOS.setAmount(10)">LKR 10</button>
                            <button onclick="pharmacyPOS.setAmount(100)">LKR 100</button>
                            <button onclick="pharmacyPOS.setAmount(500)">LKR 500</button>
                            <button onclick="pharmacyPOS.setAmount(1000)">LKR 1000</button>
                        </div>
                    </div>
                    <div class="payment-balance">
                        <div class="balance-row">
                            <span>Balance</span>
                            <span class="balance-amount" id="balanceAmount">LKR ${total.toFixed(2)} (due)</span>
                        </div>
                    </div>
                    <div class="payment-actions">
                        <button class="btn btn-success btn-large" onclick="pharmacyPOS.completeSale()">
                            🧾 Complete Sale & Print Receipt
                        </button>
                        <button class="btn btn-secondary" onclick="pharmacyPOS.backToCart()">
                            ← Back to cart
                        </button>
                        <button class="btn btn-danger" onclick="pharmacyPOS.clearCart(); pharmacyPOS.closePaymentDropdown();">
                            🧹 Clear Cart
                        </button>
                    </div>
                </div>
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
        let receipt = `🏥 PHARMACY RECEIPT\n`;
        receipt += `====================\n`;
        receipt += `Date: ${sale.timestamp}\n`;
        receipt += `Customer: ${sale.customer.name}\n`;
        receipt += `Payment: ${sale.paymentMethod}\n\n`;
        receipt += `ITEMS:\n`;
        sale.items.forEach(item => {
            receipt += `${item.name} x${item.quantity} - LKR ${(item.price * item.quantity).toFixed(2)}\n`;
        });
        receipt += `\nTOTAL: LKR ${sale.total.toFixed(2)}\n`;
        receipt += `PAID: LKR ${sale.amountPaid.toFixed(2)}\n`;
        receipt += `CHANGE: LKR ${(sale.amountPaid - sale.total).toFixed(2)}\n`;
        receipt += `====================\n`;
        receipt += `Thank you for your purchase!\n`;
        
        console.log(receipt);
        alert('🧾 Receipt printed (check console for details)');
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