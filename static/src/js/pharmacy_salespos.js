/** @odoo-module **/

import { rpc } from "@web/core/network/rpc";
import { medicines } from "./data/medicine_data.js";

export class PharmacyPOS {
  constructor() {
    this.cart = [];
    this.currentCustomer = {
      name: "Walk-in Customer",
      isWalkIn: true,
    };
    this.heldBills = [];
    this.products = [];
    this.salesHistory = [];
    this.charts = {};
    this.rpc = rpc;

    // Initialize POS
    this.initializePOS();

    // Make instance globally available for onclick handlers
    window.pharmacyPOS = this;
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
                        <div class="sales-table-container pos-glass-card">
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
                        <div class="cart-container modern-cart-container pos-glass-card">
                            <div class="cart-header">
                                <h2><span class="emoji-icon">🛒</span> Sales Cart</h2>
                                <span class="cart-badge"><span id="cartItemCount">0</span> items</span>
                            </div>
                            <div class="cart-summary modern-summary">
                                <div class="cart-totals">
                                    <div class="summary-row">
                                        <span class="summary-label">Subtotal</span>
                                        <span class="summary-value" id="cartSubtotal">LKR 0.00</span>
                                    </div>
                                    <div class="summary-row">
                                        <span class="summary-label">Discount</span>
                                        <span class="summary-value discount-value" id="cartDiscount">LKR 0.00</span>
                                    </div>
                                    <div class="summary-divider"></div>
                                    <div class="summary-row grand-total-row">
                                        <span class="summary-label">Grand Total</span>
                                        <span class="summary-value total-value" id="cartTotal">LKR 0.00</span>
                                    </div>
                                </div>
                                <div class="cart-actions cart-actions-modern">
                                    <button class="btn-modern btn-pay" onclick="pharmacyPOS.checkout()">
                                         Pay
                                    </button>
                                    <button class="btn-modern btn-clear" onclick="pharmacyPOS.clearCart()">
                                         Clear
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

    // Load products from backend
    this.loadProducts();

    // Load customers from backend
    this.loadCustomers();

    // Initialize cart
    this.cart = [];
    this.updateCartDisplay();

    // Initialize customer
    this.currentCustomer = {
      name: "Walk-in Customer",
      isWalkIn: true,
    };

    // Load held bills from backend
    this.loadHeldBills();

    // Update held bills count display
    this.updateHeldBillsCount();

    // Render products grid
    this.renderProducts(this.products);

    // Close search dropdown when clicking outside
    document.addEventListener("click", (e) => {
      const searchContainer = document.querySelector(".search-container");
      const suggestionsContainer = document.getElementById("searchSuggestions");
      if (
        searchContainer &&
        !searchContainer.contains(e.target) &&
        suggestionsContainer
      ) {
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.classList.remove("glass-dropdown");
      }
    });
  }

  loadHeldBills() {
    return this.rpc("/pharmacy/sales/held/list")
      .then((result) => {
        if (!result || result.success === false) {
          this.heldBills = [];
          return;
        }
        this.heldBills = Array.isArray(result.data) ? result.data : [];
        this.updateHeldBillsCount();
      })
      .catch((error) => {
        console.error("Error loading held bills from backend:", error);
        this.heldBills = [];
      });
  }

  async deleteHeldBillFromBackend(billId) {
    try {
      const result = await this.rpc("/pharmacy/sales/held/delete", {
        id: billId,
      });
      return !!(result && result.success);
    } catch (error) {
      console.error("Error deleting held bill:", error);
      return false;
    }
  }

  async saveHeldBillToBackend(heldBill) {
    try {
      const result = await this.rpc("/pharmacy/sales/held/create", {
        bill_name: heldBill.name,
        customer_id:
          heldBill.customer && !heldBill.customer.isWalkIn
            ? heldBill.customer.id
            : false,
        items: heldBill.items,
        total_amount: heldBill.total,
      });
      if (!result || result.success === false) {
        this.showNotification("Failed to hold bill in database.", "error");
        return false;
      }
      await this.loadHeldBills();
      return true;
    } catch (error) {
      console.error("Error saving held bill to backend:", error);
      this.showNotification("Failed to hold bill in database.", "error");
      return false;
    }
  }

  saveHeldBills() {
    // Kept for backward compatibility with existing calls.
    // Held bills are persisted in PostgreSQL through RPC APIs.
    this.updateHeldBillsCount();
  }

  // barcode search (supports base medicines data + backend items)
  findProductByBarcode(barcode) {
    const searchKey = String(barcode || "").trim();
    if (!searchKey) return null;

    // Use the loaded products which now come from the backend
    const dataset = this.products.length > 0 ? this.products : medicines;

    // Prefer exact barcode match first
    const byBarcode = dataset.find((m) => String(m.barcode) === searchKey);
    if (byBarcode) return byBarcode;

    // Fallback to ID match (numeric or string)
    return dataset.find((m) => String(m.id) === searchKey);
  }

  async holdBill() {
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

      const isSaved = await this.saveHeldBillToBackend(heldBill);
      if (!isSaved) return;

      this.showNotification(
        `⏸ Bill "${billName}" held successfully! (${this.cart.length} items, LKR ${Number(this.getCartTotal()).toFixed(2)})`,
        "success",
      );
      this.clearCart(false);
      this.updateHeldBillsCount();
    }
  }

  handleReturns() {
    if (this.heldBills.length === 0) {
      this.heldBills = [];
      this.showNotification("🔁 No held bills available for returns.", "info");
      return;
    }

    this.showReturnsModal();
  }

  openCamera() {
    this.showNotification(
      "Barcode scanner functionality has been removed.",
      "info",
    );
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
      row.className = "cart-row";

      row.innerHTML = `
                <td>
                    <div class="product-name">
                        <span class="product-text" style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${item.name}</span>
                    </div>
                </td>
                <td>
                    <div class="batch-expiry">
                        <span class="batch-pill">${item.batch}</span>
                        <span class="expiry-pill">${item.expiry}</span>
                    </div>
                </td>
                <td class="quantity-cell">
                    <div class="modern-qty-controls">
                        <button class="qty-btn-glass" onclick="pharmacyPOS.updateQuantity(${index}, -1)">−</button>
                        <span class="qty-value-modern">${item.quantity}</span>
                        <button class="qty-btn-glass" onclick="pharmacyPOS.updateQuantity(${index}, 1)">+</button>
                    </div>
                </td>
                <td class="price-cell" style="font-weight: 600;">LKR ${Number(item.unitPrice || 0).toFixed(2)}</td>
                <td class="discount-cell"><span style="color: #64748b; font-size: 11px;">${Number(item.discount || 0)}%</span></td>
                <td class="total-cell" style="font-weight: 800; color: #10b981;">LKR ${Number(item.total || 0).toFixed(2)}</td>
                <td class="actions-cell">
                    <button class="delete-btn-modern" onclick="pharmacyPOS.removeItem(${index})" title="Remove item">
                        🗑️
                    </button>
                </td>
            `;

      tableBody.appendChild(row);
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

    const itemCountEl = document.getElementById("cartItemCount");
    const subtotalEl = document.getElementById("cartSubtotal");
    const discountEl = document.getElementById("cartDiscount");
    const totalEl = document.getElementById("cartTotal");

    if (itemCountEl) itemCountEl.textContent = itemCount;
    if (subtotalEl)
      subtotalEl.textContent = `LKR ${Number(subtotal).toFixed(2)}`;
    if (discountEl)
      discountEl.textContent = `LKR ${Number(totalDiscount).toFixed(2)}`;
    if (totalEl) totalEl.textContent = `LKR ${Number(grandTotal).toFixed(2)}`;
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
    // Premium standard notification implementation
    const notification = document.createElement("div");
    notification.className = `glass-notification notification-${type}`;
    
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️"
    };

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 1.25rem;">${icons[type] || icons.info}</span>
        <span style="font-size: 0.9rem; font-weight: 500;">${message}</span>
      </div>
      <button onclick="this.parentElement.remove()" style="background:none; border:none; color:#94a3b8; cursor:pointer; padding:4px; font-size:18px;">×</button>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      min-width: 320px;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 99999;
      animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      color: #1e293b;
    `;

    // Type-specific left border accent
    const colors = {
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6"
    };
    notification.style.borderLeft = `5px solid ${colors[type] || colors.info}`;

    // Add animation styles if not present
    if (!document.getElementById("notif-styles")) {
      const style = document.createElement("style");
      style.id = "notif-styles";
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = "slideOutRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
        setTimeout(() => notification.remove(), 400);
      }
    }, 4000);
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

  async retrieveBill(billIndex) {
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

    // Remove the held bill from backend + memory
    const removed = await this.deleteHeldBillFromBackend(bill.id);
    if (!removed) {
      this.showNotification(
        "Failed to retrieve held bill from database.",
        "error",
      );
      return;
    }
    this.heldBills.splice(billIndex, 1);

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

  async processReturn(billIndex) {
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

      // Update inventory stock (add back items)
      this.updateInventoryStock(bill.items, true);

      // Remove the held bill from backend + memory
      const removed = await this.deleteHeldBillFromBackend(bill.id);
      if (!removed) {
        this.showNotification(
          "Failed to remove held bill from database.",
          "error",
        );
        return;
      }
      this.heldBills.splice(billIndex, 1);

      this.showNotification(
        `🔁 Return processed for "${bill.name}" - Refund: LKR ${Number(bill.total).toFixed(2)}`,
        "success",
      );
      this.closeReturnsModal();
      this.updateHeldBillsCount();
    }
  }

  async deleteHeldBill(billIndex) {
    const bill = this.heldBills[billIndex];
    if (!bill) return;

    if (
      confirm(`Delete held bill "${bill.name}"? This action cannot be undone.`)
    ) {
      const removed = await this.deleteHeldBillFromBackend(bill.id);
      if (!removed) {
        this.showNotification(
          "Failed to delete held bill from database.",
          "error",
        );
        return;
      }
      this.heldBills.splice(billIndex, 1);

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

  getSavedSetting(section, fallback = {}) {
    try {
      const raw = localStorage.getItem(`pharmacy_settings_${section}`);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch (error) {
      console.warn(`Failed to load settings for ${section}:`, error);
      return fallback;
    }
  }

  escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  getReceiptContext() {
    const pharmacy = this.getSavedSetting("pharmacy", {});
    const receipt = this.getSavedSetting("receipt", {});
    const tax = this.getSavedSetting("tax", {});
    return {
      pharmacy: {
        name: pharmacy.name || "Timolog Pharma",
        registrationNo: pharmacy.registrationNo || "PHM-LK-2020-001",
        addressLine1: pharmacy.addressLine1 || "123, Main Street, Colombo 07",
        hotline: pharmacy.hotline || "0112 345 678",
      },
      receipt: {
        header: receipt.header || "✚ TIMOLOG PHARMA ✚",
        footer:
          receipt.footer ||
          "Medicines are not returnable after purchase. Please check items before leaving.",
        invoicePrefix: receipt.invoicePrefix || "TMP",
        startingInvoice: receipt.startingInvoice || "2025-0001",
        showLogo: receipt.showLogo !== false,
        showCashier: receipt.showCashier !== false,
        showBatch: receipt.showBatch !== false,
        showExpiry: receipt.showExpiry !== false,
        showVat: receipt.showVat !== false,
      },
      tax: {
        currency: tax.currency || "LKR",
        vatRate:
          typeof tax.vatRate === "number" && !Number.isNaN(tax.vatRate)
            ? tax.vatRate
            : 15,
      },
    };
  }

  buildReceiptHTML({
    docTitle,
    invoiceLabel,
    invoiceNumber,
    timestamp,
    cashier,
    customer,
    items,
    subtotal,
    vatAmount,
    total,
    paidLabel,
    paidAmount,
    balanceLabel,
    balanceAmount,
    statusLine,
  }) {
    const { pharmacy, receipt, tax } = this.getReceiptContext();
    const safeItems = Array.isArray(items) ? items : [];
    const rows = safeItems
      .map((item) => {
        const lineTotal = Number(item.lineTotal || 0).toFixed(2);
        const qty = Number(item.quantity || 0);
        const unitPrice = qty > 0 ? Number(item.lineTotal || 0) / qty : 0;
        const batchLine =
          receipt.showBatch && item.batch
            ? `<div class="item-meta-line">Batch: ${this.escapeHtml(item.batch)}</div>`
            : "";
        const expiryLine =
          receipt.showExpiry && item.expiry
            ? `<div class="item-meta-line">Exp: ${this.escapeHtml(item.expiry)}</div>`
            : "";

        return `
                    <tr class="item-row">
                        <td class="item-left">
                            <div class="item-name">${this.escapeHtml(item.name)}</div>
                            <div class="item-qty">${qty} x ${this.escapeHtml(tax.currency)} ${unitPrice.toFixed(2)}</div>
                            <div class="item-meta">${batchLine}${expiryLine}</div>
                        </td>
                        <td class="item-right">${this.escapeHtml(tax.currency)} ${lineTotal}</td>
                    </tr>
                `;
      })
      .join("");

    return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${this.escapeHtml(docTitle)}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        background: #fff;
                        padding: 0;
                        width: 80mm;
                        color: #000;
                        font-size: 12px;
                        line-height: 1.2;
                    }
                    .thermal-receipt {
                        width: 100%;
                        background: #ffffff;
                        padding: 10px;
                    }
                    .receipt-top {
                        border-bottom: 2px solid #000;
                        padding-bottom: 8px;
                        margin-bottom: 10px;
                        text-align: center;
                    }
                    .receipt-title {
                        font-size: 16px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    .receipt-subtitle {
                        font-size: 10px;
                        font-weight: normal;
                    }
                    .receipt-content {
                        padding: 0;
                    }
                    .thermal-header, .thermal-footer {
                        text-align: center;
                        margin-bottom: 10px;
                    }
                    .pharmacy-header {
                        font-weight: bold;
                        font-size: 15px;
                        margin-bottom: 4px;
                    }
                    .meta-text {
                        font-size: 11px;
                        margin-bottom: 2px;
                    }
                    .info-card {
                        border-top: 1px solid #000;
                        border-bottom: 1px solid #000;
                        padding: 6px 0;
                        margin-bottom: 10px;
                    }
                    .thermal-info-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 3px;
                    }
                    .label { font-weight: normal; }
                    .value { font-weight: bold; text-align: right; }
                    .section-title {
                        font-size: 12px;
                        font-weight: bold;
                        text-transform: uppercase;
                        border-bottom: 1px solid #000;
                        padding-bottom: 2px;
                        margin: 10px 0 5px;
                    }
                    .thermal-table { width: 100%; border-collapse: collapse; }
                    .item-row td {
                        padding: 5px 0;
                        border-bottom: 1px dashed #ccc;
                        vertical-align: top;
                    }
                    .item-row:last-child td { border-bottom: none; }
                    .item-name { font-weight: bold; margin-bottom: 2px; }
                    .item-qty { font-size: 11px; margin-bottom: 2px; }
                    .item-meta-line { font-size: 10px; font-style: italic; }
                    .item-right { text-align: right; font-weight: bold; }
                    .totals-card {
                        border-top: 2px solid #000;
                        margin-top: 10px;
                        padding-top: 8px;
                    }
                    .grand-total {
                        font-size: 15px;
                        font-weight: bold;
                        margin-top: 5px;
                        padding-top: 5px;
                        border-top: 1px solid #000;
                    }
                    .payment-card {
                        margin-top: 10px;
                        padding-top: 5px;
                        border-top: 1px dashed #000;
                    }
                    .thermal-divider { border-top: 1px dashed #000; margin: 10px 0; }
                    @media print {
                        body { width: 80mm; background: #fff; }
                        .thermal-receipt { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="thermal-receipt">
                    <div class="receipt-top">
                        <div class="receipt-title">${invoiceLabel === "Return" ? "RETURN RECEIPT" : "SALES RECEIPT"}</div>
                        <div class="receipt-subtitle">Modern Thermal Print</div>
                    </div>
                    <div class="receipt-content">
                    <div class="thermal-header">
                        ${receipt.showLogo ? '<div style="margin-bottom:6px;">🏥</div>' : ""}
                        <div class="pharmacy-header">${this.escapeHtml(receipt.header)}</div>
                        <div class="meta-text">${this.escapeHtml(pharmacy.addressLine1)}</div>
                        <div class="meta-text">Tel: ${this.escapeHtml(pharmacy.hotline)}</div>
                        <div class="meta-text">${this.escapeHtml(pharmacy.registrationNo)}</div>
                    </div>

                    <div class="info-card">
                    <div class="thermal-info-row">
                        <span class="label">${this.escapeHtml(invoiceLabel)} #</span>
                        <span class="value">${this.escapeHtml(invoiceNumber)}</span>
                    </div>
                    <div class="thermal-info-row">
                        <span class="label">Date & Time</span>
                        <span class="value">${this.escapeHtml(timestamp)}</span>
                    </div>
                    ${receipt.showCashier && cashier ? `<div class="thermal-info-row"><span class="label">Cashier</span><span class="value">${this.escapeHtml(cashier)}</span></div>` : ""}
                    ${customer ? `<div class="thermal-info-row"><span class="label">Customer</span><span class="value">${this.escapeHtml(customer)}</span></div>` : ""}
                    </div>

                    <div class="section-title">Items</div>
                    <div class="item-table-wrap">
                    <table class="thermal-table">
                        ${rows}
                    </table>
                    </div>

                    <div class="totals-card">
                    <div class="thermal-info-row"><span class="label">Subtotal</span><span class="value">${this.escapeHtml(tax.currency)} ${Number(subtotal || 0).toFixed(2)}</span></div>
                    ${receipt.showVat ? `<div class="thermal-info-row"><span class="label">VAT (${Number(tax.vatRate).toFixed(0)}%)</span><span class="value">${this.escapeHtml(tax.currency)} ${Number(vatAmount || 0).toFixed(2)}</span></div>` : ""}
                    <div class="thermal-info-row grand-total">
                        <span>TOTAL</span>
                        <span>${this.escapeHtml(tax.currency)} ${Number(total || 0).toFixed(2)}</span>
                    </div>
                    </div>

                    <div class="payment-card">
                    <div class="thermal-info-row"><span class="label">${this.escapeHtml(paidLabel)}</span><span class="value">${this.escapeHtml(tax.currency)} ${Number(paidAmount || 0).toFixed(2)}</span></div>
                    <div class="thermal-info-row"><span class="label">${this.escapeHtml(balanceLabel)}</span><span class="value">${this.escapeHtml(tax.currency)} ${Number(balanceAmount || 0).toFixed(2)}</span></div>
                    ${statusLine ? `<div class="thermal-info-row"><span class="label">Status</span><span class="value">${this.escapeHtml(statusLine)}</span></div>` : ""}
                    </div>

                    <div class="thermal-divider"></div>

                    <div class="thermal-footer">
                        ${this.escapeHtml(receipt.footer)}
                    </div>
                    </div>
                </div>
            </body>
            </html>
        `;
  }

  printReturnReceipt(returnTransaction) {
    const { receipt } = this.getReceiptContext();
    const receiptContent = this.buildReceiptHTML({
      docTitle: `Return Receipt - RET${returnTransaction.id}`,
      invoiceLabel: "Return",
      invoiceNumber: `${receipt.invoicePrefix}-RET${returnTransaction.id}`,
      timestamp: returnTransaction.timestamp,
      cashier: "System",
      customer: "Walk-in Customer",
      items: (returnTransaction.items || []).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        batch: item.batch || "N/A",
        expiry: item.expiry || "N/A",
        lineTotal: Number(item.unitPrice || 0) * Number(item.quantity || 0),
      })),
      subtotal: returnTransaction.totalAmount,
      vatAmount: 0,
      total: returnTransaction.refundAmount,
      paidLabel: "Refund",
      paidAmount: returnTransaction.refundAmount,
      balanceLabel: "Balance",
      balanceAmount: 0,
      statusLine: "Refund Completed",
    });

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

  async loadProducts() {
    try {
      // Use the Odoo RPC service to fetch products from the backend inventory
      const result = await this.rpc("/pharmacy/inventory/list");

      // Handle the various result formats Odoo might return
      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result?.result)
          ? result.result
          : Array.isArray(result?.data)
            ? result.data
            : [];

      if (rows.length > 0) {
        // Map backend fields to the format expected by the POS UI
        this.products = rows.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category || "tablets",
          price: Number(item.price) || 0,
          stock: Number(item.stock) || 0,
          icon: item.icon || "💊",
          barcode: item.barcode || "",
          batch: item.batch || "N/A",
          expiry: item.expiry_date || item.expiry || "N/A",
          prescription: !!item.rx_only,
        }));
        console.log(`Loaded ${this.products.length} products from backend`);
      } else {
        // Fallback to medicines data if backend is empty
        this.products = [...medicines];
        console.log(
          "No products found in backend, using default medicines data",
        );
      }
    } catch (error) {
      console.error("Failed to load products from backend:", error);
      // Fallback to bundled defaults if backend is unavailable
      this.products = [...medicines];
      this.showNotification(
        "Using fallback product data - Backend unavailable",
        "warning",
      );
    }

    // Render products once loaded
    this.renderProducts(this.products);
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
                    <p class="product-price"> Price: LKR ${Number(product.price || 0).toFixed(2)}</p>
                    <p class="product-stock ${product.stock < 20 ? "low-stock" : ""}">
                       Stock: ${product.stock} in stock
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
      ".premium-suggestion-item:not(.no-results)",
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
          suggestionsContainer.classList.remove("glass-dropdown");
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
    if (!suggestionsContainer) return;

    // Initialize container for fresh results
    suggestionsContainer.innerHTML = "";
    suggestionsContainer.classList.remove("glass-dropdown");

    if (!query.trim()) {
      suggestionsContainer.innerHTML = "";
      suggestionsContainer.classList.remove("glass-dropdown");
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
        if (searchInput) searchInput.value = "";
        suggestionsContainer.innerHTML = "";
        this.showNotification(
          `✅ ${product.name} added via barcode scan`,
          "success",
        );
        return;
      }
    }

    // Use the loaded products which now come from the backend
    const allProducts = this.products.length > 0 ? this.products : medicines;

    const filtered = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        String(product.barcode) === query.trim(),
    );

    if (filtered.length === 0) {
      if (query.trim()) {
        suggestionsContainer.classList.add("glass-dropdown");
        suggestionsContainer.innerHTML =
          '<div class="premium-suggestion-item no-results" style="justify-content: center; opacity: 1;">No products found</div>';
      }
      return;
    }

    this.renderSuggestions(filtered, suggestionsContainer);
  }

  renderSuggestions(filtered, suggestionsContainer) {
    suggestionsContainer.classList.add("glass-dropdown");
    suggestionsContainer.innerHTML = filtered
      .map(
        (product, index) => `
            <div class="premium-suggestion-item" 
                 style="animation-delay: ${index * 0.05}s"
                 onclick="pharmacyPOS.addToCartFromSearch(${product.id}, '${product.name.replace(/'/g, "\\'")}')">
                <div class="suggestion-icon-wrap">${product.icon}</div>
                <div class="suggestion-info">
                    <div class="suggestion-name">${product.name}</div>
                    <div class="suggestion-details">
                         LKR ${Number(product.price || 0).toFixed(2)} |  ${product.stock} in stock
                        ${product.barcode ? ` |  ${product.barcode}` : ""}
                    </div>
                </div>
                <div class="suggestion-action-pill">➕</div>
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
    // Use the loaded products which now come from the backend
    const allProducts = this.products.length > 0 ? this.products : medicines;
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    this.addToCart(productId);

    // Clear search and hide suggestions
    const searchInput = document.getElementById("medicineSearch");
    if (searchInput) searchInput.value = "";
    const suggestionsContainer = document.getElementById("searchSuggestions");
    if (suggestionsContainer) {
      suggestionsContainer.innerHTML = "";
      suggestionsContainer.classList.remove("glass-dropdown");
    }

    // Show brief notification
    const notification = document.createElement("div");
    notification.className = "add-notification";
    notification.textContent = `✅ ${productName} added to cart`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  }

  addToCart(productId) {
    // Use the loaded products which now come from the backend
    const allProducts = this.products.length > 0 ? this.products : medicines;
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
    const paymentRadios = document.querySelectorAll('input[name="payment"]');

    const updateBalance = () => {
      const paid = parseFloat(amountPaid.value) || 0;
      const balance = total - paid;

      const selectedMethod = document.querySelector(
        'input[name="payment"]:checked',
      )?.value;
      if (selectedMethod === "credit") {
        balanceAmount.textContent = `LKR ${Number(balance).toFixed(2)} (added to credit)`;
        balanceAmount.style.color = "#eab308"; // Warning color for credit
      } else {
        balanceAmount.textContent =
          balance > 0
            ? `LKR ${Number(balance).toFixed(2)} (due)`
            : `LKR ${Number(Math.abs(balance)).toFixed(2)} (change)`;
        balanceAmount.style.color = "";
      }
    };

    // Auto-update amount when method changes
    paymentRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.value === "card") {
          amountPaid.value = total.toFixed(2);
          amountPaid.readOnly = true;
        } else if (e.target.value === "credit") {
          amountPaid.value = "0.00";
          amountPaid.readOnly = false; // Allow partial payments
        } else {
          // cash
          amountPaid.readOnly = false;
          amountPaid.focus();
          amountPaid.select();
        }
        updateBalance();
      });
    });

    amountPaid.addEventListener("input", updateBalance);
    updateBalance();
  }

  setAmount(amount) {
    const amountPaidInput = document.getElementById("amountPaid");
    if (amountPaidInput) {
      amountPaidInput.value = amount;
      this.setupPaymentCalculation();
    }
  }

  async completeSale() {
    const total = this.calculateGrandTotal();
    let amountPaid =
      parseFloat(document.getElementById("amountPaid").value) || 0;
    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked',
    ).value;

    // Safety fallback: if card is selected, forcefully assume total is fully paid
    if (paymentMethod === "card") {
      amountPaid = total;
    }

    if (amountPaid < total && paymentMethod !== "credit") {
      alert("Insufficient payment amount!");
      return;
    }

    if (
      paymentMethod === "credit" &&
      (!this.currentCustomer || this.currentCustomer.isWalkIn)
    ) {
      alert("Please select a registered customer to process credit payments.");
      return;
    }

    let sale;
    try {
      const payload = {
        items: [...this.cart],
        customer_id:
          this.currentCustomer && !this.currentCustomer.isWalkIn
            ? this.currentCustomer.id
            : false,
        total_amount: total,
        amount_paid: amountPaid,
        payment_method: paymentMethod,
      };

      const backendResult = await this.rpc("/pharmacy/sales/create", payload);
      if (!backendResult || backendResult.success === false) {
        throw new Error(backendResult?.error || "Sale save failed");
      }

      sale = {
        id: backendResult.sale_id,
        receiptNumber: backendResult.receipt_number,
        cashierId: backendResult.cashier_name || "Unknown",
        shift: "Morning",
        items: [...this.cart],
        total: total,
        amountPaid: amountPaid,
        paymentMethod: paymentMethod,
        timestamp: backendResult.sale_date || new Date().toISOString(),
        displayTimestamp: new Date().toLocaleString(),
        customer: this.currentCustomer ? { ...this.currentCustomer } : null,
      };
    } catch (error) {
      console.error("Failed to save sale in backend:", error);
      this.showNotification("Failed to complete sale in database.", "error");
      return;
    }

    if (!this.salesHistory) this.salesHistory = [];
    this.salesHistory.push(sale);

    const customerInfo =
      this.currentCustomer && !this.currentCustomer.isWalkIn
        ? ` for ${this.currentCustomer.name}`
        : "";

    this.showNotification(
      `🧾 Sale completed${customerInfo} - LKR ${Number(total).toFixed(2)}`,
      "success",
    );
    // Update inventory stock levels
    this.updateInventoryStock(this.cart);

    this.clearCart(false);
    this.closePaymentDropdown();

    // Reset customer to walk-in after sale
    this.currentCustomer = {
      name: "Walk-in Customer",
      isWalkIn: true,
    };
    this.updateCustomerButton();

    await this.loadCustomers();
    // Print receipt
    this.printReceipt(sale);
  }

  async updateInventoryStock(cartItems, isReturn = false) {
    if (!cartItems || cartItems.length === 0) return;

    try {
      console.log(
        `Synchronizing stock updates with backend (${isReturn ? "Return" : "Sale"})...`,
      );

      // Process each item update via RPC
      // In a more optimized version, you might want a single batch endpoint
      for (const cartItem of cartItems) {
        try {
          await this.rpc("/pharmacy/inventory/update_stock", {
            item_id: Number(cartItem.id),
            quantity: Number(cartItem.quantity),
            operation: isReturn ? "add" : "subtract",
          });
          console.log(`Backend stock updated for product ID ${cartItem.id}`);
        } catch (itemError) {
          console.error(
            `Failed to update stock for item ${cartItem.id}:`,
            itemError,
          );
          // We continue with other items even if one fails
        }
      }

      // Refresh the local products list from backend to get the latest stock levels
      await this.loadProducts();

      // Force a refresh of the inventory component UI if it exists in the current session
      if (window.pharmacyInventory) {
        if (typeof window.pharmacyInventory.loadInventoryItems === "function") {
          await window.pharmacyInventory.loadInventoryItems();
        }
        if (
          typeof window.pharmacyInventory.updateInventoryStatsAndTable ===
          "function"
        ) {
          window.pharmacyInventory.updateInventoryStatsAndTable();
        }
      }
    } catch (error) {
      console.error("Critical error in updateInventoryStock RPC:", error);
      this.showNotification(
        "Stock synchronization partially failed. Please check inventory.",
        "warning",
      );
    }
  }

  printReceipt(sale) {
    const { receipt, tax } = this.getReceiptContext();
    const subtotal = Number(sale.total || 0);
    const vatAmount = receipt.showVat
      ? (subtotal * Number(tax.vatRate || 0)) / 100
      : 0;
    const total = subtotal + vatAmount;

    const receiptContent = this.buildReceiptHTML({
      docTitle: `Receipt - ${sale.receiptNumber}`,
      invoiceLabel: "Invoice",
      invoiceNumber:
        sale.receiptNumber ||
        `${receipt.invoicePrefix}-${receipt.startingInvoice}`,
      timestamp: sale.timestamp,
      cashier: sale.cashierId || "Unknown",
      customer:
        sale.customer && !sale.customer.isWalkIn ? sale.customer.name : "",
      items: (sale.items || []).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        batch: item.batch || "N/A",
        expiry: item.expiry || "N/A",
        lineTotal:
          Number(item.price || item.unitPrice || 0) *
          Number(item.quantity || 0),
      })),
      subtotal,
      vatAmount,
      total,
      paidLabel: "Cash Paid",
      paidAmount: sale.amountPaid,
      balanceLabel: "Balance",
      balanceAmount: Number(sale.amountPaid || 0) - total,
      statusLine: "",
    });

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
                ${this.customers.length > 0 ? this.renderCustomerDropdownList() : '<div style="padding:10px; text-align:center; font-size:11px;">Loading customers...</div>'}
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

  async loadCustomers() {
    try {
      const result = await this.rpc("/pharmacy/customers/list");

      if (result && !Array.isArray(result) && result.error) {
        console.error("Backend Error:", result.error);
        this.customers = [];
        return;
      }

      // Map Odoo snake_case fields to camelCase for frontend
      this.customers = (Array.isArray(result) ? result : []).map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone || "N/A",
        email: c.email || "",
        address: c.address || "",
        tier: c.tier || "Bronze",
        totalPurchases: c.total_purchases || 0,
        recentPurchases: c.recent_purchases || [],
      }));
      console.log(`Loaded ${this.customers.length} customers from backend`);
    } catch (error) {
      console.error("RPC Error loading customers:", error);
      this.customers = [];
    }
  }

  loadCustomersFromStorage() {
    // Return the memory-cached backend customers
    return this.customers || [];
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
      listContainer.innerHTML =
        this.renderCustomerDropdownListFiltered(filtered);
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
        if (iconElement) iconElement.textContent = "🧍";
        if (textElement) textElement.textContent = "Walk-in Customer";
      } else {
        if (iconElement) iconElement.textContent = "👤";
        if (textElement) textElement.textContent = this.currentCustomer.name;
      }
    } else {
      if (iconElement) iconElement.textContent = "🧍";
      if (textElement) textElement.textContent = "Select Customer";
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

  cleanup() {
    // Clear any timers or intervals if added later
    this.closeReturnsModal();
    this.closeCustomerDropdown();
    this.closePaymentDropdown();
  }
}

// Global reference for onclick handlers
window.PharmacyPOS = PharmacyPOS;
