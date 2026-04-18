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
        permissions: ["all"],
      },
      pharm1: {
        password: "123",
        role: "Pharmacist",
        name: "John Pharmacist",
        permissions: ["sales", "inventory", "prescriptions"],
      },
      cashier1: {
        password: "123",
        role: "Cashier",
        name: "Sarah Cashier",
        permissions: ["sales"],
      },
      store1: {
        password: "123",
        role: "Storekeeper",
        name: "Mike Storekeeper",
        permissions: ["inventory", "purchasing"],
      },
      manager1: {
        password: "123",
        role: "Manager",
        name: "Alex Manager",
        permissions: ["reports", "approvals"],
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

    // Store session data in localStorage
    localStorage.setItem("pharmacy_active_cashier_id", this.state.cashierId);
    localStorage.setItem("pharmacy_active_cashier_name", user.name);
    localStorage.setItem("pharmacy_active_role", user.role);
    localStorage.setItem(
      "pharmacy_active_permissions",
      JSON.stringify(user.permissions),
    );
    localStorage.setItem("pharmacy_active_shift", this.isCashierSelected ? this.state.shift : "N/A");
    localStorage.setItem("pharmacy_opening_cash", this.isCashierSelected ? this.state.openingCash : "0");
    localStorage.setItem("pharmacy_session_start", new Date().toISOString());
  }
}

PharmacyLogin.template = "pharmacy_root_layout";
PharmacyLogin.components = { PharmacyDashboard };

registry.category("actions").add("pharmacy_dashboard_action", PharmacyLogin);
