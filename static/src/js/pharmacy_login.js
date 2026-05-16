/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component, useState } from "@odoo/owl";
import { PharmacyDashboard } from "@pharmacy_pos_ui/js/dashboard";

export class PharmacyLogin extends Component {
  setup() {
    this.state = useState({
      isAuthenticated: false,
      cashierId: "",
      cashierName: "",
      role: "",
      password: "",
      shift: "Morning",
      openingCash: "",
      error: false,
      errorMessage: "",
    });

    // Default users for each role
    this.USER_DB = {
      admin: {
        password: "123",
        role: "Administrator",
        name: "Admin User",
        permissions: [
          "All modules",
          "User management",
          "System settings",
          "Reports",
          "Audit logs",
          "Price management"
        ],
      },
      pharm1: {
        password: "123",
        role: "Pharmacist",
        name: "John Pharmacist",
        permissions: [
          "Inventory view",
          "Medicine safety check",
          "Prescriptions",
          "Dispensing"
        ],
      },
      cashier1: {
        password: "123",
        role: "Cashier",
        name: "Sarah Cashier",
        permissions: [
          "Sales (POS)",
          "Customer lookup",
          "Hold/resume bills",
          "End of day report"
        ],
      },
      store1: {
        password: "123",
        role: "Storekeeper",
        name: "Mike Storekeeper",
        permissions: [
          "Inventory management",
          "GRN entry",
          "Purchase orders",
          "Stock adjustments",
          "Supplier management"
        ],
      },
      manager1: {
        password: "123",
        role: "Manager",
        name: "Alex Manager",
        permissions: [
          "All reports",
          "Sales reports",
          "Inventory reports",
          "Staff oversight",
          "Void approvals",
          "Refund approval"
        ],
      },
    };

    // Expose a global method...
    window.pharmacyLogout = () => {
      this.state.isAuthenticated = false;
      this.state.cashierId = "";
      this.state.cashierName = "";
      this.state.role = "";
      this.state.password = "";
      this.state.shift = "Morning";
      this.state.openingCash = "";
      this.state.error = false;

      // Clear all session data
      localStorage.removeItem("pharmacy_active_cashier_id");
      localStorage.removeItem("pharmacy_active_cashier_name");
      localStorage.removeItem("pharmacy_active_role");
      localStorage.removeItem("pharmacy_active_permissions");
      localStorage.removeItem("pharmacy_active_shift");
      localStorage.removeItem("pharmacy_opening_cash");
      localStorage.removeItem("pharmacy_session_start");
    };
  }

  get isCashierSelected() {
    if (!this.state.cashierId) return false;
    const user = this.USER_DB[this.state.cashierId];
    return user && user.role === "Cashier";
  }

  handleLogin(e) {
    e.preventDefault();
    this.state.error = false;
    this.state.errorMessage = "";

    const user = this.USER_DB[this.state.cashierId];

    if (!user) {
      this.state.error = true;
      this.state.errorMessage = "Invalid User ID.";
      return;
    }

    if (this.state.password !== user.password) {
      this.state.error = true;
      this.state.errorMessage = "Invalid Password.";
      return;
    }

    // Only validate shift and opening cash for Cashiers
    if (this.isCashierSelected) {
      if (
        this.state.openingCash === "" ||
        parseFloat(this.state.openingCash) < 0
      ) {
        this.state.error = true;
        this.state.errorMessage = "Invalid Opening Cash amount.";
        return;
      }
    }

    // Successfully logged in or started shift
    this.state.isAuthenticated = true;
    this.state.role = user.role;
    this.state.cashierName = user.name;

    // Dynamically fetch updated permissions from settings
    let activePermissions = user.permissions;
    const savedUsersRaw = localStorage.getItem("pharmacy_settings_users");
    if (savedUsersRaw) {
      try {
        const savedUsers = JSON.parse(savedUsersRaw);
        if (savedUsers && savedUsers.roles) {
          const roleData = savedUsers.roles.find(r => r.name === user.role);
          if (roleData) {
            activePermissions = roleData.permissions;
          }
        }
      } catch (err) {
        console.error("Error reading updated permissions", err);
      }
    }

    // Store session data in localStorage
    localStorage.setItem("pharmacy_active_cashier_id", this.state.cashierId);
    localStorage.setItem("pharmacy_active_cashier_name", user.name);
    localStorage.setItem("pharmacy_active_role", user.role);
    localStorage.setItem(
      "pharmacy_active_permissions",
      JSON.stringify(activePermissions),
    );
    localStorage.setItem(
      "pharmacy_active_shift",
      this.isCashierSelected ? this.state.shift : "N/A",
    );
    localStorage.setItem(
      "pharmacy_opening_cash",
      this.isCashierSelected ? this.state.openingCash : "0",
    );
    localStorage.setItem("pharmacy_session_start", new Date().toISOString());
  }
}

PharmacyLogin.template = "pharmacy_root_layout";
PharmacyLogin.components = { PharmacyDashboard };

registry.category("actions").add("pharmacy_dashboard_action", PharmacyLogin);
