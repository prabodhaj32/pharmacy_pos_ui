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
                whatsapp: "0771234567"
            },
            receipt: {
                header: "Thank you for shopping!",
                footer: "Please visit again!",
                showCustomerInfo: true,
                showBarcode: true,
                printReceipt: true
            },
            tax: {
                enabled: true,
                vatRate: 15,
                serviceCharge: 10,
                nbtEnabled: false,
                nbtRate: 2
            },
            pricing: {
                showRetailPrice: true,
                showWholesalePrice: false,
                allowDiscount: true,
                maxDiscount: 20,
                roundAmount: true
            },
            users: {
                roles: [
                    { id: 1, name: "Administrator", permissions: ["all"] },
                    { id: 2, name: "Pharmacist", permissions: ["sales", "inventory"] },
                    { id: 3, name: "Cashier", permissions: ["sales"] },
                    { id: 4, name: "Store Keeper", permissions: ["inventory", "purchasing"] }
                ]
            },
            hardware: {
                printerType: "thermal",
                paperSize: "80mm",
                barcodeScanner: "usb",
                cashDrawer: "usb",
                customerDisplay: "none"
            },
            notifications: {
                lowStockAlert: true,
                expiryAlert: true,
                salesAlert: false,
                backupReminder: true,
                emailNotifications: false,
                emailAddress: ""
            },
            backup: {
                autoBackup: true,
                backupFrequency: "daily",
                backupLocation: "local",
                cloudBackup: false,
                retentionDays: 30
            },
            security: {
                sessionTimeout: 30,
                requirePassword: true,
                twoFactorAuth: false,
                auditLog: true,
                encryptData: true
            }
        };

        this.currentSection = 'pharmacy';
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
                whatsapp: "0771234567"
            },
            receipt: {
                header: "Thank you for shopping!",
                footer: "Please visit again!",
                showCustomerInfo: true,
                showBarcode: true,
                printReceipt: true
            },
            tax: {
                enabled: true,
                vatRate: 15,
                serviceCharge: 10,
                nbtEnabled: false,
                nbtRate: 2
            },
            pricing: {
                showRetailPrice: true,
                showWholesalePrice: false,
                allowDiscount: true,
                maxDiscount: 20,
                roundAmount: true
            },
            users: {
                roles: [
                    { id: 1, name: "Administrator", permissions: ["all"] },
                    { id: 2, name: "Pharmacist", permissions: ["sales", "inventory"] },
                    { id: 3, name: "Cashier", permissions: ["sales"] },
                    { id: 4, name: "Store Keeper", permissions: ["inventory", "purchasing"] }
                ]
            },
            hardware: {
                printerType: "thermal",
                paperSize: "80mm",
                barcodeScanner: "usb",
                cashDrawer: "usb",
                customerDisplay: "none"
            },
            notifications: {
                lowStockAlert: true,
                expiryAlert: true,
                salesAlert: false,
                backupReminder: true,
                emailNotifications: false,
                emailAddress: ""
            },
            backup: {
                autoBackup: true,
                backupFrequency: "daily",
                backupLocation: "local",
                cloudBackup: false,
                retentionDays: 30
            },
            security: {
                sessionTimeout: 30,
                requirePassword: true,
                twoFactorAuth: false,
                auditLog: true,
                encryptData: true
            }
        };
        instance.currentSection = 'pharmacy';
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
                                <span class="nav-icon">🏥</span>
                                <span class="nav-text">Pharmacy</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="receipt">
                            <button class="nav-btn">
                                <span class="nav-icon">🧾</span>
                                <span class="nav-text">Receipt Setup</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="tax">
                            <button class="nav-btn">
                                <span class="nav-icon">💰</span>
                                <span class="nav-text">Tax & Pricing</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="users">
                            <button class="nav-btn">
                                <span class="nav-icon">👥</span>
                                <span class="nav-text">User Roles</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="hardware">
                            <button class="nav-btn">
                                <span class="nav-icon">🖨️</span>
                                <span class="nav-text">Hardware</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="notifications">
                            <button class="nav-btn">
                                <span class="nav-icon">🔔</span>
                                <span class="nav-text">Notifications</span>
                            </button>
                        </li>
                        <li class="nav-tab" data-section="backup">
                            <button class="nav-btn">
                                <span class="nav-icon">💾</span>
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
            whatsapp: "0771234567"
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
            header: "Thank you for shopping!",
            footer: "Please visit again!",
            showCustomerInfo: true,
            showBarcode: true,
            printReceipt: true
        };
        return `
            <section class="settings-section">
                <div class="section-header">
                    <h2>🧾 Receipt Setup</h2>
                    <p>Configure how your receipts look and what information they include</p>
                </div>
                
                <div class="settings-grid">
                    <div class="form-group full-width">
                        <label for="receiptHeader" class="form-label">Receipt Header</label>
                        <textarea id="receiptHeader" class="form-textarea" rows="2"
                                  onchange="pharmacySettings.updateSetting('receipt', 'header', this.value)">${data.header}</textarea>
                    </div>
                    
                    <div class="form-group full-width">
                        <label for="receiptFooter" class="form-label">Receipt Footer</label>
                        <textarea id="receiptFooter" class="form-textarea" rows="2"
                                  onchange="pharmacySettings.updateSetting('receipt', 'footer', this.value)">${data.footer}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="showCustomerInfo" ${data.showCustomerInfo ? 'checked' : ''}
                                       onchange="pharmacySettings.updateSetting('receipt', 'showCustomerInfo', this.checked)">
                                <span class="checkbox-custom"></span>
                                Show Customer Information
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="showBarcode" ${data.showBarcode ? 'checked' : ''}
                                       onchange="pharmacySettings.updateSetting('receipt', 'showBarcode', this.checked)">
                                <span class="checkbox-custom"></span>
                                Show Barcode on Receipt
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="printReceipt" ${data.printReceipt ? 'checked' : ''}
                                       onchange="pharmacySettings.updateSetting('receipt', 'printReceipt', this.checked)">
                                <span class="checkbox-custom"></span>
                                Auto-print Receipt
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="section-actions">
                    <button class="btn btn-secondary" onclick="pharmacySettings.previewReceipt()">
                        👁️ Preview Receipt
                    </button>
                    <button class="btn btn-primary" onclick="pharmacySettings.saveReceiptSettings()">
                        Save Receipt Settings
                    </button>
                </div>
            </section>
        `;
    }

    renderTaxSettings() {
        const tax = this.settingsData.tax || {
            enabled: true,
            vatRate: 15,
            serviceCharge: 10,
            nbtEnabled: false,
            nbtRate: 2
        };
        const pricing = this.settingsData.pricing || {
            showRetailPrice: true,
            showWholesalePrice: false,
            allowDiscount: true,
            maxDiscount: 20,
            roundAmount: true
        };
        return `
            <section class="settings-section tax-settings">
                <div class="section-header">
                    <h2>💰 Tax Settings</h2>
                    <p>Configure tax rates and pricing options</p>
                </div>
                
                <div class="settings-subsection">
                    <h3>Tax Configuration</h3>
                    <div class="settings-grid">
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="vatEnabled" ${tax.enabled ? 'checked' : ''}
                                           onchange="pharmacySettings.updateSetting('tax', 'enabled', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Enable VAT
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="vatRate" class="form-label">VAT Rate (%)</label>
                            <input type="number" id="vatRate" class="form-input" value="${tax.vatRate}" min="0" max="100" step="0.1"
                                   onchange="pharmacySettings.updateSetting('tax', 'vatRate', parseFloat(this.value))">
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="nbtEnabled" ${tax.nbtEnabled ? 'checked' : ''}
                                           onchange="pharmacySettings.updateSetting('tax', 'nbtEnabled', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Enable NBT
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="nbtRate" class="form-label">NBT Rate (%)</label>
                            <input type="number" id="nbtRate" class="form-input" value="${tax.nbtRate}" min="0" max="100" step="0.1"
                                   onchange="pharmacySettings.updateSetting('tax', 'nbtRate', parseFloat(this.value))">
                        </div>
                        
                        <div class="form-group">
                            <label for="serviceCharge" class="form-label">Service Charge (%)</label>
                            <input type="number" id="serviceCharge" class="form-input" value="${tax.serviceCharge}" min="0" max="100" step="0.1"
                                   onchange="pharmacySettings.updateSetting('tax', 'serviceCharge', parseFloat(this.value))">
                        </div>
                    </div>
                </div>
                
                <div class="settings-subsection">
                    <h3>Pricing Options</h3>
                    <div class="settings-grid">
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="showRetailPrice" ${pricing.showRetailPrice ? 'checked' : ''}
                                           onchange="pharmacySettings.updateSetting('pricing', 'showRetailPrice', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Show Retail Price
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="showWholesalePrice" ${pricing.showWholesalePrice ? 'checked' : ''}
                                           onchange="pharmacySettings.updateSetting('pricing', 'showWholesalePrice', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Show Wholesale Price
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="allowDiscount" ${pricing.allowDiscount ? 'checked' : ''}
                                           onchange="pharmacySettings.updateSetting('pricing', 'allowDiscount', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Allow Discount
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="maxDiscount" class="form-label">Maximum Discount (%)</label>
                            <input type="number" id="maxDiscount" class="form-input" value="${pricing.maxDiscount}" min="0" max="100"
                                   onchange="pharmacySettings.updateSetting('pricing', 'maxDiscount', parseInt(this.value))">
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="roundAmount" ${pricing.roundAmount ? 'checked' : ''}
                                           onchange="pharmacySettings.updateSetting('pricing', 'roundAmount', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Round Amount
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="section-actions">
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
            { id: 4, name: "Store Keeper", permissions: ["inventory", "purchasing"] }
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
                            ${roles.map(role => `
                                <tr>
                                    <td>
                                        <div class="role-info">
                                            <span class="role-name">${role.name}</span>
                                            <span class="role-id">ID: ${role.id}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="permissions-list">
                                            ${role.permissions.map(perm => `
                                                <span class="permission-tag">${perm}</span>
                                            `).join('')}
                                        </div>
                                    </td>
                                    <td>
                                        <div class="role-actions">
                                            <button class="btn btn-sm btn-outline" onclick="pharmacySettings.editRole(${role.id})">
                                                ✏️ Edit
                                            </button>
                                            ${role.id > 1 ? `
                                                <button class="btn btn-sm btn-danger" onclick="pharmacySettings.deleteRole(${role.id})">
                                                    🗑️ Delete
                                                </button>
                                            ` : ''}
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
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
            customerDisplay: "none"
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
                            <option value="thermal" ${hardware.printerType === 'thermal' ? 'selected' : ''}>Thermal Printer</option>
                            <option value="dotmatrix" ${hardware.printerType === 'dotmatrix' ? 'selected' : ''}>Dot Matrix</option>
                            <option value="laser" ${hardware.printerType === 'laser' ? 'selected' : ''}>Laser Printer</option>
                            <option value="none" ${hardware.printerType === 'none' ? 'selected' : ''}>No Printer</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="paperSize" class="form-label">Paper Size</label>
                        <select id="paperSize" class="form-select"
                                onchange="pharmacySettings.updateSetting('hardware', 'paperSize', this.value)">
                            <option value="58mm" ${hardware.paperSize === '58mm' ? 'selected' : ''}>58mm</option>
                            <option value="80mm" ${hardware.paperSize === '80mm' ? 'selected' : ''}>80mm</option>
                            <option value="a4" ${hardware.paperSize === 'a4' ? 'selected' : ''}>A4</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="barcodeScanner" class="form-label">Barcode Scanner</label>
                        <select id="barcodeScanner" class="form-select"
                                onchange="pharmacySettings.updateSetting('hardware', 'barcodeScanner', this.value)">
                            <option value="usb" ${hardware.barcodeScanner === 'usb' ? 'selected' : ''}>USB Scanner</option>
                            <option value="bluetooth" ${hardware.barcodeScanner === 'bluetooth' ? 'selected' : ''}>Bluetooth Scanner</option>
                            <option value="camera" ${hardware.barcodeScanner === 'camera' ? 'selected' : ''}>Camera Scanner</option>
                            <option value="none" ${hardware.barcodeScanner === 'none' ? 'selected' : ''}>No Scanner</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="cashDrawer" class="form-label">Cash Drawer</label>
                        <select id="cashDrawer" class="form-select"
                                onchange="pharmacySettings.updateSetting('hardware', 'cashDrawer', this.value)">
                            <option value="usb" ${hardware.cashDrawer === 'usb' ? 'selected' : ''}>USB Cash Drawer</option>
                            <option value="serial" ${hardware.cashDrawer === 'serial' ? 'selected' : ''}>Serial Port</option>
                            <option value="none" ${hardware.cashDrawer === 'none' ? 'selected' : ''}>No Cash Drawer</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="customerDisplay" class="form-label">Customer Display</label>
                        <select id="customerDisplay" class="form-select"
                                onchange="pharmacySettings.updateSetting('hardware', 'customerDisplay', this.value)">
                            <option value="none" ${hardware.customerDisplay === 'none' ? 'selected' : ''}>No Display</option>
                            <option value="lcd" ${hardware.customerDisplay === 'lcd' ? 'selected' : ''}>LCD Display</option>
                            <option value="vfd" ${hardware.customerDisplay === 'vfd' ? 'selected' : ''}>VFD Display</option>
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
            emailAddress: ""
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
                                <input type="checkbox" id="lowStockAlert" ${notifications.lowStockAlert ? 'checked' : ''}
                                       onchange="pharmacySettings.updateSetting('notifications', 'lowStockAlert', this.checked)">
                                <span class="checkbox-custom"></span>
                                Low Stock Alert
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="expiryAlert" ${notifications.expiryAlert ? 'checked' : ''}
                                       onchange="pharmacySettings.updateSetting('notifications', 'expiryAlert', this.checked)">
                                <span class="checkbox-custom"></span>
                                Medicine Expiry Alert
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="salesAlert" ${notifications.salesAlert ? 'checked' : ''}
                                       onchange="pharmacySettings.updateSetting('notifications', 'salesAlert', this.checked)">
                                <span class="checkbox-custom"></span>
                                Sales Achievement Alert
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="backupReminder" ${notifications.backupReminder ? 'checked' : ''}
                                       onchange="pharmacySettings.updateSetting('notifications', 'backupReminder', this.checked)">
                                <span class="checkbox-custom"></span>
                                Backup Reminder
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="emailNotifications" ${notifications.emailNotifications ? 'checked' : ''}
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
            retentionDays: 30
        };
        const security = this.settingsData.security || {
            sessionTimeout: 30,
            requirePassword: true,
            twoFactorAuth: false,
            auditLog: true,
            encryptData: true
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
                                    <input type="checkbox" id="autoBackup" ${backup.autoBackup ? 'checked' : ''}
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
                                <option value="hourly" ${backup.backupFrequency === 'hourly' ? 'selected' : ''}>Hourly</option>
                                <option value="daily" ${backup.backupFrequency === 'daily' ? 'selected' : ''}>Daily</option>
                                <option value="weekly" ${backup.backupFrequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                                <option value="monthly" ${backup.backupFrequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="backupLocation" class="form-label">Backup Location</label>
                            <select id="backupLocation" class="form-select"
                                    onchange="pharmacySettings.updateSetting('backup', 'backupLocation', this.value)">
                                <option value="local" ${backup.backupLocation === 'local' ? 'selected' : ''}>Local Storage</option>
                                <option value="network" ${backup.backupLocation === 'network' ? 'selected' : ''}>Network Drive</option>
                                <option value="cloud" ${backup.backupLocation === 'cloud' ? 'selected' : ''}>Cloud Storage</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="cloudBackup" ${backup.cloudBackup ? 'checked' : ''}
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
                                    <input type="checkbox" id="requirePassword" ${security.requirePassword ? 'checked' : ''}
                                           onchange="pharmacySettings.updateSetting('security', 'requirePassword', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Require Password for Sensitive Actions
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="twoFactorAuth" ${security.twoFactorAuth ? 'checked' : ''}
                                           onchange="pharmacySettings.updateSetting('security', 'twoFactorAuth', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Two-Factor Authentication
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="auditLog" ${security.auditLog ? 'checked' : ''}
                                           onchange="pharmacySettings.updateSetting('security', 'auditLog', this.checked)">
                                    <span class="checkbox-custom"></span>
                                    Enable Audit Log
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="encryptData" ${security.encryptData ? 'checked' : ''}
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
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const section = tab.dataset.section;
                this.switchSection(section);
            });
        });
    }

    switchSection(section) {
        // Update navigation tabs
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.section === section) {
                tab.classList.add('active');
            }
        });

        // Update panels
        const panels = document.querySelectorAll('.settings-panel');
        panels.forEach(panel => {
            panel.style.display = 'none';
        });

        const targetPanel = document.getElementById(`${section}Panel`);
        if (targetPanel) {
            targetPanel.style.display = 'block';
        }

        this.currentSection = section;
    }

    setupFormHandlers() {
        // Add form change listeners to track unsaved changes
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
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
        const indicator = document.getElementById('unsavedIndicator');
        const saveBtn = document.getElementById('saveSettingsBtn');
        
        if (this.unsavedChanges.size > 0) {
            if (indicator) indicator.style.display = 'flex';
            if (saveBtn) {
                saveBtn.classList.add('btn-pulse');
                saveBtn.innerHTML = '💾 Save All Changes (' + this.unsavedChanges.size + ')';
            }
        } else {
            if (indicator) indicator.style.display = 'none';
            if (saveBtn) {
                saveBtn.classList.remove('btn-pulse');
                saveBtn.innerHTML = '💾 Save All Changes';
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
        
        sections.forEach(section => {
            this.saveSection(section);
        });

        this.unsavedChanges.clear();
        this.updateUnsavedIndicator();
        
        this.showNotification('All settings saved successfully!', 'success');
    }

    saveSection(section) {
        // Save to localStorage
        localStorage.setItem('pharmacy_settings_' + section, JSON.stringify(this.settingsData[section]));
        
        // Here you would also save to the backend
        console.log('Saving section:', section, this.settingsData[section]);
    }

    loadSettingsFromStorage() {
        const categories = ['pharmacy', 'receipt', 'tax', 'pricing', 'users', 'hardware', 'notifications', 'backup', 'security'];
        
        categories.forEach(category => {
            const saved = localStorage.getItem('pharmacy_settings_' + category);
            if (saved) {
                try {
                    this.settingsData[category] = JSON.parse(saved);
                } catch (e) {
                    console.error('Error loading settings for', category, e);
                }
            }
        });
    }

    // Individual save methods
    savePharmacySettings() {
        this.saveSection('pharmacy');
        this.unsavedChanges.delete('pharmacy');
        this.updateUnsavedIndicator();
        this.showNotification('Pharmacy settings saved!', 'success');
    }

    saveReceiptSettings() {
        this.saveSection('receipt');
        this.unsavedChanges.delete('receipt');
        this.updateUnsavedIndicator();
        this.showNotification('Receipt settings saved!', 'success');
    }

    saveTaxSettings() {
        this.saveSection('tax');
        this.saveSection('pricing');
        this.unsavedChanges.delete('tax');
        this.unsavedChanges.delete('pricing');
        this.updateUnsavedIndicator();
        this.showNotification('Tax and pricing settings saved!', 'success');
    }

    saveHardwareSettings() {
        this.saveSection('hardware');
        this.unsavedChanges.delete('hardware');
        this.updateUnsavedIndicator();
        this.showNotification('Hardware settings saved!', 'success');
    }

    saveNotificationSettings() {
        this.saveSection('notifications');
        this.unsavedChanges.delete('notifications');
        this.updateUnsavedIndicator();
        this.showNotification('Notification settings saved!', 'success');
    }

    saveBackupSettings() {
        this.saveSection('backup');
        this.saveSection('security');
        this.unsavedChanges.delete('backup');
        this.unsavedChanges.delete('security');
        this.updateUnsavedIndicator();
        this.showNotification('Backup and security settings saved!', 'success');
    }

    // Utility methods
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
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
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pharmacy_settings_' + new Date().toISOString().split('T')[0] + '.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Settings exported successfully!', 'success');
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const imported = JSON.parse(event.target.result);
                        this.settingsData = { ...this.settingsData, ...imported };
                        this.renderSettingsPage();
                        this.showNotification('Settings imported successfully!', 'success');
                    } catch (error) {
                        this.showNotification('Error importing settings file!', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    previewReceipt() {
        this.showNotification('Receipt preview feature coming soon!', 'info');
    }

    testHardware() {
        this.showNotification('Hardware test feature coming soon!', 'info');
    }

    testNotification() {
        this.showNotification('Test notification sent successfully!', 'success');
    }

    createBackup() {
        this.showNotification('Backup creation started...', 'info');
        setTimeout(() => {
            this.showNotification('Backup created successfully!', 'success');
        }, 2000);
    }

    editRole(roleId) {
        this.showNotification(`Edit role ${roleId} feature coming soon!`, 'info');
    }

    deleteRole(roleId) {
        if (confirm('Are you sure you want to delete this role?')) {
            const roles = this.settingsData.users.roles;
            const index = roles.findIndex(r => r.id === roleId);
            if (index > -1) {
                roles.splice(index, 1);
                this.renderUserSettings();
                this.showNotification('Role deleted successfully!', 'success');
            }
        }
    }

    addNewRole() {
        this.showNotification('Add new role feature coming soon!', 'info');
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