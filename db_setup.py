"""
Script de configuracion e inicializacion de la Base de Datos MySQL.
Ejecuta este script para crear la base de datos si no existe,
crear todas las tablas e insertar datos iniciales de prueba.
"""
import pymysql
from app import create_app
from app.extensions import db
from app.models.autor import Autor
from app.models.libro import Libro
from config.settings import Config

def ensure_database_exists():
    """Conecta directamente al servidor MySQL para asegurar que la base de datos exista."""
    try:
        print(f"[*] Verificando conexion con MySQL en {Config.DB_HOST}:{Config.DB_PORT}...")
        conn = pymysql.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            port=int(Config.DB_PORT)
        )
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{Config.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            print(f"[+] Base de datos '{Config.DB_NAME}' asegurada con exito.")
        conn.close()
        return True
    except Exception as e:
        print(f"[-] Error al conectar con el servidor MySQL: {e}")
        print("    Verifica que el contenedor de MySQL este corriendo y que los valores en .env sean correctos.")
        return False

def seed_data():
    """Inserta autores y libros de prueba si la base de datos esta vacia."""
    app = create_app()
    with app.app_context():
        # Crear todas las tablas segun los modelos SQLAlchemy
        db.create_all()
        print("[+] Tablas creadas/verificadas en la base de datos.")

        # Verificar si ya existen autores
        if Autor.query.count() == 0:
            print("[*] Insertando datos iniciales de prueba...")
            
            autor1 = Autor(nombre="Gabriel García Márquez", nacionalidad="Colombiana")
            autor2 = Autor(nombre="Miguel de Cervantes", nacionalidad="Española")
            autor3 = Autor(nombre="Isabel Allende", nacionalidad="Chilena")
            
            db.session.add_all([autor1, autor2, autor3])
            db.session.commit()

            libro1 = Libro(
                titulo="Cien años de soledad",
                genero="Realismo Mágico",
                anio_publicacion=1967,
                disponible=True,
                autor_id=autor1.id
            )
            libro2 = Libro(
                titulo="El amor en los tiempos del cólera",
                genero="Novela",
                anio_publicacion=1985,
                disponible=True,
                autor_id=autor1.id
            )
            libro3 = Libro(
                titulo="Don Quijote de la Mancha",
                genero="Novela clásica",
                anio_publicacion=1605,
                disponible=True,
                autor_id=autor2.id
            )
            libro4 = Libro(
                titulo="La casa de los espíritus",
                genero="Ficción",
                anio_publicacion=1982,
                disponible=False,
                autor_id=autor3.id
            )

            db.session.add_all([libro1, libro2, libro3, libro4])
            db.session.commit()
            print("[+] Datos de prueba insertados exitosamente.")
        else:
            print("[*] La base de datos ya contiene registros. No se insertaron datos duplicados.")

if __name__ == '__main__':
    print("=== Inicializador de Base de Datos - miBiblioteca ===")
    if ensure_database_exists():
        seed_data()
        print("=== Inicializacion completada con exito ===")
