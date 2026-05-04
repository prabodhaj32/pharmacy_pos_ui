{
    'name': 'Pharmacy POS UI',
    'version': '1.0',
    'summary': 'Frontend UI for Pharmacy POS',
    'category': 'Point of Sale',
    'depends': ['base', 'web'],

    'data': [
        'views/pos_views.xml',
        'views/customers.xml',
        'views/menu.xml',
        'security/ir.model.access.csv',
        # 'controllers/',
    ],

    'assets': {
        'web.assets_backend': [
            'pharmacy_pos_ui/static/src/js/data/medicine_data.js',
            'pharmacy_pos_ui/static/src/css/style.css',
            'pharmacy_pos_ui/static/src/js/dashboard.js',
            'pharmacy_pos_ui/static/src/js/pharmacy_login.js',
            'pharmacy_pos_ui/static/src/js/pharmacy_customers.js',
            'pharmacy_pos_ui/static/src/js/inventory.js',
            'pharmacy_pos_ui/static/src/js/pharmacy_salespos.js',
            'pharmacy_pos_ui/static/src/js/pos.js',

            'pharmacy_pos_ui/static/src/js/pharmacy_purchasing.js',
            'pharmacy_pos_ui/static/src/js/pharmacy_reports.js',
            'pharmacy_pos_ui/static/src/js/pharmacy_settings.js',
            'pharmacy_pos_ui/static/src/xml/templates.xml',
             'pharmacy_pos_ui/static/src/lib/chart.min.js',
            #  'pharmacy_pos_ui/static/src/js/data/customers_data.js', 
        ],
    },

    'installable': True,
    'application': True,
}