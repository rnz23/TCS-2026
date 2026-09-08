from flask import Blueprint, request, jsonify
from app.services.stateless_service import StatelessService
from app.repositories.libro_repository import LibroRepository

stateless_bp = Blueprint('stateless', __name__, url_prefix='/api/tools')
libro_repo = LibroRepository()

@stateless_bp.route('/citar', methods=['POST'])
def format_citation():
    """
    Endpoint Stateless: Formatea una cita bibliográfica a partir de los datos recibidos o por ID de libro.
    No almacena estado en sesión ni en base de datos.
    """
    try:
        data = request.get_json() or {}
        style = data.get('style', 'apa')

        # Si se pasa un libro_id, obtener datos frescos del libro
        if 'libro_id' in data:
            libro = libro_repo.get_by_id(data['libro_id'])
            if libro:
                data = libro.to_dict()

        resultado = StatelessService.format_citation(data, style=style)
        return jsonify({
            'success': True,
            'data': resultado
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error al generar cita: {str(e)}"
        }), 500

@stateless_bp.route('/qr', methods=['POST'])
def generate_qr():
    """
    Endpoint Stateless: Genera un código QR en Base64 con la ficha del libro.
    Totalmente en memoria sin persistencia en disco ni sesión.
    """
    try:
        data = request.get_json() or {}
        if 'libro_id' in data:
            libro = libro_repo.get_by_id(data['libro_id'])
            if libro:
                data = libro.to_dict()

        resultado = StatelessService.generate_qr_code(data)
        return jsonify({
            'success': True,
            'data': resultado
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Error al generar código QR: {str(e)}"
        }), 500
