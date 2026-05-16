# models/report.py
from odoo import models, fields, api
from datetime import datetime, timedelta

class PharmacyShiftHistory(models.Model):
    _name = 'pharmacy.shift.history'
    _description = 'Pharmacy Shift History'
    _order = 'end_time desc'

    cashier_id = fields.Many2one('res.users', string="Cashier", required=True)
    shift = fields.Char(string="Shift Name", required=True)
    start_time = fields.Datetime(string="Start Time", required=True)
    end_time = fields.Datetime(string="End Time", required=True)
    opening_cash = fields.Float(string="Opening Cash")
    expected_cash = fields.Float(string="Expected Cash")
    actual_cash = fields.Float(string="Actual Cash")
    difference = fields.Float(string="Difference", compute='_compute_difference', store=True)

    @api.depends('expected_cash', 'actual_cash')
    def _compute_difference(self):
        for rec in self:
            rec.difference = rec.actual_cash - rec.expected_cash

class PharmacyReport(models.Model):
    _name = 'pharmacy.report'
    _description = 'Pharmacy Reports Helper'
    _auto = False

    @api.model
    def get_report_summary(self, from_date=None, to_date=None, session_start=None, shift=None):
        """Main method to fetch all report data at once"""
        sale_domain = [('state', '=', 'done')]
        if from_date:
            sale_domain.append(('sale_date', '>=', from_date))
        if to_date:
            sale_domain.append(('sale_date', '<=', f"{to_date} 23:59:59"))

        sales = self.env['pharmacy.sale'].search(sale_domain)
        inventory = self.env['pharmacy.inventory'].search([])

        # 1. Metrics
        gross_sales = sum(s.total_amount for s in sales if s.total_amount > 0)
        total_returns = sum(abs(s.total_amount) for s in sales if s.total_amount < 0)
        total_discount = sum(s.discount_amount for s in sales)
        total_profit = sum(s.profit for s in sales)
        # Assuming 15% tax if not stored explicitly
        tax_collected = sum(s.total_amount * 0.15 for s in sales if s.total_amount > 0)

        # 2. Daily Sales Trend
        daily = {}
        for s in sales:
            date_key = s.sale_date.strftime('%Y-%m-%d')
            if date_key not in daily:
                daily[date_key] = {'sales': 0, 'profit': 0}
            if s.total_amount > 0:
                daily[date_key]['sales'] += s.total_amount
            daily[date_key]['profit'] += s.profit

        # 3. Fast Movers
        product_stats = {}
        # Create a mapping for inventory to get category and stock
        inventory_map = {i.name: i for i in inventory}
        
        # Calculate days in range for avg calculation
        days_in_range = 1
        if from_date and to_date:
            d1 = datetime.strptime(from_date, '%Y-%m-%d')
            d2 = datetime.strptime(to_date, '%Y-%m-%d')
            days_in_range = max((d2 - d1).days + 1, 1)

        for line in self.env['pharmacy.sale.line'].search([('sale_id', 'in', sales.ids)]):
            name = line.product_name
            if name not in product_stats:
                inv_item = inventory_map.get(name)
                product_stats[name] = {
                    'qty': 0, 
                    'revenue': 0, 
                    'category': inv_item.category if inv_item else 'General',
                    'stock': inv_item.stock if inv_item else 0
                }
            product_stats[name]['qty'] += line.quantity
            product_stats[name]['revenue'] += line.total

        fast_movers = sorted(
            [{
                'medicine': n, 
                'qty_sold': s['qty'], 
                'revenue': s['revenue'],
                'category': s['category'],
                'stock': s['stock'],
                'avg_per_day': round(s['qty'] / days_in_range, 1)
            } for n, s in product_stats.items()],
            key=lambda x: x['revenue'], reverse=True
        )[:10]

        # 4. Expiry Report
        today = fields.Date.today()
        expiry_limit = today + timedelta(days=90)
        expiring = inventory.filtered(lambda i: i.expiry_date and i.expiry_date <= expiry_limit)
        
        expiry_data = [
            {
                'medicine': i.name,
                'batch': i.batch or 'N/A',
                'expiry_date': i.expiry_date,
                'days_left': (i.expiry_date - today).days if i.expiry_date else 0,
                'stock': i.stock,
                'value_at_cost': i.stock * i.cost
            } for i in expiring
        ]

        # 5. Stock Valuation
        total_cost = sum(i.stock * i.cost for i in inventory)
        total_sell = sum(i.stock * i.price for i in inventory)
        
        stock_details = [
            {
                'medicine': i.name,
                'stock': i.stock,
                'category': i.category or 'General',
                'cost_per_unit': i.cost,
                'sell_per_unit': i.price,
                'cost_value': i.stock * i.cost,
                'sell_value': i.stock * i.price,
                'potential_profit': (i.stock * i.price) - (i.stock * i.cost)
            } for i in inventory
        ]

        # 6. Cashier Summary
        cashiers = {}
        for s in sales:
            c_name = s.cashier_id.name or 'Unknown'
            if c_name not in cashiers:
                cashiers[c_name] = {
                    'bills': 0, 'total_sales': 0, 
                    'cash_collected': 0, 'card_collected': 0
                }
            cashiers[c_name]['bills'] += 1
            cashiers[c_name]['total_sales'] += s.total_amount
            if s.payment_method == 'cash':
                cashiers[c_name]['cash_collected'] += s.total_amount
            elif s.payment_method == 'card':
                cashiers[c_name]['card_collected'] += s.total_amount

        expected_session_cash = 0.0
        if session_start and shift:
            # session_start is ISO format, slice to Odoo format
            clean_start = session_start.replace('T', ' ')[:19]
            session_domain = [
                ('sale_date', '>=', clean_start),
                ('shift', '=', shift),
                ('cashier_id', '=', self.env.user.id),
                ('payment_method', '=', 'cash'),
                ('state', '=', 'done')
            ]
            session_sales = self.env['pharmacy.sale'].search(session_domain)
            expected_session_cash = sum(s.total_amount for s in session_sales)

        return {
            'metrics': {
                'gross_sales': gross_sales,
                'net_sales': gross_sales - total_returns,
                'total_discount': total_discount,
                'total_returns': total_returns,
                'tax_collected': tax_collected,
                'total_profit': total_profit
            },
            'daily_sales': {
                'labels': sorted(list(daily.keys())),
                'sales': [daily[k]['sales'] for k in sorted(daily.keys())],
                'profit': [daily[k]['profit'] for k in sorted(daily.keys())]
            },
            'fast_movers': fast_movers,
            'expiry_report': sorted(expiry_data, key=lambda x: x['days_left']),
            'stock_valuation': {
                'summary': {
                    'total_cost_value': total_cost,
                    'total_selling_value': total_sell,
                    'potential_profit': total_sell - total_cost
                },
                'details': stock_details
            },
            'cashier_summary': [{'cashier': n, **v} for n, v in cashiers.items()],
            'expected_session_cash': expected_session_cash
        }
