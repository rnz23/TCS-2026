from app.repositories.base_repository import BaseRepository
from app.models.usuario import Usuario

class UsuarioRepository(BaseRepository):
    """Repositorio especifico para la entidad Usuario."""

    def __init__(self):
        super().__init__(Usuario)

    def get_by_email(self, email):
        """Busca un usuario por su direccion de correo electronico."""
        return self.model.query.filter_by(email=email.strip().lower()).first()

    def search_by_name(self, search_term):
        """Busca usuarios cuyo nombre coincida parcialmente."""
        return self.model.query.filter(self.model.nombre.ilike(f"%{search_term.strip()}%")).all()

    def get_by_tipo(self, tipo_usuario):
        """Retorna usuarios filtrados por su tipo (Estudiante, Profesor, General)."""
        return self.model.query.filter_by(tipo_usuario=tipo_usuario).all()

