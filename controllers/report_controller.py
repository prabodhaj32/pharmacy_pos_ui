# controllers/report_controller.py
from odoo import http
from odoo.http import request

class PharmacyReportController(http.Controller):

    @http.route('/pharmacy/reports/data', type='json', auth='user', methods=['POST'])
    def get_reports_data(self, **post):
        from_date = post.get('from_date')
        to_date = post.get('to_date')
        session_start = post.get('session_start')
        shift = post.get('shift')
        return request.env['pharmacy.report'].get_report_summary(from_date, to_date, session_start, shift)

    @http.route('/pharmacy/reports/finalize_shift', type='json', auth='user', methods=['POST'])
    def finalize_shift(self, **post):
        try:
            request.env['pharmacy.shift.history'].create({
                'cashier_id': request.env.user.id,
                'shift': post.get('shift'),
                'start_time': post.get('start'),
                'end_time': post.get('end'),
                'opening_cash': float(post.get('openingCash') or 0),
                'expected_cash': float(post.get('openingCash') or 0) + float(post.get('expectedCashSales') or 0),
                'actual_cash': float(post.get('actualClosingCash') or 0),
            })
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
