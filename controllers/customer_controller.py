# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request

class PharmacyCustomerController(http.Controller):

    # ======================
    # LIST CUSTOMERS
    # ======================
    @http.route('/pharmacy/customers/list', type='json', auth='user', csrf=False)
    def list_customers(self):
        try:
            records = request.env['pharmacy.customer'].sudo().search([])
            return records.read([
                'id',
                'name',
                'phone',
                'email',
                'address',
                'tier',
                'loyalty_points',
                'credit_used',
                'credit_limit',
                'member_since',
                'total_purchases'
            ])
        except Exception as e:
            return {'error': str(e)}

    # ======================
    # CREATE CUSTOMER
    # ======================
    @http.route('/pharmacy/customers/create', type='json', auth='user', csrf=False)
    def create_customer(self, **data):
        try:
            # If wrapped in 'data' key (like inventory module), unwrap it
            if 'data' in data:
                data = data['data']
                
            record = request.env['pharmacy.customer'].sudo().create({
                'name': data.get('name'),
                'phone': data.get('phone'),
                'email': data.get('email'),
                'address': data.get('address'),
                'tier': data.get('tier'),
                'credit_limit': float(data.get('creditLimit') or 0),
                'member_since': data.get('memberSince'),
            })
            return {'success': True, 'id': record.id}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    # ======================
    # UPDATE CUSTOMER
    # ======================
    @http.route('/pharmacy/customers/update', type='json', auth='user', csrf=False)
    def update_customer(self, **data):
        try:
            if 'data' in data:
                data = data['data']
                
            record = request.env['pharmacy.customer'].sudo().browse(int(data.get('id')))
            if not record.exists():
                return {'success': False, 'error': 'Customer not found'}

            record.write({
                'name': data.get('name'),
                'phone': data.get('phone'),
                'email': data.get('email'),
                'address': data.get('address'),
                'tier': data.get('tier'),
                'credit_limit': float(data.get('creditLimit') or 0),
            })
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    # ======================
    # DELETE
    # ======================
    @http.route('/pharmacy/customers/delete', type='json', auth='user', csrf=False)
    def delete_customer(self, **kwargs):
        try:
            record = request.env['pharmacy.customer'].sudo().browse(int(kwargs.get('id')))
            if record.exists():
                record.unlink()
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}