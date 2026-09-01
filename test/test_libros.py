import unittest
import json
from app import create_app
from app.extensions import db
from app.models.autor import Autor

class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'test-key'

class LibrosTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            # Crear autor de prueba
            autor = Autor(nombre="Gabriel García Márquez", nacionalidad="Colombiana")
            db.session.add(autor)
            db.session.commit()
            self.autor_id = autor.id

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_crear_y_obtener_libro(self):
        nuevo_libro = {
            "titulo": "Cien años de soledad",
            "genero": "Realismo Mágico",
            "anio_publicacion": 1967,
            "disponible": True,
            "autor_id": self.autor_id
        }
        res = self.client.post('/api/libros/', data=json.dumps(nuevo_libro), content_type='application/json')
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['titulo'], "Cien años de soledad")

        # Obtener lista de libros
        res_list = self.client.get('/api/libros/')
        self.assertEqual(res_list.status_code, 200)
        data_list = res_list.get_json()
        self.assertEqual(data_list['count'], 1)

    def test_crear_libro_con_autor_inexistente_retorna_400(self):
        nuevo_libro = {
            "titulo": "Libro Fantasma",
            "autor_id": 999
        }
        res = self.client.post('/api/libros/', data=json.dumps(nuevo_libro), content_type='application/json')
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data['success'])

if __name__ == '__main__':
    unittest.main()
