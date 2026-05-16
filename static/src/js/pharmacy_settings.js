/** @odoo-module **/

import { Component, onMounted, onWillUnmount } from "@odoo/owl";
import { rpc } from "@web/core/network/rpc";

class PharmacySettings extends Component {
  setup() {
    this.settingsData = this.getDefaultSettings();
    this.currentSection = "pharmacy";
    this.unsavedChanges = new Set();

    onMounted(async () => {
      await this.loadSettingsFromBackend();
      this.initializeSettings();
      this.setupEventListeners();
    });

    onWillUnmount(() => {
      this.cleanup();
    });
  }

  getDefaultSettings() {
    return {
      pharmacy: {
        name: "Timolog Pharma",
        registrationNo: "PHM-LK-2020-001",
        addressLine1: "123, Main Street, Colombo 07",
        city: "Colombo",
        hotline: "0112 345 678",
        whatsapp: "0771234567",
      },
      receipt: {
        header: "✚ TIMOLOG PHARMA ✚",
        footer:
          "Medicines are not returnable after purchase. Please check items before leaving.",
        invoicePrefix: "TMP",
        startingInvoice: "2025-0001",
        showLogo: true,
        showCashier: true,
        showBatch: true,
        showExpiry: true,
        showVat: true,
        printReceipt: true,
      },
      tax: {
        currency: "LKR",
        vatRate: 15,
        minMargin: 20,
        maxDiscount: 20,
        applyVatVitamins: true,
        essentialExempt: true,
        manualDiscount: true,
        managerApproval: true,
      },
      pricing: {
        showRetailPrice: true,
        showWholesalePrice: false,
        allowDiscount: true,
        maxDiscount: 20,
        roundAmount: true,
      },
      users: {
        roles: [
          {
            id: 1,
            name: "Administrator",
            permissions: [
              "All modules",
              "User management",
              "System settings",
              "Reports",
              "Audit logs",
              "Price management",
            ],
          },
          {
            id: 2,
            name: "Pharmacist",
            permissions: [
              "Inventory view",
              "Medicine safety check",
              "Prescriptions",
              "Dispensing",
            ],
          },
          {
            id: 3,
            name: "Cashier",
            permissions: [
              "Sales (POS)",
              "Customer lookup",
              "Hold/resume bills",
              "End of day report",
            ],
          },
          {
            id: 4,
            name: "Storekeeper",
            permissions: [
              "Inventory management",
              "GRN entry",
              "Purchase orders",
              "Stock adjustments",
              "Supplier management",
            ],
          },
          {
            id: 5,
            name: "Manager",
            permissions: [
              "All reports",
              "Sales reports",
              "Inventory reports",
              "Staff oversight",
              "Void approvals",
              "Refund approval",
            ],
          },
        ],
      },
      hardware: {
        printerType: "thermal",
        paperSize: "80mm",
        barcodeScanner: "usb",
        cashDrawer: "usb",
        customerDisplay: "none",
      },
      notifications: {
        whatsappEnabled: true,
        whatsappNumber: "+94776789117",
        lowStockThreshold: 10,
        expiryThreshold: 90,
        lowStockAlert: true,
        expiryAlert: true,
        salesAlert: false,
        backupReminder: true,
        emailNotifications: false,
        emailAddress: "",
      },
      backup: {
        autoBackup: true,
        backupFrequency: "daily",
        backupLocation: "local",
        cloudBackup: false,
        retentionDays: 30,
      },
      security: {
        sessionTimeout: 30,
        requirePassword: true,
        twoFactorAuth: false,
        auditLog: true,
        encryptData: true,
      },
    };
  }

  // Static method to create instance without OWL framework
  static createInstance() {
    const instance = Object.create(PharmacySettings.prototype);
    instance.settingsData = instance.getDefaultSettings();
    instance.currentSection = "pharmacy";
    instance.unsavedChanges = new Set();
    instance.loadSettingsFromBackend().then(() => {
      instance.initializeSettings();
      instance.setupEventListeners();
    });
    return instance;
  }

  async initializeSettings() {
    // Always fetch fresh data from backend when opening settings to ensure consistency across roles
    await this.loadSettingsFromBackend();
    this.renderSettingsPage();
    this.attachEventListeners();
  }

  attachEventListeners() {
    this.setupNavigation();
    this.setupFormHandlers();
  }

  renderSettingsPage() {
    const container = document.getElementById("dashboard_container");
    if (!container) return;

    container.innerHTML = `
            <style>
                /* Apply Add Inventory Item form UI to all settings grids */
                .settings-content .settings-grid {
                    padding: 1rem !important; 
                    background: transparent !important; 
                    display: grid !important; 
                    grid-template-columns: 1fr 1fr !important; 
                    gap: 0.6rem !important;
                }
                .settings-content .form-group {
                    margin-bottom: 0 !important;
                }
                .settings-content .form-group.full-width {
                    grid-column: span 2 !important;
                }
                .settings-content .form-label {
                    display: block !important; 
                    font-size: 0.65rem !important; 
                    font-weight: 700 !important; 
                    color: #475569 !important; 
                    margin-bottom: 0.2rem !important; 
                    text-transform: uppercase !important;
                }
                .settings-content .form-input, 
                .settings-content .form-select, 
                .settings-content .form-textarea {
                    width: 100% !important; 
                    padding: 0.35rem 0.6rem !important; 
                    border: 1px solid rgba(0,0,0,0.1) !important; 
                    border-radius: 6px !important; 
                    font-size: 0.75rem !important; 
                    background: rgba(255,255,255,0.5) !important; 
                    outline: none !important;
                    box-sizing: border-box !important;
                    color: #0f172a !important;
                    height: auto !important;
                }
                .settings-content .checkbox-group label.checkbox-label {
                    display: flex !important; 
                    align-items: center !important; 
                    gap: 0.5rem !important; 
                    font-size: 0.7rem !important; 
                    font-weight: 600 !important; 
                    color: #475569 !important; 
                    cursor: pointer !important;
                }
                .settings-content .checkbox-group input[type="checkbox"] {
                    display: inline-block !important;
                    appearance: auto !important;
                    -webkit-appearance: checkbox !important;
                    position: static !important;
                    opacity: 1 !important;
                    width: auto !important;
                    height: auto !important;
                    cursor: pointer !important;
                    margin: 0 !important;
                }
                .settings-content .checkbox-custom {
                    display: none !important;
                }
                .settings-content .section-actions {
                    grid-column: span 2 !important; 
                    display: flex !important; 
                    justify-content: flex-end !important; 
                    gap: 0.6rem !important; 
                    margin-top: 0.5rem !important; 
                    padding-top: 0.75rem !important; 
                    border-top: 1px solid rgba(0,0,0,0.05) !important;
                }
                .settings-content .btn-primary {
                    padding: 0.4rem 1rem !important; 
                    font-size: 0.7rem !important; 
                    border-radius: 6px !important; 
                    background: #007513 !important; 
                    border: none !important; 
                    color: white !important; 
                    font-weight: 700 !important; 
                    cursor: pointer !important; 
                    box-shadow: 0 4px 6px -1px rgba(0, 117, 19, 0.2) !important; 
                    transition: all 0.2s !important;
                }
                .settings-content .btn-secondary, .settings-content .btn-outline {
                    padding: 0.4rem 1rem !important; 
                    font-size: 0.7rem !important; 
                    border-radius: 6px !important; 
                    background: white !important; 
                    color: #475569 !important; 
                    border: 1px solid #e2e8f0 !important; 
                    font-weight: 600 !important; 
                    cursor: pointer !important; 
                    transition: all 0.2s !important;
                }
                
                /* Pulse animation for unsaved changes */
                @keyframes pulse-save {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 117, 19, 0.4); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(0, 117, 19, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 117, 19, 0); }
                }
                .btn-save-all.pulse {
                    animation: pulse-save 2s infinite !important;
                    background: #007513 !important;
                    border-color: #007513 !important;
                    color: white !important;
                }
                .btn-save-all {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 0.4rem !important;
                    padding: 0.35rem 0.6rem !important;
                    font-size: 0.75rem !important;
                    font-weight: 700 !important;
                    border-radius: 6px !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    width: calc(100% - 1.2rem) !important;
                    margin: 1rem 0.6rem !important;
                    background: #007513 !important;
                    color: white !important;
                    border: none !important;
                    cursor: pointer !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 117, 19, 0.2) !important;
                }
                .settings-nav {
                    display: flex !important;
                    flex-direction: column !important;
                    height: 100% !important;
                    padding: 0.5rem 0 !important;
                }
            </style>
            <div class="settings-container">

                <!-- Settings Navigation -->
                <nav class="settings-nav">
                    <ul class="nav-tabs">
                        <li class="nav-tab active" data-section="pharmacy">
                            <button class="nav-btn" style="padding: 0.35rem 0.6rem;">
                                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path fill-rule="evenodd" d="M3 3a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5h18a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0021 3H3zm8.25 4.5a.75.75 0 011.5 0v2.25H15a.75.75 0 010 1.5h-2.25v2.25a.75.75 0 01-1.5 0v-2.25H9a.75.75 0 010-1.5h2.25V7.5z" clip-rule="evenodd"/></svg></span>
                                <span class="nav-text" style="font-size: 0.75rem;">Pharmacy</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="receipt">
                            <button class="nav-btn" style="padding: 0.35rem 0.6rem;">
                                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clip-rule="evenodd" /><path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" /></svg></span>
                                <span class="nav-text" style="font-size: 0.75rem;">Receipt Setup</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="tax">
                            <button class="nav-btn" style="padding: 0.35rem 0.6rem;">
                                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /><path fill-rule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v14.25c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 19.125V4.875zm8.25 9.75a3.75 3.75 0 114.5 0 3.75 3.75 0 01-4.5 0z" clip-rule="evenodd" /></svg></span>
                                <span class="nav-text" style="font-size: 0.75rem;">Tax & Pricing</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="users">
                            <button class="nav-btn" style="padding: 0.35rem 0.6rem;">
                                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" /></svg></span>
                                <span class="nav-text" style="font-size: 0.75rem;">User Roles</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="hardware">
                            <button class="nav-btn" style="padding: 0.35rem 0.6rem;">
                                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path fill-rule="evenodd" d="M7.875 1.5C6.839 1.5 6 2.34 6 3.375v2.99c-.426.053-.851.11-1.274.174-1.454.218-2.476 1.483-2.476 2.917v6.294a3 3 0 003 3h.27l-.155 1.705A1.875 1.875 0 007.232 22.5h9.536a1.875 1.875 0 001.867-2.045l-.155-1.705h.27a3 3 0 003-3V9.456c0-1.434-1.022-2.7-2.476-2.917A48.716 48.716 0 0018 6.366V3.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM16.5 6.205v-2.83A.375.375 0 0016.125 3h-8.25a.375.375 0 00-.375.375v2.83a49.353 49.353 0 019 0zm-.217 8.265c.178.018.317.16.333.337l.526 5.784a.375.375 0 01-.373.409H7.232a.375.375 0 01-.373-.409l.526-5.784a.373.373 0 01.333-.337 41.741 41.741 0 018.566 0zm.967-3.97a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H18a.75.75 0 01-.75-.75V10.5z" clip-rule="evenodd" /></svg></span>
                                <span class="nav-text" style="font-size: 0.75rem;">Hardware</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="notifications">
                            <button class="nav-btn" style="padding: 0.35rem 0.6rem;">
                                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path fill-rule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clip-rule="evenodd" /></svg></span>
                                <span class="nav-text" style="font-size: 0.75rem;">Notifications</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="backup">
                            <button class="nav-btn" style="padding: 0.35rem 0.6rem;">
                                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5zM12 15a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 15z" clip-rule="evenodd" /></svg></span>
                                <span class="nav-text" style="font-size: 0.75rem;">Backup & Security</span>
                            </button>
                        </li>
                    </ul>
                    
                    <!-- Sidebar Save Action (Under Backup & Security) -->
                    <div style="padding: 1rem 0.6rem; border-top: 1px solid #e2e8f0; margin-top: 0.5rem;">
                        <button id="saveAllBtn" class="btn btn-save-all" onclick="pharmacySettings.saveAllSettings()">
                            Save All Changes
                        </button>
                    </div>
                </nav>

                <!-- Settings Content -->
                <main class="settings-content">
                    <div class="settings-panel" id="pharmacyPanel">
                        ${this.renderPharmacySettings()}
                    </div>
                    <div class="settings-panel" id="receiptPanel" style="display: none;">
                        ${this.renderReceiptSettings()}
                    </div>
                    <div class="settings-panel" id="taxPanel" style="display: none;">
                        ${this.renderTaxSettings()}
                    </div>
                    <div class="settings-panel" id="usersPanel" style="display: none;">
                        ${this.renderUserSettings()}
                    </div>
                    <div class="settings-panel" id="hardwarePanel" style="display: none;">
                        ${this.renderHardwareSettings()}
                    </div>
                    <div class="settings-panel" id="notificationsPanel" style="display: none;">
                        ${this.renderNotificationSettings()}
                    </div>
                    <div class="settings-panel" id="backupPanel" style="display: none;">
                        ${this.renderBackupSettings()}
                    </div>
                </main>
            </div>
        `;
  }

  renderPharmacySettings() {
    const data = this.settingsData.pharmacy;
    return `
            <section class="settings-section">
                <div class="section-header" style="margin-bottom: 1rem;">
                    <h2 style="font-size: 1.1rem; display: flex; align-items: center; gap: 0.6rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px;color:#3b82f6;"><path fill-rule="evenodd" d="M3 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h19.5a.75.75 0 000-1.5H21V3.75a.75.75 0 000-1.5H3zm9.75 7.5a.75.75 0 000 1.5h2.25a.75.75 0 000-1.5h-2.25zm0 3a.75.75 0 000 1.5h2.25a.75.75 0 000-1.5h-2.25zm0 3a.75.75 0 000 1.5h2.25a.75.75 0 000-1.5h-2.25zM9 7.5a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75A.75.75 0 019 8.25v-.75zM9 11.25a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75zm.75 3a.75.75 0 00-.75.75v.75c0 .414.336.75.75.75h.75a.75.75 0 00.75-.75v-.75a.75.75 0 00-.75-.75h-.75z" clip-rule="evenodd" /></svg>
                        Pharmacy Information
                    </h2>
                    <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">This information appears on your receipts and reports</p>
                </div>
                
                <div class="settings-grid">
                    <div class="form-group">
                        <label for="pharmacyName" class="form-label">Pharmacy Name</label>
                        <input type="text" id="pharmacyName" class="form-input" value="${data.name}" 
                               oninput="pharmacySettings.updateSetting('pharmacy', 'name', this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label for="registrationNo" class="form-label">Registration No.</label>
                        <input type="text" id="registrationNo" class="form-input" value="${data.registrationNo}"
                               oninput="pharmacySettings.updateSetting('pharmacy', 'registrationNo', this.value)">
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="addressLine1" class="form-label">Address Line 1</label>
                        <input type="text" id="addressLine1" class="form-input" value="${data.addressLine1}"
                               oninput="pharmacySettings.updateSetting('pharmacy', 'addressLine1', this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label for="city" class="form-label">City</label>
                        <input type="text" id="city" class="form-input" value="${data.city}"
                               oninput="pharmacySettings.updateSetting('pharmacy', 'city', this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label for="hotline" class="form-label">Hotline</label>
                        <input type="tel" id="hotline" class="form-input" value="${data.hotline}"
                               oninput="pharmacySettings.updateSetting('pharmacy', 'hotline', this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label for="whatsapp" class="form-label">WhatsApp</label>
                        <input type="tel" id="whatsapp" class="form-input" value="${data.whatsapp}"
                               oninput="pharmacySettings.updateSetting('pharmacy', 'whatsapp', this.value)">
                    </div>
                </div>
                
                <div class="section-actions" style="margin-top: 0.5rem;">
                    <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="pharmacySettings.savePharmacySettings()">
                        Save Pharmacy Settings
                    </button>
                </div>
            </section>
        `;
  }

  renderReceiptSettings() {
    const data = this.settingsData.receipt || {
      header: "✚ TIMOLOG PHARMA ✚",
      footer:
        "Medicines are not returnable after purchase. Please check items before leaving.",
      invoicePrefix: "TMP",
      startingInvoice: "2025-0001",
      showLogo: true,
      showCashier: true,
      showBatch: true,
      showExpiry: true,
      showVat: true,
      printReceipt: true,
    };

    return `
            <style>
                .receipt-setup-layout {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 1rem;
                    align-items: flex-start;
                }
                .thermal-receipt-preview {
                    background: #f3f4f6;
                    padding: 15px;
                    width: 100%;
                    max-width: 320px;
                    margin: 0 auto;
                }
                .thermal-receipt {
                    width: 100%;
                    background: #ffffff;
                    padding: 10px;
                    font-family: 'Courier New', Courier, monospace;
                    color: #000;
                    font-size: 12px;
                    line-height: 1.2;
                    border: 1px solid #000;
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
                @media (max-width: 768px) {
                    .receipt-setup-layout {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            
            <section class="settings-section">
                <div class="section-header" style="margin-bottom: 1.25rem;">
                    <h2 style="font-size: 1.1rem; display: flex; align-items: center; gap: 0.6rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px;color:#8b5cf6;"><path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" /><path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" /></svg>
                        Receipt Configuration
                    </h2>
                    <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">Customize your 80mm thermal printer receipts</p>
                </div>
                
                <div class="receipt-setup-layout">
                    <!-- Config Form -->
                    <div class="receipt-config">
                        <div class="settings-grid">
                            <div class="form-group full-width">
                                <label for="receiptHeader" class="form-label">Receipt Header Text</label>
                                <textarea id="receiptHeader" class="form-textarea" rows="1"
                                          oninput="pharmacySettings.updateSetting('receipt', 'header', this.value); pharmacySettings.updateReceiptPreview()">${data.header}</textarea>
                            </div>
                            
                            <div class="form-group full-width">
                                <label for="receiptFooter" class="form-label">Receipt Footer Note</label>
                                <textarea id="receiptFooter" class="form-textarea" rows="1"
                                          oninput="pharmacySettings.updateSetting('receipt', 'footer', this.value); pharmacySettings.updateReceiptPreview()">${data.footer}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="invoicePrefix" class="form-label">Invoice Prefix</label>
                                <input type="text" id="invoicePrefix" class="form-input" value="${data.invoicePrefix}"
                                       oninput="pharmacySettings.updateSetting('receipt', 'invoicePrefix', this.value); pharmacySettings.updateReceiptPreview()">
                            </div>
                            
                            <div class="form-group">
                                <label for="startingInvoice" class="form-label">Starting Invoice Number</label>
                                <input type="text" id="startingInvoice" class="form-input" value="${data.startingInvoice}"
                                       oninput="pharmacySettings.updateSetting('receipt', 'startingInvoice', this.value); pharmacySettings.updateReceiptPreview()">
                            </div>

                            <div class="form-group full-width" style="margin-top: 0.5rem;">
                                <h3 style="font-size: 0.9rem; font-weight: 600; color: var(--text-color);">Receipt Options</h3>
                            </div>
                            
                            <div class="form-group">
                                <div class="checkbox-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="showLogo" ${data.showLogo ? "checked" : ""}
                                               onchange="pharmacySettings.updateSetting('receipt', 'showLogo', this.checked); pharmacySettings.updateReceiptPreview()">
                                        <span class="checkbox-custom"></span>
                                        Show pharmacy logo
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <div class="checkbox-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="showCashier" ${data.showCashier ? "checked" : ""}
                                               onchange="pharmacySettings.updateSetting('receipt', 'showCashier', this.checked); pharmacySettings.updateReceiptPreview()">
                                        <span class="checkbox-custom"></span>
                                        Show cashier name
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <div class="checkbox-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="showBatch" ${data.showBatch ? "checked" : ""}
                                               onchange="pharmacySettings.updateSetting('receipt', 'showBatch', this.checked); pharmacySettings.updateReceiptPreview()">
                                        <span class="checkbox-custom"></span>
                                        Show batch number
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <div class="checkbox-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="showExpiry" ${data.showExpiry ? "checked" : ""}
                                               onchange="pharmacySettings.updateSetting('receipt', 'showExpiry', this.checked); pharmacySettings.updateReceiptPreview()">
                                        <span class="checkbox-custom"></span>
                                        Show expiry date
                                    </label>
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="checkbox-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="showVat" ${data.showVat ? "checked" : ""}
                                               onchange="pharmacySettings.updateSetting('receipt', 'showVat', this.checked); pharmacySettings.updateReceiptPreview()">
                                        <span class="checkbox-custom"></span>
                                        Show VAT breakdown
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <div class="checkbox-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="printReceipt" ${data.printReceipt ? "checked" : ""}
                                               onchange="pharmacySettings.updateSetting('receipt', 'printReceipt', this.checked)">
                                        <span class="checkbox-custom"></span>
                                        Auto-print on sale
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section-actions" style="margin-top:0.75rem;">
                            <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="pharmacySettings.saveReceiptSettings()">
                                Save Receipt Settings
                            </button>
                        </div>
                    </div>

                    <!-- Receipt Preview Pane -->
                    <div class="receipt-preview-pane">
                        <h3 style="margin-bottom:1rem; font-size:14px; font-weight:600; color:var(--text-color);">Receipt Preview</h3>
                        <div class="thermal-receipt-preview" id="receiptPreviewBox">
                            ${this.generateReceiptPreviewHTML(data)}
                        </div>
                    </div>
                </div>
            </section>
        `;
  }

  generateReceiptPreviewHTML(data) {
    const pharmacy = this.settingsData.pharmacy || {};
    const tax = this.settingsData.tax || { currency: "LKR", vatRate: 15 };

    // Sample items for preview
    const items = [
      {
        name: "Panadol 500mg x2",
        quantity: 1,
        batch: "BAT991",
        expiry: "12/26",
        lineTotal: 130.0,
      },
      {
        name: "Omeprazole 20mg x1",
        quantity: 1,
        batch: "PZM002",
        expiry: "08/25",
        lineTotal: 42.0,
      },
    ];

    const rows = items
      .map((item) => {
        const batchLine =
          data.showBatch && item.batch
            ? `<div class="item-meta-line">Batch: ${this.escapeHtml(item.batch)}</div>`
            : "";
        const expiryLine =
          data.showExpiry && item.expiry
            ? `<div class="item-meta-line">Exp: ${this.escapeHtml(item.expiry)}</div>`
            : "";
        return `
            <tr class="item-row">
                <td class="item-left">
                    <div class="item-name">${this.escapeHtml(item.name)}</div>
                    <div class="item-qty">1 x ${this.escapeHtml(tax.currency)} ${item.lineTotal.toFixed(2)}</div>
                    <div class="item-meta">${batchLine}${expiryLine}</div>
                </td>
                <td class="item-right">${this.escapeHtml(tax.currency)} ${item.lineTotal.toFixed(2)}</td>
            </tr>
        `;
      })
      .join("");

    return `
        <div class="thermal-receipt">
            <div class="receipt-top">
                <div class="receipt-title">SALES RECEIPT</div>
                <div class="receipt-subtitle">Thermal Print Preview</div>
            </div>
            <div class="receipt-content">
                <div class="thermal-header">
                    ${data.showLogo ? '<div style="margin-bottom:6px; font-size: 20px;">🏥</div>' : ""}
                    <div class="pharmacy-header">${this.escapeHtml(data.header || pharmacy.name || "")}</div>
                    <div class="meta-text">${this.escapeHtml(pharmacy.addressLine1 || "")}</div>
                    <div class="meta-text">${this.escapeHtml(pharmacy.city || "")}</div>
                    <div class="meta-text">Tel: ${this.escapeHtml(pharmacy.hotline || "")}</div>
                    ${pharmacy.whatsapp ? `<div class="meta-text">WA: ${this.escapeHtml(pharmacy.whatsapp)}</div>` : ""}
                    <div class="meta-text">Reg: ${this.escapeHtml(pharmacy.registrationNo || "")}</div>
                </div>

                <div class="info-card">
                    <div class="thermal-info-row">
                        <span class="label">Invoice #</span>
                        <span class="value">${this.escapeHtml(data.invoicePrefix || "TMP")}-${this.escapeHtml(data.startingInvoice || "2025-0001")}</span>
                    </div>
                    <div class="thermal-info-row">
                        <span class="label">Date & Time</span>
                        <span class="value">19/02/2025 10:45</span>
                    </div>
                    ${data.showCashier ? `<div class="thermal-info-row"><span class="label">Cashier</span><span class="value">Admin User</span></div>` : ""}
                </div>

                <div class="section-title">Items</div>
                <table class="thermal-table">
                    ${rows}
                </table>

                <div class="totals-card">
                    <div class="thermal-info-row"><span class="label">Subtotal</span><span class="value">${this.escapeHtml(tax.currency)} 150.00</span></div>
                    ${data.showVat ? `<div class="thermal-info-row"><span class="label">VAT (${tax.vatRate || 0}%)</span><span class="value">${this.escapeHtml(tax.currency)} 22.00</span></div>` : ""}
                    <div class="thermal-info-row grand-total">
                        <span>TOTAL</span>
                        <span>${this.escapeHtml(tax.currency)} 172.00</span>
                    </div>
                </div>

                <div class="payment-card">
                    <div class="thermal-info-row"><span class="label">Cash Paid</span><span class="value">${this.escapeHtml(tax.currency)} 200.00</span></div>
                    <div class="thermal-info-row"><span class="label">Balance</span><span class="value">${this.escapeHtml(tax.currency)} 28.00</span></div>
                </div>

                <div class="thermal-divider"></div>

                <div class="thermal-footer">
                    ${this.escapeHtml(data.footer || "")}
                </div>
            </div>
        </div>
    `;
  }

  updateReceiptPreview() {
    const previewBox = document.getElementById("receiptPreviewBox");
    if (previewBox && this.settingsData.receipt) {
      previewBox.innerHTML = this.generateReceiptPreviewHTML(
        this.settingsData.receipt,
      );
    }
  }

  renderTaxSettings() {
    const tax = this.settingsData.tax || {
      currency: "LKR",
      vatRate: 15,
      minMargin: 20,
      maxDiscount: 20,
      applyVatVitamins: true,
      essentialExempt: true,
      manualDiscount: true,
      managerApproval: true,
    };

    return `
            <style>
                .compact-tax-settings .form-group {
                    margin-bottom: 0.75rem;
                }
                .compact-tax-settings .settings-grid {
                    gap: 0.75rem;
                }
                .compact-tax-settings .form-label {
                    font-size: 0.8rem;
                    margin-bottom: 0.25rem;
                }
                .compact-tax-settings .form-input, 
                .compact-tax-settings select.form-input {
                    padding: 0.35rem 0.6rem;
                    font-size: 0.85rem;
                    height: auto;
                }
                .compact-tax-settings h3 {
                    font-size: 1rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .compact-tax-settings .checkbox-label {
                    font-size: 0.85rem;
                }
                .compact-tax-settings .checkbox-custom {
                    width: 15px;
                    height: 15px;
                    margin-right: 8px;
                }
                .compact-tax-settings .checkbox-custom::after {
                    left: 4px;
                    top: 1px;
                    width: 3px;
                    height: 8px;
                }
            </style>
            <section class="settings-section tax-settings compact-tax-settings">
                <div class="section-header" style="margin-bottom: 1.25rem;">
                    <h2 style="font-size: 1.1rem; display: flex; align-items: center; gap: 0.6rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px;color:#f59e0b;"><path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /><path fill-rule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v14.25c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 19.125V4.875zm8.25 9.75a3.75 3.75 0 114.5 0 3.75 3.75 0 01-4.5 0z" clip-rule="evenodd" /></svg>
                        Tax & Pricing Rules
                    </h2>
                    <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">Configure VAT, margins, and pricing rules</p>
                </div>
                
                <div class="settings-subsection">
                    <h3>General Settings</h3>
                    <div class="settings-grid">
                        <div class="form-group">
                            <label for="currency" class="form-label">Currency</label>
                            <select id="currency" class="form-input" onchange="pharmacySettings.updateSetting('tax', 'currency', this.value)">
                                <option value="LKR" ${tax.currency === "LKR" ? "selected" : ""}>LKR — Sri Lankan Rupee</option>
                                <option value="USD" ${tax.currency === "USD" ? "selected" : ""}>USD — US Dollar</option>
                                <option value="EUR" ${tax.currency === "EUR" ? "selected" : ""}>EUR — Euro</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="vatRate" class="form-label">Default VAT Rate (%)</label>
                            <input type="number" id="vatRate" class="form-input" value="${tax.vatRate}" min="0" max="100" step="0.1"
                                   onchange="pharmacySettings.updateSetting('tax', 'vatRate', parseFloat(this.value))">
                        </div>
                        
                        <div class="form-group">
                            <label for="minMargin" class="form-label">Minimum Margin (%)</label>
                            <input type="number" id="minMargin" class="form-input" value="${tax.minMargin}" min="0" max="100" step="0.1"
                                   onchange="pharmacySettings.updateSetting('tax', 'minMargin', parseFloat(this.value))">
                        </div>
                        
                        <div class="form-group">
                            <label for="maxDiscount" class="form-label">Max Discount (%)</label>
                            <input type="number" id="maxDiscount" class="form-input" value="${tax.maxDiscount}" min="0" max="100" step="0.1"
                                   onchange="pharmacySettings.updateSetting('tax', 'maxDiscount', parseFloat(this.value))">
                        </div>
                    </div>
                </div>
                
                <div class="settings-subsection">
                    <h3 style="margin-top: 0.5rem; color: var(--text-color);">Pricing Rules</h3>
                    <div class="settings-grid" style="grid-template-columns: 1fr 1fr;">
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="showRetailPrice" ${this.settingsData.pricing.showRetailPrice ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('pricing', 'showRetailPrice', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Show Retail Price on labels
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="showWholesalePrice" ${this.settingsData.pricing.showWholesalePrice ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('pricing', 'showWholesalePrice', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Show Wholesale Price
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="roundAmount" ${this.settingsData.pricing.roundAmount ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('pricing', 'roundAmount', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Round total amount to nearest integer
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="applyVatVitamins" ${tax.applyVatVitamins ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('tax', 'applyVatVitamins', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Apply VAT to Vitamins only
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="essentialExempt" ${tax.essentialExempt ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('tax', 'essentialExempt', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Medicines are VAT exempt
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="manualDiscount" ${tax.manualDiscount ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('tax', 'manualDiscount', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Allow manual discount
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="managerApproval" ${tax.managerApproval ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('tax', 'managerApproval', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Manager approval for >10% disc.
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="section-actions" style="margin-top:1.5rem;">
                    <button class="btn btn-primary" onclick="pharmacySettings.saveTaxSettings()">
                        Save Tax & Pricing Settings
                    </button>
                </div>
            </section>
        `;
  }

  renderUserSettings() {
    const roles = this.settingsData.users.roles;
    return `
            <section class="settings-section">
                <div class="section-header" style="margin-bottom: 1.25rem;">
                    <h2 style="font-size: 1.1rem; display: flex; align-items: center; gap: 0.6rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px;color:#ec4899;"><path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" /></svg>
                        User Roles & Permissions
                    </h2>
                    <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">Manage user roles and their permissions</p>
                </div>
                
                <div class="roles-table-container">
                    <table class="roles-table">
                        <thead>
                            <tr>
                                <th>Role Name</th>
                                <th>Permissions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${roles
                              .map(
                                (role) => `
                                <tr>
                                    <td>
                                        <div class="role-info">
                                            <span class="role-name">${role.name}</span>
                                            <span class="role-id">ID: ${role.id}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="permissions-list">
                                            ${role.permissions
                                              .map(
                                                (perm) => `
                                                <span class="permission-tag">${perm}</span>
                                            `,
                                              )
                                              .join("")}
                                        </div>
                                    </td>
                                    <td>
                                        <div class="role-actions">
                                            <button class="btn btn-sm btn-outline" onclick="pharmacySettings.editRole(${role.id})">
                                                ✏️ Edit
                                            </button>
                                            ${
                                              role.id > 1
                                                ? `
                                                <button class="btn btn-sm btn-danger" onclick="pharmacySettings.deleteRole(${role.id})">
                                                    🗑️ Delete
                                                </button>
                                            `
                                                : ""
                                            }
                                        </div>
                                    </td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
                
                <div class="section-actions" style="margin-top: 0.5rem;">
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="pharmacySettings.addNewRole()">
                        ➕ Add New Role
                    </button>
                    <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="pharmacySettings.saveUserSettings()">
                        Save Roles Settings
                    </button>
                </div>
            </section>
        `;
  }

  renderHardwareSettings() {
    const hardware = this.settingsData.hardware || {
      printerType: "thermal",
      paperSize: "80mm",
      barcodeScanner: "usb",
      cashDrawer: "usb",
      customerDisplay: "none",
    };
    return `
            <section class="settings-section">
                <div class="section-header" style="margin-bottom: 1.25rem;">
                    <h2 style="font-size: 1.1rem; display: flex; align-items: center; gap: 0.6rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px;color:#6366f1;"><path d="M2.25 5.25a3 3 0 00-3 3v8.25a3 3 0 003 3h19.5a3 3 0 003-3V8.25a3 3 0 00-3-3H2.25z" /><path fill-rule="evenodd" d="M11.25 20.25a.75.75 0 011.5 0h-1.5zm0 0H7.5a.75.75 0 010-1.5H16.5a.75.75 0 010 1.5H11.25z" clip-rule="evenodd" /></svg>
                        Hardware Configuration
                    </h2>
                    <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">Set up your hardware devices</p>
                </div>
                
                <div class="settings-grid">
                    <div class="form-group">
                        <label for="printerType" class="form-label">Printer Type</label>
                        <select id="printerType" class="form-select"
                                onchange="pharmacySettings.updateSetting('hardware', 'printerType', this.value)">
                            <option value="thermal" ${hardware.printerType === "thermal" ? "selected" : ""}>Thermal Printer</option>
                            <option value="dotmatrix" ${hardware.printerType === "dotmatrix" ? "selected" : ""}>Dot Matrix</option>
                            <option value="laser" ${hardware.printerType === "laser" ? "selected" : ""}>Laser Printer</option>
                            <option value="none" ${hardware.printerType === "none" ? "selected" : ""}>No Printer</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="paperSize" class="form-label">Paper Size</label>
                        <select id="paperSize" class="form-select"
                                onchange="pharmacySettings.updateSetting('hardware', 'paperSize', this.value)">
                            <option value="58mm" ${hardware.paperSize === "58mm" ? "selected" : ""}>58mm</option>
                            <option value="80mm" ${hardware.paperSize === "80mm" ? "selected" : ""}>80mm</option>
                            <option value="a4" ${hardware.paperSize === "a4" ? "selected" : ""}>A4</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="barcodeScanner" class="form-label">Barcode Scanner</label>
                        <select id="barcodeScanner" class="form-select"
                                onchange="pharmacySettings.updateSetting('hardware', 'barcodeScanner', this.value)">
                            <option value="usb" ${hardware.barcodeScanner === "usb" ? "selected" : ""}>USB Scanner</option>
                            <option value="bluetooth" ${hardware.barcodeScanner === "bluetooth" ? "selected" : ""}>Bluetooth Scanner</option>
                            <option value="camera" ${hardware.barcodeScanner === "camera" ? "selected" : ""}>Camera Scanner</option>
                            <option value="none" ${hardware.barcodeScanner === "none" ? "selected" : ""}>No Scanner</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="cashDrawer" class="form-label">Cash Drawer</label>
                        <select id="cashDrawer" class="form-select"
                                onchange="pharmacySettings.updateSetting('hardware', 'cashDrawer', this.value)">
                            <option value="usb" ${hardware.cashDrawer === "usb" ? "selected" : ""}>USB Cash Drawer</option>
                            <option value="serial" ${hardware.cashDrawer === "serial" ? "selected" : ""}>Serial Port</option>
                            <option value="none" ${hardware.cashDrawer === "none" ? "selected" : ""}>No Cash Drawer</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="customerDisplay" class="form-label">Customer Display</label>
                        <select id="customerDisplay" class="form-select"
                                onchange="pharmacySettings.updateSetting('hardware', 'customerDisplay', this.value)">
                            <option value="none" ${hardware.customerDisplay === "none" ? "selected" : ""}>No Display</option>
                            <option value="lcd" ${hardware.customerDisplay === "lcd" ? "selected" : ""}>LCD Display</option>
                            <option value="vfd" ${hardware.customerDisplay === "vfd" ? "selected" : ""}>VFD Display</option>
                        </select>
                    </div>
                </div>
                
                <div class="section-actions" style="margin-top: 0.5rem;">
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="pharmacySettings.testHardware()">
                        🧪 Test Hardware
                    </button>
                    <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="pharmacySettings.saveHardwareSettings()">
                        Save Hardware Settings
                    </button>
                </div>
            </section>
        `;
  }

  renderNotificationSettings() {
    const notifications = this.settingsData.notifications || {
      whatsappEnabled: true,
      whatsappNumber: "+94776789117",
      lowStockThreshold: 10,
      expiryThreshold: 90,
    };
    return `
            <style>
                .notifications-layout {
                    display: grid;
                    grid-template-columns: 1fr 280px;
                    gap: 0.75rem;
                    align-items: flex-start;
                }
                .info-box {
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    border-radius: 8px;
                    padding: 0.6rem;
                }
                .info-box h3 {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    color: #1e40af;
                    font-size: 0.75rem;
                    margin-bottom: 0.4rem;
                    font-weight: 700;
                }
                .info-step {
                    display: flex;
                    gap: 0.4rem;
                    margin-bottom: 0.3rem;
                    font-size: 0.6rem;
                    color: #475569;
                    line-height: 1.3;
                }
                .step-number {
                    flex-shrink: 0;
                    width: 14px;
                    height: 14px;
                    background: #1e40af;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.5rem;
                    font-weight: 700;
                }
                .activation-box {
                    background: #f8fafc;
                    border: 1px dashed #cbd5e1;
                    padding: 0.4rem;
                    border-radius: 4px;
                    font-family: inherit;
                    font-size: 0.6rem;
                    color: #334155;
                    margin-top: 0.3rem;
                }
                .activation-code {
                    font-weight: 700;
                    color: #059669;
                    background: #ecfdf5;
                    padding: 0.05rem 0.2rem;
                    border-radius: 3px;
                }
                .threshold-card {
                    background: rgba(255, 255, 255, 0.5);
                    border: 1px solid rgba(0,0,0,0.05);
                    border-radius: 6px;
                    padding: 0.4rem 0.6rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.4rem;
                }
                .threshold-label {
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: #1e293b;
                }
                .threshold-input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                }
                .threshold-input {
                    width: 45px !important;
                    height: 22px !important;
                    text-align: center;
                    font-weight: 700;
                    color: #059669;
                    padding: 0 !important;
                    font-size: 0.75rem !important;
                    border-radius: 4px !important;
                }
                @media (max-width: 900px) {
                    .notifications-layout {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            
            <section class="settings-section" style="padding: 0.75rem;">
                <div class="section-header" style="margin-bottom: 0.75rem;">
                    <h2 style="font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem; margin: 0;">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;color:#059669;"><path fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52a.75.75 0 01.64.712v15.26a.75.75 0 01-1.01.707L12 17.158l-6.782 2.29a.75.75 0 01-1.01-.708V3.483a.75.75 0 01.64-.712z" clip-rule="evenodd" /></svg>
                       Notifications
                    </h2>
                    <p style="font-size: 0.65rem; color: #64748b; margin-top: 0.1rem;">Configure WhatsApp alerts for low stock and expiring items</p>
                </div>
                
                <div class="notifications-layout">
                    <!-- Left Column: Settings -->
                    <div class="settings-column">
                        <div class="settings-subsection" style="margin-bottom: 0.75rem;">
                            <h3 style="font-size: 0.75rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.2rem;">WhatsApp Alerts</h3>
                            
                            <div class="settings-grid" style="gap: 0.5rem;">
                                <div class="form-group full-width">
                                    <label for="whatsappNumber" class="form-label" style="font-size: 0.6rem; margin-bottom: 0.2rem;">WhatsApp Phone Number</label>
                                    <div style="display: flex; gap: 0.4rem; align-items: center;">
                                        <input type="tel" id="whatsappNumber" class="form-input" 
                                               value="${notifications.whatsappNumber}" 
                                               placeholder="+94771234567"
                                               style="flex: 1; padding: 0.2rem 0.4rem; font-size: 0.7rem; height: 28px;"
                                               onchange="pharmacySettings.updateSetting('notifications', 'whatsappNumber', this.value)">
                                    </div>
                                    <p style="font-size: 0.55rem; color: #94a3b8; margin-top: 0.15rem;">Enter number with country code (e.g. +94771234567)</p>
                                </div>
                                
                                <div class="form-group full-width" style="margin-top: 0.2rem;">
                                    <div class="checkbox-group">
                                        <label class="checkbox-label" style="background: rgba(16, 185, 129, 0.05); padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.1);">
                                            <input type="checkbox" id="whatsappEnabled" ${notifications.whatsappEnabled ? "checked" : ""}
                                                   onchange="pharmacySettings.updateSetting('notifications', 'whatsappEnabled', this.checked)">
                                            <span class="checkbox-custom" style="width: 12px; height: 12px;"></span>
                                            <div>
                                                <span style="display: block; font-size: 0.65rem; font-weight: 600;">Enable WhatsApp notifications</span>
                                                <small style="display: block; font-weight: 400; color: #64748b; margin-top: 0.05rem; font-size: 0.55rem;">Automated messages will be sent to the number above</small>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="settings-subsection">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.6rem;">
                                <h3 style="font-size: 0.75rem; font-weight: 700; color: #1e293b; margin: 0;">Alert Thresholds</h3>
                                <div style="display: flex; gap: 0.3rem;">
                                    <button class="btn btn-secondary" style="padding: 0.15rem 0.5rem; font-size: 0.6rem; height: 24px;" onclick="pharmacySettings.testNotification()">
                                        🧪 Test
                                    </button>
                                    <button class="btn btn-primary" style="padding: 0.15rem 0.75rem; font-size: 0.6rem; height: 24px; background: #007513;" onclick="pharmacySettings.saveNotificationSettings()">
                                        Save
                                    </button>
                                </div>
                            </div>
                            
                            <div style="display: grid; gap: 0.4rem; max-width: 350px;">
                                <div class="threshold-card">
                                    <div class="threshold-label">Low stock alerts</div>
                                    <div class="threshold-input-wrapper">
                                        <span style="font-size: 0.55rem; color: #64748b;">Alert when stock falls below</span>
                                        <input type="number" id="lowStockThreshold" class="form-input threshold-input" 
                                               value="${notifications.lowStockThreshold}" min="1"
                                               onchange="pharmacySettings.updateSetting('notifications', 'lowStockThreshold', parseInt(this.value))">
                                        <span style="font-size: 0.55rem; color: #64748b;">units</span>
                                    </div>
                                </div>

                                <div class="threshold-card">
                                    <div class="threshold-label">Expiry alerts</div>
                                    <div class="threshold-input-wrapper">
                                        <span style="font-size: 0.55rem; color: #64748b;">Alert when items expire within</span>
                                        <input type="number" id="expiryThreshold" class="form-input threshold-input" 
                                               value="${notifications.expiryThreshold}" min="1"
                                               onchange="pharmacySettings.updateSetting('notifications', 'expiryThreshold', parseInt(this.value))">
                                        <span style="font-size: 0.55rem; color: #64748b;">days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Instructions -->
                    <div class="info-column">
                        <div class="info-box">
                            <h3>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836c-.149.598.019 1.225.44 1.645a.75.75 0 01-1.06 1.06 2.25 2.25 0 01-1.321-1.494l.712-2.847c.112-.447-.048-.902-.365-1.219a.75.75 0 011.038-1.087zM12 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" /></svg>
                                How it works
                            </h3>
                            
                            <div class="info-step">
                                <div class="step-number">1</div>
                                <div>Checks stock & expiry hourly</div>
                            </div>
                            
                            <div class="info-step">
                                <div class="step-number">2</div>
                                <div>Sends WhatsApp alerts instantly</div>
                            </div>
                            
                            <div class="info-step">
                                <div class="step-number">3</div>
                                <div>Uses free CallMeBot API</div>
                            </div>

                            <div class="activation-box">
                                <p style="margin-bottom: 0.2rem; font-weight: 600;">Activation:</p>
                                <p>Send <span class="activation-code">"I allow callmebot..."</span> to <span style="font-weight:700;">+34 644 71 83 08</span></p>
                            </div>
                        </div>
                        
                        <div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(16, 185, 129, 0.05); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.1);">
                             <div style="display: flex; align-items: center; gap: 0.3rem; color: #059669; font-size: 0.65rem; font-weight: 700; margin-bottom: 0.2rem;">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:12px;height:12px;"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm3 10.5a.75.75 0 000-1.5H9a.75.75 0 000 1.5h6z" clip-rule="evenodd" /></svg>
                                Status
                             </div>
                             <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.6rem; color: #475569;">Service</span>
                                <span style="font-size: 0.55rem; color: #059669; font-weight: 700; background: #ecfdf5; padding: 0.05rem 0.3rem; border-radius: 20px;">READY</span>
                             </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
  }

  renderBackupSettings() {
    const backup = this.settingsData.backup || {
      autoBackup: true,
      backupFrequency: "daily",
      backupLocation: "local",
      cloudBackup: false,
      retentionDays: 30,
    };
    const security = this.settingsData.security || {
      sessionTimeout: 30,
      requirePassword: true,
      twoFactorAuth: false,
      auditLog: true,
      encryptData: true,
    };
    return `
            <section class="settings-section backup-settings">
                <div class="section-header" style="margin-bottom: 1.25rem;">
                    <h2 style="font-size: 1.1rem; display: flex; align-items: center; gap: 0.6rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px;color:#ef4444;"><path fill-rule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516 11.209 11.209 0 01-7.877-3.08zM15.78 11.28a.75.75 0 00-1.06-1.06l-3.47 3.47-1.47-1.47a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4-4z" clip-rule="evenodd" /></svg>
                        Backup & Security Settings
                    </h2>
                    <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">Configure automatic backup and data retention</p>
                </div>
                
                <div class="settings-subsection">
                    <h3>Backup Configuration</h3>
                    <div class="settings-grid">
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="autoBackup" ${backup.autoBackup ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('backup', 'autoBackup', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Enable Automatic Backup
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="backupFrequency" class="form-label">Backup Frequency</label>
                            <select id="backupFrequency" class="form-select"
                                    onchange="pharmacySettings.updateSetting('backup', 'backupFrequency', this.value)">
                                <option value="hourly" ${backup.backupFrequency === "hourly" ? "selected" : ""}>Hourly</option>
                                <option value="daily" ${backup.backupFrequency === "daily" ? "selected" : ""}>Daily</option>
                                <option value="weekly" ${backup.backupFrequency === "weekly" ? "selected" : ""}>Weekly</option>
                                <option value="monthly" ${backup.backupFrequency === "monthly" ? "selected" : ""}>Monthly</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="backupLocation" class="form-label">Backup Location</label>
                            <select id="backupLocation" class="form-select"
                                    onchange="pharmacySettings.updateSetting('backup', 'backupLocation', this.value)">
                                <option value="local" ${backup.backupLocation === "local" ? "selected" : ""}>Local Storage</option>
                                <option value="network" ${backup.backupLocation === "network" ? "selected" : ""}>Network Drive</option>
                                <option value="cloud" ${backup.backupLocation === "cloud" ? "selected" : ""}>Cloud Storage</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="cloudBackup" ${backup.cloudBackup ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('backup', 'cloudBackup', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Cloud Backup
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="retentionDays" class="form-label">Retention Period (Days)</label>
                            <input type="number" id="retentionDays" class="form-input" value="${backup.retentionDays}" min="1" max="365"
                                   onchange="pharmacySettings.updateSetting('backup', 'retentionDays', parseInt(this.value))">
                        </div>
                    </div>
                </div>
                
                <div class="settings-subsection">
                    <h3>🔒 Security Settings</h3>
                    <div class="settings-grid">
                        <div class="form-group">
                            <label for="sessionTimeout" class="form-label">Session Timeout (Minutes)</label>
                            <input type="number" id="sessionTimeout" class="form-input" value="${security.sessionTimeout}" min="5" max="480"
                                   onchange="pharmacySettings.updateSetting('security', 'sessionTimeout', parseInt(this.value))">
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="requirePassword" ${security.requirePassword ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('security', 'requirePassword', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Require Password for Sensitive Actions
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="twoFactorAuth" ${security.twoFactorAuth ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('security', 'twoFactorAuth', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Two-Factor Authentication
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="auditLog" ${security.auditLog ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('security', 'auditLog', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Enable Audit Log
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="encryptData" ${security.encryptData ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('security', 'encryptData', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Encrypt Sensitive Data
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="section-actions" style="margin-top: 0.5rem;">
                    <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="pharmacySettings.createBackup()">
                        💾 Create Backup Now
                    </button>
                    <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="pharmacySettings.saveBackupSettings()">
                        Save Backup & Security Settings
                    </button>
                </div>
            </section>
        `;
  }

  setupNavigation() {
    const navTabs = document.querySelectorAll(".nav-tab");
    navTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const section = tab.dataset.section;
        this.switchSection(section);
      });
    });
  }

  switchSection(section) {
    // Update navigation tabs
    const navTabs = document.querySelectorAll(".nav-tab");
    navTabs.forEach((tab) => {
      tab.classList.remove("active");
      if (tab.dataset.section === section) {
        tab.classList.add("active");
      }
    });

    // Update panels
    const panels = document.querySelectorAll(".settings-panel");
    panels.forEach((panel) => {
      panel.style.display = "none";
    });

    const targetPanel = document.getElementById(`${section}Panel`);
    if (targetPanel) {
      targetPanel.style.display = "block";
    }

    this.currentSection = section;
  }

  setupFormHandlers() {
    // Add form change listeners to track unsaved changes
    const inputs = document.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.addEventListener("change", () => {
        this.markAsChanged(input);
      });
    });
  }

  markAsChanged() {
    const section = this.currentSection;
    this.unsavedChanges.add(section);
  }

  updateUnsavedIndicator() {
    // UI elements removed per user request
  }

  escapeHtml(unsafe) {
    if (typeof unsafe !== "string") return unsafe;
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  updateSetting(category, field, value) {
    if (!this.settingsData[category]) {
      this.settingsData[category] = {};
    }
    this.settingsData[category][field] = value;
    this.settingsData[category][field] = value;
    this.unsavedChanges.add(category);

    // Trigger real-time UI updates
    if (category === "pharmacy" && field === "name") {
      this.updateGlobalPharmacyName();
    }

    // Trigger receipt preview update if pharmacy or receipt settings change
    if (category === "pharmacy" || category === "receipt") {
      this.updateReceiptPreview();
    }

    // Draft save to localStorage to prevent data loss on accidental refresh
    localStorage.setItem(
      "pharmacy_settings_" + category,
      JSON.stringify(this.settingsData[category]),
    );
  }

  async saveAllSettings() {
    const sections = Array.from(this.unsavedChanges);
    if (sections.length === 0) {
      this.showNotification("No changes to save.", "info");
      return;
    }

    this.showNotification(`Saving ${sections.length} section(s)...`, "info");

    const savePromises = sections.map((section) => this.saveSection(section));
    await Promise.all(savePromises);

    this.showNotification("All settings synchronized successfully!", "success");
  }

  async saveSectionToBackend(section) {
    try {
      const data = this.settingsData[section] || {};
      const result = await rpc("/pharmacy/settings/save", {
        category: section,
        data: data,
      });

      if (result.success) {
        this.unsavedChanges.delete(section);
        this.updateUnsavedIndicator();
        this.showNotification(
          `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`,
          "success",
        );
      } else {
        console.error(`Backend failed to save ${section}:`, result.error);
        this.showNotification(
          `Failed to save ${section}: ${result.error || "Unknown error"}`,
          "error",
        );
      }
    } catch (error) {
      console.error(`RPC error saving ${section}:`, error);
      this.showNotification(
        "Network error: Failed to save settings to database.",
        "error",
      );
    }
  }

  async saveSection(section) {
    // Keep local storage as a fallback/cache if desired, but primary is backend
    localStorage.setItem(
      "pharmacy_settings_" + section,
      JSON.stringify(this.settingsData[section]),
    );
    await this.saveSectionToBackend(section);
  }

  async loadSettingsFromBackend() {
    try {
      const result = await rpc("/pharmacy/settings/load");
      if (result.success && result.settings) {
        // Convert flat keys back to nested structure
        const nested = this._convertFlatToNested(result.settings);
        // Merge with existing defaults to ensure all keys exist
        this.settingsData = this._deepMerge(this.settingsData, nested);

        // After successful load, these sections are synchronized
        Object.keys(nested).forEach((cat) => this.unsavedChanges.delete(cat));
        this.updateUnsavedIndicator();
      }
    } catch (error) {
      console.error("Failed to load settings from backend:", error);
      // Fallback to localStorage if backend fails
      this.loadSettingsFromStorage();
    }
    this.updateGlobalPharmacyName();
  }

  _convertFlatToNested(flatSettings) {
    const nested = {};
    Object.keys(flatSettings).forEach((key) => {
      const parts = key.split(".");
      let current = nested;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = flatSettings[key];
    });
    return nested;
  }

  _deepMerge(target, source) {
    if (!source || typeof source !== "object") return source;
    if (Array.isArray(source)) return source; // Overwrite arrays instead of merging indices

    for (const key in source) {
      if (
        source[key] instanceof Object &&
        key in target &&
        !Array.isArray(source[key])
      ) {
        target[key] = this._deepMerge(target[key] || {}, source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  loadSettingsFromStorage() {
    const categories = [
      "pharmacy",
      "receipt",
      "tax",
      "pricing",
      "users",
      "hardware",
      "notifications",
      "backup",
      "security",
    ];

    categories.forEach((category) => {
      const saved = localStorage.getItem("pharmacy_settings_" + category);
      if (saved) {
        try {
          this.settingsData[category] = JSON.parse(saved);
        } catch (e) {
          console.error("Error loading settings for", category, e);
        }
      }
    });

    this.updateGlobalPharmacyName();
  }

  updateGlobalPharmacyName() {
    const name = this.settingsData.pharmacy?.name || "Timolog Pharma";
    const sidebarLogoSpan = document.getElementById("sidebar-pharmacy-name");
    if (sidebarLogoSpan) {
      sidebarLogoSpan.textContent = name;
    }
  }

  // Individual save methods
  async savePharmacySettings() {
    await this.saveSection("pharmacy");
    this.updateGlobalPharmacyName();
  }

  async saveReceiptSettings() {
    await this.saveSection("receipt");
  }

  async saveTaxSettings() {
    await this.saveSection("tax");
    await this.saveSection("pricing");
  }

  async saveUserSettings() {
    await this.saveSection("users");
  }

  async saveInventorySettings() {
    await this.saveSection("inventory");
  }

  async saveHardwareSettings() {
    await this.saveSection("hardware");
  }

  async saveNotificationSettings() {
    await this.saveSection("notifications");
  }

  async saveBackupSettings() {
    await this.saveSection("backup");
    await this.saveSection("security");
  }

  // Utility methods
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

  exportSettings() {
    const dataStr = JSON.stringify(this.settingsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download =
      "pharmacy_settings_" + new Date().toISOString().split("T")[0] + ".json";
    link.click();

    URL.revokeObjectURL(url);
    this.showNotification("Settings exported successfully!", "success");
  }

  importSettings() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            this.settingsData = { ...this.settingsData, ...imported };
            this.initializeSettings(); // Re-render and re-attach listeners
            this.showNotification("Settings imported successfully!", "success");
          } catch (error) {
            this.showNotification("Error importing settings file!", "error");
          }
        };
        reader.readAsText(file);
      }
    };

    input.click();
  }

  previewReceipt() {
    this.showNotification("Receipt preview feature coming soon!", "info");
  }

  testHardware() {
    this.showNotification("Hardware test feature coming soon!", "info");
  }

  testNotification() {
    this.showNotification("Test notification sent successfully!", "success");
  }

  createBackup() {
    this.showNotification("Backup creation started...", "info");
    setTimeout(() => {
      this.saveSection("backup");
      this.saveSection("security");
      this.showNotification(
        "Backup created successfully and settings saved!",
        "success",
      );
    }, 1500);
  }

  editRole(roleId) {
    const role = this.settingsData.users.roles.find((r) => r.id === roleId);
    if (!role) return;

    if (document.getElementById("editRoleModal")) return;

    const allPermissions = [
      "All modules",
      "User management",
      "System settings",
      "Reports",
      "Audit logs",
      "Price management",
      "Inventory view",
      "Medicine safety check",
      "Prescriptions",
      "Dispensing",
      "Sales (POS)",
      "Customer lookup",
      "Hold/resume bills",
      "End of day report",
      "Inventory management",
      "GRN entry",
      "Purchase orders",
      "Stock adjustments",
      "Supplier management",
      "All reports",
      "Sales reports",
      "Inventory reports",
      "Staff oversight",
      "Void approvals",
      "Refund approval",
    ];

    const modal = document.createElement("div");
    modal.id = "editRoleModal";
    modal.className = "inventory-modal-overlay";
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(8px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    let checkboxesHtml = allPermissions
      .map(
        (perm) => `
        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; cursor: pointer; background: rgba(255,255,255,0.5); padding: 0.4rem; border-radius: 4px; border: 1px solid rgba(0,0,0,0.05);">
            <input type="checkbox" value="${perm}" class="role-permission-cb" ${role.permissions.includes(perm) ? "checked" : ""} style="margin: 0;">
            ${perm}
        </label>
    `,
      )
      .join("");

    modal.innerHTML = `
        <div class="inventory-modal glass-card" style="width: 500px; max-height: 90vh; overflow-y: auto; padding: 2rem; border-radius: 16px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
            <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a;">Edit Role: ${role.name}</h3>
                <button id="closeEditRoleBtn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b;">&times;</button>
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; color: #475569;">Role Name</label>
                <input type="text" id="editRoleNameInput" value="${role.name}" 
                       style="width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.95rem; outline: none; box-sizing: border-box;">
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; color: #475569;">Permissions</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    ${checkboxesHtml}
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                <button id="cancelEditRoleBtn" style="padding: 0.6rem 1.2rem; border-radius: 8px; border: 1px solid #e2e8f0; background: white; font-weight: 600; color: #64748b; cursor: pointer;">Cancel</button>
                <button id="saveEditRoleBtn" style="padding: 0.6rem 1.2rem; border-radius: 8px; border: none; background: #007513; color: white; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px rgba(0,117,19,0.2);">Save Changes</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector("#closeEditRoleBtn");
    const cancelBtn = modal.querySelector("#cancelEditRoleBtn");
    const saveBtn = modal.querySelector("#saveEditRoleBtn");
    const nameInput = modal.querySelector("#editRoleNameInput");

    const closeModal = () => modal.remove();

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    saveBtn.onclick = () => {
      const newName = nameInput.value.trim();
      if (!newName) {
        this.showNotification("Role name cannot be empty", "error");
        return;
      }

      const checkedBoxes = modal.querySelectorAll(
        ".role-permission-cb:checked",
      );
      const newPermissions = Array.from(checkedBoxes).map((cb) => cb.value);

      role.name = newName;
      role.permissions = newPermissions;

      this.markAsChanged();

      // Re-render the user settings panel
      const panel = document.getElementById("usersPanel");
      if (panel) {
        panel.innerHTML = this.renderUserSettings();
      }

      this.showNotification("Role updated successfully!", "success");
      closeModal();
    };

    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  }

  deleteRole(roleId) {
    if (confirm("Are you sure you want to delete this role?")) {
      const roles = this.settingsData.users.roles;
      const index = roles.findIndex((r) => r.id === roleId);
      if (index > -1) {
        roles.splice(index, 1);
        const panel = document.getElementById("usersPanel");
        if (panel) panel.innerHTML = this.renderUserSettings();
        this.showNotification("Role deleted successfully!", "success");
        this.markAsChanged();
      }
    }
  }

  addNewRole() {
    const roleName = prompt("Enter new role name:");
    if (roleName) {
      const roles = this.settingsData.users.roles;
      const newId = Math.max(...roles.map((r) => r.id), 0) + 1;
      roles.push({
        id: newId,
        name: roleName,
        permissions: ["sales"],
      });
      const panel = document.getElementById("usersPanel");
      if (panel) panel.innerHTML = this.renderUserSettings();
      this.showNotification("New role added!", "success");
      this.markAsChanged();
    }
  }

  setupEventListeners() {
    // Add any additional event listeners here
  }

  cleanup() {
    // Clean up any resources
  }
}

// Make the class globally available
window.PharmacySettings = PharmacySettings;

// Initialize when library is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.pharmacySettings) {
      window.pharmacySettings = PharmacySettings.createInstance();
    }
  });
} else {
  if (!window.pharmacySettings) {
    window.pharmacySettings = PharmacySettings.createInstance();
  }
}
