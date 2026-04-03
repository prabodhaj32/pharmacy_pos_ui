/** @odoo-module **/

class PharmacyPurchasing {
    constructor() {
        this.charts = {};
        this.refreshInterval = null;
        this.purchaseOrders = [];
        this.suppliers = [];
        this.currentPurchasingTab = 'orders';
        this.purchaseOrdersSearchQuery = '';
        this.dashboardData = {};
        this.ordersData = {};
        this.grnData = {};
        this.suppliersData = {};
        
        // Initialize data
        this.loadPurchasingData().then(() => {
            this.renderPurchasingPage();
            this.initializePurchasingHandlers();
            this.updatePurchasingStats();
            this.startAutoRefresh();
        });
    }

    async loadPurchasingData() {
        const basePath = '/pharmacy_pos_ui/static/src/js/data/purchasing/';

        try {
            this.dashboardData = await this.fetchJSON(basePath + 'dashboard.json');
            this.ordersData = await this.fetchJSON(basePath + 'purchase_orders.json');
            this.grnData = await this.fetchJSON(basePath + 'grn.json');
            this.suppliersData = await this.fetchJSON(basePath + 'suppliers.json');

            // Use this data instead of hardcoded arrays
            this.purchaseOrders = this.ordersData.orders || [];
            this.suppliers = this.suppliersData.suppliers || [];
            
            console.log('Purchasing data loaded successfully:', {
                dashboard: this.dashboardData,
                orders: this.ordersData,
                grn: this.grnData,
                suppliers: this.suppliersData
            });
        } catch (error) {
            console.error('Error loading purchasing data:', error);
            // Fallback to default data if JSON files fail to load
            this.loadDefaultPurchasingData();
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

    loadDefaultPurchasingData() {
        // Fallback data when JSON files are not available
        this.purchaseOrders = [
            {
                id: '1',
                orderNumber: 'PO-001234',
                supplierId: '1',
                supplierName: 'MediSupply Ltd',
                orderDate: new Date().toISOString(),
                items: [
                    { name: 'Paracetamol 500mg', quantity: 100, unitCost: 5.50, batch: 'B001', total: 550.00 },
                    { name: 'Amoxicillin 250mg', quantity: 50, unitCost: 8.75, batch: 'B002', total: 437.50 }
                ],
                totalAmount: 987.50,
                status: 'pending',
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                orderNumber: 'PO-001235',
                supplierId: '2',
                supplierName: 'PharmaDistributors',
                orderDate: new Date(Date.now() - 86400000).toISOString(),
                items: [
                    { name: 'Ibuprofen 400mg', quantity: 75, unitCost: 6.25, batch: 'B003', total: 468.75 }
                ],
                totalAmount: 468.75,
                status: 'received',
                receivedDate: new Date(Date.now() - 43200000).toISOString(),
                createdAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
    }

    savePurchaseOrders() {
        localStorage.setItem('pharmacy_pos_purchase_orders', JSON.stringify(this.purchaseOrders));
    }

    loadSuppliers() {
        const savedSuppliers = localStorage.getItem('pharmacy_pos_suppliers');
        this.suppliers = savedSuppliers ? JSON.parse(savedSuppliers) : [
            { id: '1', name: 'MediSupply Ltd', email: 'info@medisupply.lk', phone: '0112-345678', address: 'Colombo 01', status: 'active' },
            { id: '2', name: 'PharmaDistributors', email: 'orders@pharmadist.lk', phone: '0112-987654', address: 'Kandy', status: 'active' },
            { id: '3', name: 'GlobalHealth Supplies', email: 'contact@globalhealth.lk', phone: '0112-456789', address: 'Galle', status: 'active' }
        ];
    }

    saveSuppliers() {
        localStorage.setItem('pharmacy_pos_suppliers', JSON.stringify(this.suppliers));
    }

    renderPurchasingPage() {
        const container = document.getElementById("dashboard_container");
        
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

        // Make instance globally available for onclick handlers
        window.pharmacyPurchasing = this;
        
        // Initialize content after rendering
        setTimeout(() => {
            this.renderPurchasingContent();
        }, 100);
    }

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
        
        // Add search input event listener
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                this.purchaseOrdersSearchQuery = query;
                this.renderPurchasingContent();
            });
        }
    }

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
                        <button onclick="pharmacyPurchasing.viewPurchaseOrder('${order.id}')" style="padding: 2px 6px; font-size: 0.65rem; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 4px; cursor: pointer; color: #475569;" title="View">👁</button>
                        <button onclick="pharmacyPurchasing.editPurchaseOrder('${order.id}')" style="padding: 2px 6px; font-size: 0.65rem; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 4px; cursor: pointer; color: #475569;" title="Edit">✏️</button>
                        ${order.status === 'pending' ? `
                            <button onclick="pharmacyPurchasing.receivePurchaseOrder('${order.id}')" style="padding: 2px 6px; font-size: 0.65rem; border: 1px solid #22c55e; background: #dcfce7; border-radius: 4px; cursor: pointer; color: #16a34a;" title="Receive">✓</button>
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

    renderGRNTab(container) {
        const grnRecords = this.grnData?.grn_records || [];
        
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
                        ${grnRecords.length === 0 ? `
                            <tr class="cart-empty-row">
                                <td colspan="6" class="cart-empty" style="text-align: center; padding: 2rem 1rem;">
                                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                        <div style="font-size: 2rem; margin-bottom: 0.5rem; color: #cbd5e1;">📋</div>
                                        <p style="font-size: 0.875rem; color: #64748b; font-weight: 500; margin: 0;">No GRN records found</p>
                                    </div>
                                </td>
                            </tr>
                        ` : grnRecords.map(grn => this.renderGRNRow(grn)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderGRNRow(grn) {
        const receivedDate = new Date(grn.receivedDate || grn.orderDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        return `
            <tr class="cart-row" style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.75rem; font-size: 0.75rem; font-weight: 600; color: #1e293b;">${grn.grnNumber}</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; color: #475569;">${grn.orderNumber}</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; color: #475569;">${grn.supplierName}</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; color: #64748b;">${receivedDate}</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; color: #64748b;">${grn.items ? grn.items.length : 0} items</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; text-align: right; font-weight: 600; color: #0f172a;">${this.formatLKR(grn.totalAmount)}</td>
            </tr>
        `;
    }

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
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 80px;">Status</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 80px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredSuppliers.length === 0 ? `
                            <tr class="cart-empty-row">
                                <td colspan="5" class="cart-empty" style="text-align: center; padding: 2rem 1rem;">
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
    }

    renderSupplierRow(supplier) {
        const statusBadge = supplier.status === 'active' 
            ? '<span style="padding: 2px 8px; font-size: 0.6rem; background: #dcfce7; color: #16a34a; border-radius: 12px; font-weight: 500;">✅ Active</span>'
            : '<span style="padding: 2px 8px; font-size: 0.6rem; background: #fee2e2; color: #dc2626; border-radius: 12px; font-weight: 500;">❌ Inactive</span>';

        return `
            <tr class="cart-row" style="border-bottom: 1px solid #f1f5f9; transition: background-color 0.2s ease;" onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor='transparent'">
                <td style="padding: 0.75rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <div style="font-weight: 600; color: #1e293b; font-size: 0.75rem;">${supplier.name}</div>
                        <div style="font-size: 0.65rem; color: #64748b;">📧 ${supplier.email}</div>
                        <div style="font-size: 0.65rem; color: #64748b;">📱 ${supplier.phone}</div>
                    </div>
                </td>
                <td style="padding: 0.75rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                        <div style="font-size: 0.7rem; color: #475569; font-weight: 500;">📍 ${supplier.address}</div>
                        <div style="font-size: 0.65rem; color: #64748b;">${supplier.city}</div>
                    </div>
                </td>
                <td style="padding: 0.75rem;">${statusBadge}</td>
                <td style="padding: 0.75rem;">
                    <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
                        <button onclick="pharmacyPurchasing.viewSupplier('${supplier.id}')" style="padding: 3px 6px; font-size: 0.6rem; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 4px; cursor: pointer; color: #475569; transition: all 0.2s ease;" onmouseover="this.style.background='#e2e8f0'; this.style.color='#1e293b'" onmouseout="this.style.background='#f8fafc'; this.style.color='#475569'" title="View Details">👁</button>
                        <button onclick="pharmacyPurchasing.editSupplier('${supplier.id}')" style="padding: 3px 6px; font-size: 0.6rem; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 4px; cursor: pointer; color: #475569; transition: all 0.2s ease;" onmouseover="this.style.background='#e2e8f0'; this.style.color='#1e293b'" onmouseout="this.style.background='#f8fafc'; this.style.color='#475569'" title="Edit Supplier">✏️</button>
                        <button onclick="pharmacyPurchasing.toggleSupplierStatus('${supplier.id}')" style="padding: 3px 6px; font-size: 0.6rem; border: 1px solid ${supplier.status === 'active' ? '#fbbf24' : '#22c55e'}; background: ${supplier.status === 'active' ? '#fef3c7' : '#dcfce7'}; border-radius: 4px; cursor: pointer; color: ${supplier.status === 'active' ? '#d97706' : '#16a34a'}; transition: all 0.2s ease;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='brightness(1)'" title="${supplier.status === 'active' ? 'Deactivate' : 'Activate'}">🔄</button>
                    </div>
                </td>
            </tr>
        `;
    }

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
            (supplier.city && supplier.city.toLowerCase().includes(query))
        );
    }

    // Placeholder methods for modals and actions
    openNewPurchaseOrderModal() {
        if (document.getElementById('purchaseOrderModal')) return;

        const modal = document.createElement('div');
        modal.id = 'purchaseOrderModal';
        modal.className = 'inventory-modal-overlay';
        modal.innerHTML = `
            <div class="inventory-modal" style="max-width: 600px; max-height: 85vh; overflow-y: auto; border-radius: 6px; box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06);" role="dialog" aria-modal="true" aria-labelledby="purchaseOrderTitle">
                <div class="inventory-modal-header" style="background: white; border-bottom: 1px solid #e5e7eb; padding: 1rem; border-radius: 6px 6px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 id="purchaseOrderTitle" style="margin: 0; font-size: 1rem; font-weight: 600; color: #111827;">
                            Create New Purchase Order
                        </h3>
                        <p style="margin: 0.125rem 0 0; font-size: 0.75rem; color: #6b7280;">Add items and supplier details</p>
                    </div>
                    <button type="button" class="inventory-modal-close" aria-label="Close purchase order form" style="background: transparent; border: 1px solid #d1d5db; color: #6b7280; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">×</button>
                </div>
                
                <form id="purchaseOrderForm" style="padding: 1rem; background: white;">
                    <!-- Order Information -->
                    <div style="margin-bottom: 1rem;">
                        <h4 style="margin: 0 0 0.75rem 0; font-size: 0.75rem; font-weight: 600; color: #111827; text-transform: uppercase; letter-spacing: 0.05em;">
                            Order Information
                        </h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                            <div>
                                <label style="display: block; font-size: 0.75rem; font-weight: 500; color: #374151; margin-bottom: 0.125rem;">Supplier *</label>
                                <select name="supplierId" required style="width: 100%; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 3px; font-size: 0.75rem; background: white;">
                                    <option value="">Select Supplier</option>
                                    ${this.suppliers.filter(s => s.status === 'active').map(supplier => 
                                        `<option value="${supplier.id}">${supplier.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-size: 0.75rem; font-weight: 500; color: #374151; margin-bottom: 0.125rem;">Order Date *</label>
                                <input type="date" name="orderDate" required style="width: 100%; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 3px; font-size: 0.75rem; background: white;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 0.75rem; font-weight: 500; color: #374151; margin-bottom: 0.125rem;">Expected Delivery</label>
                                <input type="date" name="expectedDeliveryDate" style="width: 100%; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 3px; font-size: 0.75rem; background: white;">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Order Items -->
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                            <h4 style="margin: 0; font-size: 0.75rem; font-weight: 600; color: #111827; text-transform: uppercase; letter-spacing: 0.05em;">
                                Order Items
                            </h4>
                            <div style="display: flex; gap: 0.375rem;">
                                <button type="button" id="addItemBtn" style="padding: 0.375rem 0.75rem; font-size: 0.625rem; border-radius: 3px; background: #3b82f6; border: 1px solid #2563eb; color: white; font-weight: 500; cursor: pointer;">
                                    Add Item
                                </button>
                                <button type="button" id="clearItemsBtn" style="padding: 0.375rem 0.75rem; font-size: 0.625rem; border-radius: 3px; background: #ef4444; border: 1px solid #dc2626; color: white; font-weight: 500; cursor: pointer;">
                                    Clear All
                                </button>
                            </div>
                        </div>
                        
                        <div id="itemsContainer" style="border: 1px solid #d1d5db; border-radius: 3px; padding: 0.75rem; background: #f9fafb; min-height: 100px;">
                            <div id="noItemsMessage" style="text-align: center; padding: 1.5rem; color: #6b7280;">
                                <p style="font-size: 0.75rem; margin: 0;">No items added yet. Click "Add Item" to start.</p>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #e5e7eb;">
                            <div style="font-size: 0.75rem; color: #6b7280;">
                                <span id="itemCount">0 items</span> • Total quantity: <span id="totalQuantity">0</span>
                            </div>
                            <div id="orderTotal" style="font-size: 0.875rem; font-weight: 600; color: #111827;">
                                Total: <span style="color: #059669;">LKR 0.00</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Form Actions -->
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                        <div style="font-size: 0.75rem; color: #6b7280;">
                            <span style="color: #ef4444;">*</span> Required fields
                        </div>
                        <div style="display: flex; gap: 0.75rem;">
                            <button type="button" class="btn btn-secondary" id="cancelPurchaseOrderBtn" style="padding: 0.375rem 1rem; font-size: 0.75rem; border-radius: 3px; background: white; color: #374151; border: 1px solid #d1d5db; font-weight: 500; cursor: pointer;">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-primary" style="padding: 0.375rem 1rem; font-size: 0.75rem; border-radius: 3px; background: #10b981; border: 1px solid #059669; color: white; font-weight: 500; cursor: pointer;">
                                Create Purchase Order
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Set default order date to today
        const orderDateInput = modal.querySelector('input[name="orderDate"]');
        if (orderDateInput) {
            orderDateInput.value = new Date().toISOString().split('T')[0];
        }

        // Initialize items array
        this.currentOrderItems = [];
        this.updateItemsDisplay();

        // Event listeners
        const close = () => this.closePurchaseOrderModal();
        modal.querySelector('.inventory-modal-close')?.addEventListener('click', close);
        modal.querySelector('#cancelPurchaseOrderBtn')?.addEventListener('click', close);
        modal.addEventListener('click', (ev) => {
            if (ev.target === modal) close();
        });

        // Add item button
        modal.querySelector('#addItemBtn')?.addEventListener('click', () => {
            this.addPurchaseOrderItem();
        });

        // Clear items button
        modal.querySelector('#clearItemsBtn')?.addEventListener('click', () => {
            this.clearAllItems();
        });

        // Form submission
        const form = modal.querySelector('#purchaseOrderForm');
        form?.addEventListener('submit', (ev) => {
            ev.preventDefault();
            this.createPurchaseOrderFromForm(form);
        });
    }

    addPurchaseOrderItem() {
        const itemId = Date.now().toString();
        const newItem = {
            id: itemId,
            name: '',
            quantity: 1,
            unitCost: 0,
            batch: '',
            total: 0
        };
        
        this.currentOrderItems.push(newItem);
        this.updateItemsDisplay();
    }

    clearAllItems() {
        if (this.currentOrderItems.length === 0) {
            this.showNotification('No items to clear', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to clear all items? This action cannot be undone.')) {
            this.currentOrderItems = [];
            this.updateItemsDisplay();
            this.showNotification('All items cleared', 'success');
        }
    }

    updateItemsDisplay() {
        const container = document.getElementById('itemsContainer');
        const orderTotal = document.getElementById('orderTotal');
        const itemCount = document.getElementById('itemCount');
        const totalQuantity = document.getElementById('totalQuantity');
        
        if (!container) return;
        
        if (this.currentOrderItems.length === 0) {
            container.innerHTML = `
                <div id="noItemsMessage" style="text-align: center; padding: 2rem; color: #6b7280;">
                    <p style="font-size: 0.875rem; margin: 0;">No items added yet. Click "Add Item" to start.</p>
                </div>
            `;
        } else {
            const itemsHtml = this.currentOrderItems.map((item, index) => `
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 80px; gap: 0.5rem; margin-bottom: 0.5rem; padding: 0.75rem; background: white; border: 1px solid #e5e7eb; border-radius: 4px;">
                    <input type="text" placeholder="Item name" value="${item.name}" 
                           onchange="pharmacyPurchasing.updateItemField('${item.id}', 'name', this.value)"
                           style="padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; background: white;">
                    <input type="number" placeholder="Qty" value="${item.quantity}" min="1" 
                           onchange="pharmacyPurchasing.updateItemField('${item.id}', 'quantity', parseFloat(this.value) || 1)"
                           style="padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; background: white;">
                    <input type="number" placeholder="Unit cost" value="${item.unitCost}" min="0" step="0.01"
                           onchange="pharmacyPurchasing.updateItemField('${item.id}', 'unitCost', parseFloat(this.value) || 0)"
                           style="padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; background: white;">
                    <input type="text" placeholder="Batch #" value="${item.batch}"
                           onchange="pharmacyPurchasing.updateItemField('${item.id}', 'batch', this.value)"
                           style="padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; background: white;">
                    <button type="button" onclick="pharmacyPurchasing.removeItem('${item.id}')" 
                            style="padding: 0.375rem; background: #ef4444; color: white; border: 1px solid #dc2626; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Remove</button>
                </div>
            `).join('');
            
            container.innerHTML = itemsHtml;
        }
        
        // Update statistics
        const total = this.currentOrderItems.reduce((sum, item) => sum + item.total, 0);
        const quantity = this.currentOrderItems.reduce((sum, item) => sum + item.quantity, 0);
        
        if (orderTotal) {
            orderTotal.innerHTML = `Total: <span style="color: #059669;">${this.formatLKR(total)}</span>`;
        }
        
        if (itemCount) {
            itemCount.textContent = `${this.currentOrderItems.length} items`;
        }
        
        if (totalQuantity) {
            totalQuantity.textContent = quantity.toString();
        }
    }

    updateItemField(itemId, field, value) {
        const item = this.currentOrderItems.find(i => i.id === itemId);
        if (!item) return;
        
        item[field] = value;
        
        // Recalculate total
        if (field === 'quantity' || field === 'unitCost') {
            item.total = item.quantity * item.unitCost;
        }
        
        this.updateItemsDisplay();
    }

    removeItem(itemId) {
        this.currentOrderItems = this.currentOrderItems.filter(item => item.id !== itemId);
        this.updateItemsDisplay();
    }

    closePurchaseOrderModal() {
        const modal = document.getElementById('purchaseOrderModal');
        if (modal) modal.remove();
        this.currentOrderItems = [];
    }

    createPurchaseOrderFromForm(form) {
        const formData = new FormData(form);
        const supplierId = formData.get('supplierId');
        const orderDate = formData.get('orderDate');
        const notes = formData.get('notes') || '';
        const expectedDeliveryDate = formData.get('expectedDeliveryDate') || '';

        if (!supplierId || !orderDate) {
            this.showNotification('Please fill all required fields', 'warning');
            return;
        }

        if (this.currentOrderItems.length === 0) {
            this.showNotification('Please add at least one item', 'warning');
            return;
        }

        // Validate items
        const invalidItems = this.currentOrderItems.filter(item => 
            !item.name || item.quantity <= 0 || item.unitCost <= 0
        );
        
        if (invalidItems.length > 0) {
            this.showNotification('Please fill in all item details correctly', 'warning');
            return;
        }

        const supplier = this.suppliers.find(s => s.id == supplierId);
        if (!supplier) {
            this.showNotification('Invalid supplier selected', 'warning');
            return;
        }

        // Calculate total
        const totalAmount = this.currentOrderItems.reduce((sum, item) => sum + item.total, 0);

        // Generate order number
        const orderNumber = `PO-${Date.now().toString().slice(-6)}`;

        // Create purchase order
        const newOrder = {
            id: Date.now().toString(),
            orderNumber,
            supplierId: supplier.id,
            supplierName: supplier.name,
            orderDate,
            items: [...this.currentOrderItems],
            totalAmount,
            status: 'pending',
            notes,
            expectedDeliveryDate,
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

    viewPurchaseOrder(orderId) {
        const order = this.purchaseOrders.find(o => o.id === orderId);
        if (order) {
            this.showNotification(`Viewing order ${order.orderNumber}`, 'info');
        }
    }

    editPurchaseOrder(orderId) {
        const order = this.purchaseOrders.find(o => o.id === orderId);
        if (order) {
            this.showNotification(`Editing order ${order.orderNumber}`, 'info');
        }
    }

    receivePurchaseOrder(orderId) {
        const order = this.purchaseOrders.find(o => o.id === orderId);
        if (order && order.status === 'pending') {
            order.status = 'received';
            order.receivedDate = new Date().toISOString();
            this.savePurchaseOrders();
            this.updatePurchasingStats();
            this.renderPurchasingContent();
            this.showNotification(`Order ${order.orderNumber} received successfully!`, 'success');
        }
    }

    openAddSupplierModal() {
        this.showNotification('Add Supplier modal would open here', 'info');
    }

    viewSupplier(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (supplier) {
            this.showNotification(`Viewing supplier ${supplier.name}`, 'info');
        }
    }

    editSupplier(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (supplier) {
            this.showNotification(`Editing supplier ${supplier.name}`, 'info');
        }
    }

    toggleSupplierStatus(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (supplier) {
            supplier.status = supplier.status === 'active' ? 'inactive' : 'active';
            this.saveSuppliers();
            this.updatePurchasingStats();
            this.renderPurchasingContent();
            const statusText = supplier.status === 'active' ? 'activated' : 'deactivated';
            this.showNotification(`Supplier "${supplier.name}" ${statusText}`, 'success');
        }
    }

    formatLKR(amount) {
        return `LKR ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    showNotification(message, type = 'info') {
        const notif = document.createElement('div');
        notif.style.cssText = `position:fixed;top:20px;right:20px;padding:12px 20px;border-radius:6px;color:white;z-index:10000;`;
        notif.style.backgroundColor = type === 'success' ? '#22c55e' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6';
        notif.textContent = message;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }

    startAutoRefresh() {
        // Auto-refresh data every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.updatePurchasingStats();
        }, 30000);
    }

    cleanup() {
        // Clear auto-refresh interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Clean up global reference
        if (window.pharmacyPurchasing === this) {
            delete window.pharmacyPurchasing;
        }
    }
}

// Export for use in dashboard
window.PharmacyPurchasing = PharmacyPurchasing;