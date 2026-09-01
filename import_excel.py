import os
import sys
import pandas as pd
from app import create_app
from app.extensions import db
from app.models.autor import Autor
from app.models.libro import Libro

def normalize_column_name(col):
    """Normaliza nombres de columnas eliminando acentos, saltos de línea, espacios y convirtiendo a minúsculas."""
    c = str(col).strip().lower()
    c = c.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
    # split() sin argumentos separa por cualquier espacio en blanco (incluyendo \n de Excel)
    return ' '.join(c.split())

def find_column(df_columns, candidates):
    """Busca una columna que coincida exacta o parcialmente con alguno de los nombres candidatos."""
    # 1. Coincidencia exacta normalizada
    for col in df_columns:
        norm_c = normalize_column_name(col)
        for cand in candidates:
            if norm_c == normalize_column_name(cand):
                return col

    # 2. Coincidencia parcial
    for col in df_columns:
        norm_c = normalize_column_name(col)
        for cand in candidates:
            if normalize_column_name(cand) in norm_c:
                return col

    return None

def import_from_excel(file_path):
    """Lee un archivo Excel o CSV e importa autores y libros a la base de datos."""
    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
    except Exception as e:
        print(f"[-] Error al leer el archivo Excel: {e}")
        return False

    print(f"[+] Archivo leido con exito. Total de filas encontradas: {len(df)}")
    print(f"[*] Columnas detectadas: {list(df.columns)}")
    # Mapear columnas esperadas según las cabeceras exactas de tu archivo
    col_obra = find_column(df.columns, ['Titulo de Obra', 'Título de Obra', 'Titulo', 'Obra', 'Libro'])
    col_autor = find_column(df.columns, ['Autor', 'Autores', 'Autor(es)'])
    col_genero = find_column(df.columns, ['Género', 'Genero', 'Categoría', 'Categoria'])
    col_recuento = find_column(df.columns, ['Recuento Total', 'Recuento'])

    if not col_obra:
        print(f"[-] Error: No se encontró la columna 'Titulo de Obra' en el archivo.")
        print(f"    Columnas disponibles: {list(df.columns)}")
        return False

    print(f"[*] Mapeo de columnas:")
    print(f"    - Obra/Titulo: '{col_obra}'")
    print(f"    - Autor(es):   '{col_autor or '(No detectada, se usará Anónimo)'}'")
    print(f"    - Género:      '{col_genero or '(Opcional)'}'")
    if col_recuento:
        print(f"    - Recuento:    '{col_recuento}'")

    app = create_app()
    with app.app_context():
        # Asegurar tablas
        db.create_all()

        # Cache de autores en memoria para evitar consultas repetitivas
        autores_db = {a.nombre.strip().lower(): a for a in Autor.query.all()}
        
        # Cache de libros existentes (titulo_lower, autor_id)
        libros_existentes = {
            (l.titulo.strip().lower(), l.autor_id): l for l in Libro.query.all()
        }

        autores_creados = 0
        libros_creados = 0
        filas_invalidas = 0

        for index, row in df.iterrows():
            obra_val = row[col_obra]
            if pd.isna(obra_val) or not str(obra_val).strip():
                filas_invalidas += 1
                continue

            titulo = str(obra_val).strip()

            # Autor
            autor_nombre = "Anónimo"
            if col_autor and not pd.isna(row[col_autor]):
                raw_autor = str(row[col_autor]).strip()
                if raw_autor:
                    autor_nombre = raw_autor

            # Genero
            genero = None
            if col_genero and not pd.isna(row[col_genero]):
                raw_genero = str(row[col_genero]).strip()
                if raw_genero and raw_genero.lower() != 'nan':
                    genero = raw_genero

            # Obtener o crear autor (los autores se reutilizan para no duplicar autores)
            autor_key = autor_nombre.lower()
            if autor_key in autores_db:
                autor = autores_db[autor_key]
            else:
                autor = Autor(nombre=autor_nombre)
                db.session.add(autor)
                db.session.flush() # Genera el id sin hacer commit completo
                autores_db[autor_key] = autor
                autores_creados += 1

            # Crear cada libro/ejemplar/tomo como un registro individual
            nuevo_libro = Libro(
                titulo=titulo,
                genero=genero,
                disponible=True,
                autor_id=autor.id
            )
            db.session.add(nuevo_libro)
            libros_creados += 1

        # Confirmar todos los cambios en la base de datos
        db.session.commit()

        print("\n" + "="*50)
        print(" RESUMEN DE IMPORTACION A LA BASE DE DATOS")
        print("="*50)
        print(f"[+] Total Autores nuevos creados:   {autores_creados}")
        print(f"[+] Total Libros/Ejemplares creados: {libros_creados}")
        if filas_invalidas > 0:
            print(f"[!] Filas invalidas (sin titulo):   {filas_invalidas}")
        print("="*50)
        print("[+] ¡Importacion completada con exito!")
        return True

if __name__ == '__main__':
    print("=== Importador de Libros desde Excel - miBiblioteca ===\n")
    
    if len(sys.argv) > 1:
        archivo = sys.argv[1]
    else:
        # Buscar archivos .xlsx o .xls comunes en el directorio actual
        candidatos = [f for f in os.listdir('.') if f.endswith('.xlsx') or f.endswith('.xls')]
        if candidatos:
            archivo = candidatos[0]
            print(f"[*] No se especificó archivo, usando archivo detectado: '{archivo}'")
        else:
            print("[-] Uso del script:")
            print("    python import_excel.py <nombre_o_ruta_del_archivo.xlsx>")
            sys.exit(1)

    import_from_excel(archivo)