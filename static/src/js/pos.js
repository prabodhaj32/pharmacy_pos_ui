/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component, onMounted } from "@odoo/owl";

class PharmacyPOS extends Component {

    setup() {
        onMounted(() => {
            this.cart = [];
            this.total = 0;

            this.initializeProducts();
            this.initializePayment();
            this.initializeNewSale();
        });
    }

    // 🛒 PRODUCT CLICK HANDLER
    initializeProducts() {
        const products = document.querySelectorAll(".product-card");
        const cartItems = document.getElementById("cart_items");
        const cartTotal = document.getElementById("cart_total");

        products.forEach(product => {
            product.addEventListener("click", () => {

                const name = product.dataset.name;
                const price = parseFloat(product.dataset.price);

                // add to cart
                this.cart.push({ name, price });
                this.total += price;

                // UI update
                const li = document.createElement("li");
                li.textContent = `${name} - LKR ${price}`;
                cartItems.appendChild(li);

                cartTotal.textContent = `LKR ${this.total.toLocaleString()}`;
            });
        });
    }

    // 💳 PAYMENT
    initializePayment() {
        const payBtn = document.querySelector(".pay-btn");

        if (payBtn) {
            payBtn.addEventListener("click", () => {
                if (this.cart.length === 0) {
                    alert("Cart is empty!");
                    return;
                }

                alert(`Payment Successful! Total: LKR ${this.total}`);

                // reset
                this.cart = [];
                this.total = 0;

                document.getElementById("cart_items").innerHTML = "";
                document.getElementById("cart_total").textContent = "LKR 0";
            });
        }
    }

    // 🆕 NEW SALE
    initializeNewSale() {
        const newSaleBtn = document.querySelector(".new-sale-btn");

        if (newSaleBtn) {
            newSaleBtn.addEventListener("click", () => {
                this.cart = [];
                this.total = 0;

                document.getElementById("cart_items").innerHTML = "";
                document.getElementById("cart_total").textContent = "LKR 0";
            });
        }
    }
}

// Register POS action in Odoo
PharmacyPOS.template = "pharmacy_pos_layout";

registry.category("actions").add("pharmacy_pos_action", PharmacyPOS);