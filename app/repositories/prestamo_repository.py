from app.repositories.base_repository import BaseRepository
from app.models.prestamo import Prestamo

class PrestamoRepository(BaseRepository):
    """Repositorio especifico para la entidad Prestamo."""

    def __init__(self):
        super().__init__(Prestamo)

    def get_by_usuario(self, usuario_id):
        """Retorna todos los prestamos asociados a un usuario."""
        return self.model.query.filter_by(usuario_id=usuario_id).order_by(self.model.fecha_prestamo.desc()).all()

    def get_by_libro(self, libro_id):
        """Retorna el historial de prestamos de un libro."""
        return self.model.query.filter_by(libro_id=libro_id).order_by(self.model.fecha_prestamo.desc()).all()

    def get_activos(self):
        """Retorna todos los prestamos con estado ACTIVO o VENCIDO."""
        return self.model.query.filter(self.model.estado.in_(['ACTIVO', 'VENCIDO'])).order_by(self.model.fecha_prestamo.desc()).all()

