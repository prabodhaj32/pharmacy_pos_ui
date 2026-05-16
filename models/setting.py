# models/setting.py
from odoo import models, fields, api
import json

class PharmacySetting(models.Model):
    _name = 'pharmacy.setting'
    _description = 'Pharmacy System Settings'
    _rec_name = 'key'

    key = fields.Char(string='Setting Key', required=True, index=True)
    value = fields.Text(string='Value (JSON)')
    description = fields.Char(string='Description')
    category = fields.Selection([
        ('pharmacy', 'Pharmacy Info'),
        ('receipt', 'Receipt'),
        ('tax', 'Tax & Pricing'),
        ('pricing', 'Pricing Strategy'),
        ('users', 'User Roles'),
        ('hardware', 'Hardware'),
        ('notifications', 'Notifications'),
        ('backup', 'Backup'),
        ('security', 'Security'),
    ], string='Category', default='pharmacy')

    _sql_constraints = [
        ('key_uniq', 'unique(key)', 'Setting key must be unique!')
    ]

    @api.model
    def set_setting(self, key, value, category='general', description=''):
        """Save or update a setting"""
        setting = self.search([('key', '=', key)], limit=1)
        val = json.dumps(value) if isinstance(value, (dict, list)) else str(value)
        
        if setting:
            setting.write({
                'value': val,
                'category': category,
                'description': description
            })
        else:
            self.create({
                'key': key,
                'value': val,
                'category': category,
                'description': description
            })
        return True

    @api.model
    def get_setting(self, key, default=None):
        """Get setting value"""
        setting = self.search([('key', '=', key)], limit=1)
        if setting:
            try:
                return json.loads(setting.value)
            except:
                return setting.value
        return default

    @api.model
    def get_all_settings(self):
        """Get all settings grouped by category"""
        settings = self.search([])
        result = {}
        for s in settings:
            try:
                value = json.loads(s.value)
            except:
                value = s.value
            result[s.key] = value
        return result