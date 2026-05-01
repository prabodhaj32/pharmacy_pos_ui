/** @odoo-module **/

import { medicines } from "./data/medicine_data.js";

export class PharmacyPOS {
  constructor() {
    this.cart = [];
    this.heldBills = [];
    this.salesHistory = [];
    this.currentCustomer = {
      name: "Walk-in Customer",
      isWalkIn: true,
    };
    this.products = [];
  }

  init() {
    this.loadProducts();
    this.loadHeldBills();
    this.updateHeldBillsCount();
    this.renderProducts(this.products);
    window.pharmacyPOS = this; // Make it globally accessible
  }

  // ==================== DATA LOADING ====================

  loadProducts() {
    const savedItems = localStorage.getItem("pharmacy_pos_inventory_items");
    this.products = savedItems ? JSON.parse(savedItems) : [...medicines];
  }

  loadHeldBills() {
    const saved = localStorage.getItem("pharmacy_pos_held_bills");
    this.heldBills = saved ? JSON.parse(saved) : [];
  }

  saveHeldBills() {
    try {
      localStorage.setItem(
        "pharmacy_pos_held_bills",
        JSON.stringify(this.heldBills),
      );
    } catch (e) {
      console.error("Failed to save held bills", e);
    }
  }

  // ==================== CART OPERATIONS ====================

  addProductToCart(product) {
    const existing = this.cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
      existing.total = Number(existing.unitPrice) * existing.quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        batch: product.batch || "N/A",
        expiry: product.expiryLabel || product.expiry || "N/A",
        quantity: 1,
        unitPrice: Number(product.price) || 0,
        discount: 0,
        total: Number(product.price) || 0,
        icon: product.icon || "💊",
      });
    }

    this.updateCartDisplay();
    this.updateSalesTable();
    this.updateCartSummary();
    this.autoScrollTable();
  }

  updateQuantity(index, change) {
    const item = this.cart[index];
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
      this.removeItem(index);
      return;
    }

    item.total = Number(item.unitPrice) * item.quantity;

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

  clearCart(askConfirm = true) {
    if (!askConfirm || confirm("Clear the cart?")) {
      this.cart = [];
      this.updateCartDisplay();
      this.updateSalesTable();
      this.updateCartSummary();
    }
  }

  // ==================== UI UPDATES ====================

  updateCartDisplay() {
    const countEl = document.getElementById("cartItemCount");
    if (countEl) {
      const totalItems = this.cart.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      countEl.textContent = totalItems;
    }
  }

  updateSalesTable() {
    const tbody = document.getElementById("cartTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (this.cart.length === 0) {
      tbody.innerHTML = `
                <tr class="cart-empty-row">
                    <td colspan="7" class="cart-empty">
                        <p>Table is empty</p>
                    </td>
                </tr>`;
      return;
    }

    this.cart.forEach((item, index) => {
      const row = document.createElement("tr");
      row.className = "cart-row";
      row.innerHTML = `
                <td><div class="product-name"><span style="font-weight:700;">${item.name}</span></div></td>
                <td><div class="batch-expiry">
                    <span class="batch-pill">${item.batch}</span>
                    <span class="expiry-pill">${item.expiry}</span>
                </div></td>
                <td class="quantity-cell">
                    <div class="modern-qty-controls">
                        <button class="qty-btn-glass" onclick="pharmacyPOS.updateQuantity(${index}, -1)">−</button>
                        <span class="qty-value-modern">${item.quantity}</span>
                        <button class="qty-btn-glass" onclick="pharmacyPOS.updateQuantity(${index}, 1)">+</button>
                    </div>
                </td>
                <td class="price-cell">LKR ${Number(item.unitPrice).toFixed(2)}</td>
                <td class="discount-cell"><span style="color:#64748b;">${item.discount || 0}%</span></td>
                <td class="total-cell" style="font-weight:800;color:#10b981;">LKR ${Number(item.total).toFixed(2)}</td>
                <td class="actions-cell">
                    <button class="delete-btn-modern" onclick="pharmacyPOS.removeItem(${index})" title="Remove">🗑️</button>
                </td>
            `;
      tbody.appendChild(row);
    });
  }

  updateCartSummary() {
    const subtotal = this.cart.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const discount = this.cart.reduce(
      (sum, item) =>
        sum + (item.unitPrice * item.quantity * (item.discount || 0)) / 100,
      0,
    );
    const grandTotal = subtotal - discount;

    document.getElementById("cartSubtotal").textContent =
      `LKR ${subtotal.toFixed(2)}`;
    document.getElementById("cartDiscount").textContent =
      `LKR ${discount.toFixed(2)}`;
    document.getElementById("cartTotal").textContent =
      `LKR ${grandTotal.toFixed(2)}`;
  }

  autoScrollTable() {
    const container = document.querySelector(".cart-table-container");
    if (container) {
      setTimeout(() => {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }

  // ==================== SEARCH & BARCODE ====================

  findProductByBarcode(barcode) {
    const searchKey = String(barcode || "").trim();
    const savedItems = localStorage.getItem("pharmacy_pos_inventory_items");
    const dataset = savedItems ? JSON.parse(savedItems) : medicines;

    return (
      dataset.find((m) => String(m.barcode) === searchKey) ||
      dataset.find((m) => String(m.id) === searchKey)
    );
  }

  searchMedicines(query) {
    // ... (keep your existing searchMedicines logic here)
    // I recommend keeping the full implementation you already have
  }

  addToCart(productId) {
    const savedItems = localStorage.getItem("pharmacy_pos_inventory_items");
    const allProducts = savedItems ? JSON.parse(savedItems) : medicines;
    const product = allProducts.find((p) => p.id === productId);
    if (product) this.addProductToCart(product);
  }

  // ==================== CHECKOUT & PAYMENT ====================

  checkout() {
    if (this.cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    // Your full checkout logic (payment dropdown, etc.)
    // ... paste your existing checkout(), completeSale(), printReceipt(), etc.
  }

  completeSale() {
    // Full implementation of completeSale() from your original code
    // ... (keep your existing completeSale logic here)
  }

  // ==================== HOLDS & RETURNS ====================

  holdBill() {
    // ... your existing holdBill logic
  }

  handleReturns() {
    // ... your existing returns logic
  }

  // ==================== CUSTOMER ====================

  selectWalkInCustomer() {
    this.currentCustomer = { name: "Walk-in Customer", isWalkIn: true };
    this.updateCustomerButton();
  }

  updateCustomerButton() {
    const icon = document.getElementById("customerButtonIcon");
    const text = document.getElementById("customerButtonText");
    if (!icon || !text) return;

    if (this.currentCustomer.isWalkIn) {
      icon.textContent = "🧍";
      text.textContent = "Walk-in Customer";
    } else {
      icon.textContent = "👤";
      text.textContent = this.currentCustomer.name;
    }
  }

  // ==================== INVENTORY UPDATE ====================

  updateInventoryStock(cartItems, isReturn = false) {
    // Your existing stock update logic
    // ... keep it here
  }

  // ==================== UTILITIES ====================

  showNotification(message, type = "info") {
    // Your existing notification function
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `position:fixed;top:20px;right:20px;padding:12px 20px;border-radius:6px;color:white;font-weight:500;z-index:10000;`;

    const colors = {
      success: "#22c55e",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  cleanup() {
    this.cart = [];
    this.heldBills = [];
    if (window.pharmacyPOS === this) {
      delete window.pharmacyPOS;
    }
  }
}

// Make class available globally
window.PharmacyPOS = PharmacyPOS;
