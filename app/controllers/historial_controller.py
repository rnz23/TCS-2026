from flask import Blueprint, request, jsonify
from app.services.historial_service import HistorialService

historial_bp = Blueprint('historial', __name__, url_prefix='/api/historial')
historial_service = HistorialService()

@historial_bp.route('', methods=['GET'])
def get_historial():
    """Retorna la lista cronológica de eventos y auditoría del sistema (Stateful)."""
    try:
        limit = request.args.get('limit', default=100, type=int)
        tipo_accion = request.args.get('tipo_accion')
        movimientos = historial_service.get_movimientos(limit=limit, tipo_accion=tipo_accion)
        return jsonify({
            'success': True,
            'data': movimientos,
            'count': len(movimientos)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
