from app.models.autor import Autor
from app.repositories.autor_repository import AutorRepository
from app.utils.validators import validate_required_fields

class AutorService:
    """Capa de logica de negocio para operaciones con autores."""

    def __init__(self):
        self.repository = AutorRepository()

    def get_all(self):
        """Retorna la lista de todos los autores serializados."""
        autores = self.repository.get_all()
        return [autor.to_dict() for autor in autores]

    def get_by_id(self, autor_id):
        """Retorna un autor con sus libros incluidos o None si no existe."""
        autor = self.repository.get_by_id(autor_id)
        if not autor:
            return None
        return autor.to_dict(include_libros=True)

    def create(self, data):
        """Valida y crea un nuevo autor."""
        is_valid, error = validate_required_fields(data, ['nombre'])
        if not is_valid:
            raise ValueError(error)

        nombre = data['nombre'].strip()
        nacionalidad = data.get('nacionalidad', '').strip() if data.get('nacionalidad') else None

        nuevo_autor = Autor(
            nombre=nombre,
            nacionalidad=nacionalidad
        )
        created = self.repository.create(nuevo_autor)
        return created.to_dict()

    def update(self, autor_id, data):
        """Actualiza la informacion de un autor existente."""
        autor = self.repository.get_by_id(autor_id)
        if not autor:
            return None

        if 'nombre' in data:
            if not data['nombre'] or not data['nombre'].strip():
                raise ValueError("El campo 'nombre' no puede estar vacio.")
            autor.nombre = data['nombre'].strip()

        if 'nacionalidad' in data:
            autor.nacionalidad = data['nacionalidad'].strip() if data['nacionalidad'] else None

        self.repository.update()
        return autor.to_dict()

    def delete(self, autor_id):
        """Elimina un autor por su ID."""
        autor = self.repository.get_by_id(autor_id)
        if not autor:
            return False

        self.repository.delete(autor)
        return True
