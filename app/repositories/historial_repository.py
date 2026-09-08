from app.models.historial import HistorialMovimiento
from app.repositories.base_repository import BaseRepository

class HistorialRepository(BaseRepository):
    """Repositorio para operaciones sobre el Historial de Auditoria."""

    def __init__(self):
        super().__init__(HistorialMovimiento)

    def get_recientes(self, limit=100, tipo_accion=None):
        """Retorna los movimientos mas recientes, opcionalmente filtrados por accion."""
        query = self.model.query
        if tipo_accion:
            query = query.filter_by(tipo_accion=tipo_accion)
        return query.order_by(self.model.fecha_creacion.desc()).limit(limit).all()
