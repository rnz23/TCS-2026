from flask import Blueprint, request, jsonify
from app.services.tools_service import ToolsService

tools_bp = Blueprint('tools_bp', __name__)

@tools_bp.route('/citas', methods=['POST', 'GET'])
def generar_cita():
    """
    Endpoint Stateless para generar citas bibliograficas.
    Acepta parametros en JSON (POST) o querystring (GET).
    """
    try:
        if request.method == 'POST':
            data = request.get_json() or {}
        else:
            data = {
                'titulo': request.args.get('titulo'),
                'autor': request.args.get('autor'),
                'anio_publicacion': request.args.get('anio'),
                'genero': request.args.get('genero'),
                'formato': request.args.get('formato')
            }

        resultado = ToolsService.generar_cita_bibliografica(data)
        return jsonify({
            'success': True,
            'data': resultado
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@tools_bp.route('/calculadora', methods=['POST', 'GET'])
def calcular_multa():
    """
    Endpoint Stateless para calcular fechas limites y multas por mora.
    Acepta parametros en JSON (POST) o querystring (GET).
    """
    try:
        if request.method == 'POST':
            data = request.get_json() or {}
        else:
            data = {
                'tipo_usuario': request.args.get('tipo_usuario'),
                'fecha_inicio': request.args.get('fecha_inicio'),
                'dias_retraso': request.args.get('dias_retraso', 0)
            }

        resultado = ToolsService.calcular_multa_y_fechas(data)
        return jsonify({
            'success': True,
            'data': resultado
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

