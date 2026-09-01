from flask import Blueprint, request, jsonify
from app.services.libro_service import LibroService

libro_bp = Blueprint('libro_bp', __name__)
libro_service = LibroService()

@libro_bp.route('/', methods=['GET'])
def get_libros():
    """Retorna la lista de libros con soporte para filtros opcionales."""
    try:
        autor_id = request.args.get('autor_id', type=int)
        search = request.args.get('search', type=str)
        disponible_param = request.args.get('disponible')
        disponible = None
        if disponible_param is not None:
            disponible = disponible_param.lower() in ('true', '1', 'yes')

        libros = libro_service.get_all(autor_id=autor_id, disponible=disponible, search=search)
        return jsonify({
            'success': True,
            'data': libros,
            'count': len(libros)
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@libro_bp.route('/<int:libro_id>', methods=['GET'])
def get_libro(libro_id):
    """Retorna un libro especifico por su ID."""
    try:
        libro = libro_service.get_by_id(libro_id)
        if not libro:
            return jsonify({'success': False, 'message': f'Libro con ID {libro_id} no encontrado.'}), 404
        return jsonify({'success': True, 'data': libro}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@libro_bp.route('/', methods=['POST'])
def create_libro():
    """Crea un nuevo libro en la base de datos."""
    try:
        data = request.get_json() or {}
        nuevo_libro = libro_service.create(data)
        return jsonify({
            'success': True,
            'message': 'Libro creado exitosamente.',
            'data': nuevo_libro
        }), 201
    except ValueError as ve:
        return jsonify({'success': False, 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@libro_bp.route('/<int:libro_id>', methods=['PUT'])
def update_libro(libro_id):
    """Actualiza la informacion de un libro existente."""
    try:
        data = request.get_json() or {}
        libro_actualizado = libro_service.update(libro_id, data)
        if not libro_actualizado:
            return jsonify({'success': False, 'message': f'Libro con ID {libro_id} no encontrado.'}), 404
        return jsonify({
            'success': True,
            'message': 'Libro actualizado exitosamente.',
            'data': libro_actualizado
        }), 200
    except ValueError as ve:
        return jsonify({'success': False, 'message': str(ve)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@libro_bp.route('/<int:libro_id>', methods=['DELETE'])
def delete_libro(libro_id):
    """Elimina un libro por su ID."""
    try:
        eliminado = libro_service.delete(libro_id)
        if not eliminado:
            return jsonify({'success': False, 'message': f'Libro con ID {libro_id} no encontrado.'}), 404
        return jsonify({'success': True, 'message': f'Libro con ID {libro_id} eliminado exitosamente.'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@libro_bp.route('/import-excel', methods=['POST'])
def import_excel():
    """Endpoint para subir e importar un archivo Excel o CSV con libros y autores."""
    import pandas as pd
    from app.extensions import db
    from app.models.autor import Autor
    from app.models.libro import Libro

    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No se encontro ningun archivo en la peticion.'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'Nombre de archivo vacio.'}), 400

    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        # Normalizar nombres de columnas
        def norm(c):
            c = str(c).strip().lower()
            c = c.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
            c = c.replace('(', '').replace(')', '').replace('/', '').replace('_', ' ').replace('-', ' ')
            return ' '.join(c.split())

        def find_col(keywords):
            # Coincidencia exacta primero
            for col in df.columns:
                n = norm(col)
                for kw in keywords:
                    if n == norm(kw):
                        return col
            # Coincidencia parcial (subcadena)
            for col in df.columns:
                n = norm(col)
                for kw in keywords:
                    if norm(kw) in n:
                        return col
            return None

        col_obra = find_col(['titulo de obra', 'obra', 'titulo', 'libro', 'title', 'nombre de obra'])
        col_autor = find_col(['autor(es)', 'autor', 'autores', 'author', 'authors'])
        col_genero = find_col(['genero', 'género', 'categoria', 'categoría', 'genre', 'tema'])

        if not col_obra:
            return jsonify({
                'success': False,
                'message': f"No se encontro la columna de Obra o Titulo. Columnas detectadas: {list(df.columns)}"
            }), 400

        autores_db = {a.nombre.strip().lower(): a for a in Autor.query.all()}
        libros_existentes = {(l.titulo.strip().lower(), l.autor_id): l for l in Libro.query.all()}

        autores_creados = 0
        libros_creados = 0

        for _, row in df.iterrows():
            obra_val = row[col_obra]
            if pd.isna(obra_val) or not str(obra_val).strip():
                continue

            titulo = str(obra_val).strip()

            autor_nombre = "Anónimo"
            if col_autor and not pd.isna(row[col_autor]):
                raw_a = str(row[col_autor]).strip()
                if raw_a:
                    autor_nombre = raw_a

            genero = None
            if col_genero and not pd.isna(row[col_genero]):
                raw_g = str(row[col_genero]).strip()
                if raw_g and raw_g.lower() != 'nan':
                    genero = raw_g

            autor_key = autor_nombre.lower()
            if autor_key in autores_db:
                autor = autores_db[autor_key]
            else:
                autor = Autor(nombre=autor_nombre)
                db.session.add(autor)
                db.session.flush()
                autores_db[autor_key] = autor
                autores_creados += 1

            nuevo_libro = Libro(
                titulo=titulo,
                genero=genero,
                disponible=True,
                autor_id=autor.id
            )
            db.session.add(nuevo_libro)
            libros_creados += 1

        db.session.commit()

        return jsonify({
            'success': True,
            'message': f"Importacion finalizada: {libros_creados} libros/ejemplares y {autores_creados} nuevos autores registrados.",
            'resumen': {
                'libros_creados': libros_creados,
                'autores_creados': autores_creados,
                'total_filas': len(df)
            }
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'message': f"Error al procesar archivo: {str(e)}"}), 500
