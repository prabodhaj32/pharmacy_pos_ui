# -*- coding: utf-8 -*-
from odoo import models, fields, api

class PharmacySupplier(models.Model):
    _name = 'pharmacy.supplier'
    _description = 'Pharmacy Supplier'

    name = fields.Char(required=True)
    email = fields.Char()
    phone = fields.Char(required=True)
    address = fields.Text()
    status = fields.Selection([
        ('active', 'Active'),
        ('inactive', 'Inactive')
    ], default='active')
    created_at = fields.Datetime(default=fields.Datetime.now)

class PharmacyPurchaseOrder(models.Model):
    _name = 'pharmacy.purchase.order'
    _description = 'Pharmacy Purchase Order'

    name = fields.Char(required=True, string='Order Number')
    supplier_id = fields.Many2one('pharmacy.supplier', required=True, ondelete='cascade')
    order_date = fields.Datetime(default=fields.Datetime.now)
    expected_delivery_date = fields.Date()
    total_amount = fields.Float()
    status = fields.Selection([
        ('pending', 'Pending'),
        ('received', 'Received'),
        ('cancelled', 'Cancelled')
    ], default='pending')
    order_line_ids = fields.One2many('pharmacy.purchase.order.line', 'order_id')

class PharmacyPurchaseOrderLine(models.Model):
    _name = 'pharmacy.purchase.order.line'
    _description = 'Pharmacy Purchase Order Line'

    order_id = fields.Many2one('pharmacy.purchase.order', ondelete='cascade')
    product_name = fields.Char(required=True)
    quantity = fields.Float(default=1.0)
    unit_cost = fields.Float()
    price_subtotal = fields.Float(compute='_compute_subtotal', store=True)

    @api.depends('quantity', 'unit_cost')
    def _compute_subtotal(self):
        for line in self:
            line.price_subtotal = line.quantity * line.unit_cost

class PharmacyGRN(models.Model):
    _name = 'pharmacy.grn'
    _description = 'Goods Received Note'

    name = fields.Char(required=True, string='GRN Number')
    order_id = fields.Many2one('pharmacy.purchase.order')
    supplier_id = fields.Many2one('pharmacy.supplier', ondelete='cascade')
    received_date = fields.Datetime(default=fields.Datetime.now)
    total_amount = fields.Float()
