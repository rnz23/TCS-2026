from app.models.autor import Autor
from app.repositories.base_repository import BaseRepository

class AutorRepository(BaseRepository):
    """Repositorio para operaciones sobre la entidad Autor."""

    def __init__(self):
        super().__init__(Autor)

    def get_by_name(self, nombre):
        """Busca un autor por su nombre exacto."""
        return self.model.query.filter_by(nombre=nombre).first()

    def search_by_name(self, query):
        """Busca autores cuyo nombre contenga el termino dado."""
        return self.model.query.filter(self.model.nombre.ilike(f"%{query}%")).all()
