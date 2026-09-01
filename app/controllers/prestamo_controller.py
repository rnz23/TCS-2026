from flask import Blueprint, request, jsonify
from app.services.prestamo_service import PrestamoService

prestamo_bp = Blueprint('prestamo_bp', __name__)
prestamo_service = PrestamoService()

@prestamo_bp.route('/', methods=['GET'])
def get_prestamos():
    """Retorna la lista de prestamos."""
    try:
        usuario_id = request.args.get('usuario_id', type=int)
        activos_only = request.args.get('activos', 'false').lower() == 'true'
        prestamos = prestamo_service.get_all(usuario_id=usuario_id, activos_only=activos_only)
        return jsonify({
            'success': True,
            'data': prestamos,
            'count': len(prestamos)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@prestamo_bp.route('/<int:prestamo_id>', methods=['GET'])
def get_prestamo(prestamo_id):
    """Retorna los detalles de un prestamo por su ID."""
    try:
        prestamo = prestamo_service.get_by_id(prestamo_id)
        if not prestamo:
            return jsonify({'success': False, 'message': f'Prestamo con ID {prestamo_id} no encontrado.'}), 404
        return jsonify({'success': True, 'data': prestamo}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@prestamo_bp.route('/', methods=['POST'])
def registrar_prestamo():
    """Registra un nuevo prestamo de un libro a un usuario."""
    try:
        data = request.get_json() or {}
        nuevo_prestamo = prestamo_service.registrar_prestamo(data)
        return jsonify({
            'success': True,
            'message': 'Prestamo registrado exitosamente.',
            'data': nuevo_prestamo
        }), 201
    except ValueError as ve:
        return jsonify({'success': False, 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@prestamo_bp.route('/<int:prestamo_id>/devolver', methods=['PUT', 'POST'])
def registrar_devolucion(prestamo_id):
    """Registra la devolucion de un libro prestado."""
    try:
        prestamo_devuelto = prestamo_service.registrar_devolucion(prestamo_id)
        if not prestamo_devuelto:
            return jsonify({'success': False, 'message': f'Prestamo con ID {prestamo_id} no encontrado.'}), 404
        return jsonify({
            'success': True,
            'message': 'Devolucion registrada exitosamente. El libro vuelve a estar disponible.',
            'data': prestamo_devuelto
        }), 200
    except ValueError as ve:
        return jsonify({'success': False, 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

