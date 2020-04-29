from flask import jsonify


class SuccessModel:

    def __init__(self, data={}):
        self.data = data

    def json(self):
        return jsonify({
            'okay': True,
            'data': self.data
        })


class ErrorModel:

    def __init__(self, error='error'):
        self.error = error

    def json(self):
        return jsonify({
            'okay': False,
            'error': self.error
        })
