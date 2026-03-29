odoo.define('pharmacy_pos_ui.pos', function (require) {
'use strict';

var core = require('web.core');
var Widget = require('web.Widget');

var PharmacyPOS = Widget.extend({
    template: 'pharmacy_pos_template',
    
    init: function (parent, options) {
        this._super(parent, options);
        this.cart = [];
        this.total = 0;
    },
    
    start: function () {
        this._super();
        this.initializeProducts();
        this.initializePayment();
        this.initializeNewSale();
        return this;
    },

    initializeProducts: function () {
        var self = this;
        var products = document.querySelectorAll(".product-card");
        var cartItems = document.getElementById("cart_items");
        var cartTotal = document.getElementById("cart_total");

        products.forEach(function(product) {
            product.addEventListener("click", function() {
                var name = product.dataset.name;
                var price = parseFloat(product.dataset.price);

                // add to cart
                self.cart.push({ name: name, price: price });
                self.total += price;

                // UI update
                var li = document.createElement("li");
                li.textContent = name + " - LKR " + price;
                cartItems.appendChild(li);

                cartTotal.textContent = "LKR " + self.total.toLocaleString();
            });
        });
    },

    initializePayment: function () {
        var self = this;
        var payBtn = document.querySelector(".pay-btn");

        if (payBtn) {
            payBtn.addEventListener("click", function() {
                if (self.cart.length === 0) {
                    alert("Cart is empty!");
                    return;
                }

                alert("Payment Successful! Total: LKR " + self.total);

                // reset
                self.cart = [];
                self.total = 0;

                document.getElementById("cart_items").innerHTML = "";
                document.getElementById("cart_total").textContent = "LKR 0";
            });
        }
    },

    initializeNewSale: function () {
        var self = this;
        var newSaleBtn = document.querySelector(".new-sale-btn");

        if (newSaleBtn) {
            newSaleBtn.addEventListener("click", function() {
                self.cart = [];
                self.total = 0;

                document.getElementById("cart_items").innerHTML = "";
                document.getElementById("cart_total").textContent = "LKR 0";
            });
        }
    }
});

// Register the action
core.action_registry.add('action_pos', PharmacyPOS);

return {
    PharmacyPOS: PharmacyPOS
};

});
