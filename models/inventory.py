# -*- coding: utf-8 -*-
from odoo import models, fields

class PharmacyInventory(models.Model):
    _name = 'pharmacy.inventory'
    _description = 'Pharmacy Inventory'

    name = fields.Char(required=True)
    generic = fields.Char()
    barcode = fields.Char()
    category = fields.Char()
    batch = fields.Char()
    expiry_date = fields.Date()

    stock = fields.Integer(default=0)
    cost = fields.Float()
    price = fields.Float()

    rx_only = fields.Boolean(default=False)
    controlled = fields.Boolean(default=False)