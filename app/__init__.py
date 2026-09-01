from flask import Flask, jsonify
from flask_cors import CORS
from config.settings import Config
from app.extensions import db
from app.controllers import autor_bp, libro_bp

def create_app(config_class=Config):
    """
    Fabrica de aplicaciones (Application Factory).
    Inicializa Flask, carga la configuracion, registra extensiones y blueprints.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Habilitar CORS para permitir peticiones desde el frontend de React/Vite
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Inicializar base de datos con la app
    db.init_app(app)

    # Registrar Blueprints de controladores
    app.register_blueprint(autor_bp, url_prefix='/api/autores')
    app.register_blueprint(libro_bp, url_prefix='/api/libros')

    # Crear tablas en MySQL automaticamente si no existen
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            app.logger.error(f"Error al conectar con la base de datos o crear tablas: {e}")

    # Ruta raiz de bienvenida con documentacion de endpoints
    @app.route('/')
    def index():
        return jsonify({
            'mensaje': '¡Bienvenido a la API de miBiblioteca!',
            'version': '1.0.0',
            'estado': 'activo',
            'endpoints_disponibles': {
                'autores': {
                    'listar_y_crear': '/api/autores/',
                    'detalle_actualizar_eliminar': '/api/autores/<id>'
                },
                'libros': {
                    'listar_y_crear': '/api/libros/',
                    'filtros_disponibles': '/api/libros/?autor_id=<id>&disponible=true&search=<texto>',
                    'detalle_actualizar_eliminar': '/api/libros/<id>'
                }
            }
        })

    # Manejadores de errores HTTP globales
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'message': 'Recurso no encontrado.'}), 404

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({'success': False, 'message': 'Error interno del servidor.'}), 500

    return app