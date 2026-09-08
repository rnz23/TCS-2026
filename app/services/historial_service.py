from app.extensions import db
from app.models.historial import HistorialMovimiento
from app.repositories.historial_repository import HistorialRepository

class HistorialService:
    """Servicio para registrar y consultar movimientos históricos de la biblioteca (Stateful)."""

    def __init__(self, repository: HistorialRepository = None):
        self.repository = repository or HistorialRepository()

    def registrar(self, tipo_accion, descripcion, detalles=None):
        """Registra un nuevo evento de auditoría en la base de datos."""
        movimiento = HistorialMovimiento(
            tipo_accion=tipo_accion,
            descripcion=descripcion,
            detalles=detalles
        )
        self.repository.create(movimiento)
        return movimiento

    def get_movimientos(self, limit=100, tipo_accion=None):
        """Obtiene la lista cronológica de movimientos."""
        movimientos = self.repository.get_recientes(limit=limit, tipo_accion=tipo_accion)
        return [m.to_dict() for m in movimientos]
