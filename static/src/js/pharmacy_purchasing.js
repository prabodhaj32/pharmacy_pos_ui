import { rpc } from "@web/core/network/rpc";

export class PharmacyPurchasing {
  constructor() {
    this.charts = {};
    this.refreshInterval = null;
    this.purchaseOrders = [];
    this.suppliers = [];
    this.currentPurchasingTab = "orders";
    this.purchaseOrdersSearchQuery = "";
    this.dashboardData = {};
    this.ordersData = {};
    this.grnData = { grn_records: [] };
    this.rpc = rpc;
    window.pharmacyPurchasing = this;

    // Initialize
    this.init();
  }

  async init() {
    await this.loadPurchasingData();
    this.renderPurchasingPage();
    this.initializePurchasingHandlers();
    this.updatePurchasingStats();
    this.startAutoRefresh();
  }

  // --- Data Helpers ---

  async loadPurchasingData() {
    try {
      const result = await this.rpc("/pharmacy_pos/get_purchasing_data");
      if (result && !result.error) {
        this.suppliers = result.suppliers || [];
        this.purchaseOrders = result.orders || [];
        this.grnData = { grn_records: result.grns || [] };
      }
    } catch (error) {
      console.error("Error loading purchasing data:", error);
    }
  }

  _saveLocal(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  _loadLocal(key, defaultValue) {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  }

  savePurchaseOrders() {
    // Persisted in backend on creation
  }
  saveSuppliers() {
    // Persisted in backend on creation/update
  }
  saveGRNRecords() {
    // Persisted in backend on processing
  }

  async fetchJSON(url) {
    try {
      const response = await fetch(url);
      return response.ok ? await response.json() : null;
    } catch (e) {
      return null;
    }
  }

  // --- UI Helpers ---

  _renderModal({ id, title, subtitle, contentHtml, maxWidth = "560px" }) {
    if (document.getElementById(id)) return;
    const modal = document.createElement("div");
    modal.id = id;
    modal.className = "inventory-modal-overlay";
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    `;

    modal.innerHTML = `
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .premium-input {
          width: 100%; padding: 0.5rem 0.75rem; border: 1px solid rgba(0,0,0,0.1); 
          border-radius: 8px; font-size: 0.75rem; background: rgba(255,255,255,0.6);
          transition: all 0.2s ease; outline: none; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
        }
        .premium-input:focus {
          border-color: #006c11; background: #fff; box-shadow: 0 0 0 3px rgba(0, 108, 17, 0.1);
        }
        .premium-label {
          display: block; font-size: 0.65rem; font-weight: 700; color: #475569; 
          margin-bottom: 0.35rem; text-transform: uppercase; letter-spacing: 0.025em;
        }
        .premium-card {
          padding: 1rem; background: #fff; border: 1px solid rgba(0,0,0,0.05); 
          border-radius: 12px; cursor: pointer; display: flex; 
          justify-content: space-between; align-items: center; transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .premium-card:hover {
          border-color: #006c11; transform: translateY(-2px); 
          box-shadow: 0 4px 12px rgba(0, 108, 17, 0.08);
        }
      </style>
      <div class="inventory-modal" style="
        width: 100%; max-width: ${maxWidth}; max-height: 85vh; overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 16px;
        background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(25px) saturate(200%);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1);
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); position: relative;
      " role="dialog">
        <div class="inventory-modal-header" style="
          background: linear-gradient(to right, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
          border-bottom: 1px solid rgba(0, 0, 0, 0.05); padding: 1rem 1.25rem;
          display: flex; justify-content: space-between; align-items: center;
          position: sticky; top: 0; z-index: 10;
        ">
          <div>
            <h3 style="margin: 0; font-size: 1rem; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">${title}</h3>
            ${subtitle ? `<p style="margin: 0.15rem 0 0; font-size: 0.7rem; color: #64748b; font-weight: 500;">${subtitle}</p>` : ""}
          </div>
          <button type="button" onclick="document.getElementById('${id}').remove()" style="
            background: rgba(255,255,255,0.5); border: 1px solid rgba(0,0,0,0.05);
            color: #64748b; width: 28px; height: 28px; border-radius: 8px;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: all 0.2s; font-size: 1.25rem; font-weight: 300;
          " onmouseover="this.style.background='#fee2e2'; this.style.color='#ef4444'" onmouseout="this.style.background='rgba(255,255,255,0.5)'; this.style.color='#64748b'">×</button>
        </div>
        <div class="inventory-modal-body">${contentHtml}</div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
    return modal;
  }

  _getBadge(text, type = "info") {
    const styles = {
      success: "background: #dcfce7; color: #007513;",
      warning: "background: #fef3c7; color: #d97706;",
      error: "background: #fee2e2; color: #dc2626;",
      info: "background: #e0f2fe; color: #0284c7;",
    };
    return `<span style="padding: 2px 8px; font-size: 0.65rem; border-radius: 12px; font-weight: 500; ${styles[type] || styles.info}">${text}</span>`;
  }

  _getActionButton(icon, title, onClick, colorType = "default") {
    const isSuccess = colorType === "success";
    const border = isSuccess ? "#007513" : "#e2e8f0";
    const bg = isSuccess ? "#dcfce7" : "#f8fafc";
    const color = isSuccess ? "#007513" : "#475569";
    return `<button onclick="${onClick}" style="padding: 2px 6px; font-size: 0.65rem; border: 1px solid ${border}; background: ${bg}; border-radius: 4px; cursor: pointer; color: ${color};" title="${title}">${icon}</button>`;
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
                        <div class="stat-icon" aria-hidden="true" style="font-size: 1.25rem; background: #dcfce7; color: #007513; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">✅</div>
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
                    
                    <!-- Search Only -->
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="position: relative; width: 180px;">
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
    const ordersTabBtn = document.getElementById("ordersTabBtn");
    const grnTabBtn = document.getElementById("grnTabBtn");
    const suppliersTabBtn = document.getElementById("suppliersTabBtn");
    const newPurchaseOrderBtn = document.getElementById("newPurchaseOrderBtn");
    const searchInput = document.getElementById("purchaseOrdersSearchInput");

    ordersTabBtn?.addEventListener("click", () =>
      this.switchPurchasingTab("orders"),
    );
    grnTabBtn?.addEventListener("click", () => this.switchPurchasingTab("grn"));
    suppliersTabBtn?.addEventListener("click", () =>
      this.switchPurchasingTab("suppliers"),
    );

    // Add search input event listener
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        this.purchaseOrdersSearchQuery = query;
        this.renderPurchasingContent();
      });
    }
  }

  switchPurchasingTab(tab) {
    this.currentPurchasingTab = tab;

    // Update tab styles
    const tabs = ["ordersTabBtn", "grnTabBtn", "suppliersTabBtn"];
    tabs.forEach((tabId) => {
      const btn = document.getElementById(tabId);
      if (btn) {
        if (tabId === `${tab}TabBtn`) {
          btn.style.background = "#fff";
          btn.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
          btn.style.fontWeight = "600";
          btn.style.color = "#0f172a";
        } else {
          btn.style.background = "transparent";
          btn.style.boxShadow = "none";
          btn.style.fontWeight = "500";
          btn.style.color = "#64748b";
        }
      }
    });

    // Update search placeholder
    const searchInput = document.getElementById("purchaseOrdersSearchInput");
    if (searchInput) {
      const placeholders = {
        orders: "Search orders...",
        grn: "Search GRN...",
        suppliers: "Search suppliers...",
      };
      searchInput.placeholder =
        placeholders[this.currentPurchasingTab] || "Search...";
    }

    this.renderPurchasingContent();
  }

  updatePurchasingStats() {
    const totalOrders = this.purchaseOrders.length;
    const pendingOrders = this.purchaseOrders.filter(
      (order) => order.status === "pending",
    ).length;
    const receivedOrders = this.purchaseOrders.filter(
      (order) => order.status === "received",
    ).length;
    const activeSuppliers = this.suppliers.filter(
      (supplier) => supplier.status === "active",
    ).length;

    // Update DOM elements
    const totalOrdersEl = document.getElementById("totalOrdersCount");
    const pendingOrdersEl = document.getElementById("pendingOrdersCount");
    const receivedOrdersEl = document.getElementById("receivedOrdersCount");
    const activeSuppliersEl = document.getElementById("activeSuppliersCount");
    const totalSuppliersText = document.getElementById("totalSuppliersText");

    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
    if (receivedOrdersEl) receivedOrdersEl.textContent = receivedOrders;
    if (activeSuppliersEl) activeSuppliersEl.textContent = activeSuppliers;
    if (totalSuppliersText)
      totalSuppliersText.textContent = `${this.suppliers.length} total`;
  }

  renderPurchasingContent() {
    const contentArea = document.getElementById("purchasingContentArea");
    if (!contentArea) return;

    switch (this.currentPurchasingTab) {
      case "orders":
        this.renderOrdersTab(contentArea);
        break;
      case "grn":
        this.renderGRNTab(contentArea);
        break;
      case "suppliers":
        this.renderSuppliersTab(contentArea);
        break;
    }
  }

  renderOrdersTab(container) {
    const filteredOrders = this.getFilteredPurchaseOrders();

    container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h3 style="margin: 0; font-size: 0.875rem; color: #1e293b; font-weight: 600;">📦 Purchase Orders</h3>
                <button onclick="pharmacyPurchasing.openNewPurchaseOrderModal()" style="padding: 6px 14px; font-size: 0.7rem; border-radius: 8px; background: linear-gradient(135deg, #006c11, #004d0c); border: none; color: white; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 108, 17, 0.2); display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 15px rgba(0, 108, 17, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 108, 17, 0.2)'">
                    <span style="font-size: 0.8rem;">+</span> New Purchase Order
                </button>
            </div>
            <div class="cart-table-container inventory-table-container compact" style="background: #ffffff; border: 1px solid var(--border-color, #e5e7eb); border-radius: 0.375rem; overflow: hidden;">
                <table class="cart-table compact" style="width: 100%; text-align: left; border-collapse: collapse;">
                    <thead style="background: #f8fafc; border-bottom: 1px solid var(--border-color, #e5e7eb);">
                        <tr>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 100px;">Order No.</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 150px;">Supplier</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 100px;">Date</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 100px; text-align: right;">Total (LKR)</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 100px; text-align: center;">Status</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 120px; text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          filteredOrders.length === 0
                            ? `
                            <tr class="cart-empty-row">
                                <td colspan="6" class="cart-empty" style="text-align: center; padding: 2rem 1rem;">
                                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                        <div style="font-size: 2rem; margin-bottom: 0.5rem; color: #cbd5e1;">🛒</div>
                                        <p style="font-size: 0.875rem; color: #64748b; font-weight: 500; margin: 0;">No purchase orders found</p>
                                    </div>
                                </td>
                            </tr>
                        `
                            : filteredOrders
                                .map((order) =>
                                  this.renderPurchaseOrderRow(order),
                                )
                                .join("")
                        }
                    </tbody>
                </table>
            </div>
        `;
  }

  renderPurchaseOrderRow(order) {
    const orderDate = new Date(order.orderDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const statusType =
      order.status === "received"
        ? "success"
        : order.status === "cancelled"
          ? "error"
          : "warning";

    return `
            <tr class="cart-row" style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 0.75rem; font-size: 0.75rem; font-weight: 600; color: #1e293b;">${order.orderNumber}</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; color: #475569;">${order.supplierName}</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; color: #64748b;">${orderDate}</td>
                <td style="padding: 0.75rem; font-size: 0.75rem; text-align: right; font-weight: 600; color: #0f172a;">${this.formatLKR(order.totalAmount)}</td>
                <td style="padding: 0.75rem; text-align: center;">${this._getBadge(order.status.charAt(0).toUpperCase() + order.status.slice(1), statusType)}</td>
                <td style="padding: 0.75rem; text-align: center;">
                    <div style="display: flex; gap: 0.25rem; justify-content: center; flex-wrap: nowrap;">
                        ${this._getActionButton("👁", "View", `pharmacyPurchasing.viewPurchaseOrder('${order.id}')`)}
                        ${this._getActionButton("✏️", "Edit", `pharmacyPurchasing.editPurchaseOrder('${order.id}')`)}
                        ${order.status === "pending" ? this._getActionButton("✓", "Receive", `pharmacyPurchasing.receivePurchaseOrder('${order.id}')`, "success") : ""}
                        ${this._getActionButton("🗑️", "Delete", `pharmacyPurchasing.deletePurchaseOrder('${order.id}')`, "error")}
                    </div>
                </td>
            </tr>
        `;
  }

  viewPurchaseOrder(id) {
    const order = this.purchaseOrders.find((o) => String(o.id) === String(id));
    if (!order) return;
    this._renderModal({
      id: "viewPOModal",
      title: `Order Details: ${order.orderNumber}`,
      subtitle: `Supplier: ${order.supplierName}`,
      contentHtml: `
        <div style="padding: 1rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: rgba(255,255,255,0.4); padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05); margin-bottom: 1rem;">
            <div><div class="premium-label">Status</div><div>${this._getBadge(order.status, order.status === "received" ? "success" : "warning")}</div></div>
            <div><div class="premium-label">Total Amount</div><div style="font-weight: 700; color: #006c11;">${this.formatLKR(order.totalAmount)}</div></div>
            <div><div class="premium-label">Order Date</div><div style="font-size: 0.75rem; color: #1e293b;">${new Date(order.orderDate).toLocaleDateString()}</div></div>
            <div><div class="premium-label">Expected Delivery</div><div style="font-size: 0.75rem; color: #1e293b;">${order.expectedDeliveryDate || "N/A"}</div></div>
          </div>
          <div class="premium-label">Order Items</div>
          <div style="border: 1px solid rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden; background: rgba(255,255,255,0.5);">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem;">
              <thead style="background: rgba(0,0,0,0.02);">
                <tr>
                  <th style="padding: 0.5rem; text-align: left;">Item Name</th>
                  <th style="padding: 0.5rem; text-align: center;">Qty</th>
                  <th style="padding: 0.5rem; text-align: right;">Unit Price</th>
                </tr>
              </thead>
              <tbody>
                ${(order.items || [])
                  .map(
                    (i) => `
                  <tr style="border-top: 1px solid rgba(0,0,0,0.03);">
                    <td style="padding: 0.5rem;">${i.name}</td>
                    <td style="padding: 0.5rem; text-align: center;">${i.quantity}</td>
                    <td style="padding: 0.5rem; text-align: right;">${this.formatLKR(i.unitCost)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          <div style="display: flex; justify-content: flex-end; padding-top: 1.5rem;">
            <button onclick="document.getElementById('viewPOModal').remove()" style="padding: 0.4rem 1.5rem; font-size: 0.75rem; border-radius: 6px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-weight: 600;">Close</button>
          </div>
        </div>
      `,
    });
  }

  editPurchaseOrder(id) {
    this.showNotification(
      "Edit functionality is currently being implemented.",
      "info",
    );
  }

  async deletePurchaseOrder(id) {
    if (!confirm("Are you sure you want to delete this purchase order?"))
      return;
    try {
      const result = await this.rpc("/pharmacy_pos/delete_purchase_order", {
        id,
      });
      if (result && result.success) {
        await this.loadPurchasingData();
        this.renderPurchasingContent();
        this.showNotification(
          "Purchase order deleted successfully.",
          "success",
        );
      } else {
        this.showNotification(
          result.error || "Failed to delete order",
          "error",
        );
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      this.showNotification("Error connecting to server", "error");
    }
  }

  async receivePurchaseOrder(orderId) {
    try {
      const result = await this.rpc("/pharmacy_pos/process_grn", { orderId });
      if (result && result.success) {
        await this.loadPurchasingData();
        this.renderPurchasingContent();
        this.showNotification(
          "Inventory received and GRN recorded!",
          "success",
        );
      } else {
        this.showNotification(result.error || "Failed to process GRN", "error");
      }
    } catch (error) {
      console.error("Error processing GRN:", error);
      this.showNotification("Error processing GRN", "error");
    }
  }

  renderGRNTab(container) {
    const grnRecords = this.grnData?.grn_records || [];

    container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h3 style="margin: 0; font-size: 0.875rem; color: #1e293b; font-weight: 600;">📋 Goods Received Notes</h3>
                <button onclick="pharmacyPurchasing.openNewGRNModal()" style="padding: 6px 14px; font-size: 0.7rem; border-radius: 8px; background: linear-gradient(135deg, #006c11, #004d0c); border: none; color: white; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 108, 17, 0.2); display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 15px rgba(0, 108, 17, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 108, 17, 0.2)'">
                    <span style="font-size: 0.8rem;">+</span> Create New GRN
                </button>
            </div>
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
                        ${
                          grnRecords.length === 0
                            ? `
                            <tr class="cart-empty-row">
                                <td colspan="6" class="cart-empty" style="text-align: center; padding: 2rem 1rem;">
                                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                        <div style="font-size: 2rem; margin-bottom: 0.5rem; color: #cbd5e1;">📋</div>
                                        <p style="font-size: 0.875rem; color: #64748b; font-weight: 500; margin: 0;">No GRN records found</p>
                                    </div>
                                </td>
                            </tr>
                        `
                            : grnRecords
                                .map((grn) => this.renderGRNRow(grn))
                                .join("")
                        }
                    </tbody>
                </table>
            </div>
        `;
  }

  renderGRNRow(grn) {
    const receivedDate = new Date(
      grn.receivedDate || grn.orderDate,
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
                <button onclick="pharmacyPurchasing.openAddSupplierModal()" style="padding: 6px 14px; font-size: 0.7rem; border-radius: 8px; background: linear-gradient(135deg, #006c11, #004d0c); border: none; color: white; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 108, 17, 0.2); display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 15px rgba(0, 108, 17, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 108, 17, 0.2)'">
                    <span style="font-size: 0.8rem;">+</span> Add Supplier
                </button>
            </div>
            <div class="cart-table-container inventory-table-container compact" style="background: #ffffff; border: 1px solid var(--border-color, #e5e7eb); border-radius: 0.375rem; overflow: hidden;">
                <table class="cart-table compact" style="width: 100%; text-align: left; border-collapse: collapse;">
                    <thead style="background: #f8fafc; border-bottom: 1px solid var(--border-color, #e5e7eb);">
                        <tr>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 180px;">Supplier Details</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 150px;">Contact Information</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 120px;">Location</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 100px; text-align: center;">Status</th>
                            <th style="padding: 0.5rem 0.75rem; font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; min-width: 120px; text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                          filteredSuppliers.length === 0
                            ? `
                            <tr class="cart-empty-row">
                                <td colspan="5" class="cart-empty" style="text-align: center; padding: 2rem 1rem;">
                                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                        <div style="font-size: 2rem; margin-bottom: 0.5rem; color: #cbd5e1;">🏢</div>
                                        <p style="font-size: 0.875rem; color: #64748b; font-weight: 500; margin: 0;">No suppliers found</p>
                                        <p style="font-size: 0.75rem; color: #94a3b8; margin: 0.25rem 0 0;">Click "Add Supplier" to create your first supplier</p>
                                    </div>
                                </td>
                            </tr>
                        `
                            : filteredSuppliers
                                .map((supplier) =>
                                  this.renderSupplierRow(supplier),
                                )
                                .join("")
                        }
                    </tbody>
                </table>
            </div>
        `;
  }

  renderSupplierRow(supplier) {
    const statusType = supplier.status === "active" ? "success" : "error";

    return `
            <tr class="cart-row" style="border-bottom: 1px solid #f1f5f9; transition: background-color 0.2s ease;" onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor='transparent'">
                <td style="padding: 0.75rem;">
                    <div style="font-weight: 600; color: #1e293b; font-size: 0.75rem;">${supplier.name}</div>
                </td>
                <td style="padding: 0.75rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                        <div style="font-size: 0.65rem; color: #64748b;">📧 ${supplier.email || "N/A"}</div>
                        <div style="font-size: 0.65rem; color: #64748b;">📱 ${supplier.phone || "N/A"}</div>
                    </div>
                </td>
                <td style="padding: 0.75rem;">
                    <div style="font-size: 0.7rem; color: #475569; font-weight: 500;">📍 ${supplier.address || "N/A"}</div>
                </td>
                <td style="padding: 0.75rem; text-align: center;">${this._getBadge(supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1), statusType)}</td>
                <td style="padding: 0.75rem; text-align: center;">
                    <div style="display: flex; gap: 0.25rem; justify-content: center; flex-wrap: nowrap;">
                        ${this._getActionButton("👁", "View", `pharmacyPurchasing.viewSupplier('${supplier.id}')`)}
                        ${this._getActionButton("✏️", "Edit", `pharmacyPurchasing.editSupplier('${supplier.id}')`)}
                        ${this._getActionButton("🔄", supplier.status === "active" ? "Deactivate" : "Activate", `pharmacyPurchasing.toggleSupplierStatus('${supplier.id}')`, supplier.status === "active" ? "warning" : "success")}
                        ${this._getActionButton("🗑️", "Delete", `pharmacyPurchasing.deleteSupplier('${supplier.id}')`, "error")}
                    </div>
                </td>
            </tr>
        `;
  }

  async deleteSupplier(id) {
    if (
      !confirm(
        "Are you sure you want to delete this supplier? This will also affect linked orders.",
      )
    )
      return;
    try {
      const result = await this.rpc("/pharmacy_pos/delete_supplier", { id });
      if (result && result.success) {
        await this.loadPurchasingData();
        this.renderPurchasingContent();
        this.showNotification("Supplier deleted successfully.", "success");
      } else {
        this.showNotification(
          result.error || "Failed to delete supplier",
          "error",
        );
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      this.showNotification("Error connecting to server", "error");
    }
  }

  getFilteredPurchaseOrders() {
    const query = (this.purchaseOrdersSearchQuery || "").toLowerCase().trim();
    if (!query) return this.purchaseOrders;
    return this.purchaseOrders.filter(
      (o) =>
        (o.orderNumber && o.orderNumber.toLowerCase().includes(query)) ||
        (o.supplierName && o.supplierName.toLowerCase().includes(query)) ||
        (o.status && o.status.toLowerCase().includes(query)),
    );
  }

  getFilteredSuppliers() {
    const query = (this.purchaseOrdersSearchQuery || "").toLowerCase().trim();
    if (!query) return this.suppliers;
    return this.suppliers.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(query)) ||
        (s.email && s.email.toLowerCase().includes(query)) ||
        (s.phone && s.phone.includes(query)) ||
        (s.address && s.address.toLowerCase().includes(query)) ||
        (s.city && s.city.toLowerCase().includes(query)),
    );
  }

  // --- Modals ---

  openNewPurchaseOrderModal() {
    this._renderModal({
      id: "purchaseOrderModal",
      title: "New Purchase Order",
      subtitle: "Select supplier and add items to your order",
      contentHtml: `
        <form id="purchaseOrderForm" style="padding: 1.25rem;">
          <div style="margin-bottom: 1rem;">
            <label class="premium-label">Supplier *</label>
            <select name="supplierId" required class="premium-input" style="appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 0.75rem center; background-size: 1rem;">
              <option value="">Select a supplier...</option>
              ${this.suppliers
                .filter((s) => s.status === "active")
                .map((s) => `<option value="${s.id}">${s.name}</option>`)
                .join("")}
            </select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label class="premium-label">Order Date *</label>
              <input type="date" name="orderDate" required value="${new Date().toISOString().split("T")[0]}" class="premium-input">
            </div>
            <div>
              <label class="premium-label">Expected Delivery</label>
              <input type="date" name="expectedDeliveryDate" class="premium-input">
            </div>
          </div>
          <div style="margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h4 style="margin: 0; font-size: 0.7rem; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Order Items</h4>
              <button type="button" onclick="pharmacyPurchasing.addPurchaseOrderItem()" style="padding: 4px 12px; font-size: 0.65rem; border-radius: 6px; background: #3b82f6; color: white; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                <span style="font-size: 0.8rem;">+</span> Add Item
              </button>
            </div>
            <div id="itemsContainer" style="border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 0.75rem; background: rgba(0,0,0,0.02); max-height: 220px; overflow-y: auto;"></div>
            <div style="display: flex; justify-content: space-between; margin-top: 0.75rem; padding: 0.75rem 1rem; background: #fff; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
              <span id="itemCount" style="font-size: 0.7rem; color: #64748b; font-weight: 500;">0 items</span>
              <span id="orderTotal" style="font-size: 0.85rem; font-weight: 800; color: #0f172a;">Total: <span style="color: #007513;">LKR 0.00</span></span>
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05);">
            <button type="button" onclick="document.getElementById('purchaseOrderModal').remove()" style="padding: 0.5rem 1.25rem; font-size: 0.75rem; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #475569; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">Cancel</button>
            <button type="submit" style="padding: 0.5rem 1.75rem; font-size: 0.75rem; border-radius: 8px; background: linear-gradient(135deg, #006c11, #004d0c); color: white; border: none; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 108, 17, 0.2); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 15px rgba(0, 108, 17, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 108, 17, 0.2)'">Create Purchase Order</button>
          </div>
        </form>
      `,
    });

    this.currentOrderItems = [];
    this.updateItemsDisplay();

    const form = document.getElementById("purchaseOrderForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.createPurchaseOrderFromForm(form);
    });
  }

  openNewGRNModal() {
    const pendingOrders = this.purchaseOrders.filter(
      (o) => o.status === "pending",
    );
    this._renderModal({
      id: "grnModal",
      title: "Receive Inventory (GRN)",
      subtitle:
        "Select a pending purchase order to process the Goods Received Note",
      contentHtml: `
        <div style="padding: 1.25rem;">
          ${
            pendingOrders.length === 0
              ? `
            <div style="text-align: center; padding: 2rem 1rem; background: rgba(0,0,0,0.02); border-radius: 12px; border: 1px dashed rgba(0,0,0,0.1);">
              <div style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;">📋</div>
              <p style="color: #64748b; font-size: 0.8rem; font-weight: 500; margin: 0;">No pending purchase orders found.</p>
              <p style="color: #94a3b8; font-size: 0.7rem; margin-top: 0.25rem;">Create a new order before processing a GRN.</p>
            </div>
          `
              : `
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <p class="premium-label">Select Pending Order</p>
              ${pendingOrders
                .map(
                  (o) => `
                <div onclick="pharmacyPurchasing.receivePurchaseOrder('${o.id}'); document.getElementById('grnModal').remove();" 
                     class="premium-card">
                  <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: #dcfce7; color: #006c11; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">📦</div>
                    <div>
                      <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a;">${o.orderNumber}</div>
                      <div style="font-size: 0.7rem; color: #64748b; font-weight: 500;">${o.supplierName} • ${new Date(o.orderDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 0.85rem; font-weight: 800; color: #007513;">${this.formatLKR(o.totalAmount)}</div>
                    <div style="font-size: 0.65rem; color: #006c11; font-weight: 600;">Process Receipt →</div>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          `
          }
          <div style="display: flex; justify-content: flex-end; margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05);">
            <button onclick="document.getElementById('grnModal').remove()" style="padding: 0.5rem 1.25rem; font-size: 0.75rem; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #475569; font-weight: 600; cursor: pointer;">Close</button>
          </div>
        </div>
      `,
    });
  }

  openAddSupplierModal() {
    this._renderModal({
      id: "addSupplierModal",
      title: "Add New Supplier",
      subtitle: "Enter supplier contact and location details",
      contentHtml: this._getSupplierFormHtml(),
    });

    const form = document.getElementById("supplierForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.createSupplier(form);
    });
  }

  editSupplier(id) {
    const supplier = this.suppliers.find((s) => s.id === id);
    if (!supplier) return;

    this._renderModal({
      id: "editSupplierModal",
      title: `Edit Supplier: ${supplier.name}`,
      subtitle: "Update supplier details",
      contentHtml: this._getSupplierFormHtml(supplier),
    });

    const form = document.getElementById("supplierForm");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.updateSupplierFromForm(form);
    });
  }

  viewSupplier(id) {
    const s = this.suppliers.find((s) => s.id === id);
    if (!s) return;
    this._renderModal({
      id: "viewSupplierModal",
      title: `Supplier Details: ${s.name}`,
      subtitle: "Detailed information for this supplier",
      contentHtml: `
        <div style="padding: 1rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: rgba(255,255,255,0.4); padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05); margin-bottom: 1rem;">
            <div><div style="font-size: 0.6rem; color: #64748b;">Full Name</div><div style="font-size: 0.8rem; font-weight: 600; color: #1e293b;">${s.name}</div></div>
            <div><div style="font-size: 0.6rem; color: #64748b;">Status</div><div>${this._getBadge(s.status, s.status === "active" ? "success" : "error")}</div></div>
            <div><div style="font-size: 0.6rem; color: #64748b;">Email</div><div style="font-size: 0.8rem; color: #1e293b;">${s.email || "N/A"}</div></div>
            <div><div style="font-size: 0.6rem; color: #64748b;">Phone</div><div style="font-size: 0.8rem; color: #1e293b;">${s.phone}</div></div>
          </div>
          <div style="background: rgba(255,255,255,0.4); padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
            <div style="font-size: 0.6rem; color: #64748b;">Address</div><div style="font-size: 0.8rem; color: #1e293b;">${s.address || "N/A"}</div>
          </div>
          <div style="display: flex; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05); margin-top: 1rem;">
            <button onclick="document.getElementById('viewSupplierModal').remove()" style="padding: 0.4rem 1rem; font-size: 0.7rem; border-radius: 6px; border: 1px solid #e2e8f0; background: white; cursor: pointer;">Close</button>
          </div>
        </div>
      `,
    });
  }

  _getSupplierFormHtml(s = {}) {
    return `
      <form id="supplierForm" style="padding: 1.25rem;">
        <input type="hidden" name="id" value="${s.id || ""}">
        <div style="margin-bottom: 1rem;">
          <label class="premium-label">Supplier Name *</label>
          <input type="text" name="name" required placeholder="e.g. MediSupply Ltd" value="${s.name || ""}" class="premium-input">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label class="premium-label">Email Address</label>
            <input type="email" name="email" placeholder="contact@example.com" value="${s.email || ""}" class="premium-input">
          </div>
          <div>
            <label class="premium-label">Phone Number *</label>
            <input type="text" name="phone" required placeholder="+94 XX XXX XXXX" value="${s.phone || ""}" class="premium-input">
          </div>
        </div>
        <div style="margin-bottom: 1.25rem;">
          <label class="premium-label">Business Address</label>
          <textarea name="address" rows="3" placeholder="Enter full business address..." class="premium-input" style="resize: none; font-family: inherit;">${s.address || ""}</textarea>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05);">
          <button type="button" onclick="this.closest('.inventory-modal-overlay').remove()" style="padding: 0.5rem 1.25rem; font-size: 0.75rem; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #475569; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">Cancel</button>
          <button type="submit" style="padding: 0.5rem 1.75rem; font-size: 0.75rem; border-radius: 8px; background: linear-gradient(135deg, #006c11, #004d0c); color: white; border: none; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 108, 17, 0.2); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 15px rgba(0, 108, 17, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 108, 17, 0.2)'">Save Supplier</button>
        </div>
      </form>
    `;
  }

  // --- Logic Methods ---

  addPurchaseOrderItem() {
    this.currentOrderItems.push({
      id: Date.now().toString(),
      name: "",
      quantity: 1,
      unitCost: 0,
      batch: "",
      total: 0,
    });
    this.updateItemsDisplay();
  }

  updateItemField(itemId, field, value) {
    const item = this.currentOrderItems.find((i) => i.id === itemId);
    if (item) {
      item[field] = value;
      if (field === "quantity" || field === "unitCost")
        item.total =
          (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0);
      this.updateItemsDisplay();
    }
  }

  updateItemFieldLive(itemId, field, value) {
    const item = this.currentOrderItems.find((i) => i.id === itemId);
    if (item) {
      item[field] = value;
      if (field === "quantity" || field === "unitCost")
        item.total =
          (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0);
      this.updateTotalsLive();
    }
  }

  updateTotalsLive() {
    const total = this.currentOrderItems.reduce(
      (sum, i) => sum + (parseFloat(i.total) || 0),
      0,
    );
    const totalQty = this.currentOrderItems.reduce(
      (sum, i) => sum + (parseFloat(i.quantity) || 0),
      0,
    );

    const totalEl = document.getElementById("orderTotal");
    const countEl = document.getElementById("itemCount");
    if (totalEl)
      totalEl.innerHTML = `Total: <span style="color: #007513;">${this.formatLKR(total)}</span>`;
    if (countEl)
      countEl.textContent = `${this.currentOrderItems.length} items • Qty: ${totalQty}`;
  }

  removeItem(itemId) {
    this.currentOrderItems = this.currentOrderItems.filter(
      (i) => i.id !== itemId,
    );
    this.updateItemsDisplay();
  }

  updateItemsDisplay() {
    const container = document.getElementById("itemsContainer");
    if (!container) return;

    if (this.currentOrderItems.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: #94a3b8; font-size: 0.7rem; padding: 1rem;">No items added yet.</p>';
    } else {
      let html = `
        <div style="display: grid; grid-template-columns: 1fr 60px 80px 32px; gap: 0.35rem; margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 1px solid rgba(0,0,0,0.05);">
          <div style="font-size: 0.6rem; font-weight: 800; color: #64748b; text-transform: uppercase;">Item Name</div>
          <div style="font-size: 0.6rem; font-weight: 800; color: #64748b; text-transform: uppercase; text-align: center;">Qty</div>
          <div style="font-size: 0.6rem; font-weight: 800; color: #64748b; text-transform: uppercase; text-align: right;">Price</div>
          <div></div>
        </div>
      `;

      html += this.currentOrderItems
        .map(
          (item) => `
        <div style="display: grid; grid-template-columns: 1fr 60px 80px 32px; gap: 0.35rem; margin-bottom: 0.35rem; align-items: center;">
          <input type="text" placeholder="e.g. Paracetamol" value="${item.name}" oninput="pharmacyPurchasing.updateItemFieldLive('${item.id}', 'name', this.value)" style="width: 100%; padding: 0.35rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.7rem; background: #fff;">
          <input type="number" placeholder="0" value="${item.quantity}" min="1" oninput="pharmacyPurchasing.updateItemFieldLive('${item.id}', 'quantity', parseFloat(this.value) || 0)" style="width: 100%; padding: 0.35rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.7rem; text-align: center; background: #fff;">
          <input type="number" placeholder="0.00" value="${item.unitCost}" min="0" step="0.01" oninput="pharmacyPurchasing.updateItemFieldLive('${item.id}', 'unitCost', parseFloat(this.value) || 0)" style="width: 100%; padding: 0.35rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.7rem; text-align: right; background: #fff;">
          <button type="button" onclick="pharmacyPurchasing.removeItem('${item.id}')" style="width: 28px; height: 28px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">🗑</button>
        </div>
      `,
        )
        .join("");

      container.innerHTML = html;
    }

    const total = this.currentOrderItems.reduce((sum, i) => sum + i.total, 0);
    const totalQty = this.currentOrderItems.reduce(
      (sum, i) => sum + i.quantity,
      0,
    );

    const totalEl = document.getElementById("orderTotal");
    const countEl = document.getElementById("itemCount");
    if (totalEl)
      totalEl.innerHTML = `Total: <span style="color: #007513;">${this.formatLKR(total)}</span>`;
    if (countEl)
      countEl.textContent = `${this.currentOrderItems.length} items • Qty: ${totalQty}`;
  }

  async createPurchaseOrderFromForm(form) {
    const data = Object.fromEntries(new FormData(form));
    if (!data.supplierId || this.currentOrderItems.length === 0) {
      this.showNotification(
        "Please select a supplier and add items.",
        "warning",
      );
      return;
    }

    const poData = {
      orderNumber: `PO-${Date.now().toString().slice(-6)}`,
      supplierId: data.supplierId,
      expectedDeliveryDate: data.expectedDeliveryDate,
      orderDate: data.orderDate,
      totalAmount: this.currentOrderItems.reduce((sum, i) => sum + i.total, 0),
      items: this.currentOrderItems,
    };

    try {
      const result = await this.rpc(
        "/pharmacy_pos/create_purchase_order",
        poData,
      );
      if (result && result.success) {
        await this.loadPurchasingData();
        this.renderPurchasingContent();
        form.closest(".inventory-modal-overlay").remove();
        this.showNotification(
          "Purchase order created successfully!",
          "success",
        );
      } else {
        this.showNotification(result.error || "Failed to create PO", "error");
      }
    } catch (error) {
      console.error("Error creating PO:", error);
      this.showNotification("Error connecting to server", "error");
    }
  }

  async createSupplier(form) {
    const data = Object.fromEntries(new FormData(form));
    try {
      const result = await this.rpc("/pharmacy_pos/save_supplier", data);
      if (result && result.success) {
        await this.loadPurchasingData();
        this.renderPurchasingContent();
        form.closest(".inventory-modal-overlay").remove();
        this.showNotification("Supplier added successfully!", "success");
      } else {
        this.showNotification(
          result.error || "Failed to add supplier",
          "error",
        );
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      this.showNotification("Error connecting to server", "error");
    }
  }

  async updateSupplierFromForm(form) {
    const data = Object.fromEntries(new FormData(form));
    try {
      const result = await this.rpc("/pharmacy_pos/save_supplier", data);
      if (result && result.success) {
        await this.loadPurchasingData();
        this.renderPurchasingContent();
        form.closest(".inventory-modal-overlay").remove();
        this.showNotification("Supplier updated!", "success");
      } else {
        this.showNotification(
          result.error || "Failed to update supplier",
          "error",
        );
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
      this.showNotification("Error connecting to server", "error");
    }
  }

  async toggleSupplierStatus(id) {
    const s = this.suppliers.find((s) => s.id === id);
    if (s) {
      const newStatus = s.status === "active" ? "inactive" : "active";
      try {
        const result = await this.rpc("/pharmacy_pos/save_supplier", {
          id,
          status: newStatus,
        });
        if (result && result.success) {
          await this.loadPurchasingData();
          this.renderPurchasingContent();
          this.showNotification(`Supplier ${newStatus}!`, "success");
        }
      } catch (error) {
        console.error("Error toggling status:", error);
      }
    }
  }

  // --- Common Helpers ---

  formatLKR(amount) {
    return `LKR ${Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  }

  showNotification(message, type = "info") {
    const notif = document.createElement("div");
    notif.style.cssText = `position:fixed;top:20px;right:20px;padding:12px 20px;border-radius:6px;color:white;z-index:10000; transition: all 0.3s ease;`;
    notif.style.backgroundColor =
      type === "success"
        ? "#007513"
        : type === "warning"
          ? "#f59e0b"
          : type === "error"
            ? "#ef4444"
            : "#3b82f6";
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => {
      notif.style.opacity = "0";
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  startAutoRefresh() {
    this.refreshInterval = setInterval(
      () => this.updatePurchasingStats(),
      30000,
    );
  }

  cleanup() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    if (window.pharmacyPurchasing === this) delete window.pharmacyPurchasing;
  }
}

window.PharmacyPurchasing = PharmacyPurchasing;
