from datetime import datetime, timezone
from app.extensions import db

class Prestamo(db.Model):
    """Modelo para representar los prestamos de libros a usuarios."""
    __tablename__ = 'prestamos'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    libro_id = db.Column(db.Integer, db.ForeignKey('libros.id', ondelete='CASCADE'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id', ondelete='CASCADE'), nullable=False)
    fecha_prestamo = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    fecha_devolucion_esperada = db.Column(db.DateTime, nullable=False)
    fecha_devolucion_real = db.Column(db.DateTime, nullable=True)
    estado = db.Column(db.String(20), default='ACTIVO', nullable=False)  # ACTIVO, DEVUELTO, VENCIDO

    # Relaciones
    libro = db.relationship('Libro', lazy=True)
    usuario = db.relationship('Usuario', back_populates='prestamos', lazy=True)

    def to_dict(self):
        """Convierte la entidad Prestamo a un diccionario serializable en JSON."""
        return {
            'id': self.id,
            'libro_id': self.libro_id,
            'libro_titulo': self.libro.titulo if self.libro else None,
            'usuario_id': self.usuario_id,
            'usuario_nombre': self.usuario.nombre if self.usuario else None,
            'usuario_tipo': self.usuario.tipo_usuario if self.usuario else None,
            'fecha_prestamo': self.fecha_prestamo.isoformat() if self.fecha_prestamo else None,
            'fecha_devolucion_esperada': self.fecha_devolucion_esperada.isoformat() if self.fecha_devolucion_esperada else None,
            'fecha_devolucion_real': self.fecha_devolucion_real.isoformat() if self.fecha_devolucion_real else None,
            'estado': self.estado
        }

    def __repr__(self):
        return f"<Prestamo {self.id}: Libro {self.libro_id} -> Usuario {self.usuario_id} ({self.estado})>"

