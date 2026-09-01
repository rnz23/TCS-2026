from flask import Blueprint, request, jsonify
from app.services.autor_service import AutorService

autor_bp = Blueprint('autor_bp', __name__)
autor_service = AutorService()

@autor_bp.route('/', methods=['GET'])
def get_autores():
    """Retorna la lista de todos los autores."""
    try:
        autores = autor_service.get_all()
        return jsonify({
            'success': True,
            'data': autores,
            'count': len(autores)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@autor_bp.route('/<int:autor_id>', methods=['GET'])
def get_autor(autor_id):
    """Retorna los datos de un autor y la lista de sus libros."""
    try:
        autor = autor_service.get_by_id(autor_id)
        if not autor:
            return jsonify({'success': False, 'message': f'Autor con ID {autor_id} no encontrado.'}), 404
        return jsonify({'success': True, 'data': autor}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@autor_bp.route('/', methods=['POST'])
def create_autor():
    """Crea un nuevo autor en la base de datos."""
    try:
        data = request.get_json() or {}
        nuevo_autor = autor_service.create(data)
        return jsonify({
            'success': True,
            'message': 'Autor creado exitosamente.',
            'data': nuevo_autor
        }), 201
    except ValueError as ve:
        return jsonify({'success': False, 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@autor_bp.route('/<int:autor_id>', methods=['PUT'])
def update_autor(autor_id):
    """Actualiza la informacion de un autor."""
    try:
        data = request.get_json() or {}
        autor_actualizado = autor_service.update(autor_id, data)
        if not autor_actualizado:
            return jsonify({'success': False, 'message': f'Autor con ID {autor_id} no encontrado.'}), 404
        return jsonify({
            'success': True,
            'message': 'Autor actualizado exitosamente.',
            'data': autor_actualizado
        }), 200
    except ValueError as ve:
        return jsonify({'success': False, 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@autor_bp.route('/<int:autor_id>', methods=['DELETE'])
def delete_autor(autor_id):
    """Elimina un autor por su ID."""
    try:
        eliminado = autor_service.delete(autor_id)
        if not eliminado:
            return jsonify({'success': False, 'message': f'Autor con ID {autor_id} no encontrado.'}), 404
        return jsonify({'success': True, 'message': f'Autor con ID {autor_id} eliminado exitosamente.'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
