# -*- coding: utf-8 -*-
from odoo import models, fields

class PharmacyCustomer(models.Model):
    _name = 'pharmacy.customer'
    _description = 'Pharmacy Customer'

    name = fields.Char(required=True)
    phone = fields.Char(required=True)
    email = fields.Char()
    address = fields.Char()

    tier = fields.Selection([
        ('Bronze', 'Bronze'),
        ('Silver', 'Silver'),
        ('Gold', 'Gold'),
        ('Platinum', 'Platinum'),
    ], default='Bronze')

    loyalty_points = fields.Integer(default=0)
    credit_used = fields.Float(default=0)
    credit_limit = fields.Float(default=0)

    member_since = fields.Char()
    total_purchases = fields.Float(default=0)