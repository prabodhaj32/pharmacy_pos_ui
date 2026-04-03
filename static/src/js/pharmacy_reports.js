/** @odoo-module **/

// Simple JavaScript class for Reports (not OWL Component)
class PharmacyReports {
    constructor() {
        console.log('PharmacyReports constructor() called');
        this.charts = {};
        this.dashboardData = {};
        this.metricsData = {};
        this.reportData = {};
        this.loadReportData().then(() => {
            this.renderReports();
        });
    }

    async loadReportData() {
        const basePath = '/pharmacy_pos_ui/static/src/js/data/reports/';   // updated path for reports subfolder

        try {
            this.dashboardData = await this.fetchJSON(basePath + 'dashboard.json');
            this.metricsData = await this.fetchJSON(basePath + 'metrics.json');
            
            this.reportData = {
                daily_sales: await this.fetchJSON(basePath + 'daily_sales.json'),
                profit_report: await this.fetchJSON(basePath + 'profit_report.json'),
                fast_movers: await this.fetchJSON(basePath + 'fast_movers.json'),
                expiry_report: await this.fetchJSON(basePath + 'expiry_report.json'),
                stock_valuation: await this.fetchJSON(basePath + 'stock_valuation.json'),
                cashier_summary: await this.fetchJSON(basePath + 'cashier_summary.json')
            };
            
            console.log('Report data loaded successfully:', this.reportData);
        } catch (error) {
            console.error('Error loading report data:', error);
            // Fallback to default data if JSON files fail to load
            this.setDefaultData();
        }
    }

    async fetchJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching JSON from ${url}:`, error);
            throw error;
        }
    }

    setDefaultData() {
        // Fallback data when JSON files are not available
        this.dashboardData = {
            total_sales: 48750,
            net_sales: 47550,
            total_discount: 1200,
            total_returns: 1200,
            tax_collected: 180
        };
        
        this.metricsData = {
            gross_sales: 48750,
            net_sales: 47550,
            total_discount: 1200,
            total_returns: 1200,
            tax_collected: 180
        };
        
        this.reportData = {
            daily_sales: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                sales: [35000, 48000, 42000, 61000, 78000, 72000, 48750],
                profit: [9500, 12000, 10500, 16000, 22000, 19500, 12400]
            },
            profit_report: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                profit: [9500, 12000, 10500, 16000, 22000, 19500, 12400]
            },
            fast_movers: [
                { rank: 1, medicine: 'Panadol 500mg', qty_sold: 450, revenue: 29250, avg_per_day: 64 },
                { rank: 2, medicine: 'Omeprazole 20mg', qty_sold: 220, revenue: 9240, avg_per_day: 31 },
                { rank: 3, medicine: 'Augmentin 625', qty_sold: 85, revenue: 21250, avg_per_day: 12 },
                { rank: 4, medicine: 'Vitamin C 1000', qty_sold: 180, revenue: 15300, avg_per_day: 26 },
                { rank: 5, medicine: 'Cetirizine 10mg', qty_sold: 310, revenue: 6200, avg_per_day: 44 }
            ],
            expiry_report: [
                { medicine: 'Alprazolam 0.5mg', batch: 'BT2024033', expiry_date: '9/30/2025', days_left: -181, stock: 45, value_at_cost: 4275, action: 'Discount' },
                { medicine: 'Cetirizine 10mg', batch: 'BT2024056', expiry_date: '10/31/2025', days_left: -150, stock: 22, value_at_cost: 264, action: 'Discount' },
                { medicine: 'Augmentin 625', batch: 'BT2024045', expiry_date: '12/31/2025', days_left: -89, stock: 80, value_at_cost: 14800, action: 'Discount' },
                { medicine: 'Vitamin C 1000', batch: 'BT2024110', expiry_date: '4/30/2026', days_left: 31, stock: 420, value_at_cost: 23100, action: 'Discount' },
                { medicine: 'Losartan 50mg', batch: 'BT2024102', expiry_date: '6/30/2026', days_left: 92, stock: 340, value_at_cost: 22100, action: 'Discount' },
                { medicine: 'Panadol 500mg', batch: 'BT2024001', expiry_date: '8/31/2026', days_left: 154, stock: 1200, value_at_cost: 54000, action: 'Discount' }
            ],
            stock_valuation: {
                summary: {
                    total_cost_value: 143859,
                    total_selling_value: 212950,
                    potential_profit: 69091
                },
                details: [
                    { medicine: 'Panadol 500mg', stock: 1200, cost_per_unit: 45, sell_per_unit: 65, cost_value: 54000, sell_value: 78000, potential_profit: 24000 },
                    { medicine: 'Augmentin 625', stock: 80, cost_per_unit: 185, sell_per_unit: 250, cost_value: 14800, sell_value: 20000, potential_profit: 5200 },
                    { medicine: 'Omeprazole 20', stock: 650, cost_per_unit: 28, sell_per_unit: 42, cost_value: 18200, sell_value: 27300, potential_profit: 9100 },
                    { medicine: 'Losartan 50', stock: 340, cost_per_unit: 65, sell_per_unit: 95, cost_value: 22100, sell_value: 32300, potential_profit: 10200 },
                    { medicine: 'Cetirizine 10', stock: 22, cost_per_unit: 12, sell_per_unit: 20, cost_value: 264, sell_value: 440, potential_profit: 176 },
                    { medicine: 'Metformin 500', stock: 890, cost_per_unit: 8, sell_per_unit: 14, cost_value: 7120, sell_value: 12460, potential_profit: 5340 },
                    { medicine: 'Alprazolam 0.5', stock: 45, cost_per_unit: 95, sell_per_unit: 150, cost_value: 4275, sell_value: 6750, potential_profit: 2475 },
                    { medicine: 'Vitamin C 1000', stock: 420, cost_per_unit: 55, sell_per_unit: 85, cost_value: 23100, sell_value: 35700, potential_profit: 12600 }
                ]
            },
            cashier_summary: [
                { cashier: 'Cashier 1', bills_processed: 18, total_sales: 28500, avg_bill_value: 1583, cash_collected: 18525, card_collected: 9975 },
                { cashier: 'Cashier 2', bills_processed: 16, total_sales: 20250, avg_bill_value: 1266, cash_collected: 13163, card_collected: 7088 }
            ]
        };
    }

    renderReports() {
        console.log('PharmacyReports renderReports() called');
        const container = document.getElementById("dashboard_container");
        console.log('Container found:', !!container);
        
        if (!container) {
            console.error('Dashboard container not found!');
            return;
        }
        
        // Use current date for date pickers
        const today = new Date().toISOString().split('T')[0];
        console.log('Rendering Reports content...');

        // Get metrics data or use defaults
        const metrics = this.metricsData || {
            gross_sales: 48750,
            net_sales: 47550,
            total_discount: 1200,
            total_returns: 1200,
            tax_collected: 180
        };

        container.innerHTML = `
            <div class="dashboard reports-dashboard">
                <div class="reports-header-row">
                    <div class="reports-title-section">
                        <h2>Reports & Analytics</h2>
                        <span class="subtitle">Insights and data export</span>
                    </div>
                    <div class="reports-controls-bar">
                        <div class="date-range">
                            <input type="date" value="${today}" class="date-input compact" id="reportFromDate" />
                            <span class="date-separator">to</span>
                            <input type="date" value="${today}" class="date-input compact" id="reportToDate" />
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
                                <p class="metric-value">LKR ${metrics.gross_sales?.toLocaleString() || '48,750'}</p>
                            </div>
                            <div class="metric-icon">💰</div>
                        </div>
                    </div>

                    <div class="metric-card info">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Net Sales</h3>
                                <p class="metric-value">LKR ${metrics.net_sales?.toLocaleString() || '47,550'}</p>
                            </div>
                            <div class="metric-icon">💵</div>
                        </div>
                    </div>

                    <div class="metric-card warning">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Total Discount</h3>
                                <p class="metric-value">LKR ${metrics.total_discount?.toLocaleString() || '1,200'}</p>
                            </div>
                            <div class="metric-icon">🏷️</div>
                        </div>
                    </div>

                    <div class="metric-card danger">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Total Returns</h3>
                                <p class="metric-value">LKR ${metrics.total_returns?.toLocaleString() || '1,200'}</p>
                            </div>
                            <div class="metric-icon">🔄</div>
                        </div>
                    </div>

                    <div class="metric-card" style="border-left: 4px solid #8b5cf6">
                        <div class="metric-header">
                            <div>
                                <h3 class="metric-title">Tax Collected</h3>
                                <p class="metric-value">LKR ${metrics.tax_collected?.toLocaleString() || '180'}</p>
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
                            <canvas id="reportsTrendChart" aria-label="Weekly Sales Trend" style="max-height: 400px;"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        console.log('Reports content rendered');

        this.setupReportsHandlers();
        
        // Initialize chart after DOM is rendered
        setTimeout(() => {
            console.log('Initializing Reports chart...');
            this.initializeReportsChart();
        }, 100);
    }

    setupReportsHandlers() {
        // Tab switching
        const tabs = document.querySelectorAll('.reports-tabs .tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                // Change content based on active tab
                const activeTab = e.target.textContent.trim();
                this.renderTabContent(activeTab);
            });
        });

        // Export CSV
        const btnExportCSV = document.getElementById('btnExportCSV');
        if (btnExportCSV) {
            btnExportCSV.addEventListener('click', () => {
                this.exportReportsCSV();
            });
        }

        // Print Report
        const btnPrintReport = document.getElementById('btnPrintReport');
        if (btnPrintReport) {
            btnPrintReport.addEventListener('click', () => {
                window.print();
            });
        }
    }

    renderTabContent(tabName) {
        const container = document.querySelector('.charts-grid');
        
        switch(tabName) {
            case 'Daily Sales':
                this.renderDailySalesChart(container);
                break;
            case 'Profit Report':
                this.renderProfitTrendChart(container);
                break;
            case 'Fast Movers':
                this.renderFastMoversChart(container);
                break;
            case 'Expiry Report':
                this.renderExpiryReport(container);
                break;
            case 'Stock Valuation':
                this.renderStockValuation(container);
                break;
            case 'Cashier Summary':
                this.renderCashierSummary(container);
                break;
            default:
                this.renderDailySalesChart(container);
        }
    }

    renderDailySalesChart(container) {
        container.innerHTML = `
            <div class="chart-card full-width reports-weekly-trend-card">
                <div class="reports-weekly-trend-head">
                    <h3 class="chart-title reports-weekly-trend-title">Weekly Sales Trend</h3>
                    <div class="reports-weekly-trend-legend" aria-hidden="true">
                        <span class="reports-weekly-trend-legend-item"><i class="dot sales"></i>Sales</span>
                        <span class="reports-weekly-trend-legend-item"><i class="dot profit"></i>Profit</span>
                    </div>
                </div>
                <div class="chart-container reports-weekly-trend-canvas-wrap">
                    <canvas id="reportsTrendChart" aria-label="Weekly Sales Trend" style="max-height: 400px;"></canvas>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.initializeReportsChart();
        }, 100);
    }

    renderProfitTrendChart(container) {
        container.innerHTML = `
            <div class="chart-card full-width reports-weekly-trend-card">
                <div class="reports-weekly-trend-head">
                    <h3 class="chart-title reports-weekly-trend-title">Profit Trend (7 Days)</h3>
                    <div class="reports-weekly-trend-legend" aria-hidden="true">
                        <span class="reports-weekly-trend-legend-item"><i class="dot profit"></i>Profit</span>
                    </div>
                </div>
                <div class="chart-container reports-weekly-trend-canvas-wrap">
                    <canvas id="profitTrendChart" aria-label="Profit Trend" style="max-height: 400px;"></canvas>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            this.initializeProfitChart();
        }, 100);
    }

    renderFastMoversChart(container) {
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
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Qty Sold</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Revenue (LKR)</th>
                                <th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb;">Avg/Day</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: #059669; border-bottom: 1px solid #f1f5f9;">1</td>
                                <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">Panadol 500mg</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">450</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">29,250</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">64/day</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: #059669; border-bottom: 1px solid #f1f5f9;">2</td>
                                <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">Omeprazole 20mg</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">220</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">9,240</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">31/day</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: #059669; border-bottom: 1px solid #f1f5f9;">3</td>
                                <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">Augmentin 625</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">85</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">21,250</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">12/day</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: #059669; border-bottom: 1px solid #f1f5f9;">4</td>
                                <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">Vitamin C 1000</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">180</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">15,300</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">26/day</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: #059669; border-bottom: 1px solid #f1f5f9;">5</td>
                                <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">Cetirizine 10mg</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">310</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">6,200</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">44/day</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderExpiryReport(container) {
    container.innerHTML = `
        <div class="chart-card full-width">
            <div class="reports-weekly-trend-head">
                <h3 class="chart-title reports-weekly-trend-title">Expiring Medicines</h3>
                <div class="reports-weekly-trend-legend" aria-hidden="true">
                    <span class="reports-weekly-trend-legend-item">6 items</span>
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
                        <tr style="border-bottom: 1px solid #fecaca; background: #fef2f2;">
                            <td style="padding: 0.5rem; font-weight: 500; color: #7f1d1d; border-bottom: 1px solid #fecaca;">
                                <div style="font-weight: 600;">Alprazolam 0.5 0.5mg</div>
                                <div style="font-size: 10px; color: #991b1b;">Alprazolam</div>
                            </td>
                            <td style="padding: 0.5rem; color: #7f1d1d; border-bottom: 1px solid #fecaca;">BT2024033</td>
                            <td style="padding: 0.5rem; text-align: center; color: #7f1d1d; border-bottom: 1px solid #fecaca;">9/30/2025</td>
                            <td style="padding: 0.5rem; text-align: center; font-weight: 600; color: #dc2626; border-bottom: 1px solid #fecaca;">-181 days</td>
                            <td style="padding: 0.5rem; text-align: center; color: #7f1d1d; border-bottom: 1px solid #fecaca;">45</td>
                            <td style="padding: 0.5rem; text-align: center; color: #7f1d1d; border-bottom: 1px solid #fecaca;">LKR 4,275</td>
                            <td style="padding: 0.5rem; text-align: center; border-bottom: 1px solid #fecaca;">
                                <span style="background: #ef4444; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 10px; font-weight: 500;">Discount</span>
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid #fecaca; background: #fef2f2;">
                            <td style="padding: 0.5rem; font-weight: 500; color: #7f1d1d; border-bottom: 1px solid #fecaca;">
                                <div style="font-weight: 600;">Cetirizine 10 10mg</div>
                                <div style="font-size: 10px; color: #991b1b;">Cetirizine HCl</div>
                            </td>
                            <td style="padding: 0.5rem; color: #7f1d1d; border-bottom: 1px solid #fecaca;">BT2024056</td>
                            <td style="padding: 0.5rem; text-align: center; color: #7f1d1d; border-bottom: 1px solid #fecaca;">10/31/2025</td>
                            <td style="padding: 0.5rem; text-align: center; font-weight: 600; color: #dc2626; border-bottom: 1px solid #fecaca;">-150 days</td>
                            <td style="padding: 0.5rem; text-align: center; color: #7f1d1d; border-bottom: 1px solid #fecaca;">22</td>
                            <td style="padding: 0.5rem; text-align: center; color: #7f1d1d; border-bottom: 1px solid #fecaca;">LKR 264</td>
                            <td style="padding: 0.5rem; text-align: center; border-bottom: 1px solid #fecaca;">
                                <span style="background: #ef4444; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 10px; font-weight: 500;">Discount</span>
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid #fecaca; background: #fef2f2;">
                            <td style="padding: 0.5rem; font-weight: 500; color: #7f1d1d; border-bottom: 1px solid #fecaca;">
                                <div style="font-weight: 600;">Augmentin 625 625mg</div>
                                <div style="font-size: 10px; color: #991b1b;">Amoxicillin + Clavulanate</div>
                            </td>
                            <td style="padding: 0.5rem; color: #7f1d1d; border-bottom: 1px solid #fecaca;">BT2024045</td>
                            <td style="padding: 0.5rem; text-align: center; color: #7f1d1d; border-bottom: 1px solid #fecaca;">12/31/2025</td>
                            <td style="padding: 0.5rem; text-align: center; font-weight: 600; color: #dc2626; border-bottom: 1px solid #fecaca;">-89 days</td>
                            <td style="padding: 0.5rem; text-align: center; color: #7f1d1d; border-bottom: 1px solid #fecaca;">80</td>
                            <td style="padding: 0.5rem; text-align: center; color: #7f1d1d; border-bottom: 1px solid #fecaca;">LKR 14,800</td>
                            <td style="padding: 0.5rem; text-align: center; border-bottom: 1px solid #fecaca;">
                                <span style="background: #ef4444; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 10px; font-weight: 500;">Discount</span>
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid #fecaca; background: #fef9c3;">
                            <td style="padding: 0.5rem; font-weight: 500; color: #713f12; border-bottom: 1px solid #fde68a;">
                                <div style="font-weight: 600;">Vitamin C 1000 1000mg</div>
                                <div style="font-size: 10px; color: #92400e;">Ascorbic Acid</div>
                            </td>
                            <td style="padding: 0.5rem; color: #713f12; border-bottom: 1px solid #fde68a;">BT2024110</td>
                            <td style="padding: 0.5rem; text-align: center; color: #713f12; border-bottom: 1px solid #fde68a;">4/30/2026</td>
                            <td style="padding: 0.5rem; text-align: center; font-weight: 600; color: #d97706; border-bottom: 1px solid #fde68a;">31 days</td>
                            <td style="padding: 0.5rem; text-align: center; color: #713f12; border-bottom: 1px solid #fde68a;">420</td>
                            <td style="padding: 0.5rem; text-align: center; color: #713f12; border-bottom: 1px solid #fde68a;">LKR 23,100</td>
                            <td style="padding: 0.5rem; text-align: center; border-bottom: 1px solid #fde68a;">
                                <span style="background: #f59e0b; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 10px; font-weight: 500;">Discount</span>
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid #fecaca; background: #fef3c7;">
                            <td style="padding: 0.5rem; font-weight: 500; color: #78350f; border-bottom: 1px solid #fed7aa;">
                                <div style="font-weight: 600;">Losartan 50 50mg</div>
                                <div style="font-size: 10px; color: #92400e;">Losartan Potassium</div>
                            </td>
                            <td style="padding: 0.5rem; color: #78350f; border-bottom: 1px solid #fed7aa;">BT2024102</td>
                            <td style="padding: 0.5rem; text-align: center; color: #78350f; border-bottom: 1px solid #fed7aa;">6/30/2026</td>
                            <td style="padding: 0.5rem; text-align: center; font-weight: 600; color: #ea580c; border-bottom: 1px solid #fed7aa;">92 days</td>
                            <td style="padding: 0.5rem; text-align: center; color: #78350f; border-bottom: 1px solid #fed7aa;">340</td>
                            <td style="padding: 0.5rem; text-align: center; color: #78350f; border-bottom: 1px solid #fed7aa;">LKR 22,100</td>
                            <td style="padding: 0.5rem; text-align: center; border-bottom: 1px solid #fed7aa;">
                                <span style="background: #f59e0b; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 10px; font-weight: 500;">Discount</span>
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid #fecaca; background: #fef3c7;">
                            <td style="padding: 0.5rem; font-weight: 500; color: #78350f; border-bottom: 1px solid #fed7aa;">
                                <div style="font-weight: 600;">Panadol 500mg</div>
                                <div style="font-size: 10px; color: #92400e;">Paracetamol</div>
                            </td>
                            <td style="padding: 0.5rem; color: #78350f; border-bottom: 1px solid #fed7aa;">BT2024001</td>
                            <td style="padding: 0.5rem; text-align: center; color: #78350f; border-bottom: 1px solid #fed7aa;">8/31/2026</td>
                            <td style="padding: 0.5rem; text-align: center; font-weight: 600; color: #ea580c; border-bottom: 1px solid #fed7aa;">154 days</td>
                            <td style="padding: 0.5rem; text-align: center; color: #78350f; border-bottom: 1px solid #fed7aa;">1200</td>
                            <td style="padding: 0.5rem; text-align: center; color: #78350f; border-bottom: 1px solid #fed7aa;">LKR 54,000</td>
                            <td style="padding: 0.5rem; text-align: center; border-bottom: 1px solid #fed7aa;">
                                <span style="background: #f59e0b; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 10px; font-weight: 500;">Discount</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

    renderStockValuation(container) {
        container.innerHTML = `
            <div class="chart-card full-width stock-valuation-card">
                <div class="stock-valuation-header">
                    <h3 class="chart-title reports-weekly-trend-title">Stock Valuation</h3>
                </div>
                
                <!-- Summary Cards -->
                <div class="stock-summary-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; padding: 0 1rem;">
                    <div class="stock-summary-card" style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 1px solid #0ea5e9; border-radius: 0.375rem; padding: 0.75rem; text-align: center;">
                        <div style="font-size: 0.75rem; color: #0369a1; font-weight: 600; margin-bottom: 0.25rem;">Total Cost Value</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #0c4a6e;">LKR 143,859</div>
                    </div>
                    <div class="stock-summary-card" style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1px solid #22c55e; border-radius: 0.375rem; padding: 0.75rem; text-align: center;">
                        <div style="font-size: 0.75rem; color: #15803d; font-weight: 600; margin-bottom: 0.25rem;">Total Selling Value</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #14532d;">LKR 212,950</div>
                    </div>
                    <div class="stock-summary-card" style="background: linear-gradient(135deg, #fefce8, #fef3c7); border: 1px solid #f59e0b; border-radius: 0.375rem; padding: 0.75rem; text-align: center;">
                        <div style="font-size: 0.75rem; color: #d97706; font-weight: 600; margin-bottom: 0.25rem;">Potential Profit</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: #92400e;">LKR 69,091</div>
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
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">Panadol 500mg</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">1200</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 45.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 65.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 54,000</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 78,000</td>
                                <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: #059669; border-bottom: 1px solid #f1f5f9;">LKR 24,000</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">Augmentin 625 625mg</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">80</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 185.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 250.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 14,800</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 20,000</td>
                                <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: #059669; border-bottom: 1px solid #f1f5f9;">LKR 5,200</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">Omeprazole 20 20mg</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">650</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 28.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 42.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 18,200</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 27,300</td>
                                <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: #059669; border-bottom: 1px solid #f1f5f9;">LKR 9,100</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">Losartan 50 50mg</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">340</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 65.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 95.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 22,100</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 32,300</td>
                                <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: #059669; border-bottom: 1px solid #f1f5f9;">LKR 10,200</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">Cetirizine 10 10mg</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">22</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 12.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 20.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 264</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 440</td>
                                <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: #059669; border-bottom: 1px solid #f1f5f9;">LKR 176</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">Metformin 500 500mg</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">890</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 8.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 14.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 7,120</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 12,460</td>
                                <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: #059669; border-bottom: 1px solid #f1f5f9;">LKR 5,340</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">Alprazolam 0.5 0.5mg</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">45</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 95.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 150.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 4,275</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 6,750</td>
                                <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: #059669; border-bottom: 1px solid #f1f5f9;">LKR 2,475</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 0.75rem; font-weight: 500; color: #1f2937; border-bottom: 1px solid #f1f5f9;">Vitamin C 1000 1000mg</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">420</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 55.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 85.00</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 23,100</td>
                                <td style="padding: 0.75rem; text-align: center; color: #4b5563; border-bottom: 1px solid #f1f5f9;">LKR 35,700</td>
                                <td style="padding: 0.75rem; text-align: center; font-weight: 600; color: #059669; border-bottom: 1px solid #f1f5f9;">LKR 12,600</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderCashierSummary(container) {
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
                    <!-- Cashier 1 -->
                    <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 1px solid #3b82f6; border-radius: 0.5rem; padding: 1rem;">
                        <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                            <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; margin-right: 0.5rem;"></div>
                            <h4 style="margin: 0; font-size: 1rem; font-weight: 600; color: #1f2937;">Cashier 1</h4>
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280; font-weight: 500; margin-bottom: 1rem;">Today's Performance</div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                            <div style="text-align: center; padding: 0.5rem; background: white; border-radius: 0.375rem;">
                                <div style="font-size: 1.25rem; font-weight: 700; color: #1f2937;">18</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">Bills Processed</div>
                            </div>
                            <div style="text-align: center; padding: 0.5rem; background: white; border-radius: 0.375rem;">
                                <div style="font-size: 1.25rem; font-weight: 700; color: #059669;">LKR 28,500</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">Total Sales</div>
                            </div>
                            <div style="text-align: center; padding: 0.5rem; background: white; border-radius: 0.375rem;">
                                <div style="font-size: 1.25rem; font-weight: 700; color: #3b82f6;">LKR 1,583</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">Avg. Bill Value</div>
                            </div>
                            <div style="text-align: center; padding: 0.5rem; background: white; border-radius: 0.375rem;">
                                <div style="font-size: 1.25rem; font-weight: 700; color: #059669;">LKR 18,525</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">Cash Collected</div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 0.75rem; padding: 0.5rem; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 0.375rem; text-align: center;">
                            <div style="font-size: 1rem; font-weight: 600; color: #0369a1;">LKR 9,975</div>
                            <div style="font-size: 0.75rem; color: #64748b;">Card Collected</div>
                        </div>
                    </div>
                    
                    <!-- Cashier 2 -->
                    <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 1px solid #3b82f6; border-radius: 0.5rem; padding: 1rem;">
                        <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                            <div style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; margin-right: 0.5rem;"></div>
                            <h4 style="margin: 0; font-size: 1rem; font-weight: 600; color: #1f2937;">Cashier 2</h4>
                        </div>
                        <div style="font-size: 0.875rem; color: #6b7280; font-weight: 500; margin-bottom: 1rem;">Today's Performance</div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                            <div style="text-align: center; padding: 0.5rem; background: white; border-radius: 0.375rem;">
                                <div style="font-size: 1.25rem; font-weight: 700; color: #1f2937;">16</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">Bills Processed</div>
                            </div>
                            <div style="text-align: center; padding: 0.5rem; background: white; border-radius: 0.375rem;">
                                <div style="font-size: 1.25rem; font-weight: 700; color: #059669;">LKR 20,250</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">Total Sales</div>
                            </div>
                            <div style="text-align: center; padding: 0.5rem; background: white; border-radius: 0.375rem;">
                                <div style="font-size: 1.25rem; font-weight: 700; color: #3b82f6;">LKR 1,266</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">Avg. Bill Value</div>
                            </div>
                            <div style="text-align: center; padding: 0.5rem; background: white; border-radius: 0.375rem;">
                                <div style="font-size: 1.25rem; font-weight: 700; color: #059669;">LKR 13,163</div>
                                <div style="font-size: 0.75rem; color: #6b7280;">Cash Collected</div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 0.75rem; padding: 0.5rem; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 0.375rem; text-align: center;">
                            <div style="font-size: 1rem; font-weight: 600; color: #0369a1;">LKR 7,088</div>
                            <div style="font-size: 0.75rem; color: #64748b;">Card Collected</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initializeProfitChart() {
        const canvas = document.getElementById('profitTrendChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const profitData = [9500, 12000, 10500, 16000, 22000, 19500, 12400];

        this.drawProfitTrendChart(ctx, canvas, labels, profitData);
    }

    drawProfitTrendChart(ctx, canvas, labels, profitData) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const logicalW = canvas.offsetWidth;
        const logicalH = canvas.offsetHeight;
        canvas.width = Math.round(logicalW * dpr);
        canvas.height = Math.round(logicalH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const padL = 45, padR = 15, padT = 20, padB = 35;
        const chartWidth = logicalW - padL - padR;
        const chartHeight = logicalH - padT - padB;
        const maxValue = 26000;

        // Clear canvas
        ctx.clearRect(0, 0, logicalW, logicalH);

        // Set font for labels
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#64748b';

        // Draw Y-axis range marks and labels
        const ySteps = 4;
        for (let i = 0; i <= ySteps; i++) {
            const y = padT + chartHeight - (i / ySteps) * chartHeight;
            const value = (i / ySteps) * maxValue;
            
            // Draw horizontal grid line (lighter)
            ctx.strokeStyle = '#f9fafb';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(padL + chartWidth, y);
            ctx.stroke();
            
            // Draw Y-axis mark (smaller)
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(padL - 2, y);
            ctx.lineTo(padL, y);
            ctx.stroke();
            
            // Draw Y-axis label (simpler format)
            ctx.fillStyle = '#64748b';
            ctx.font = '9px Inter';
            ctx.textAlign = 'right';
            ctx.fillText((value / 1000).toFixed(0) + 'k', padL - 5, y + 2);
        }

        // Draw X and Y axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, padT);
        ctx.lineTo(padL, padT + chartHeight);
        ctx.lineTo(padL + chartWidth, padT + chartHeight);
        ctx.stroke();

        // Simple bar chart implementation for profit only
        const barWidth = chartWidth / (labels.length * 1.8);
        const gap = barWidth * 0.3;

        // Draw profit bars
        labels.forEach((label, i) => {
            const x = padL + (chartWidth / labels.length) * i + gap;
            
            // Profit bar
            const profitHeight = (profitData[i] / maxValue) * chartHeight;
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x, padT + chartHeight - profitHeight, barWidth, profitHeight);
            
            // Draw X-axis mark (smaller)
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            const centerX = x + barWidth / 2;
            ctx.moveTo(centerX, padT + chartHeight);
            ctx.lineTo(centerX, padT + chartHeight + 2);
            ctx.stroke();
            
            // Draw X-axis label (smaller)
            ctx.fillStyle = '#64748b';
            ctx.font = '9px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(label, centerX, logicalH - 8);
        });

        // Draw axis titles (smaller)
        ctx.fillStyle = '#374151';
        ctx.font = '10px Inter';
        ctx.fontWeight = '500';
        
        // Y-axis title
        ctx.save();
        ctx.translate(12, padT + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Profit (LKR)', 0, 0);
        ctx.restore();
        
        // X-axis title
        ctx.textAlign = 'center';
        ctx.fillText('Day of Week', padL + chartWidth / 2, logicalH - 2);

        // Legend (smaller)
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(padL, 3, 8, 8);
        ctx.fillStyle = '#64748b';
        ctx.font = '9px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Profit', padL + 12, 10);
    }

    initializeCashierPerformanceChart() {
        const canvas = document.getElementById('cashierPerformanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const labels = ['Bills Processed', 'Total Sales', 'Cash Collected', 'Card Collected'];
        const cashier1Data = [18, 28500, 18525, 9975];
        const cashier2Data = [16, 20250, 13163, 7088];

        this.drawCashierPerformanceChart(ctx, canvas, labels, cashier1Data, cashier2Data);
    }

    drawCashierPerformanceChart(ctx, canvas, labels, cashier1Data, cashier2Data) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const logicalW = canvas.offsetWidth;
        const logicalH = canvas.offsetHeight;
        canvas.width = Math.round(logicalW * dpr);
        canvas.height = Math.round(logicalH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const padL = 45, padR = 15, padT = 20, padB = 35;
        const chartWidth = logicalW - padL - padR;
        const chartHeight = logicalH - padT - padB;
        const maxValue = 35000;

        // Clear canvas
        ctx.clearRect(0, 0, logicalW, logicalH);

        // Set font for labels
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#64748b';

        // Draw Y-axis range marks and labels
        const ySteps = 4;
        for (let i = 0; i <= ySteps; i++) {
            const y = padT + chartHeight - (i / ySteps) * chartHeight;
            const value = (i / ySteps) * maxValue;
            
            // Draw horizontal grid line (lighter)
            ctx.strokeStyle = '#f9fafb';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(padL + chartWidth, y);
            ctx.stroke();
            
            // Draw Y-axis mark (smaller)
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(padL - 2, y);
            ctx.lineTo(padL, y);
            ctx.stroke();
            
            // Draw Y-axis label (simpler format)
            ctx.fillStyle = '#64748b';
            ctx.font = '9px Inter';
            ctx.textAlign = 'right';
            ctx.fillText((value / 1000).toFixed(0) + 'k', padL - 5, y + 2);
        }

        // Draw X and Y axes
        ctx.strokeStyle = '#e5e7eb';
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
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(x, padT + chartHeight - cashier1Height, barWidth, cashier1Height);
            
            // Cashier 2 bar
            const cashier2Height = (cashier2Data[i] / maxValue) * chartHeight;
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x + barWidth + gap/2, padT + chartHeight - cashier2Height, barWidth, cashier2Height);
            
            // Draw X-axis mark (smaller)
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            const centerX = x + barWidth + gap/4;
            ctx.moveTo(centerX, padT + chartHeight);
            ctx.lineTo(centerX, padT + chartHeight + 2);
            ctx.stroke();
            
            // Draw X-axis label (smaller)
            ctx.fillStyle = '#64748b';
            ctx.font = '9px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(label, centerX, logicalH - 8);
        });

        // Draw axis titles (smaller)
        ctx.fillStyle = '#374151';
        ctx.font = '10px Inter';
        ctx.fontWeight = '500';
        
        // Y-axis title
        ctx.save();
        ctx.translate(12, padT + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Amount (LKR)', 0, 0);
        ctx.restore();
        
        // X-axis title
        ctx.textAlign = 'center';
        ctx.fillText('Performance Metrics', padL + chartWidth / 2, logicalH - 2);

        // Legend (smaller)
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(padL, 3, 8, 8);
        ctx.fillStyle = '#64748b';
        ctx.font = '9px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Cashier 1', padL + 12, 10);

        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(padL + 70, 3, 8, 8);
        ctx.fillStyle = '#64748b';
        ctx.fillText('Cashier 2', padL + 82, 10);
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

        // Use loaded data or fallback to defaults
        const dailySalesData = this.reportData.daily_sales || {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            sales: [35000, 48000, 42000, 61000, 78000, 72000, 48750],
            profit: [9500, 12000, 10500, 16000, 22000, 19500, 12400]
        };

        const labels = dailySalesData.labels;
        const salesData = dailySalesData.sales;
        const profitData = dailySalesData.profit;

        this.drawAnimatedBarChart(ctx, canvas, labels, salesData, profitData);
    }

    drawAnimatedBarChart(ctx, canvas, labels, salesData, profitData) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const logicalW = canvas.offsetWidth;
        const logicalH = canvas.offsetHeight;
        canvas.width = Math.round(logicalW * dpr);
        canvas.height = Math.round(logicalH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const padL = 45, padR = 15, padT = 20, padB = 35;
        const chartWidth = logicalW - padL - padR;
        const chartHeight = logicalH - padT - padB;
        const maxValue = 80000;

        // Clear canvas
        ctx.clearRect(0, 0, logicalW, logicalH);

        // Set font for labels
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#64748b';

        // Draw Y-axis range marks and labels
        const ySteps = 4;
        for (let i = 0; i <= ySteps; i++) {
            const y = padT + chartHeight - (i / ySteps) * chartHeight;
            const value = (i / ySteps) * maxValue;
            
            // Draw horizontal grid line (lighter)
            ctx.strokeStyle = '#f9fafb';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(padL + chartWidth, y);
            ctx.stroke();
            
            // Draw Y-axis mark (smaller)
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(padL - 2, y);
            ctx.lineTo(padL, y);
            ctx.stroke();
            
            // Draw Y-axis label (simpler format)
            ctx.fillStyle = '#64748b';
            ctx.font = '9px Inter';
            ctx.textAlign = 'right';
            ctx.fillText((value / 1000).toFixed(0) + 'k', padL - 5, y + 2);
        }

        // Draw X and Y axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, padT);
        ctx.lineTo(padL, padT + chartHeight);
        ctx.lineTo(padL + chartWidth, padT + chartHeight);
        ctx.stroke();

        // Simple bar chart implementation
        const barWidth = chartWidth / (labels.length * 2.5);
        const gap = barWidth * 0.5;

        // Draw bars
        labels.forEach((label, i) => {
            const x = padL + (chartWidth / labels.length) * i + gap;
            
            // Sales bar
            const salesHeight = (salesData[i] / maxValue) * chartHeight;
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(x, padT + chartHeight - salesHeight, barWidth, salesHeight);
            
            // Profit bar
            const profitHeight = (profitData[i] / maxValue) * chartHeight;
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x + barWidth + gap/2, padT + chartHeight - profitHeight, barWidth, profitHeight);
            
            // Draw X-axis mark (smaller)
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            const centerX = x + barWidth + gap/4;
            ctx.moveTo(centerX, padT + chartHeight);
            ctx.lineTo(centerX, padT + chartHeight + 2);
            ctx.stroke();
            
            // Draw X-axis label (smaller)
            ctx.fillStyle = '#64748b';
            ctx.font = '9px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(label, centerX, logicalH - 8);
        });

        // Draw axis titles (smaller)
        ctx.fillStyle = '#374151';
        ctx.font = '10px Inter';
        ctx.fontWeight = '500';
        
        // Y-axis title
        ctx.save();
        ctx.translate(12, padT + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Amount (LKR)', 0, 0);
        ctx.restore();
        
        // X-axis title
        ctx.textAlign = 'center';
        ctx.fillText('Day of Week', padL + chartWidth / 2, logicalH - 2);

        // Legend (smaller)
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(padL, 3, 8, 8);
        ctx.fillStyle = '#64748b';
        ctx.font = '9px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Sales', padL + 12, 10);

        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(padL + 50, 3, 8, 8);
        ctx.fillStyle = '#64748b';
        ctx.fillText('Profit', padL + 62, 10);
    }

    initializeStockValuationChart() {
        const canvas = document.getElementById('stockValuationChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Stock valuation data
        const medicines = [
            'Panadol 500mg', 'Augmentin 625', 'Omeprazole 20', 'Losartan 50',
            'Cetirizine 10', 'Metformin 500', 'Alprazolam 0.5', 'Vitamin C 1000'
        ];
        const costValues = [54000, 14800, 18200, 22100, 264, 7120, 4275, 23100];
        const sellValues = [78000, 20000, 27300, 32300, 440, 12460, 6750, 35700];
        const profitValues = [24000, 5200, 9100, 10200, 176, 5340, 2475, 12600];

        this.drawStockValuationChart(ctx, canvas, medicines, costValues, sellValues, profitValues);
    }

    drawStockValuationChart(ctx, canvas, medicines, costValues, sellValues, profitValues) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const logicalW = canvas.offsetWidth;
        const logicalH = canvas.offsetHeight;
        canvas.width = Math.round(logicalW * dpr);
        canvas.height = Math.round(logicalH * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const padL = 60, padR = 15, padT = 20, padB = 60;
        const chartWidth = logicalW - padL - padR;
        const chartHeight = logicalH - padT - padB;
        const maxValue = 80000;

        // Clear canvas
        ctx.clearRect(0, 0, logicalW, logicalH);

        // Set font for labels
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#64748b';

        // Draw Y-axis range marks and labels
        const ySteps = 4;
        for (let i = 0; i <= ySteps; i++) {
            const y = padT + chartHeight - (i / ySteps) * chartHeight;
            const value = (i / ySteps) * maxValue;
            
            // Draw horizontal grid line
            ctx.strokeStyle = '#f9fafb';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(padL + chartWidth, y);
            ctx.stroke();
            
            // Draw Y-axis mark
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(padL - 2, y);
            ctx.lineTo(padL, y);
            ctx.stroke();
            
            // Draw Y-axis label
            ctx.fillStyle = '#64748b';
            ctx.font = '9px Inter';
            ctx.textAlign = 'right';
            ctx.fillText((value / 1000).toFixed(0) + 'k', padL - 5, y + 2);
        }

        // Draw X and Y axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, padT);
        ctx.lineTo(padL, padT + chartHeight);
        ctx.lineTo(padL + chartWidth, padT + chartHeight);
        ctx.stroke();

        // Grouped bar chart implementation
        const groupWidth = chartWidth / medicines.length;
        const barWidth = groupWidth / 3.5;
        const gap = barWidth * 0.2;

        // Draw bars for each medicine
        medicines.forEach((medicine, i) => {
            const x = padL + (groupWidth * i) + (groupWidth - (barWidth * 3 + gap * 2)) / 2;
            
            // Cost Value bar
            const costHeight = (costValues[i] / maxValue) * chartHeight;
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x, padT + chartHeight - costHeight, barWidth, costHeight);
            
            // Sell Value bar
            const sellHeight = (sellValues[i] / maxValue) * chartHeight;
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(x + barWidth + gap, padT + chartHeight - sellHeight, barWidth, sellHeight);
            
            // Profit Value bar
            const profitHeight = (profitValues[i] / maxValue) * chartHeight;
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(x + (barWidth + gap) * 2, padT + chartHeight - profitHeight, barWidth, profitHeight);
            
            // Draw X-axis label (rotated medicine names)
            ctx.save();
            ctx.translate(x + (barWidth * 1.5 + gap), padT + chartHeight + 15);
            ctx.rotate(-Math.PI / 4);
            ctx.fillStyle = '#64748b';
            ctx.font = '8px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(medicine.length > 15 ? medicine.substring(0, 12) + '...' : medicine, 0, 0);
            ctx.restore();
        });

        // Draw axis titles
        ctx.fillStyle = '#374151';
        ctx.font = '10px Inter';
        ctx.fontWeight = '500';
        
        // Y-axis title
        ctx.save();
        ctx.translate(12, padT + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('Value (LKR)', 0, 0);
        ctx.restore();
        
        // X-axis title
        ctx.textAlign = 'center';
        ctx.fillText('Medicines', padL + chartWidth / 2, logicalH - 5);

        // Legend
        const legendY = 5;
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(padL, legendY, 8, 8);
        ctx.fillStyle = '#64748b';
        ctx.font = '9px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Cost Value', padL + 12, legendY + 7);

        ctx.fillStyle = '#22c55e';
        ctx.fillRect(padL + 80, legendY, 8, 8);
        ctx.fillStyle = '#64748b';
        ctx.fillText('Sell Value', padL + 92, legendY + 7);

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(padL + 160, legendY, 8, 8);
        ctx.fillStyle = '#64748b';
        ctx.fillText('Profit', padL + 172, legendY + 7);
    }

    cleanup() {
        console.log('PharmacyReports cleanup() called');
        // Clean up charts if any
        if (this.charts && typeof this.charts === 'object') {
            Object.values(this.charts).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
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