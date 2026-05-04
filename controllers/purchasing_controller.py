# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
import json

class PharmacyPurchasingController(http.Controller):

    @http.route('/pharmacy_pos/get_purchasing_data', type='json', auth='user')
    def get_purchasing_data(self):
        try:
            suppliers = request.env['pharmacy.supplier'].sudo().search([])
            orders = request.env['pharmacy.purchase.order'].sudo().search([])
            grns = request.env['pharmacy.grn'].sudo().search([])

            suppliers_data = suppliers.read(['id', 'name', 'email', 'phone', 'address', 'status', 'created_at'])
            for s in suppliers_data:
                s['createdAt'] = s.pop('created_at') # Map to JS name

            orders_data = []
            for o in orders:
                orders_data.append({
                    'id': o.id,
                    'orderNumber': o.name,
                    'supplierId': o.supplier_id.id,
                    'supplierName': o.supplier_id.name,
                    'orderDate': o.order_date,
                    'expectedDeliveryDate': o.expected_delivery_date,
                    'totalAmount': o.total_amount,
                    'status': o.status,
                    'items': [{
                        'id': line.id,
                        'name': line.product_name,
                        'quantity': line.quantity,
                        'unitCost': line.unit_cost,
                        'total': line.price_subtotal
                    } for line in o.order_line_ids]
                })

            grns_data = []
            for g in grns:
                grns_data.append({
                    'id': g.id,
                    'grnNumber': g.name,
                    'orderNumber': g.order_id.name,
                    'supplierName': g.supplier_id.name,
                    'receivedDate': g.received_date,
                    'totalAmount': g.total_amount,
                    'items': [{
                        'name': line.product_name,
                        'quantity': line.quantity,
                        'unitCost': line.unit_cost,
                        'total': line.price_subtotal
                    } for line in g.order_id.order_line_ids]
                })

            return {
                'suppliers': suppliers_data,
                'orders': orders_data,
                'grns': grns_data
            }
        except Exception as e:
            return {'error': str(e)}

    @http.route('/pharmacy_pos/save_supplier', type='json', auth='user')
    def save_supplier(self, **data):
        try:
            if 'data' in data: data = data['data']
            vals = {
                'name': data.get('name'),
                'email': data.get('email'),
                'phone': data.get('phone'),
                'address': data.get('address'),
                'status': data.get('status', 'active')
            }
            if data.get('id'):
                supplier = request.env['pharmacy.supplier'].sudo().browse(int(data['id']))
                supplier.write(vals)
                return {'success': True, 'id': supplier.id}
            else:
                supplier = request.env['pharmacy.supplier'].sudo().create(vals)
                return {'success': True, 'id': supplier.id}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/pharmacy_pos/create_purchase_order', type='json', auth='user')
    def create_purchase_order(self, **data):
        try:
            if 'data' in data: data = data['data']
            po_vals = {
                'name': data.get('orderNumber'),
                'supplier_id': int(data.get('supplierId')),
                'expected_delivery_date': data.get('expectedDeliveryDate'),
                'total_amount': float(data.get('totalAmount', 0)),
                'status': 'pending'
            }
            po = request.env['pharmacy.purchase.order'].sudo().create(po_vals)
            for item in data.get('items', []):
                request.env['pharmacy.purchase.order.line'].sudo().create({
                    'order_id': po.id,
                    'product_name': item.get('name'),
                    'quantity': float(item.get('quantity', 1)),
                    'unit_cost': float(item.get('unitCost', 0))
                })
            return {'success': True, 'id': po.id}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/pharmacy_pos/process_grn', type='json', auth='user')
    def process_grn(self, **data):
        try:
            if 'data' in data: data = data['data']
            order = request.env['pharmacy.purchase.order'].sudo().browse(int(data.get('orderId')))
            if not order.exists(): return {'success': False, 'error': 'Order not found'}
            
            # Create GRN record
            grn = request.env['pharmacy.grn'].sudo().create({
                'name': f"GRN-{order.name.split('-')[-1]}",
                'order_id': order.id,
                'supplier_id': order.supplier_id.id,
                'total_amount': order.total_amount
            })
            
            # Mark order as received
            order.status = 'received'
            
            # Optionally update stock (inventory.py might handle this, but for now we just record the GRN)
            # if request.env['pharmacy.inventory'].sudo(): ...
            
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/pharmacy_pos/delete_purchase_order', type='json', auth='user')
    def delete_purchase_order(self, **data):
        try:
            if 'data' in data: data = data['data']
            order_id = int(data.get('id'))
            order = request.env['pharmacy.purchase.order'].sudo().browse(order_id)
            if order.exists():
                order.unlink()
                return {'success': True}
            return {'success': False, 'error': 'Order not found'}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/pharmacy_pos/delete_supplier', type='json', auth='user')
    def delete_supplier(self, **data):
        try:
            if 'data' in data: data = data['data']
            supplier_id = int(data.get('id'))
            supplier = request.env['pharmacy.supplier'].sudo().browse(supplier_id)
            if supplier.exists():
                supplier.unlink()
                return {'success': True}
            return {'success': False, 'error': 'Supplier not found'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
