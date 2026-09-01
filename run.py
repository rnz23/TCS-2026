# run.py
from app import create_app

# Creamos la instancia de la aplicación llamando a la función de __init__.py
app = create_app()

if __name__ == '__main__':
    # Ejecutamos la aplicación en modo desarrollo (debug=True)
    app.run(debug=True)