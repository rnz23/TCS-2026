from app.models.libro import Libro
from app.repositories.libro_repository import LibroRepository
from app.repositories.autor_repository import AutorRepository
from app.utils.validators import validate_required_fields

class LibroService:
    """Capa de logica de negocio para operaciones con libros."""

    def __init__(self):
        self.repository = LibroRepository()
        self.autor_repository = AutorRepository()

    def get_all(self, autor_id=None, disponible=None, search=None):
        """Retorna libros filtrados opcionalmente por autor, disponibilidad o titulo."""
        if search:
            libros = self.repository.search_by_title(search)
        elif autor_id is not None:
            libros = self.repository.get_by_autor(autor_id)
        elif disponible is not None:
            libros = self.repository.get_disponibles(disponible)
        else:
            libros = self.repository.get_all()

        return [libro.to_dict() for libro in libros]

    def get_by_id(self, libro_id):
        """Retorna un libro por su ID o None si no existe."""
        libro = self.repository.get_by_id(libro_id)
        if not libro:
            return None
        return libro.to_dict()

    def create(self, data):
        """Valida y crea un nuevo libro asegurando que el autor exista."""
        is_valid, error = validate_required_fields(data, ['titulo', 'autor_id'])
        if not is_valid:
            raise ValueError(error)

        autor_id = data['autor_id']
        autor = self.autor_repository.get_by_id(autor_id)
        if not autor:
            raise ValueError(f"El autor con ID {autor_id} no existe.")

        nuevo_libro = Libro(
            titulo=data['titulo'].strip(),
            genero=data.get('genero', '').strip() if data.get('genero') else None,
            anio_publicacion=data.get('anio_publicacion'),
            disponible=data.get('disponible', True),
            autor_id=autor_id
        )
        created = self.repository.create(nuevo_libro)
        return created.to_dict()

    def update(self, libro_id, data):
        """Actualiza un libro existente con validaciones."""
        libro = self.repository.get_by_id(libro_id)
        if not libro:
            return None

        if 'titulo' in data:
            if not data['titulo'] or not data['titulo'].strip():
                raise ValueError("El campo 'titulo' no puede estar vacio.")
            libro.titulo = data['titulo'].strip()

        if 'autor_id' in data:
            autor = self.autor_repository.get_by_id(data['autor_id'])
            if not autor:
                raise ValueError(f"El autor con ID {data['autor_id']} no existe.")
            libro.autor_id = data['autor_id']

        if 'genero' in data:
            libro.genero = data['genero'].strip() if data['genero'] else None

        if 'anio_publicacion' in data:
            libro.anio_publicacion = data['anio_publicacion']

        if 'disponible' in data:
            libro.disponible = bool(data['disponible'])

        self.repository.update()
        return libro.to_dict()

    def delete(self, libro_id):
        """Elimina un libro por su ID."""
        libro = self.repository.get_by_id(libro_id)
        if not libro:
            return False

        self.repository.delete(libro)
        return True
