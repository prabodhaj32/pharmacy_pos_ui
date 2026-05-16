/** @odoo-module **/

import { registry } from "@web/core/registry";
import { rpc } from "@web/core/network/rpc";
import { useService } from "@web/core/utils/hooks";

class PharmacyCustomers {
  constructor() {
    this.customers = [];
    this.selectedCustomer = null;
    this.setup();
    this.init();
  }

  setup() {
    try {
      this.rpc = useService("rpc");
    } catch {
      this.rpc = rpc;
    }
  }

  async init() {
    await this.loadCustomers();
    this.renderCustomers();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // This method sets up event listeners for the customers page
    // Since the renderCustomers method already handles event setup,
    // this method can be used for additional global event listeners if needed
    console.log("Customer event listeners setup completed");
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
        ...c,
        totalPurchases: c.total_purchases || 0,
        memberSince: c.member_since || "New Member",
        creditLimit: c.credit_limit || 0,
        creditUsed: c.credit_used || 0,
        loyaltyPoints: c.loyalty_points || 0,
        recentPurchases: Array.isArray(c.recent_purchases)
          ? c.recent_purchases.map((p) => ({
              saleId: p.saleId ?? p.sale_id ?? p.id ?? null,
              receiptNumber: p.receiptNumber ?? p.receipt_number ?? "N/A",
              paymentMethod: p.paymentMethod ?? p.payment_method ?? "cash",
              totalAmount: Number(p.totalAmount ?? p.total_amount ?? 0),
              timestamp: p.timestamp || "",
              displayTimestamp:
                p.displayTimestamp ?? p.display_timestamp ?? p.timestamp ?? "",
              items: Array.isArray(p.items)
                ? p.items.map((item) => ({
                    name: item.name || "Item",
                    quantity: Number(item.quantity || 0),
                    unitPrice: Number(item.unitPrice ?? item.unit_price ?? 0),
                    total: Number(item.total || 0),
                    batch: item.batch || "",
                    expiry: item.expiry || "",
                  }))
                : [],
            }))
          : [],
      }));
    } catch (error) {
      console.error("RPC Error loading customers:", error);
      this.customers = [];
    }
  }

  renderCustomers() {
    const container = document.getElementById("dashboard_container");

    container.innerHTML = `
            <div class="dashboard">
                <div class="customers-search-section" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; background: white; border-bottom: 1px solid #f1f5f9; gap: 20px;">
                    <div class="search-bar" style="flex: 1; max-width: 500px; position: relative;">
                        <input
                            type="text"
                            id="customerSearchInput"
                            placeholder="🔍 Search customers by name or phone..."
                            class="search-input"
                            style="width: 100%; padding: 12px 20px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 15px; outline: none; transition: all 0.2s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);"
                        >
                    </div>
                    <div class="customers-header-actions">
                        <button class="action-btn-glass add-btn" id="addCustomerBtn" style="padding: 12px 24px; border-radius: 12px; background: linear-gradient(135deg, #4f46e5, #6366f1); border: none; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);">
                            <span class="btn-icon" style="font-size: 18px;">➕</span>
                            Add Customer
                        </button>
                    </div>
                </div>

                <div class="customers-content">
                    <div class="customers-list" id="customersList">
                        ${this.renderCustomerList(this.customers)}
                    </div>
                    
                    <div class="customer-details" id="customerDetails">
                        ${
                          this.selectedCustomer
                            ? this.renderCustomerDetails(this.selectedCustomer)
                            : `
                            <div class="no-customer-selected">
                                <div class="no-customer-icon">👥</div>
                                <h3>Select a Customer</h3>
                                <p>Choose a customer from the list to view their details</p>
                            </div>
                        `
                        }
                    </div>
                </div>
            </div>
        `;

    // Setup handlers after rendering
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

    return customers
      .map(
        (customer) => `
            <div class="customer-card ${this.selectedCustomer?.id === customer.id ? "selected" : ""}" 
                 data-customer-id="${customer.id}">
                <div class="customer-card-header">
                    <div class="customer-avatar">
                        <span class="avatar-text">${this.getInitials(customer.name)}</span>
                    </div>
                    <div class="customer-info">
                        <h4 class="customer-name">${customer.name}</h4>
                        <div class="customer-tier">
                            <span class="customer-phone">${customer.phone}</span>
                        </div>
                    </div>
                </div>
            </div>
        `,
      )
      .join("");
  }

  getInitials(name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  renderCustomerDetails(customer) {
    // Get recent purchases
    const recentPurchases = customer.recentPurchases || [];

    return `
            <style>
                .purchase-history::-webkit-scrollbar { width: 6px; }
                .purchase-history::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                .purchase-history::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .purchase-history::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            </style>
            <div class="customer-details-content" style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05), 0 4px 10px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; font-family: 'Inter', system-ui, sans-serif;">
                
                <!-- Header Section -->
                <div class="customer-details-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 32px; border-bottom: 2px dashed #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 24px;">
                        <div class="customer-avatar large" style="width: 90px; height: 90px; border-radius: 24px; background: linear-gradient(135deg, #4f46e5, #818cf8); display: flex; align-items: center; justify-content: center; color: white; font-size: 36px; font-weight: 700; box-shadow: 0 8px 16px rgba(79, 70, 229, 0.25); transform: rotate(-2deg);">
                            <span class="avatar-text" style="transform: rotate(2deg);">${this.getInitials(customer.name)}</span>
                        </div>
                        <div class="customer-details-info">
                            <h3 class="customer-name" style="margin: 0 0 12px 0; font-size: 28px; color: #0f172a; font-weight: 800; letter-spacing: -0.5px;">${customer.name}</h3>
                            <div class="customer-contact" style="display: flex; gap: 16px; color: #475569;">
                                <div class="contact-item" style="display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 6px 12px; border-radius: 8px; font-size: 14px; border: 1px solid #f1f5f9; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                                    <span class="contact-label">📱</span>
                                    <span class="contact-value" style="font-weight: 600;">${customer.phone}</span>
                                </div>
                                <div class="contact-item" style="display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 6px 12px; border-radius: 8px; font-size: 14px; border: 1px solid #f1f5f9; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                                    <span class="contact-label">✉️</span>
                                    <span class="contact-value">${customer.email || "Not provided"}</span>
                                </div>
                                <div class="contact-item" style="display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 6px 12px; border-radius: 8px; font-size: 14px; border: 1px solid #f1f5f9; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                                    <span class="contact-label">📍</span>
                                    <span class="contact-value">${customer.address || "Not provided"}</span>
                                </div>
                            </div>
                            <div class="customer-stats" style="display: flex; gap: 24px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="background: #eff6ff; color: #3b82f6; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">📅</div>
                                    <div>
                                        <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Member Since</div>
                                        <div style="font-size: 15px; color: #0f172a; font-weight: 700;">${customer.memberSince}</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="background: #dcfce7; color: #16a34a; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🛒</div>
                                    <div>
                                        <div style="font-size: 10px; color: #15803d; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Total Purchases</div>
                                        <div style="font-size: 15px; color: #166534; font-weight: 700;">LKR ${customer.totalPurchases.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="customer-actions" style="display: flex; gap: 10px;">
                        <button class="btn btn-secondary compact customer-edit-btn" data-customer-id="${customer.id}" style="padding: 10px 16px; border-radius: 10px; background: #ffffff; border: 1px solid #cbd5e1; color: #334155; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <span class="btn-icon">✏️</span> Edit
                        </button>
                        <button class="btn btn-danger compact customer-delete-btn" data-customer-id="${customer.id}" data-customer-name="${customer.name.replace(/'/g, "\\'")}" style="padding: 10px 16px; border-radius: 10px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(220,38,38,0.05);">
                            <span class="btn-icon">🗑️</span> Delete
                        </button>
                    </div>
                </div>

                <!-- History Section -->
                <div class="customer-history">
                    <h4 style="margin: 0 0 20px 0; font-size: 20px; color: #0f172a; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                        <span style="background: #f1f5f9; padding: 6px 12px; border-radius: 8px; font-size: 16px;">📜</span> Recent Purchases
                    </h4>
                    <div class="purchase-history" style="display: flex; flex-direction: column; gap: 12px; margin-top: 4px; max-height: 400px; overflow-y: auto; padding-right: 8px;">
                        ${
                          recentPurchases.length > 0
                            ? recentPurchases
                                .map(
                                  (purchase) => `
                                <div class="purchase-record compact-layout" data-purchase-id="${purchase.saleId}" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 8px; overflow: hidden; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                                    <div class="purchase-summary" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #f8fafc; transition: background 0.2s;">
                                        <div style="display: flex; align-items: center; gap: 12px; font-size: 13px;">
                                            <div style="font-weight: 700; color: #475569; background: #e2e8f0; padding: 4px 8px; border-radius: 6px;">${purchase.receiptNumber}</div>
                                            <div style="color: #64748b; display: flex; align-items: center; gap: 4px;"><span>🕒</span> ${purchase.displayTimestamp || purchase.timestamp}</div>
                                            <div style="color: #cbd5e1;">|</div>
                                            <div style="color: #64748b;">Method: <span style="font-weight: 600; text-transform: uppercase;">${purchase.paymentMethod}</span></div>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 16px;">
                                            <div style="font-weight: 700; color: #0f172a; font-size: 15px;">LKR ${Number(purchase.totalAmount).toFixed(2)}</div>
                                            <div style="color: #64748b; font-size: 12px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: #e2e8f0; border-radius: 50%;"><span class="toggle-icon">▼</span></div>
                                        </div>
                                    </div>
                                    
                                    <div class="purchase-full-details" style="display: none; padding: 16px; border-top: 1px solid #e2e8f0; background: #ffffff;">
                                        <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Purchased Items</div>
                                        <div style="display: flex; flex-direction: column; gap: 8px;">
                                            ${purchase.items
                                              .map(
                                                (item, idx) => `
                                                <div style="display: flex; justify-content: space-between; align-items: center; ${idx !== purchase.items.length - 1 ? "padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0;" : ""}">
                                                    <div style="display: flex; flex-direction: column; gap: 2px;">
                                                        <span style="font-weight: 600; color: #334155; font-size: 13px;">${item.name}</span>
                                                        <span style="color: #64748b; font-size: 12px;">${item.quantity} × LKR ${Number(item.unitPrice).toFixed(2)}</span>
                                                    </div>
                                                    <div style="font-weight: 700; color: #0f172a; font-size: 13px;">
                                                        LKR ${Number(item.total).toFixed(2)}
                                                    </div>
                                                </div>
                                            `,
                                              )
                                              .join("")}
                                        </div>
                                    </div>
                                </div>
                            `,
                                )
                                .join("")
                            : `<div class="no-purchases" style="text-align: center; padding: 48px; background: #f8fafc; border-radius: 16px; border: 2px dashed #cbd5e1;"><div style="font-size: 48px; margin-bottom: 16px;">🛍️</div><div style="color: #334155; font-weight: 700; font-size: 18px; margin-bottom: 8px;">No recent purchases found</div><div style="color: #64748b; font-size: 15px;">This customer hasn't made any purchases yet.</div></div>`
                        }
                    </div>
                </div>
            </div>
        `;
  }

  setupCustomerHandlers() {
    // Search input
    const searchInput = document.getElementById("customerSearchInput");
    searchInput?.addEventListener("input", () => this.filterCustomers());

    // Add Customer button
    const addCustomerBtn = document.getElementById("addCustomerBtn");
    addCustomerBtn?.addEventListener("click", () =>
      this.showAddCustomerModal(),
    );

    // Customer card clicks
    this.attachCustomerCardHandlers();

    // Customer action buttons (Edit and Delete)
    this.attachCustomerActionHandlers();
  }

  attachCustomerActionHandlers() {
    // Edit buttons
    const editButtons = document.querySelectorAll(".customer-edit-btn");
    editButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const customerId = parseInt(button.dataset.customerId);
        this.editCustomer(customerId);
      });
    });

    // Delete buttons
    const deleteButtons = document.querySelectorAll(".customer-delete-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const customerId = parseInt(button.dataset.customerId);
        const customerName = button.dataset.customerName;
        this.confirmDeleteCustomer(customerId, customerName);
      });
    });

    // Purchase record expansion toggle
    const purchaseRecords = document.querySelectorAll(
      ".purchase-record.compact-layout",
    );
    purchaseRecords.forEach((record) => {
      record.addEventListener("click", (e) => {
        const fullDetails = record.querySelector(".purchase-full-details");
        const toggleIcon = record.querySelector(".toggle-icon");
        const isExpanded = fullDetails.style.display !== "none";

        if (isExpanded) {
          fullDetails.style.display = "none";
          toggleIcon.textContent = "▼";
          record.classList.remove("expanded");
        } else {
          fullDetails.style.display = "block";
          toggleIcon.textContent = "▲";
          record.classList.add("expanded");
        }
      });
    });
  }

  attachCustomerCardHandlers() {
    const cards = document.querySelectorAll(".customer-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const id = parseInt(card.dataset.customerId);
        this.selectCustomer(id);
      });
    });
  }

  filterCustomers() {
    const searchTerm = (
      document.getElementById("customerSearchInput")?.value || ""
    )
      .toLowerCase()
      .trim();

    let filtered = this.customers.filter((customer) => {
      return (
        !searchTerm ||
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm))
      );
    });

    this.updateCustomerList(filtered);
  }

  updateCustomerList(filteredCustomers) {
    const listContainer = document.getElementById("customersList");
    if (listContainer) {
      listContainer.innerHTML = this.renderCustomerList(filteredCustomers);
      this.attachCustomerCardHandlers();
    }
  }

  selectCustomer(customerId) {
    this.selectedCustomer = this.customers.find((c) => c.id === customerId);

    // Update selected styling
    document.querySelectorAll(".customer-card").forEach((card) => {
      card.classList.toggle(
        "selected",
        parseInt(card.dataset.customerId) === customerId,
      );
    });

    // Render details
    const detailsContainer = document.getElementById("customerDetails");
    if (detailsContainer) {
      detailsContainer.innerHTML = this.renderCustomerDetails(
        this.selectedCustomer,
      );
      // Attach action handlers for the new customer details
      this.attachCustomerActionHandlers();
    }
  }

  startNewSaleForCustomer(customerId) {
    const customer = this.customers.find((c) => c.id === customerId);
    if (customer) {
      this.showNotification(
        `Starting new sale for ${customer.name}`,
        "success",
      );
      // Navigate to POS page
      if (
        window.dashboard &&
        typeof window.dashboard.handlePageNavigation === "function"
      ) {
        window.dashboard.handlePageNavigation("sales");
      }
    }
  }

  editCustomer(customerId) {
    const customer = this.customers.find((c) => c.id === customerId);
    if (!customer) return;
    this.showAddCustomerModal(customer); // Pass customer data for editing
  }

  confirmDeleteCustomer(customerId, customerName) {
    if (confirm(`Delete "${customerName}" permanently?`)) {
      this.deleteCustomer(customerId);
    }
  }

  async deleteCustomer(customerId) {
    try {
      await this.rpc("/pharmacy/customers/delete", { id: customerId });
      await this.loadCustomers();
      this.renderCustomers();
      this.showNotification("Customer deleted!", "success");
    } catch (error) {
      console.error(error);
      this.showNotification("Error deleting customer", "error");
    }
  }

  showAddCustomerModal(customer = null) {
    if (document.getElementById("addCustomerModal")) return;

    const isEdit = customer !== null;
    const modalTitle = isEdit ? "Edit Customer" : "Add New Customer";
    const submitButtonText = isEdit ? "Update Customer" : "Add Customer";

    const modal = document.createElement("div");
    modal.id = "addCustomerModal";
    modal.className = "inventory-modal-overlay";
    modal.innerHTML = `
            <div class="inventory-modal" style="max-width: 520px; max-height: 90vh; overflow-y: auto; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);" role="dialog" aria-modal="true" aria-labelledby="addCustomerTitle">
                <div class="inventory-modal-header" style="background: rgba(255, 255, 255, 0.2); border-bottom: 1px solid rgba(0, 0, 0, 0.05); padding: 0.75rem 1rem; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 id="addCustomerTitle" style="margin: 0; font-size: 0.9rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">${modalTitle}</h3>
                        <p style="margin: 0; font-size: 0.65rem; color: #64748b;">Manage customer profile and loyalty tier</p>
                    </div>
                    <button type="button" class="inventory-modal-close" aria-label="Close" style="background: transparent; border: 1px solid rgba(0,0,0,0.1); color: #64748b; width: 24px; height: 24px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">×</button>
                </div>
                <form id="addCustomerForm" style="padding: 1rem; background: transparent; display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
                    <input type="hidden" name="customerId" value="${isEdit ? customer.id : ""}">
                    <div style="grid-column: span 2;">
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Full Name *</label>
                        <input type="text" name="name" required placeholder="e.g. John Doe" value="${isEdit ? customer.name || "" : ""}" style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Phone *</label>
                        <input type="tel" name="phone" required placeholder="e.g. +94771234567" value="${isEdit ? customer.phone || "" : ""}" style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Email</label>
                        <input type="email" name="email" placeholder="e.g. john.doe@email.com" value="${isEdit ? customer.email || "" : ""}" style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div style="grid-column: span 2;">
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Residential Address</label>
                        <input type="text" name="address" placeholder="e.g. 123 Main St, Colombo" value="${isEdit ? customer.address || "" : ""}" style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Loyalty Tier</label>
                        <select name="tier" style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                            <option value="Bronze" ${isEdit && customer.tier === "Bronze" ? "selected" : ""}>Bronze</option>
                            <option value="Silver" ${isEdit && customer.tier === "Silver" ? "selected" : ""}>Silver</option>
                            <option value="Gold" ${isEdit && customer.tier === "Gold" ? "selected" : ""}>Gold</option>
                            <option value="Platinum" ${isEdit && customer.tier === "Platinum" ? "selected" : ""}>Platinum</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Credit Limit (LKR)</label>
                        <input type="number" name="creditLimit" min="0" step="100" placeholder="0" value="${isEdit ? customer.creditLimit || 0 : ""}" style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid rgba(0,0,0,0.05);">
                        <button type="button" class="btn btn-secondary" id="cancelAddCustomerBtn" style="padding: 0.4rem 1rem; font-size: 0.7rem; border-radius: 6px; background: white; color: #475569; border: 1px solid #e2e8f0; font-weight: 600; cursor: pointer; transition: all 0.2s;">Cancel</button>
                        <button type="submit" class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.7rem; border-radius: 6px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; color: white; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); transition: all 0.2s;">${submitButtonText}</button>
                    </div>
                </form>
            </div>
        `;

    document.body.appendChild(modal);

    const close = () => this.closeAddCustomerModal();
    modal
      .querySelector(".inventory-modal-close")
      ?.addEventListener("click", close);
    modal
      .querySelector("#cancelAddCustomerBtn")
      ?.addEventListener("click", close);
    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) close();
    });

    const form = modal.querySelector("#addCustomerForm");
    form?.addEventListener("submit", (ev) => {
      ev.preventDefault();
      if (isEdit) {
        this.updateCustomerFromForm(form, customer.id);
      } else {
        this.createCustomerFromForm(form);
      }
    });
  }

  closeAddCustomerModal() {
    const modal = document.getElementById("addCustomerModal");
    if (modal) modal.remove();
  }

  async createCustomerFromForm(form) {
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      address: formData.get("address"),
      tier: formData.get("tier"),
      creditLimit: Number(formData.get("creditLimit") || 0),
      memberSince: new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    };

    try {
      await this.rpc("/pharmacy/customers/create", payload);
      await this.loadCustomers();
      this.renderCustomers();
      this.closeAddCustomerModal();
      this.showNotification("Customer added!", "success");
    } catch (error) {
      console.error(error);
      this.showNotification("Error adding customer", "error");
    }
  }

  async updateCustomerFromForm(form, customerId) {
    const formData = new FormData(form);

    const payload = {
      id: customerId,
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      address: formData.get("address"),
      tier: formData.get("tier"),
      creditLimit: Number(formData.get("creditLimit") || 0),
    };

    try {
      await this.rpc("/pharmacy/customers/update", payload);
      await this.loadCustomers();
      this.renderCustomers();
      this.closeAddCustomerModal();
      this.showNotification("Customer updated!", "success");
    } catch (error) {
      console.error(error);
      this.showNotification("Error updating customer", "error");
    }
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

  cleanup() {
    console.log("PharmacyCustomers cleaned up");
  }
}

// Make globally accessible
window.PharmacyCustomers = PharmacyCustomers;

// Register for Odoo
registry
  .category("actions")
  .add("pharmacy_customers_action", PharmacyCustomers);
