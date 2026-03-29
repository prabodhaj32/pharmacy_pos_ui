
import { registry } from "@web/core/registry";
import { Component, onMounted, onWillUnmount } from "@odoo/owl";
import { medicines } from "./data/medicine_data.js";


class PharmacyInventory extends Component {
    setup() {
        this.inventoryItems = [];
        this.inventoryActiveFilter = "all";
        this.inventoryLowStockThreshold = 20;

        onMounted(() => {
            this.renderInventory();
        });

        onWillUnmount(() => {
            this.cleanup();
        });
    }

    // ====================== DATA MANAGEMENT ======================
    ensureInventoryData() {
        if (this.inventoryItems?.length) return;
        this.loadInventoryItems();
    }

    loadInventoryItems() {
        const savedItems = localStorage.getItem('pharmacy_pos_inventory_items');
        this.inventoryItems = savedItems ? JSON.parse(savedItems) : [...medicines];
    }

    saveInventoryItems() {
        localStorage.setItem('pharmacy_pos_inventory_items', JSON.stringify(this.inventoryItems));
    }

    parseISODate(dateString) {
        const d = new Date(dateString);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    isExpiringWithinDays(item, days = 90) {
        const expiry = this.parseISODate(item.expiryDate);
        if (!expiry) return false;
        const diffDays = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= days;
    }

    isLowStock(item, threshold = 20) {
        return Number(item.stock || 0) <= threshold;
    }

    getMarginPct(item) {
        const price = Number(item.price) || 0;
        const cost = Number(item.cost) || 0;
        return price > 0 ? ((price - cost) / price) * 100 : 0;
    }

    formatLKR(amount) {
        const v = Number(amount) || 0;
        return `LKR ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    formatLKRCompact(amount) {
        const v = Number(amount) || 0;
        if (v >= 1000000) return `LKR ${(v / 1000000).toFixed(1)}M`;
        if (v >= 1000) return `LKR ${(v / 1000).toFixed(0)}K`;
        return `LKR ${v.toFixed(0)}`;
    }

    // ====================== RENDER INVENTORY ======================
    renderInventory() {
        this.ensureInventoryData();
        const container = document.getElementById("dashboard_container");

        const categories = [...new Set(this.inventoryItems.map(i => i.category))].sort();
        const categoryOptionsHtml = categories.map(c => `<option value="${c}">${c}</option>`).join("");

        container.innerHTML = `
            <div class="dashboard">
              

                <div class="inventory-actions">
                    <button class="btn btn-primary compact" id="inventoryAdjustStockBtn">Adjust Stock</button>
                    <button class="btn btn-secondary compact" id="inventoryAddItemBtn">➕ Add Item</button>
                </div>

                <div class="inventory-stats">
                    <div class="stat-card compact total">
                        <div class="stat-icon">◈</div>
                        <div class="stat-content">
                            <h3>Total Items</h3>
                            <p class="stat-value" id="inventoryTotalItemsValue">0</p>
                        </div>
                    </div>
                    <div class="stat-card compact warning">
                        <div class="stat-icon">!</div>
                        <div class="stat-content">
                            <h3>Low Stock</h3>
                            <p class="stat-value" id="inventoryLowStockValue">0</p>
                        </div>
                    </div>
                    <div class="stat-card compact danger">
                        <div class="stat-icon">⌛</div>
                        <div class="stat-content">
                            <h3>Expiring (&lt;90d)</h3>
                            <p class="stat-value" id="inventoryExpiringValue">0</p>
                        </div>
                    </div>
                    <div class="stat-card compact success">
                        <div class="stat-icon">LKR</div>
                        <div class="stat-content">
                            <h3>Stock Value</h3>
                            <p class="stat-value" id="inventoryStockValueValue">LKR 0</p>
                        </div>
                    </div>
                </div>

                <div class="inventory-controls compact">
                    <div class="search-bar compact">
                        <input id="inventorySearchInput" type="text" placeholder="🔍 Search inventory..." class="search-input compact">
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
                        <button class="filter-btn compact active" data-inventory-filter="all">All</button>
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
                                    <td colspan="8" class="cart-empty"><p>Loading inventory...</p></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.setupInventoryHandlers();
        this.updateInventoryStatsAndTable();
    }

    // ====================== HANDLERS ======================
    setupInventoryHandlers() {
        const searchInput = document.getElementById("inventorySearchInput");
        const categorySelect = document.getElementById("inventoryCategorySelect");
        const typeSelect = document.getElementById("inventoryTypeSelect");
        const filterButtons = document.querySelectorAll("[data-inventory-filter]");
        const addItemBtn = document.getElementById("inventoryAddItemBtn");
        const adjustStockBtn = document.getElementById("inventoryAdjustStockBtn");

        const setActiveButton = (filter) => {
            filterButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.inventoryFilter === filter));
        };

        searchInput?.addEventListener("input", () => this.updateInventoryStatsAndTable());
        categorySelect?.addEventListener("change", () => this.updateInventoryStatsAndTable());

        typeSelect?.addEventListener("change", () => {
            const v = typeSelect.value;
            this.inventoryActiveFilter = (v === "rx_only" || v === "controlled") ? v : "all";
            setActiveButton(this.inventoryActiveFilter);
            this.updateInventoryStatsAndTable();
        });

        filterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                this.inventoryActiveFilter = btn.dataset.inventoryFilter;
                if (typeSelect) {
                    typeSelect.value = (this.inventoryActiveFilter === "rx_only" || this.inventoryActiveFilter === "controlled") 
                        ? this.inventoryActiveFilter : "all";
                }
                setActiveButton(this.inventoryActiveFilter);
                this.updateInventoryStatsAndTable();
            });
        });

        addItemBtn?.addEventListener("click", () => this.openInventoryAddItemModal());
        adjustStockBtn?.addEventListener("click", () => {
            this.showNotification("Stock adjustment feature coming soon.", "info");
        });
    }

    // ====================== STATS & TABLE ======================
    updateInventoryStatsAndTable() {
        const allItems = this.inventoryItems || [];
        const totalItems = allItems.length;
        const lowStockCount = allItems.filter(i => this.isLowStock(i)).length;
        const expiringCount = allItems.filter(i => this.isExpiringWithinDays(i)).length;
        const stockValue = allItems.reduce((sum, i) => sum + (Number(i.stock) || 0) * (Number(i.price) || 0), 0);

        document.getElementById("inventoryTotalItemsValue").textContent = totalItems;
        document.getElementById("inventoryLowStockValue").textContent = lowStockCount;
        document.getElementById("inventoryExpiringValue").textContent = expiringCount;
        document.getElementById("inventoryStockValueValue").textContent = this.formatLKRCompact(stockValue);

        const filtered = this.applyInventoryFilters();
        this.renderInventoryTable(filtered);
    }

    applyInventoryFilters() {
        const query = (document.getElementById("inventorySearchInput")?.value || "").trim().toLowerCase();
        const category = document.getElementById("inventoryCategorySelect")?.value || "All";
        const typeValue = document.getElementById("inventoryTypeSelect")?.value || "all";

        let filter = this.inventoryActiveFilter || "all";
        if (typeValue === "rx_only" || typeValue === "controlled") filter = typeValue;

        return this.inventoryItems.filter(item => {
            if (category !== "All" && item.category !== category) return false;
            if (query) {
                const haystack = `${item.name} ${item.generic || ''} ${item.barcode || ''}`.toLowerCase();
                if (!haystack.includes(query)) return false;
            }
            if (filter === "low_stock") return this.isLowStock(item);
            if (filter === "expiring") return this.isExpiringWithinDays(item);
            if (filter === "controlled") return !!item.controlled;
            if (filter === "rx_only") return !!item.rxOnly;
            return true;
        });
    }

    renderInventoryTable(items) {
        const tbody = document.getElementById("inventoryTableBody");
        if (!tbody) return;
        tbody.innerHTML = "";

        if (!items || !items.length) {
            tbody.innerHTML = `<tr class="cart-empty-row"><td colspan="8" class="cart-empty"><p>No matching items found.</p></td></tr>`;
            return;
        }

        items.forEach(item => {
            const lowStock = this.isLowStock(item);
            const expiring = this.isExpiringWithinDays(item);
            const marginPct = this.getMarginPct(item);

            const statusPill = expiring ? 
                `<span class="meta-pill profit">Expiring</span>` : 
                lowStock ? `<span class="meta-pill neutral">Low Stock</span>` : 
                `<span class="meta-pill sales">In Stock</span>`;

            const rxPill = item.rxOnly ? `<span class="meta-pill rx-only">Rx</span>` : "";
            const controlledPill = item.controlled ? `<span class="meta-pill controlled">Controlled</span>` : "";

            const row = document.createElement("tr");
            row.className = `cart-row inventory-row${lowStock ? " low-stock" : ""}${expiring ? " expiring" : ""}`;
            row.innerHTML = `
                <td>
                    <div class="product-info">
                        <span class="icon">${item.icon || "💊"}</span>
                        <div class="inventory-medicine-text">
                            <div class="inventory-medicine-title">
                                <span class="name">${item.name}</span>
                                ${rxPill} ${controlledPill}
                            </div>
                            <div class="inventory-medicine-generic">${item.generic || ""}</div>
                        </div>
                    </div>
                </td>
                <td>${item.category}</td>
                <td>
                    <div class="batch-info">
                        <span class="batch">${item.batch || ""}</span>
                        <span class="expiry">${item.expiryLabel || item.expiryDate || ""}</span>
                    </div>
                </td>
                <td>${item.stock}</td>
                <td class="unit-price">${Number(item.cost || 0).toFixed(2)}</td>
                <td class="unit-price">${Number(item.price || 0).toFixed(2)}</td>
                <td class="unit-price">${marginPct.toFixed(0)}%</td>
                <td>${statusPill}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // ====================== ADD ITEM MODAL ======================
   openInventoryAddItemModal() {
        if (document.getElementById("inventoryAddItemModal")) return;

        const modal = document.createElement("div");
        modal.id = "inventoryAddItemModal";
        modal.className = "inventory-modal-overlay";
        modal.innerHTML = `
            <div class="inventory-modal" role="dialog" aria-modal="true" aria-labelledby="inventoryAddItemTitle">
                <div class="inventory-modal-header">
                    <h3 id="inventoryAddItemTitle">Add Inventory Item</h3>
                    <button type="button" class="inventory-modal-close" aria-label="Close add item form">×</button>
                </div>
                <form id="inventoryAddItemForm" class="inventory-form-grid">
                    <label class="inventory-form-field">
                        <span>Name *</span>
                        <input type="text" name="name" required placeholder="e.g. Azithromycin 500">
                    </label>
                    <label class="inventory-form-field">
                        <span>Generic</span>
                        <input type="text" name="generic" placeholder="Generic description">
                    </label>
                    <label class="inventory-form-field">
                        <span>Barcode</span>
                        <input type="text" name="barcode" placeholder="Barcode number">
                    </label>
                    <label class="inventory-form-field">
                        <span>Category *</span>
                        <input type="text" name="category" required placeholder="e.g. Antibiotics">
                    </label>
                    <label class="inventory-form-field">
                        <span>Batch *</span>
                        <input type="text" name="batch" required placeholder="e.g. BT-NEW-2026-001">
                    </label>
                    <label class="inventory-form-field">
                        <span>Expiry Date *</span>
                        <input type="date" name="expiryDate" required>
                    </label>
                    <label class="inventory-form-field">
                        <span>Stock *</span>
                        <input type="number" name="stock" min="0" step="1" required placeholder="0">
                    </label>
                    <label class="inventory-form-field">
                        <span>Cost *</span>
                        <input type="number" name="cost" min="0" step="0.01" required placeholder="0.00">
                    </label>
                    <label class="inventory-form-field">
                        <span>Price *</span>
                        <input type="number" name="price" min="0" step="0.01" required placeholder="0.00">
                    </label>
                    <label class="inventory-form-field inventory-form-check">
                        <input type="checkbox" name="rxOnly"> <span>Rx Only</span>
                    </label>
                    <label class="inventory-form-field inventory-form-check">
                        <input type="checkbox" name="controlled"> <span>Controlled</span>
                    </label>
                    <div class="inventory-form-actions">
                        <button type="button" class="btn btn-secondary compact" id="inventoryCancelAddItemBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary compact">Create Item</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Attach event listeners
        const close = () => this.closeInventoryAddItemModal();
        modal.querySelector(".inventory-modal-close")?.addEventListener("click", close);
        modal.querySelector("#inventoryCancelAddItemBtn")?.addEventListener("click", close);
        modal.addEventListener("click", (ev) => {
            if (ev.target === modal) close();
        });

        const form = modal.querySelector("#inventoryAddItemForm");
        form?.addEventListener("submit", (ev) => {
            ev.preventDefault();
            this.createInventoryItemFromForm(form);
        });

        // Set today's date as min expiry date
        const expiryInput = modal.querySelector('input[name="expiryDate"]');
        if (expiryInput) {
            const today = new Date().toISOString().split('T')[0];
            expiryInput.min = today;
        }
    }

    closeInventoryAddItemModal() {
        const modal = document.getElementById("inventoryAddItemModal");
        if (modal) modal.remove();
    }

    createInventoryItemFromForm(form) {
        const formData = new FormData(form);
        
        // Get and validate form data
        const name = String(formData.get("name") || "").trim();
        const category = String(formData.get("category") || "").trim();
        const batch = String(formData.get("batch") || "").trim();
        const expiryDate = String(formData.get("expiryDate") || "").trim();
        const stock = Number(formData.get("stock") || 0);
        const cost = Number(formData.get("cost") || 0);
        const price = Number(formData.get("price") || 0);
        const reorderLevel = Number(formData.get("reorderLevel")) || 20;

        // Validation
        if (!name || !category || !batch || !expiryDate) {
            this.showNotification("⚠️ Please fill all required fields", "warning");
            return;
        }

        if (isNaN(stock) || stock < 0) {
            this.showNotification("⚠️ Please enter a valid stock quantity", "warning");
            return;
        }

        if (isNaN(cost) || cost < 0 || isNaN(price) || price < 0) {
            this.showNotification("⚠️ Please enter valid prices", "warning");
            return;
        }

        if (price < cost) {
            this.showNotification("⚠️ Selling price should be greater than cost price", "warning");
            return;
        }

        // Parse expiry date and create label
        const parsedExpiry = this.parseISODate(expiryDate);
        if (!parsedExpiry) {
            this.showNotification("⚠️ Invalid expiry date", "warning");
            return;
        }

        const expiryLabel = parsedExpiry.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short", 
            year: "numeric"
        });

        // Generate new ID
        const nextId = (this.inventoryItems || []).reduce((max, i) => Math.max(max, Number(i.id) || 0), 0) + 1;
        
        // Generate barcode if not provided
        const barcode = String(formData.get("barcode") || "").trim() || `AUTO-${Date.now()}`;

        // Create new item
        const newItem = {
            id: nextId,
            icon: "💊",
            name,
            generic: String(formData.get("generic") || "").trim(),
            barcode,
            category,
            batch,
            expiryDate,
            expiryLabel,
            stock: Number(stock),
            reorderLevel: Number(reorderLevel),
            cost: Number(cost),
            price: Number(price),
            rxOnly: formData.get("rxOnly") === "on",
            controlled: formData.get("controlled") === "on",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Add to inventory
        if (!this.inventoryItems) this.inventoryItems = [];
        this.inventoryItems.unshift(newItem);
        
        // Save to localStorage
        this.saveInventoryItems();
        
        // Refresh UI
        this.refreshInventoryCategoryOptions();
        this.updateInventoryStatsAndTable();
        this.closeInventoryAddItemModal();
        
        // Show success notification
        this.showNotification(`✅ "${name}" added successfully to inventory!`, "success");
    }

    refreshInventoryCategoryOptions() {
        const categorySelect = document.getElementById("inventoryCategorySelect");
        if (!categorySelect) return;

        const currentValue = categorySelect.value || "All";
        const categories = [...new Set((this.inventoryItems || []).map(i => i.category).filter(Boolean))].sort();
        
        categorySelect.innerHTML = `
            <option value="All">All Categories</option>
            ${categories.map(c => `<option value="${c}">${c}</option>`).join("")}
        `;

        const hasCurrent = currentValue === "All" || categories.includes(currentValue);
        categorySelect.value = hasCurrent ? currentValue : "All";
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `position:fixed;top:20px;right:20px;padding:12px 20px;border-radius:6px;color:white;z-index:10000;`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    cleanup() {
        // Optional cleanup
    }
}

// Register as Client Action
PharmacyInventory.template = "pharmacy_inventory_layout";   // You can create a simple template or use inline
registry.category("actions").add("pharmacy_inventory_action", PharmacyInventory);

// Make available globally for dashboard integration
window.PharmacyInventory = PharmacyInventory;