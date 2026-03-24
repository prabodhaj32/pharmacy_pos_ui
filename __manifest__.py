{
    'name': 'Pharmacy POS UI',
    'version': '1.0',
    'summary': 'Frontend UI for Pharmacy POS',
    'category': 'Point of Sale',
    'depends': ['web'],

    'data': [
        'views/menu.xml',
    ],

    'assets': {
        'web.assets_backend': [
            'pharmacy_pos_ui/static/src/css/style.css',
            'pharmacy_pos_ui/static/src/js/dashboard.js',
            'pharmacy_pos_ui/static/src/xml/templates.xml',
             'pharmacy_pos_ui/static/src/lib/chart.min.js',
        ],
    },

    'installable': True,
    'application': True,
}