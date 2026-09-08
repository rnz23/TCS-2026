import unittest
from app import create_app
from app.extensions import db
from app.models.autor import Autor
from app.models.libro import Libro
from app.models.prestamo import Prestamo
from app.models.historial import HistorialMovimiento
from app.services.stateless_service import StatelessService

class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'test-secret'

class TestStatefulStateless(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

        # Datos base de prueba
        autor = Autor(nombre="Gabriel García Márquez", nacionalidad="Colombiana")
        db.session.add(autor)
        db.session.commit()

        libro = Libro(titulo="Cien años de soledad", genero="Realismo Mágico", anio_publicacion=1967, autor_id=autor.id)
        db.session.add(libro)
        db.session.commit()

        self.autor_id = autor.id
        self.libro_id = libro.id

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    # --- TESTS STATELESS ---
    def test_stateless_citation_apa(self):
        """Prueba que el generador de citas APA formatee correctamente sin persistir estado."""
        data = {
            'titulo': 'Cien años de soledad',
            'autor_nombre': 'García Márquez, Gabriel',
            'anio_publicacion': 1967,
            'genero': 'Novela'
        }
        res = StatelessService.format_citation(data, style='apa')
        self.assertIn('García Márquez, G. (1967). Cien años de soledad.', res['citation'])

    def test_stateless_citation_bibtex(self):
        """Prueba que el generador BibTeX cree la estructura LaTeX."""
        data = {
            'titulo': 'Don Quijote',
            'autor_nombre': 'Cervantes, Miguel',
            'anio_publicacion': 1605
        }
        res = StatelessService.format_citation(data, style='bibtex')
        self.assertIn('@book{', res['citation'])
        self.assertIn('title     = {Don Quijote}', res['citation'])

    def test_stateless_qr_endpoint(self):
        """Prueba el endpoint /api/tools/qr devolviendo imagen Base64 en memoria."""
        res = self.client.post('/api/tools/qr', json={'libro_id': self.libro_id})
        self.assertEqual(res.status_code, 200)
        json_data = res.get_json()
        self.assertTrue(json_data['success'])
        self.assertTrue(json_data['data']['qr_base64'].startswith('data:image/png;base64,'))

    # --- TESTS STATEFUL ---
    def test_stateful_prestamo_ciclo_de_vida(self):
        """Prueba el ciclo de vida completo: Préstamo -> Cambio estado Libro -> Devolución -> Historial."""
        # 1. Registrar préstamo
        payload = {
            'libro_id': self.libro_id,
            'lector_nombre': 'Juan Pérez',
            'dias_prestamo': 14
        }
        res = self.client.post('/api/prestamos', json=payload)
        self.assertEqual(res.status_code, 201)
        prestamo_id = res.get_json()['data']['id']

        # Verificar que el libro cambió a NO disponible en BD
        libro = db.session.get(Libro, self.libro_id)
        self.assertFalse(libro.disponible)

        # 2. Registrar devolución
        res_dev = self.client.post(f'/api/prestamos/{prestamo_id}/devolver')
        self.assertEqual(res_dev.status_code, 200)
        self.assertEqual(res_dev.get_json()['data']['estado'], 'DEVUELTO')

        # Verificar que el libro vuelve a estar disponible en BD
        db.session.refresh(libro)
        self.assertTrue(libro.disponible)

        # 3. Verificar que el Historial de Auditoría registró los movimientos
        res_hist = self.client.get('/api/historial')
        self.assertEqual(res_hist.status_code, 200)
        historial_data = res_hist.get_json()['data']
        self.assertGreaterEqual(len(historial_data), 2)
        acciones = [h['tipo_accion'] for h in historial_data]
        self.assertIn('PRESTAMO', acciones)
        self.assertIn('DEVOLUCION', acciones)

if __name__ == '__main__':
    unittest.main()
