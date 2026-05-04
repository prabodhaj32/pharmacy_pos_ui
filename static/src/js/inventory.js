import { registry } from "@web/core/registry";
import { Component, onMounted, onWillUnmount } from "@odoo/owl";
import { rpc } from "@web/core/network/rpc";
import { useService } from "@web/core/utils/hooks";
import { medicines } from "./data/medicine_data.js";

class PharmacyInventory extends Component {
  setup() {
    try {
      this.rpc = useService("rpc");
    } catch {
      this.rpc = rpc;
    }
    this.inventoryItems = [];
    this.inventoryItems = [];
    this.inventoryActiveFilter = "all";
    this.inventoryLowStockThreshold = 20;

    onMounted(async () => {
      await this.renderInventory();
    });

    onWillUnmount(() => {
      this.cleanup();
    });
  }

  // ====================== DATA MANAGEMENT ======================
  async ensureInventoryData() {
    if (this.inventoryItems?.length) return;
    await this.loadInventoryItems();
  }

  async loadInventoryItems() {
    try {
      const rpcService = this.rpc || rpc;
      const result = await rpcService("/pharmacy/inventory/list");
      if (result && !Array.isArray(result) && result.error) {
        throw new Error(result.error);
      }
      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result?.result)
          ? result.result
          : Array.isArray(result?.data)
            ? result.data
            : [];

      this.inventoryItems = rows.map((item) => {
        const expiryDate = item.expiry_date || item.expiryDate;
        let expiryLabel = item.expiryLabel;
        if (!expiryLabel && expiryDate) {
          const parsed = this.parseISODate(expiryDate);
          if (parsed) {
            expiryLabel = parsed.toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          }
        }
        return {
          ...item,
          expiryDate,
          expiryLabel,
          rxOnly: item.rx_only !== undefined ? item.rx_only : item.rxOnly,
          controlled: !!item.controlled,
        };
      });
    } catch (error) {
      console.error("Failed to load inventory:", error);
      this.inventoryItems = [];
      this.showNotification(
        `⚠️ Failed to load inventory: ${error?.message || "Server error"}`,
        "error",
      );
    }
  }

  parseISODate(dateString) {
    const d = new Date(dateString);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  isExpiringWithinDays(item, days = 90) {
    const expiry = this.parseISODate(item.expiryDate);
    if (!expiry) return false;
    const diffDays = Math.ceil(
      (expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
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
  async renderInventory() {
    await this.ensureInventoryData();
    const container = document.getElementById("dashboard_container");

    const categories = [
      ...new Set(this.inventoryItems.map((i) => i.category)),
    ].sort();
    const categoryOptionsHtml = categories
      .map((c) => `<option value="${c}">${c}</option>`)
      .join("");

    container.innerHTML = `
            <div class="dashboard">
              

              

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

                <div class="inventory-controls-glass">
                    <div class="inventory-main-bar">
                        <div class="search-glass-wrapper">
                            <input id="inventorySearchInput" type="text" placeholder="🔍 Search inventory..." class="search-input-glass">
                        </div>
                        <div class="filters-glass">
                            <select class="select-glass" id="inventoryCategorySelect">
                                <option value="All">All Categories</option>
                                ${categoryOptionsHtml}
                            </select>
                            <select class="select-glass" id="inventoryTypeSelect">
                                <option value="all">All Types</option>
                                <option value="rx_only">Rx Only</option>
                                <option value="controlled">Controlled</option>
                            </select>
                            <div class="filter-tabs-glass">
                                <button class="tab-glass active" data-inventory-filter="all">All</button>
                                <button class="tab-glass" data-inventory-filter="low_stock">⚠ Low</button>
                                <button class="tab-glass" data-inventory-filter="expiring">⏱ Expiring</button>
                                <button class="tab-glass" data-inventory-filter="controlled">🔒 Controlled</button>
                                <button class="tab-glass" data-inventory-filter="rx_only">💊 Rx</button>
                            </div>
                        </div>
                        <div class="inventory-actions-glass">
                            <button class="action-btn-glass adjust-btn" id="inventoryAdjustStockBtn">
                                <span>⚖</span> Adjust Stock
                            </button>
                            <button class="action-btn-glass add-btn" id="inventoryAddItemBtn">
                                <span>➕</span> Add Item
                            </button>
                        </div>
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
      filterButtons.forEach((btn) =>
        btn.classList.toggle("active", btn.dataset.inventoryFilter === filter),
      );
    };

    searchInput?.addEventListener("input", () =>
      this.updateInventoryStatsAndTable(),
    );
    categorySelect?.addEventListener("change", () =>
      this.updateInventoryStatsAndTable(),
    );

    typeSelect?.addEventListener("change", () => {
      const v = typeSelect.value;
      this.inventoryActiveFilter =
        v === "rx_only" || v === "controlled" ? v : "all";
      setActiveButton(this.inventoryActiveFilter);
      this.updateInventoryStatsAndTable();
    });

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.inventoryActiveFilter = btn.dataset.inventoryFilter;
        if (typeSelect) {
          typeSelect.value =
            this.inventoryActiveFilter === "rx_only" ||
            this.inventoryActiveFilter === "controlled"
              ? this.inventoryActiveFilter
              : "all";
        }
        setActiveButton(this.inventoryActiveFilter);
        this.updateInventoryStatsAndTable();
      });
    });

    addItemBtn?.addEventListener("click", () =>
      this.openInventoryAddItemModal(),
    );
    adjustStockBtn?.addEventListener("click", () => {
      this.openStockAdjustmentModal();
    });
  }

  // ====================== STATS & TABLE ======================
  updateInventoryStatsAndTable() {
    const allItems = this.inventoryItems || [];
    const totalItems = allItems.length;
    const lowStockCount = allItems.filter((i) => this.isLowStock(i)).length;
    const expiringCount = allItems.filter((i) =>
      this.isExpiringWithinDays(i),
    ).length;
    const stockValue = allItems.reduce(
      (sum, i) => sum + (Number(i.stock) || 0) * (Number(i.price) || 0),
      0,
    );

    const totalItemsEl = document.getElementById("inventoryTotalItemsValue");
    const lowStockEl = document.getElementById("inventoryLowStockValue");
    const expiringEl = document.getElementById("inventoryExpiringValue");
    const stockValueEl = document.getElementById("inventoryStockValueValue");

    // This method can be called from other pages (e.g., POS),
    // so safely skip DOM updates when inventory widgets are not mounted.
    if (totalItemsEl) totalItemsEl.textContent = totalItems;
    if (lowStockEl) lowStockEl.textContent = lowStockCount;
    if (expiringEl) expiringEl.textContent = expiringCount;
    if (stockValueEl) stockValueEl.textContent = this.formatLKRCompact(stockValue);

    const filtered = this.applyInventoryFilters();
    this.renderInventoryTable(filtered);
  }

  applyInventoryFilters() {
    const query = (document.getElementById("inventorySearchInput")?.value || "")
      .trim()
      .toLowerCase();
    const category =
      document.getElementById("inventoryCategorySelect")?.value || "All";
    const typeValue =
      document.getElementById("inventoryTypeSelect")?.value || "all";

    let filter = this.inventoryActiveFilter || "all";
    if (typeValue === "rx_only" || typeValue === "controlled")
      filter = typeValue;

    return this.inventoryItems.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (query) {
        const haystack =
          `${item.name} ${item.generic || ""} ${item.barcode || ""}`.toLowerCase();
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

    items.forEach((item) => {
      const viewItem = this.toInventoryViewItem(item);
      const lowStock = this.isLowStock(item);
      const expiring = this.isExpiringWithinDays(item);
      const marginPct = this.getMarginPct(item);

      const statusPill = expiring
        ? `<span class="meta-pill profit">Expiring</span>`
        : lowStock
          ? `<span class="meta-pill neutral">Low Stock</span>`
          : `<span class="meta-pill sales">In Stock</span>`;

      const rxPill = viewItem.rxOnly
        ? `<span class="meta-pill rx-only">Rx</span>`
        : "";
      const controlledPill = viewItem.controlled
        ? `<span class="meta-pill controlled">Controlled</span>`
        : "";

      const row = document.createElement("tr");
      row.className = `cart-row inventory-row${lowStock ? " low-stock" : ""}${expiring ? " expiring" : ""}`;
      row.innerHTML = `
                <td>
                    <div class="product-info">
                        <span class="icon">${viewItem.icon}</span>
                        <div class="inventory-medicine-text">
                            <div class="inventory-medicine-title">
                                <span class="name">${viewItem.name}</span>
                                ${rxPill} ${controlledPill}
                            </div>
                            <div class="inventory-medicine-generic">${viewItem.generic}</div>
                        </div>
                    </div>
                </td>
                <td>${viewItem.category}</td>
                <td>
                    <div class="batch-info">
                        <span class="batch">${viewItem.batch}</span>
                        <span class="expiry">${viewItem.expiry}</span>
                    </div>
                </td>
                <td>${viewItem.stock}</td>
                <td class="unit-price">${viewItem.cost}</td>
                <td class="unit-price">${viewItem.price}</td>
                <td class="unit-price">${marginPct.toFixed(0)}%</td>
                <td>${statusPill}</td>
            `;
      tbody.appendChild(row);
    });
  }

  toInventoryViewItem(item) {
    return {
      icon: item.icon || "💊",
      name: item.name || "Unnamed Item",
      generic: item.generic || "",
      category: item.category || "Uncategorized",
      batch: item.batch || "-",
      expiry: item.expiryLabel || item.expiryDate || "-",
      stock: Number(item.stock || 0),
      cost: Number(item.cost || 0).toFixed(2),
      price: Number(item.price || 0).toFixed(2),
      rxOnly: !!item.rxOnly,
      controlled: !!item.controlled,
    };
  }

  // ====================== ADD ITEM MODAL ======================
  openInventoryAddItemModal() {
    if (document.getElementById("inventoryAddItemModal")) return;

    const modal = document.createElement("div");
    modal.id = "inventoryAddItemModal";
    modal.className = "inventory-modal-overlay";
    modal.innerHTML = `
            <div class="inventory-modal" style="max-width: 520px; max-height: 90vh; overflow-y: auto; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);" role="dialog" aria-modal="true" aria-labelledby="inventoryAddItemTitle">
                <div class="inventory-modal-header" style="background: rgba(255, 255, 255, 0.2); border-bottom: 1px solid rgba(0, 0, 0, 0.05); padding: 0.75rem 1rem; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 id="inventoryAddItemTitle" style="margin: 0; font-size: 0.9rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">Add Inventory Item</h3>
                        <p style="margin: 0; font-size: 0.65rem; color: #64748b;">Register a new medicine in the system</p>
                    </div>
                    <button type="button" class="inventory-modal-close" aria-label="Close" style="background: transparent; border: 1px solid rgba(0,0,0,0.1); color: #64748b; width: 24px; height: 24px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">×</button>
                </div>
                <form id="inventoryAddItemForm" style="padding: 1rem; background: transparent; display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
                    <div style="grid-column: span 2;">
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Medicine Name *</label>
                        <input type="text" name="name" required placeholder="e.g. Azithromycin 500" style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Generic</label>
                        <input type="text" name="generic" placeholder="Generic description" style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Barcode</label>
                        <input type="text" name="barcode" placeholder="Barcode number" style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Category *</label>
                        <input type="text" name="category" required placeholder="e.g. Antibiotics" style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Batch *</label>
                        <input type="text" name="batch" required placeholder="e.g. BT-NEW-2026-001" style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Stock *</label>
                        <input type="number" name="stock" min="0" step="1" required placeholder="0" style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Expiry Date *</label>
                        <input type="date" name="expiryDate" required style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Cost *</label>
                        <input type="number" name="cost" min="0" step="0.01" required placeholder="0.00" style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Price *</label>
                        <input type="number" name="price" min="0" step="0.01" required placeholder="0.00" style="width: 100%; padding: 0.35rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div style="grid-column: span 2; display: flex; gap: 1rem; padding: 0.25rem 0;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 600; color: #475569; cursor: pointer;">
                            <input type="checkbox" name="rxOnly" style="cursor: pointer;"> 💊 Rx Only
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 600; color: #475569; cursor: pointer;">
                            <input type="checkbox" name="controlled" style="cursor: pointer;"> 🔒 Controlled
                        </label>
                    </div>
                    <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid rgba(0,0,0,0.05);">
                        <button type="button" class="btn btn-secondary" id="inventoryCancelAddItemBtn" style="padding: 0.4rem 1rem; font-size: 0.7rem; border-radius: 6px; background: white; color: #475569; border: 1px solid #e2e8f0; font-weight: 600; cursor: pointer; transition: all 0.2s;">Cancel</button>
                        <button type="submit" class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.7rem; border-radius: 6px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; color: white; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); transition: all 0.2s;">Create Item</button>
                    </div>
                </form>
            </div>
        `;

    document.body.appendChild(modal);

    // Attach event listeners
    const close = () => this.closeInventoryAddItemModal();
    modal
      .querySelector(".inventory-modal-close")
      ?.addEventListener("click", close);
    modal
      .querySelector("#inventoryCancelAddItemBtn")
      ?.addEventListener("click", close);
    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) close();
    });

    const form = modal.querySelector("#inventoryAddItemForm");
    form?.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      await this.createInventoryItemFromForm(form);
    });

    // Set today's date as min expiry date
    const expiryInput = modal.querySelector('input[name="expiryDate"]');
    if (expiryInput) {
      const today = new Date().toISOString().split("T")[0];
      expiryInput.min = today;
    }
  }

  closeInventoryAddItemModal() {
    const modal = document.getElementById("inventoryAddItemModal");
    if (modal) modal.remove();
  }

  // ====================== CREATE ITEM ======================
  async createInventoryItemFromForm(form) {
    const formData = new FormData(form);
  
    const payload = {
      name: formData.get("name"),
      generic: formData.get("generic"),
      barcode: formData.get("barcode"),
      category: formData.get("category"),
      batch: formData.get("batch"),
      expiry_date: formData.get("expiryDate"),
      stock: Number(formData.get("stock")),
      cost: Number(formData.get("cost")),
      price: Number(formData.get("price")),
      rx_only: formData.get("rxOnly") === "on",
      controlled: formData.get("controlled") === "on",
    };
  
    try {
      const rpcService = this.rpc || rpc;
      await rpcService("/pharmacy/inventory/create", { data: payload });
  
      await this.loadInventoryItems();
      this.updateInventoryStatsAndTable();
      this.closeInventoryAddItemModal();
  
      this.showNotification("✅ Item added!", "success");
    } catch (error) {
      console.error(error);
      this.showNotification("❌ Error creating item", "error");
    }
  }

  refreshInventoryCategoryOptions() {
    const categorySelect = document.getElementById("inventoryCategorySelect");
    if (!categorySelect) return;

    const currentValue = categorySelect.value || "All";
    const categories = [
      ...new Set(
        (this.inventoryItems || []).map((i) => i.category).filter(Boolean),
      ),
    ].sort();

    categorySelect.innerHTML = `
            <option value="All">All Categories</option>
            ${categories.map((c) => `<option value="${c}">${c}</option>`).join("")}
        `;

    const hasCurrent =
      currentValue === "All" || categories.includes(currentValue);
    categorySelect.value = hasCurrent ? currentValue : "All";
  }

  // ====================== STOCK ADJUSTMENT ======================
  openStockAdjustmentModal() {
    if (document.getElementById("stockAdjustmentModal")) return;

    const modal = document.createElement("div");
    modal.id = "stockAdjustmentModal";
    modal.className = "inventory-modal-overlay";
    modal.innerHTML = `
            <div class="inventory-modal" style="max-width: 480px; max-height: 90vh; overflow-y: auto; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);" role="dialog" aria-modal="true" aria-labelledby="stockAdjustmentTitle">
                <div class="inventory-modal-header" style="background: rgba(255, 255, 255, 0.2); border-bottom: 1px solid rgba(0, 0, 0, 0.05); padding: 0.75rem 1rem; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 id="stockAdjustmentTitle" style="margin: 0; font-size: 0.9rem; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">Adjust Stock Levels</h3>
                        <p style="margin: 0; font-size: 0.65rem; color: #64748b;">Manual inventory correction</p>
                    </div>
                    <button type="button" class="inventory-modal-close" aria-label="Close" style="background: transparent; border: 1px solid rgba(0,0,0,0.1); color: #64748b; width: 24px; height: 24px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">×</button>
                </div>
                <form id="stockAdjustmentForm" style="padding: 1rem; background: transparent; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                    <div style="grid-column: span 2;">
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Medicine *</label>
                        <select name="item_id" required style="width: 100%; padding: 0.4rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                            <option value="">Select a medicine...</option>
                            ${this.inventoryItems
                              .map(
                                (item) => `
                                <option value="${item.id}">${item.name} (${item.batch}) - Current: ${item.stock}</option>
                            `,
                              )
                              .join("")}
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Adjustment Type *</label>
                        <select name="adjustment_type" required style="width: 100%; padding: 0.4rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                            <option value="set">Set To (New Value)</option>
                            <option value="add">Add (+)</option>
                            <option value="subtract">Subtract (-)</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Quantity *</label>
                        <input type="number" name="quantity" min="0" required placeholder="0" style="width: 100%; padding: 0.4rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div style="grid-column: span 2;">
                        <label style="display: block; font-size: 0.65rem; font-weight: 700; color: #475569; margin-bottom: 0.2rem; text-transform: uppercase;">Reason / Notes</label>
                        <input type="text" name="reason" placeholder="e.g. Stock count discrepancy" style="width: 100%; padding: 0.4rem 0.6rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; font-size: 0.75rem; background: rgba(255,255,255,0.5); outline: none;">
                    </div>
                    <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid rgba(0,0,0,0.05);">
                        <button type="button" class="btn btn-secondary" id="cancelStockAdjBtn" style="padding: 0.4rem 1rem; font-size: 0.7rem; border-radius: 6px; background: white; color: #475569; border: 1px solid #e2e8f0; font-weight: 600; cursor: pointer; transition: all 0.2s;">Cancel</button>
                        <button type="submit" class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.7rem; border-radius: 6px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; color: white; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); transition: all 0.2s;">Update Stock</button>
                    </div>
                </form>
            </div>
        `;

    document.body.appendChild(modal);

    // Attach event listeners
    const close = () => modal.remove();
    modal
      .querySelector(".inventory-modal-close")
      ?.addEventListener("click", close);
    modal.querySelector("#cancelStockAdjBtn")?.addEventListener("click", close);
    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) close();
    });

    const form = modal.querySelector("#stockAdjustmentForm");
    form?.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      await this.updateStockFromForm(form);
    });
  }

  async updateStockFromForm(form) {
    const formData = new FormData(form);
    const itemId = Number(formData.get("item_id"));
    const type = formData.get("adjustment_type");
    const quantity = Number(formData.get("quantity"));

    if (!itemId) {
      this.showNotification("⚠️ Please select a medicine", "warning");
      return;
    }

    if (isNaN(quantity) || quantity < 0) {
      this.showNotification("⚠️ Please enter a valid quantity", "warning");
      return;
    }

    try {
      const rpcService = this.rpc || rpc;
      await rpcService("/pharmacy/inventory/update_stock", {
        item_id: itemId,
        quantity: quantity,
        operation: type,
      });

      await this.loadInventoryItems();
      this.updateInventoryStatsAndTable();
      document.getElementById("stockAdjustmentModal")?.remove();

      this.showNotification(`✅ Stock updated successfully`, "success");
    } catch (error) {
      console.error(error);
      this.showNotification("⚠️ Error updating stock", "error");
    }
  }

  showNotification(message, type = "info") {
    const notif = document.createElement("div");
    notif.style.cssText = `position:fixed;top:20px;right:20px;padding:12px 20px;border-radius:6px;color:white;z-index:10000;`;
    notif.style.backgroundColor =
      type === "success"
        ? "#22c55e"
        : type === "warning"
          ? "#f59e0b"
          : type === "error"
            ? "#ef4444"
            : "#3b82f6";
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
  }

  cleanup() {
    // Optional cleanup
  }
}

// Register as Client Action
PharmacyInventory.template = "pharmacy_inventory_layout"; // You can create a simple template or use inline
registry
  .category("actions")
  .add("pharmacy_inventory_action", PharmacyInventory);

// Make available globally for dashboard integration
window.PharmacyInventory = PharmacyInventory;
