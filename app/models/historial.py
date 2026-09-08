from datetime import datetime, timezone
from app.extensions import db

class HistorialMovimiento(db.Model):
    """Modelo para registrar el historial de transacciones y auditoría (Funcionalidad Stateful)."""
    __tablename__ = 'historial_movimientos'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tipo_accion = db.Column(db.String(50), nullable=False)  # 'CREACION_LIBRO' | 'EDICION_LIBRO' | 'ELIMINACION_LIBRO' | 'PRESTAMO' | 'DEVOLUCION' | 'IMPORTACION_EXCEL'
    descripcion = db.Column(db.String(500), nullable=False)
    detalles = db.Column(db.Text, nullable=True)
    fecha_creacion = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        """Serializa la entidad a diccionario JSON."""
        return {
            'id': self.id,
            'tipo_accion': self.tipo_accion,
            'descripcion': self.descripcion,
            'detalles': self.detalles,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
        }

    def __repr__(self):
        return f"<Historial {self.id}: [{self.tipo_accion}] {self.descripcion}>"
