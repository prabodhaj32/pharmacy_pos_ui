# models/sale.py
from odoo import models, fields

class PharmacySale(models.Model):
    _name = 'pharmacy.sale'
    _description = 'Pharmacy Sale Receipt'
    _order = 'sale_date desc'

    name = fields.Char(string='Receipt Number', required=True, readonly=True, default=lambda self: self.env['ir.sequence'].next_by_code('pharmacy.sale') or '/')
    
    sale_date = fields.Datetime(default=fields.Datetime.now, string="Sale Date")
    cashier_id = fields.Many2one('res.users', default=lambda self: self.env.user)
    shift = fields.Char(string="Shift")

    customer_id = fields.Many2one('pharmacy.customer', string="Customer")
    is_walk_in = fields.Boolean(default=True)
    bill_name = fields.Char(string="Bill Name")

    total_amount = fields.Float(digits=(16, 2))
    amount_paid = fields.Float(digits=(16, 2))
    payment_method = fields.Selection([
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('credit', 'Credit')
    ], default='cash')

    state = fields.Selection([('held', 'Held'), ('done', 'Done'), ('returned', 'Returned')], default='done')

    sale_line_ids = fields.One2many('pharmacy.sale.line', 'sale_id', string="Items")

class PharmacySaleLine(models.Model):
    _name = 'pharmacy.sale.line'
    _description = 'Sale Line'

    sale_id = fields.Many2one('pharmacy.sale', ondelete='cascade')
    product_name = fields.Char()
    quantity = fields.Float()
    unit_price = fields.Float()
    total = fields.Float()
    batch = fields.Char()
    expiry = fields.Char()