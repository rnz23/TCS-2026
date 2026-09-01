from flask import Blueprint, request, jsonify
from app.services.usuario_service import UsuarioService

usuario_bp = Blueprint('usuario_bp', __name__)
usuario_service = UsuarioService()

@usuario_bp.route('/', methods=['GET'])
def get_usuarios():
    """Retorna la lista de usuarios registrados con opcion de filtros."""
    try:
        search = request.args.get('search', type=str)
        tipo = request.args.get('tipo', type=str)
        usuarios = usuario_service.get_all(search=search, tipo=tipo)
        return jsonify({
            'success': True,
            'data': usuarios,
            'count': len(usuarios)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@usuario_bp.route('/<int:usuario_id>', methods=['GET'])
def get_usuario(usuario_id):
    """Retorna los detalles de un usuario por su ID."""
    try:
        include_prestamos = request.args.get('include_prestamos', 'false').lower() == 'true'
        usuario = usuario_service.get_by_id(usuario_id, include_prestamos=include_prestamos)
        if not usuario:
            return jsonify({'success': False, 'message': f'Usuario con ID {usuario_id} no encontrado.'}), 404
        return jsonify({'success': True, 'data': usuario}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@usuario_bp.route('/', methods=['POST'])
def create_usuario():
    """Registra un nuevo usuario."""
    try:
        data = request.get_json() or {}
        nuevo_usuario = usuario_service.create(data)
        return jsonify({
            'success': True,
            'message': 'Usuario registrado exitosamente.',
            'data': nuevo_usuario
        }), 201
    except ValueError as ve:
        return jsonify({'success': False, 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@usuario_bp.route('/<int:usuario_id>', methods=['PUT'])
def update_usuario(usuario_id):
    """Actualiza la informacion de un usuario."""
    try:
        data = request.get_json() or {}
        usuario_actualizado = usuario_service.update(usuario_id, data)
        if not usuario_actualizado:
            return jsonify({'success': False, 'message': f'Usuario con ID {usuario_id} no encontrado.'}), 404
        return jsonify({
            'success': True,
            'message': 'Usuario actualizado exitosamente.',
            'data': usuario_actualizado
        }), 200
    except ValueError as ve:
        return jsonify({'success': False, 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@usuario_bp.route('/<int:usuario_id>', methods=['DELETE'])
def delete_usuario(usuario_id):
    """Elimina un usuario por su ID."""
    try:
        eliminado = usuario_service.delete(usuario_id)
        if not eliminado:
            return jsonify({'success': False, 'message': f'Usuario con ID {usuario_id} no encontrado.'}), 404
        return jsonify({'success': True, 'message': f'Usuario con ID {usuario_id} eliminado exitosamente.'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

