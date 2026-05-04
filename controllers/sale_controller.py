# controllers/sale_controller.py
from odoo import http, fields
from odoo.http import request

class PharmacySaleController(http.Controller):
    def _serialize_sale_items(self, sale):
        return [{
            'name': line.product_name,
            'quantity': line.quantity,
            'unitPrice': line.unit_price,
            'total': line.total,
            'batch': line.batch,
            'expiry': line.expiry,
        } for line in sale.sale_line_ids]

    @http.route('/pharmacy/sales/create', type='json', auth='user', methods=['POST'])
    def create_sale(self, **post):
        try:
            items = post.get('items', [])
            customer_id = post.get('customer_id')
            total_amount = float(post.get('total_amount', 0) or 0)
            amount_paid = float(post.get('amount_paid', 0) or 0)
            payment_method = post.get('payment_method', 'cash')

            sale_vals = {
                'sale_date': fields.Datetime.now(),
                'cashier_id': request.env.user.id,
                'shift': post.get('shift', 'Morning'),
                'total_amount': total_amount,
                'amount_paid': amount_paid,
                'payment_method': payment_method,
                'customer_id': customer_id if customer_id else False,
                'is_walk_in': not bool(customer_id),
                'state': 'done',
            }
            sale = request.env['pharmacy.sale'].sudo().create(sale_vals)

            for item in items:
                request.env['pharmacy.sale.line'].sudo().create({
                    'sale_id': sale.id,
                    'product_name': item.get('name'),
                    'quantity': float(item.get('quantity') or 0),
                    'unit_price': item.get('unitPrice') or item.get('price'),
                    'total': item.get('total'),
                    'batch': item.get('batch'),
                    'expiry': item.get('expiry'),
                })

            if customer_id:
                customer = request.env['pharmacy.customer'].sudo().browse(int(customer_id))
                if customer.exists():
                    customer.total_purchases = (customer.total_purchases or 0.0) + total_amount

            return {
                'success': True,
                'sale_id': sale.id,
                'receipt_number': sale.name,
                'sale_date': sale.sale_date,
                'cashier_name': sale.cashier_id.name,
                'message': 'Sale completed successfully'
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/pharmacy/sales/held/list', type='json', auth='user', methods=['POST'], csrf=False)
    def list_held_bills(self, **post):
        try:
            held_sales = request.env['pharmacy.sale'].sudo().search(
                [('state', '=', 'held')],
                order='sale_date desc'
            )
            result = []
            for sale in held_sales:
                result.append({
                    'id': sale.id,
                    'name': sale.bill_name or sale.name,
                    'customer': {
                        'id': sale.customer_id.id,
                        'name': sale.customer_id.name,
                        'isWalkIn': False,
                    } if sale.customer_id else {'name': 'Walk-in Customer', 'isWalkIn': True},
                    'items': self._serialize_sale_items(sale),
                    'total': sale.total_amount or 0.0,
                    'timestamp': sale.sale_date,
                    'displayTimestamp': fields.Datetime.to_string(sale.sale_date) if sale.sale_date else '',
                })
            return {'success': True, 'data': result}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/pharmacy/sales/held/create', type='json', auth='user', methods=['POST'], csrf=False)
    def create_held_bill(self, **post):
        try:
            items = post.get('items', [])
            customer_id = post.get('customer_id')
            total_amount = float(post.get('total_amount', 0) or 0)
            bill_name = (post.get('bill_name') or '').strip()

            held_sale = request.env['pharmacy.sale'].sudo().create({
                'sale_date': fields.Datetime.now(),
                'cashier_id': request.env.user.id,
                'shift': post.get('shift', 'Morning'),
                'bill_name': bill_name or False,
                'total_amount': total_amount,
                'amount_paid': 0.0,
                'payment_method': 'cash',
                'customer_id': customer_id if customer_id else False,
                'is_walk_in': not bool(customer_id),
                'state': 'held',
            })

            for item in items:
                request.env['pharmacy.sale.line'].sudo().create({
                    'sale_id': held_sale.id,
                    'product_name': item.get('name'),
                    'quantity': float(item.get('quantity') or 0),
                    'unit_price': float(item.get('unitPrice') or item.get('price') or 0),
                    'total': float(item.get('total') or 0),
                    'batch': item.get('batch'),
                    'expiry': item.get('expiry'),
                })

            return {
                'success': True,
                'held_bill_id': held_sale.id,
                'name': held_sale.bill_name or held_sale.name,
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/pharmacy/sales/held/delete', type='json', auth='user', methods=['POST'], csrf=False)
    def delete_held_bill(self, **post):
        try:
            sale_id = int(post.get('id') or 0)
            sale = request.env['pharmacy.sale'].sudo().browse(sale_id)
            if not sale.exists() or sale.state != 'held':
                return {'success': False, 'error': 'Held bill not found'}
            sale.unlink()
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    @http.route('/pharmacy/sales/held/complete', type='json', auth='user', methods=['POST'], csrf=False)
    def complete_held_bill(self, **post):
        try:
            sale_id = int(post.get('id') or 0)
            amount_paid = float(post.get('amount_paid', 0) or 0)
            payment_method = post.get('payment_method', 'cash')

            sale = request.env['pharmacy.sale'].sudo().browse(sale_id)
            if not sale.exists() or sale.state != 'held':
                return {'success': False, 'error': 'Held bill not found'}

            sale.write({
                'state': 'done',
                'amount_paid': amount_paid,
                'payment_method': payment_method,
                'bill_name': False,
            })
            if sale.customer_id:
                sale.customer_id.total_purchases = (sale.customer_id.total_purchases or 0.0) + (sale.total_amount or 0.0)

            return {
                'success': True,
                'sale_id': sale.id,
                'receipt_number': sale.name,
                'sale_date': sale.sale_date,
                'cashier_name': sale.cashier_id.name,
                'items': self._serialize_sale_items(sale),
                'total_amount': sale.total_amount,
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}