# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request


class PharmacyInventoryController(http.Controller):

    # =========================
    # TEST ROUTE
    # =========================
    @http.route('/test_inventory', type='http', auth='public', website=False, csrf=False)
    def test_inventory(self):
        return "WORKING OK ✅"

    # =========================
    # LIST INVENTORY
    # =========================
    @http.route('/pharmacy/inventory/list', type='json', auth='user', csrf=False)
    def get_inventory(self, **kwargs):
        try:
            records = request.env['pharmacy.inventory'].sudo().search([])

            data = records.read([
                'id',
                'name',
                'generic',
                'barcode',
                'category',
                'batch',
                'expiry_date',
                'stock',
                'cost',
                'price',
                'rx_only',
                'controlled'
            ])

            return data if isinstance(data, list) else []

        except Exception as e:
            return {"error": str(e)}

    # =========================
    # CREATE INVENTORY
    # =========================
    @http.route('/pharmacy/inventory/create', type='json', auth='user', csrf=False)
    def create_inventory(self, **kwargs):
        try:
            data = kwargs.get('data') or {}

            if not data:
                return {"success": False, "error": "No data received"}

            record = request.env['pharmacy.inventory'].sudo().create({
                'name': data.get('name'),
                'generic': data.get('generic'),
                'barcode': data.get('barcode'),
                'category': data.get('category'),
                'batch': data.get('batch'),
                'expiry_date': data.get('expiry_date'),
                'stock': int(data.get('stock') or 0),
                'cost': float(data.get('cost') or 0),
                'price': float(data.get('price') or 0),
                'rx_only': bool(data.get('rx_only')),
                'controlled': bool(data.get('controlled')),
            })

            return {"success": True, "id": record.id}

        except Exception as e:
            return {"success": False, "error": str(e)}

    # =========================
    # UPDATE STOCK
    # =========================
    @http.route('/pharmacy/inventory/update_stock', type='json', auth='user', csrf=False)
    def update_stock(self, **kwargs):
        try:
            item_id = int(kwargs.get('item_id') or 0)
            quantity = int(kwargs.get('quantity') or 0)
            operation = kwargs.get('operation')

            if not item_id:
                return {'success': False, 'error': 'Invalid item ID'}

            record = request.env['pharmacy.inventory'].sudo().browse(item_id)

            if not record.exists():
                return {'success': False, 'error': 'Item not found'}

            if operation == "add":
                record.stock += quantity
            elif operation == "subtract":
                record.stock = max(0, record.stock - quantity)
            elif operation == "set":
                record.stock = quantity
            else:
                return {'success': False, 'error': 'Invalid operation'}

            return {'success': True, 'stock': record.stock}

        except Exception as e:
            return {'success': False, 'error': str(e)}

    # =========================
    # DELETE INVENTORY
    # =========================
    @http.route('/pharmacy/inventory/delete', type='json', auth='user', csrf=False)
    def delete_item(self, **kwargs):
        try:
            item_id = int(kwargs.get('item_id') or 0)

            if not item_id:
                return {'success': False, 'error': 'Invalid item ID'}

            record = request.env['pharmacy.inventory'].sudo().browse(item_id)

            if not record.exists():
                return {'success': False, 'error': 'Item not found'}

            record.unlink()

            return {'success': True}

        except Exception as e:
            return {'success': False, 'error': str(e)}