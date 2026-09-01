from sqlalchemy.orm import joinedload
from app.models.libro import Libro
from app.repositories.base_repository import BaseRepository

class LibroRepository(BaseRepository):
    """Repositorio optimizado para operaciones sobre la entidad Libro con eager loading."""

    def __init__(self):
        super().__init__(Libro)

    def get_all(self):
        """Retorna todos los libros con sus autores en una sola consulta JOIN."""
        return self.model.query.options(joinedload(Libro.autor)).all()

    def get_by_id(self, entity_id):
        """Retorna un libro por ID precargando el autor."""
        return self.model.query.options(joinedload(Libro.autor)).filter_by(id=entity_id).first()

    def get_by_autor(self, autor_id):
        """Retorna todos los libros pertenecientes a un autor especifico."""
        return self.model.query.options(joinedload(Libro.autor)).filter_by(autor_id=autor_id).all()

    def get_disponibles(self, disponible=True):
        """Retorna libros segun su estado de disponibilidad."""
        return self.model.query.options(joinedload(Libro.autor)).filter_by(disponible=disponible).all()

    def search_by_title(self, query):
        """Busca libros cuyo titulo contenga el termino dado."""
        return self.model.query.options(joinedload(Libro.autor)).filter(self.model.titulo.ilike(f"%{query}%")).all()

