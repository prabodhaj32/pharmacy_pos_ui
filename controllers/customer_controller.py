# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request

class PharmacyCustomerController(http.Controller):
    def _sales_table_exists(self):
        request.env.cr.execute("SELECT to_regclass('public.pharmacy_sale')")
        return bool(request.env.cr.fetchone()[0])

    # ======================
    # LIST CUSTOMERS
    # ======================
    @http.route('/pharmacy/customers/list', type='json', auth='user', csrf=False)
    def list_customers(self):
        try:
            records = request.env['pharmacy.customer'].sudo().search([])
            customers_data = records.read([
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
            if self._sales_table_exists():
                sale_model = request.env['pharmacy.sale'].sudo()
                for customer_data in customers_data:
                    recent_sales = sale_model.search(
                        [('customer_id', '=', customer_data['id']), ('state', '=', 'done')],
                        order='sale_date desc',
                        limit=10
                    )
                    customer_data['recent_purchases'] = [{
                        'saleId': sale.id,
                        'receiptNumber': sale.name,
                        'items': [{
                            'name': line.product_name,
                            'quantity': line.quantity,
                            'unitPrice': line.unit_price,
                            'total': line.total,
                            'batch': line.batch,
                            'expiry': line.expiry,
                        } for line in sale.sale_line_ids],
                        'totalAmount': sale.total_amount,
                        'paymentMethod': sale.payment_method,
                        'timestamp': sale.sale_date,
                        'displayTimestamp': sale.sale_date and sale.sale_date.strftime('%Y-%m-%d %H:%M:%S') or '',
                    } for sale in recent_sales]
            else:
                for customer_data in customers_data:
                    customer_data['recent_purchases'] = []
            return customers_data
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