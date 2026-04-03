/** @odoo-module **/

import { registry } from "@web/core/registry";

class PharmacyCustomers {
    constructor() {
        this.customers = [];
        this.selectedCustomer = null;
        this.init();
    }

    init() {
        this.loadCustomers();
        this.renderCustomers();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // This method sets up event listeners for the customers page
        // Since the renderCustomers method already handles event setup,
        // this method can be used for additional global event listeners if needed
        console.log('Customer event listeners setup completed');
    }

    loadCustomers() {
        const savedCustomers = localStorage.getItem('pharmacy_customers');
        if (savedCustomers) {
            try {
                this.customers = JSON.parse(savedCustomers);
            } catch (error) {
                console.error('Error loading customers:', error);
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
                totalPurchases: 12500,
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
                totalPurchases: 45000,
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
                totalPurchases: 18000,
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
                totalPurchases: 125000,
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
                totalPurchases: 85000,
            },
        ];
    }

    saveCustomers() {
        try {
            localStorage.setItem('pharmacy_customers', JSON.stringify(this.customers));
        } catch (error) {
            console.error('Error saving customers:', error);
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
                        ${this.selectedCustomer 
                            ? this.renderCustomerDetails(this.selectedCustomer) 
                            : `
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

        return customers.map((customer) => `
            <div class="customer-card ${this.selectedCustomer?.id === customer.id ? "selected" : ""}" 
                 data-customer-id="${customer.id}">
                <div class="customer-card-header">
                    <div class="customer-avatar">
                        <span class="avatar-text">${this.getInitials(customer.name)}</span>
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
        `).join("");
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    renderCustomerDetails(customer) {
        const creditPercentage = customer.creditLimit > 0 
            ? (customer.creditUsed / customer.creditLimit) * 100 
            : 0;

        // Get recent purchases
        const recentPurchases = customer.recentPurchases || [];

        return `
            <div class="customer-details-content">
                <div class="customer-details-header">
                    <div class="customer-avatar large">
                        <span class="avatar-text">${this.getInitials(customer.name)}</span>
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
                                <span class="contact-value">${customer.email || 'Not provided'}</span>
                            </div>
                            <div class="contact-item">
                                <span class="contact-label">📍</span>
                                <span class="contact-value">${customer.address || 'Not provided'}</span>
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
                    <div class="metric-card">
                        <div class="metric-header">
                            <span class="metric-icon">🛒</span>
                            <span class="metric-title">Total Purchases</span>
                        </div>
                        <div class="metric-value">LKR ${customer.totalPurchases.toLocaleString()}</div>
                    </div>
                </div>

                <div class="customer-actions">
                    <button class="btn btn-secondary compact customer-edit-btn" data-customer-id="${customer.id}">
                        <span class="btn-icon">✏️</span> Edit
                    </button>
                    <button class="btn btn-danger compact customer-delete-btn" data-customer-id="${customer.id}" data-customer-name="${customer.name.replace(/'/g, "\\'")}">
                        <span class="btn-icon">🗑️</span> Delete
                    </button>
                </div>

                <div class="customer-history">
                    <h4>Recent Purchases</h4>
                    <div class="purchase-history">
                        ${recentPurchases.length > 0 
                            ? recentPurchases.map(purchase => `
                                <div class="purchase-record format-style" data-purchase-id="${purchase.saleId}">
                                    <div class="receipt-info">
                                        <span class="receipt-number">${purchase.receiptNumber}</span>
                                        <span class="purchase-date">${purchase.displayTimestamp || purchase.timestamp}</span>
                                    </div>
                                    <div class="purchase-total">
                                        <span class="total-amount">LKR ${Number(purchase.totalAmount).toFixed(2)}</span>
                                    </div>
                                    <div class="items-list">
                                        ${purchase.items.map(item => `
                                            <span class="item-detail">${item.name}</span>
                                            <span class="item-quantity">${item.quantity}</span>
                                            <span class="item-price">×</span>
                                            <span class="item-unit-price">LKR ${Number(item.unitPrice).toFixed(2)}</span>
                                            <span class="item-equals">=</span>
                                            <span class="item-total">LKR ${Number(item.total).toFixed(2)}</span>
                                        `).join('')}
                                    </div>
                                    <div class="payment-info">
                                        <span class="payment-label">Payment:</span>
                                        <span class="payment-method">${purchase.paymentMethod}</span>
                                    </div>
                                </div>
                            `).join('') 
                            : `<div class="no-purchases"><p>No recent purchases found</p></div>`
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

        // Filter tabs
        const filterTabs = document.querySelectorAll(".filter-tab");
        filterTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                filterTabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                this.filterCustomers();
            });
        });

        // Add Customer button
        const addCustomerBtn = document.getElementById("addCustomerBtn");
        addCustomerBtn?.addEventListener("click", () => this.showAddCustomerModal());

        // Customer card clicks
        this.attachCustomerCardHandlers();
        
        // Customer action buttons (Edit and Delete)
        this.attachCustomerActionHandlers();
    }

    attachCustomerActionHandlers() {
        // Edit buttons
        const editButtons = document.querySelectorAll(".customer-edit-btn");
        editButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                const customerId = parseInt(button.dataset.customerId);
                this.editCustomer(customerId);
            });
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll(".customer-delete-btn");
        deleteButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                const customerId = parseInt(button.dataset.customerId);
                const customerName = button.dataset.customerName;
                this.confirmDeleteCustomer(customerId, customerName);
            });
        });
    }

    attachCustomerCardHandlers() {
        const cards = document.querySelectorAll(".customer-card");
        cards.forEach(card => {
            card.addEventListener("click", () => {
                const id = parseInt(card.dataset.customerId);
                this.selectCustomer(id);
            });
        });
    }

    filterCustomers() {
        const searchTerm = (document.getElementById("customerSearchInput")?.value || "").toLowerCase().trim();
        const activeTier = document.querySelector(".filter-tab.active")?.dataset.tier || "all";

        // Apply basic filtering
        let filtered = this.customers.filter(customer => {
            const matchesSearch = !searchTerm || 
                customer.name.toLowerCase().includes(searchTerm) ||
                customer.phone.includes(searchTerm) ||
                (customer.email && customer.email.toLowerCase().includes(searchTerm));

            const matchesTier = activeTier === "all" || 
                customer.tier.toLowerCase() === activeTier;

            return matchesSearch && matchesTier;
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
        this.selectedCustomer = this.customers.find(c => c.id === customerId);

        // Update selected styling
        document.querySelectorAll(".customer-card").forEach(card => {
            card.classList.toggle("selected", parseInt(card.dataset.customerId) === customerId);
        });

        // Render details
        const detailsContainer = document.getElementById("customerDetails");
        if (detailsContainer) {
            detailsContainer.innerHTML = this.renderCustomerDetails(this.selectedCustomer);
            // Attach action handlers for the new customer details
            this.attachCustomerActionHandlers();
        }
    }

    startNewSaleForCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            this.showNotification(`Starting new sale for ${customer.name}`, "success");
            // Navigate to POS page
            if (window.dashboard && typeof window.dashboard.handlePageNavigation === "function") {
                window.dashboard.handlePageNavigation("sales");
            }
        }
    }

    editCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return;
        this.showAddCustomerModal(customer); // Pass customer data for editing
    }

    confirmDeleteCustomer(customerId, customerName) {
        if (confirm(`Delete "${customerName}" permanently?`)) {
            this.deleteCustomer(customerId);
        }
    }

    deleteCustomer(customerId) {
        const index = this.customers.findIndex(c => c.id === customerId);
        if (index === -1) return;

        const name = this.customers[index].name;
        this.customers.splice(index, 1);
        this.saveCustomers();
        this.showNotification(`Customer "${name}" deleted successfully`, "success");
        this.renderCustomers();   // Refresh whole page
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
            <div class="inventory-modal" role="dialog" aria-modal="true" aria-labelledby="addCustomerTitle">
                <div class="inventory-modal-header">
                    <h3 id="addCustomerTitle">${modalTitle}</h3>
                    <button type="button" class="inventory-modal-close" aria-label="Close add customer form">×</button>
                </div>
                <form id="addCustomerForm" class="inventory-form-grid">
                    <input type="hidden" name="customerId" value="${isEdit ? customer.id : ''}">
                    <label class="inventory-form-field">
                        <span>Name *</span>
                        <input type="text" name="name" required placeholder="e.g. John Doe" value="${isEdit ? customer.name || '' : ''}">
                    </label>
                    <label class="inventory-form-field">
                        <span>Phone *</span>
                        <input type="tel" name="phone" required placeholder="e.g. +94771234567" value="${isEdit ? customer.phone || '' : ''}">
                    </label>
                    <label class="inventory-form-field">
                        <span>Email</span>
                        <input type="email" name="email" placeholder="e.g. john.doe@email.com" value="${isEdit ? customer.email || '' : ''}">
                    </label>
                    <label class="inventory-form-field">
                        <span>Address</span>
                        <input type="text" name="address" placeholder="e.g. 123 Main St, Colombo" value="${isEdit ? customer.address || '' : ''}">
                    </label>
                    <label class="inventory-form-field">
                        <span>Tier</span>
                        <select name="tier">
                            <option value="Bronze" ${isEdit && customer.tier === 'Bronze' ? 'selected' : ''}>Bronze</option>
                            <option value="Silver" ${isEdit && customer.tier === 'Silver' ? 'selected' : ''}>Silver</option>
                            <option value="Gold" ${isEdit && customer.tier === 'Gold' ? 'selected' : ''}>Gold</option>
                            <option value="Platinum" ${isEdit && customer.tier === 'Platinum' ? 'selected' : ''}>Platinum</option>
                        </select>
                    </label>
                    <label class="inventory-form-field">
                        <span>Credit Limit (LKR)</span>
                        <input type="number" name="creditLimit" min="0" step="100" placeholder="0" value="${isEdit ? customer.creditLimit || 0 : ''}">
                    </label>
                    <div class="inventory-form-actions">
                        <button type="button" class="btn btn-secondary compact" id="cancelAddCustomerBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary compact">${submitButtonText}</button>
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

  createCustomerFromForm(form) {
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const tier = String(formData.get("tier")) || "Bronze";
    const creditLimit = Number(formData.get("creditLimit") || 0);

    if (!name || !phone) {
      this.showNotification(
        "Please fill required fields (Name and Phone).",
        "warning",
      );
      return;
    }

    // Validate phone number format (basic validation)
    if (!phone.match(/^\+?[0-9\s\-\(\)]+$/)) {
      this.showNotification("Please enter a valid phone number.", "warning");
      return;
    }

    // Check for duplicate phone
    const existingCustomer = this.customers.find(c => c.phone === phone);
    if (existingCustomer) {
        this.showNotification("A customer with this phone number already exists", "error");
        return;
    }

    // Create new customer
    const newCustomer = {
      id: Math.max(...this.customers.map((c) => c.id)) + 1,
      name: name,
      phone: phone,
      email: email || "",
      address: address || "",
      tier: tier,
      loyaltyPoints: 0,
      creditUsed: 0,
      creditLimit: creditLimit,
      memberSince: new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      totalPurchases: 0,
      recentPurchases: []
    };

    // Add to customers array
    this.customers.push(newCustomer);

    // Save to localStorage
    this.saveCustomers();

    // Close modal
    this.closeAddCustomerModal();

    // Show success notification
    this.showNotification(`Customer "${name}" added successfully!`, "success");

    // Refresh the customers page to show the new customer
    this.renderCustomers();
  }

  updateCustomerFromForm(form, customerId) {
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const tier = String(formData.get("tier")) || "Bronze";
    const creditLimit = Number(formData.get("creditLimit")) || 0;

    if (!name || !phone) {
      this.showNotification(
        "Please fill required fields (Name and Phone).",
        "warning",
      );
      return;
    }

    // Validate phone number format (basic validation)
    if (!phone.match(/^\+?[0-9\s\-\(\)]+$/)) {
      this.showNotification("Please enter a valid phone number.", "warning");
      return;
    }

    // Find the customer to update
    const customerIndex = this.customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
      this.showNotification("Customer not found", "error");
      return;
    }

    // Check for duplicate phone (exclude current customer)
    const existingCustomer = this.customers.find(c => c.phone === phone && c.id !== customerId);
    if (existingCustomer) {
        this.showNotification("A customer with this phone number already exists", "error");
        return;
    }

    // Update customer data
    const updatedCustomer = {
      ...this.customers[customerIndex],
      name: name,
      phone: phone,
      email: email || "",
      address: address || "",
      tier: tier,
      creditLimit: creditLimit,
    };

    this.customers[customerIndex] = updatedCustomer;

    // Save to localStorage
    this.saveCustomers();

    // Close modal
    this.closeAddCustomerModal();

    // Show success notification
    this.showNotification(`Customer "${name}" updated successfully!`, "success");

    // Refresh the customers page to show updated customer
    this.renderCustomers();
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; padding: 12px 20px; 
      border-radius: 6px; color: white; font-weight: 500; z-index: 10000;
    `;
    const colors = { success: "#22c55e", error: "#ef4444", warning: "#f59e0b", info: "#3b82f6" };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => notification.remove(), 400);
    }, 3000);
  }

  cleanup() {
    console.log("PharmacyCustomers cleaned up");
  }
}

// Make globally accessible
window.PharmacyCustomers = PharmacyCustomers;

// Register for Odoo
registry.category("actions").add("pharmacy_customers_action", PharmacyCustomers);
