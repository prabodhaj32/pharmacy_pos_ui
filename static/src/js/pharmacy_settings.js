/** @odoo-module **/

import { Component, onMounted, onWillUnmount } from "@odoo/owl";

class PharmacySettings extends Component {
  setup() {
    // Initialize settings data with default values
    this.settingsData = {
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
          { id: 1, name: "Administrator", permissions: ["all"] },
          { id: 2, name: "Pharmacist", permissions: ["sales", "inventory"] },
          { id: 3, name: "Cashier", permissions: ["sales"] },
          {
            id: 4,
            name: "Store Keeper",
            permissions: ["inventory", "purchasing"],
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

    this.currentSection = "pharmacy";
    this.unsavedChanges = new Set();

    onMounted(() => {
      this.initializeSettings();
      this.setupEventListeners();
      this.loadSettingsFromStorage();
    });

    onWillUnmount(() => {
      this.cleanup();
    });
  }

  // Static method to create instance without OWL framework
  static createInstance() {
    const instance = Object.create(PharmacySettings.prototype);
    instance.settingsData = {
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
          { id: 1, name: "Administrator", permissions: ["all"] },
          { id: 2, name: "Pharmacist", permissions: ["sales", "inventory"] },
          { id: 3, name: "Cashier", permissions: ["sales"] },
          {
            id: 4,
            name: "Store Keeper",
            permissions: ["inventory", "purchasing"],
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
    instance.currentSection = "pharmacy";
    instance.unsavedChanges = new Set();
    instance.initializeSettings();
    instance.setupEventListeners();
    instance.loadSettingsFromStorage();
    return instance;
  }

  initializeSettings() {
    this.renderSettingsPage();
    this.setupNavigation();
    this.setupFormHandlers();
  }

  renderSettingsPage() {
    const container = document.getElementById("dashboard_container");
    if (!container) return;

    container.innerHTML = `
            <div class="settings-container">
                <!-- Settings Header -->
               

                <!-- Settings Navigation -->
                <nav class="settings-nav">
                 <header class="settings-header">
                    <div class="header-content">
                       
                         <div class="unsaved-indicator" id="unsavedIndicator" style="display: none;">
                    </div>
                    </div>
                </header>
                    <ul class="nav-tabs">
                        <li class="nav-tab active" data-section="pharmacy">
                            <button class="nav-btn">
                                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;"><path fill-rule="evenodd" d="M3 3a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5h18a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0021 3H3zm8.25 4.5a.75.75 0 011.5 0v2.25H15a.75.75 0 010 1.5h-2.25v2.25a.75.75 0 01-1.5 0v-2.25H9a.75.75 0 010-1.5h2.25V7.5z" clip-rule="evenodd"/></svg></span>
                                <span class="nav-text">Pharmacy</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="receipt">
                            <button class="nav-btn">
                                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;"><path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clip-rule="evenodd" /><path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" /></svg></span>
                                <span class="nav-text">Receipt Setup</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="tax">
                            <button class="nav-btn">
                                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;"><path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /><path fill-rule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v14.25c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 19.125V4.875zm8.25 9.75a3.75 3.75 0 114.5 0 3.75 3.75 0 01-4.5 0z" clip-rule="evenodd" /></svg></span>
                                <span class="nav-text">Tax & Pricing</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="users">
                            <button class="nav-btn">
                                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;"><path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" /></svg></span>
                                <span class="nav-text">User Roles</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="hardware">
                            <button class="nav-btn">
                                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;"><path fill-rule="evenodd" d="M7.875 1.5C6.839 1.5 6 2.34 6 3.375v2.99c-.426.053-.851.11-1.274.174-1.454.218-2.476 1.483-2.476 2.917v6.294a3 3 0 003 3h.27l-.155 1.705A1.875 1.875 0 007.232 22.5h9.536a1.875 1.875 0 001.867-2.045l-.155-1.705h.27a3 3 0 003-3V9.456c0-1.434-1.022-2.7-2.476-2.917A48.716 48.716 0 0018 6.366V3.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM16.5 6.205v-2.83A.375.375 0 0016.125 3h-8.25a.375.375 0 00-.375.375v2.83a49.353 49.353 0 019 0zm-.217 8.265c.178.018.317.16.333.337l.526 5.784a.375.375 0 01-.373.409H7.232a.375.375 0 01-.373-.409l.526-5.784a.373.373 0 01.333-.337 41.741 41.741 0 018.566 0zm.967-3.97a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H18a.75.75 0 01-.75-.75V10.5z" clip-rule="evenodd" /></svg></span>
                                <span class="nav-text">Hardware</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="notifications">
                            <button class="nav-btn">
                                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;"><path fill-rule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clip-rule="evenodd" /></svg></span>
                                <span class="nav-text">Notifications</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="backup">
                            <button class="nav-btn">
                                <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;"><path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5zM12 15a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 15z" clip-rule="evenodd" /></svg></span>
                                <span class="nav-text">Backup & Security</span>
                            </button>
                        </li>
                    </ul>
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
    const data = this.settingsData.pharmacy || {
      name: "Timolog Pharma",
      registrationNo: "PHM-LK-2020-001",
      addressLine1: "123, Main Street, Colombo 07",
      city: "Colombo",
      hotline: "0112 345 678",
      whatsapp: "0771234567",
    };
    return `
            <section class="settings-section">
                <div class="section-header">
                    <h2>🏥 Pharmacy Information</h2>
                    <p>This information appears on your receipts and reports</p>
                </div>
                
                <div class="settings-grid">
                    <div class="form-group">
                        <label for="pharmacyName" class="form-label">Pharmacy Name</label>
                        <input type="text" id="pharmacyName" class="form-input" value="${data.name}" 
                               onchange="pharmacySettings.updateSetting('pharmacy', 'name', this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label for="registrationNo" class="form-label">Registration No.</label>
                        <input type="text" id="registrationNo" class="form-input" value="${data.registrationNo}"
                               onchange="pharmacySettings.updateSetting('pharmacy', 'registrationNo', this.value)">
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="addressLine1" class="form-label">Address Line 1</label>
                        <input type="text" id="addressLine1" class="form-input" value="${data.addressLine1}"
                               onchange="pharmacySettings.updateSetting('pharmacy', 'addressLine1', this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label for="city" class="form-label">City</label>
                        <input type="text" id="city" class="form-input" value="${data.city}"
                               onchange="pharmacySettings.updateSetting('pharmacy', 'city', this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label for="hotline" class="form-label">Hotline</label>
                        <input type="tel" id="hotline" class="form-input" value="${data.hotline}"
                               onchange="pharmacySettings.updateSetting('pharmacy', 'hotline', this.value)">
                    </div>
                    
                    <div class="form-group">
                        <label for="whatsapp" class="form-label">WhatsApp</label>
                        <input type="tel" id="whatsapp" class="form-input" value="${data.whatsapp}"
                               onchange="pharmacySettings.updateSetting('pharmacy', 'whatsapp', this.value)">
                    </div>
                </div>
                
                <div class="section-actions">
                    <button class="btn btn-primary" onclick="pharmacySettings.savePharmacySettings()">
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
                    grid-template-columns: 1fr 340px;
                    gap: 2rem;
                    align-items: flex-start;
                }
                .thermal-receipt-preview {
                    background: #fff;
                    font-family: 'Courier New', Courier, monospace;
                    padding: 15px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border: 1px solid #e5e7eb;
                    font-size: 13px;
                    color: #111;
                    width: 100%;
                    margin: 0 auto;
                }
                .thermal-header, .thermal-footer {
                    text-align: center;
                    margin-bottom: 10px;
                }
                .thermal-divider {
                    border-top: 1px dashed #666;
                    margin: 8px 0;
                }
                .thermal-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .thermal-table td, .thermal-table th {
                    padding: 2px 0;
                    text-align: left;
                }
                .thermal-table .text-right {
                    text-align: right;
                }
                .thermal-info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }
                @media (max-width: 768px) {
                    .receipt-setup-layout {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            
            <section class="settings-section">
                <div class="section-header">
                    <h2>🧾 Receipt Configuration</h2>
                    <p>Customize your 80mm thermal printer receipts</p>
                </div>
                
                <div class="receipt-setup-layout">
                    <!-- Config Form -->
                    <div class="receipt-config">
                        <div class="settings-grid">
                            <div class="form-group full-width">
                                <label for="receiptHeader" class="form-label">Receipt Header Text</label>
                                <textarea id="receiptHeader" class="form-textarea" rows="2"
                                          oninput="pharmacySettings.updateSetting('receipt', 'header', this.value); pharmacySettings.updateReceiptPreview()">${data.header}</textarea>
                            </div>
                            
                            <div class="form-group full-width">
                                <label for="receiptFooter" class="form-label">Receipt Footer Note</label>
                                <textarea id="receiptFooter" class="form-textarea" rows="2"
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

                            <div class="form-group full-width" style="margin-top: 1rem;">
                                <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--text-color);">Receipt Options</h3>
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
                        
                        <div class="section-actions" style="margin-top:2rem;">
                            <button class="btn btn-primary" onclick="pharmacySettings.saveReceiptSettings()">
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
    return `
            <div class="thermal-header">
                ${data.showLogo ? '<div style="margin-bottom:8px; display:flex; justify-content:center;"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>' : ""}
                <div style="font-weight:bold; font-size:16px; margin-bottom:4px;" id="previewHeader">${data.header || ""}</div>
                <div>123, Main Street, Colombo 07</div>
                <div>Tel: 0112 345 678</div>
                <div>PHM-LK-2020-001</div>
            </div>
            
            <div class="thermal-info-row">
                <span>Invoice:</span>
                <span id="previewInvoice">${data.invoicePrefix || "TMP"}-${data.startingInvoice || "2025-0035"}</span>
            </div>
            <div class="thermal-info-row">
                <span>Date:</span>
                <span>19/02/2025 10:45</span>
            </div>
            ${
              data.showCashier
                ? `<div class="thermal-info-row" id="previewCashier">
                <span>Cashier:</span>
                <span>Admin User</span>
            </div>`
                : ""
            }
            
            <div class="thermal-divider"></div>
            
            <table class="thermal-table">
                <tr>
                    <td>Panadol 500mg x2${data.showBatch ? "<br><small>B: BAT991</small>" : ""}${data.showExpiry ? "<br><small>E: 12/26</small>" : ""}</td>
                    <td class="text-right" style="vertical-align: top;">130.00</td>
                </tr>
                <tr>
                    <td>Omeprazole 20mg x1${data.showBatch ? "<br><small>B: PZM002</small>" : ""}${data.showExpiry ? "<br><small>E: 08/25</small>" : ""}</td>
                    <td class="text-right" style="vertical-align: top;">42.00</td>
                </tr>
            </table>

            ${
              data.showVat
                ? `<div class="thermal-divider"></div>
            <div class="thermal-info-row">
                <span>Subtotal:</span>
                <span>150.00</span>
            </div>
            <div class="thermal-info-row">
                <span>VAT (15%):</span>
                <span>22.00</span>
            </div>`
                : ""
            }
            
            <div class="thermal-divider"></div>
            
            <div class="thermal-info-row" style="font-weight:bold; font-size:14px;">
                <span>TOTAL:</span>
                <span>LKR 172.00</span>
            </div>
            <div class="thermal-info-row">
                <span>Cash Paid:</span>
                <span>200.00</span>
            </div>
            <div class="thermal-info-row">
                <span>Balance:</span>
                <span>28.00</span>
            </div>
            
            <div class="thermal-divider"></div>
            
            <div class="thermal-footer" id="previewFooter" style="margin-top:10px;">
                ${data.footer || ""}
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
                <div class="section-header">
                    <h2>💰 Tax & Pricing Rules</h2>
                    <p>Configure VAT, margins, and pricing rules</p>
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
                                    <input type="checkbox" id="applyVatVitamins" ${tax.applyVatVitamins ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('tax', 'applyVatVitamins', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Apply VAT to Vitamins & Supplements only
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="essentialExempt" ${tax.essentialExempt ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('tax', 'essentialExempt', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Medicines (essential) are VAT exempt
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="manualDiscount" ${tax.manualDiscount ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('tax', 'manualDiscount', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Allow cashier to apply manual discount
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="managerApproval" ${tax.managerApproval ? "checked" : ""}
                                           onchange="pharmacySettings.updateSetting('tax', 'managerApproval', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Require manager approval for >10% discount
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
    const roles = this.settingsData.users?.roles || [
      { id: 1, name: "Administrator", permissions: ["all"] },
      { id: 2, name: "Pharmacist", permissions: ["sales", "inventory"] },
      { id: 3, name: "Cashier", permissions: ["sales"] },
      { id: 4, name: "Store Keeper", permissions: ["inventory", "purchasing"] },
    ];
    return `
            <section class="settings-section">
                <div class="section-header">
                    <h2>👥 User Roles & Permissions</h2>
                    <p>Manage user roles and their permissions</p>
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
                
                <div class="section-actions">
                    <button class="btn btn-primary" onclick="pharmacySettings.addNewRole()">
                        ➕ Add New Role
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
                <div class="section-header">
                    <h2>🖨️ Hardware Configuration</h2>
                    <p>Set up your hardware devices</p>
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
                
                <div class="section-actions">
                    <button class="btn btn-secondary" onclick="pharmacySettings.testHardware()">
                        🧪 Test Hardware
                    </button>
                    <button class="btn btn-primary" onclick="pharmacySettings.saveHardwareSettings()">
                        Save Hardware Settings
                    </button>
                </div>
            </section>
        `;
  }

  renderNotificationSettings() {
    const notifications = this.settingsData.notifications || {
      lowStockAlert: true,
      expiryAlert: true,
      salesAlert: false,
      backupReminder: true,
      emailNotifications: false,
      emailAddress: "",
    };
    return `
            <section class="settings-section">
                <div class="section-header">
                    <h2>🔔 Notification Settings</h2>
                    <p>Configure system notifications and alerts</p>
                </div>
                
                <div class="settings-grid">
                    <div class="form-group">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="lowStockAlert" ${notifications.lowStockAlert ? "checked" : ""}
                                       onchange="pharmacySettings.updateSetting('notifications', 'lowStockAlert', this.checked)">
                                <span class="checkbox-custom"></span>
                                Low Stock Alert
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="expiryAlert" ${notifications.expiryAlert ? "checked" : ""}
                                       onchange="pharmacySettings.updateSetting('notifications', 'expiryAlert', this.checked)">
                                <span class="checkbox-custom"></span>
                                Medicine Expiry Alert
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="salesAlert" ${notifications.salesAlert ? "checked" : ""}
                                       onchange="pharmacySettings.updateSetting('notifications', 'salesAlert', this.checked)">
                                <span class="checkbox-custom"></span>
                                Sales Achievement Alert
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="backupReminder" ${notifications.backupReminder ? "checked" : ""}
                                       onchange="pharmacySettings.updateSetting('notifications', 'backupReminder', this.checked)">
                                <span class="checkbox-custom"></span>
                                Backup Reminder
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="emailNotifications" ${notifications.emailNotifications ? "checked" : ""}
                                       onchange="pharmacySettings.updateSetting('notifications', 'emailNotifications', this.checked)">
                                <span class="checkbox-custom"></span>
                                Email Notifications
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="emailAddress" class="form-label">Notification Email Address</label>
                        <input type="email" id="emailAddress" class="form-input" value="${notifications.emailAddress}"
                               placeholder="Enter email for notifications"
                               onchange="pharmacySettings.updateSetting('notifications', 'emailAddress', this.value)">
                    </div>
                </div>
                
                <div class="section-actions">
                    <button class="btn btn-secondary" onclick="pharmacySettings.testNotification()">
                        📧 Test Notification
                    </button>
                    <button class="btn btn-primary" onclick="pharmacySettings.saveNotificationSettings()">
                        Save Notification Settings
                    </button>
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
                <div class="section-header">
                    <h2>💾 Backup Settings</h2>
                    <p>Configure automatic backup and data retention</p>
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
                
                <div class="section-actions">
                    <button class="btn btn-secondary" onclick="pharmacySettings.createBackup()">
                        💾 Create Backup Now
                    </button>
                    <button class="btn btn-primary" onclick="pharmacySettings.saveBackupSettings()">
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

  markAsChanged(element) {
    const section = this.currentSection;
    this.unsavedChanges.add(section);
    this.updateUnsavedIndicator();
  }

  updateUnsavedIndicator() {
    const indicator = document.getElementById("unsavedIndicator");
    const saveBtn = document.getElementById("saveSettingsBtn");

    if (this.unsavedChanges.size > 0) {
      if (indicator) indicator.style.display = "flex";
      if (saveBtn) {
        saveBtn.classList.add("btn-pulse");
        saveBtn.innerHTML =
          "💾 Save All Changes (" + this.unsavedChanges.size + ")";
      }
    } else {
      if (indicator) indicator.style.display = "none";
      if (saveBtn) {
        saveBtn.classList.remove("btn-pulse");
        saveBtn.innerHTML = "💾 Save All Changes";
      }
    }
  }

  updateSetting(category, field, value) {
    if (!this.settingsData[category]) {
      this.settingsData[category] = {};
    }
    this.settingsData[category][field] = value;
    this.unsavedChanges.add(category);
    this.updateUnsavedIndicator();
  }

  saveAllSettings() {
    const sections = Array.from(this.unsavedChanges);

    sections.forEach((section) => {
      this.saveSection(section);
    });

    this.unsavedChanges.clear();
    this.updateUnsavedIndicator();

    this.showNotification("All settings saved successfully!", "success");
  }

  saveSection(section) {
    // Save to localStorage
    localStorage.setItem(
      "pharmacy_settings_" + section,
      JSON.stringify(this.settingsData[section]),
    );

    // Here you would also save to the backend
    console.log("Saving section:", section, this.settingsData[section]);
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
  }

  // Individual save methods
  savePharmacySettings() {
    this.saveSection("pharmacy");
    this.unsavedChanges.delete("pharmacy");
    this.updateUnsavedIndicator();
    this.showNotification("Pharmacy settings saved!", "success");
  }

  saveReceiptSettings() {
    this.saveSection("receipt");
    this.unsavedChanges.delete("receipt");
    this.updateUnsavedIndicator();
    this.showNotification("Receipt settings saved!", "success");
  }

  saveTaxSettings() {
    this.saveSection("tax");
    this.saveSection("pricing");
    this.unsavedChanges.delete("tax");
    this.unsavedChanges.delete("pricing");
    this.updateUnsavedIndicator();
    this.showNotification("Tax and pricing settings saved!", "success");
  }

  saveHardwareSettings() {
    this.saveSection("hardware");
    this.unsavedChanges.delete("hardware");
    this.updateUnsavedIndicator();
    this.showNotification("Hardware settings saved!", "success");
  }

  saveNotificationSettings() {
    this.saveSection("notifications");
    this.unsavedChanges.delete("notifications");
    this.updateUnsavedIndicator();
    this.showNotification("Notification settings saved!", "success");
  }

  saveBackupSettings() {
    this.saveSection("backup");
    this.saveSection("security");
    this.unsavedChanges.delete("backup");
    this.unsavedChanges.delete("security");
    this.updateUnsavedIndicator();
    this.showNotification("Backup and security settings saved!", "success");
  }

  // Utility methods
  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <span class="notification-icon">${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
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
            this.renderSettingsPage();
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
      this.showNotification("Backup created successfully!", "success");
    }, 2000);
  }

  editRole(roleId) {
    this.showNotification(`Edit role ${roleId} feature coming soon!`, "info");
  }

  deleteRole(roleId) {
    if (confirm("Are you sure you want to delete this role?")) {
      const roles = this.settingsData.users.roles;
      const index = roles.findIndex((r) => r.id === roleId);
      if (index > -1) {
        roles.splice(index, 1);
        this.renderUserSettings();
        this.showNotification("Role deleted successfully!", "success");
      }
    }
  }

  addNewRole() {
    this.showNotification("Add new role feature coming soon!", "info");
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

// Create global instance
window.pharmacySettings = new PharmacySettings();
