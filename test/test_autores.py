import unittest
import json
from app import create_app
from app.extensions import db

class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'test-key'

class AutoresTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_crear_y_obtener_autor(self):
        # Crear autor
        nuevo_autor = {
            "nombre": "Jorge Luis Borges",
            "nacionalidad": "Argentina"
        }
        res = self.client.post('/api/autores/', data=json.dumps(nuevo_autor), content_type='application/json')
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['nombre'], 'Jorge Luis Borges')

        # Obtener lista de autores
        res_list = self.client.get('/api/autores/')
        self.assertEqual(res_list.status_code, 200)
        data_list = res_list.get_json()
        self.assertEqual(data_list['count'], 1)

    def test_crear_autor_sin_nombre_retorna_400(self):
        res = self.client.post('/api/autores/', data=json.dumps({}), content_type='application/json')
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data['success'])

if __name__ == '__main__':
    unittest.main()
