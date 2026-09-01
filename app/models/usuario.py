from datetime import datetime, timezone
from app.extensions import db

class Usuario(db.Model):
    """Modelo para representar a los usuarios/lectores de la biblioteca."""
    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    tipo_usuario = db.Column(db.String(50), default='Estudiante', nullable=False)  # Estudiante, Profesor, General
    telefono = db.Column(db.String(30), nullable=True)
    fecha_registro = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relacion uno a muchos: un usuario tiene muchos prestamos
    prestamos = db.relationship('Prestamo', back_populates='usuario', cascade='all, delete-orphan', lazy=True)

    def to_dict(self, include_prestamos=False):
        """Convierte la entidad Usuario a un diccionario serializable en JSON."""
        data = {
            'id': self.id,
            'nombre': self.nombre,
            'email': self.email,
            'tipo_usuario': self.tipo_usuario,
            'telefono': self.telefono,
            'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None
        }
        if include_prestamos:
            data['prestamos'] = [p.to_dict() for p in self.prestamos]
        return data

    def __repr__(self):
        return f"<Usuario {self.id}: {self.nombre} ({self.tipo_usuario})>"

