from odoo import http
from odoo.http import request
import logging
import json

_logger = logging.getLogger(__name__)

class PharmacySettingController(http.Controller):

    @http.route('/pharmacy/settings/load', type='json', auth='user', methods=['POST'])
    def load_settings(self):
        try:
            settings = request.env['pharmacy.setting'].sudo().get_all_settings()
            return {'success': True, 'settings': settings}
        except Exception as e:
            _logger.error("Pharmacy Settings Load Error: %s", str(e))
            return {'success': False, 'error': str(e)}

    @http.route('/pharmacy/settings/save', type='json', auth='user', methods=['POST'])
    def save_settings(self, **post):
        category = post.get('category')
        data = post.get('data')

        if data is None or not isinstance(data, dict):
            return {'success': False, 'error': 'Invalid data: Data must be a dictionary'}

        try:
            for key, value in data.items():
                full_key = f"{category}.{key}" if category else key
                request.env['pharmacy.setting'].sudo().set_setting(
                    full_key, value, category=category
                )
            return {'success': True, 'message': 'Settings saved successfully'}
        except Exception as e:
            _logger.error("Pharmacy Settings Save Error: %s", str(e))
            return {'success': False, 'error': str(e)}