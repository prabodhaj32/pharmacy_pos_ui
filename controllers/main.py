# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request, content_type
import json

class PharmacyCustomersController(http.Controller):
    
    @http.route('/pharmacy_pos_ui/customers', type='http', auth='user', website=True)
    def customers_page(self, **kwargs):
        """Render the customers page"""
        return request.render('pharmacy_pos_ui.customers_template', {
            'page_title': 'Customers Management',
        })

    @http.route('/pharmacy_pos_ui/api/customers', type='json', auth='user', methods=['GET', 'POST'])
    def customers_api(self, **kwargs):
        """API endpoint for customers CRUD operations"""
        if request.httprequest.method == 'GET':
            # Get customers
            customers = self._get_customers()
            return {'status': 'success', 'data': customers}
        
        elif request.httprequest.method == 'POST':
            # Create new customer
            data = json.loads(request.httprequest.data.decode('utf-8'))
            customer = self._create_customer(data)
            return {'status': 'success', 'data': customer}
    
    @http.route('/pharmacy_pos_ui/api/customers/<int:customer_id>', type='json', auth='user', methods=['GET', 'PUT', 'DELETE'])
    def customer_api(self, customer_id, **kwargs):
        """API endpoint for individual customer operations"""
        if request.httprequest.method == 'GET':
            customer = self._get_customer(customer_id)
            if customer:
                return {'status': 'success', 'data': customer}
            else:
                return {'status': 'error', 'message': 'Customer not found'}
        
        elif request.httprequest.method == 'PUT':
            # Update customer
            data = json.loads(request.httprequest.data.decode('utf-8'))
            customer = self._update_customer(customer_id, data)
            if customer:
                return {'status': 'success', 'data': customer}
            else:
                return {'status': 'error', 'message': 'Customer not found'}
        
        elif request.httprequest.method == 'DELETE':
            # Delete customer
            success = self._delete_customer(customer_id)
            if success:
                return {'status': 'success', 'message': 'Customer deleted successfully'}
            else:
                return {'status': 'error', 'message': 'Customer not found'}
    
    def _get_customers(self):
        """Get all customers (mock implementation)"""
        # In real implementation, this would query the database
        return [
            {
                'id': 1,
                'name': 'John Doe',
                'phone': '+94771234567',
                'email': 'john.doe@email.com',
                'address': '123 Main St, Colombo',
                'tier': 'Gold',
                'loyalty_points': 2500,
                'credit_used': 15000,
                'credit_limit': 50000,
                'member_since': 'Jan 2022',
                'total_purchases': 125000,
            },
            {
                'id': 2,
                'name': 'Jane Smith',
                'phone': '+94782345678',
                'email': 'jane.smith@email.com',
                'address': '456 Park Ave, Kandy',
                'tier': 'Platinum',
                'loyalty_points': 5200,
                'credit_used': 25000,
                'credit_limit': 100000,
                'member_since': 'Mar 2021',
                'total_purchases': 287000,
            },
        ]
    
    def _get_customer(self, customer_id):
        """Get a specific customer"""
        customers = self._get_customers()
        for customer in customers:
            if customer['id'] == customer_id:
                return customer
        return None
    
    def _create_customer(self, data):
        """Create a new customer"""
        # Mock implementation - in real app, save to database
        new_customer = {
            'id': 999,  # Mock ID
            'name': data.get('name', ''),
            'phone': data.get('phone', ''),
            'email': data.get('email', ''),
            'address': data.get('address', ''),
            'tier': data.get('tier', 'Bronze'),
            'loyalty_points': 0,
            'credit_used': 0,
            'credit_limit': data.get('credit_limit', 0),
            'member_since': 'Oct 2024',
            'total_purchases': 0,
        }
        return new_customer
    
    def _update_customer(self, customer_id, data):
        """Update an existing customer"""
        # Mock implementation - in real app, update database
        customer = self._get_customer(customer_id)
        if customer:
            customer.update(data)
            return customer
        return None
    
    def _delete_customer(self, customer_id):
        """Delete a customer"""
        # Mock implementation - in real app, delete from database
        customer = self._get_customer(customer_id)
        return customer is not None
