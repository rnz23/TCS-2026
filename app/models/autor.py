from datetime import datetime, timezone
from app.extensions import db

class Autor(db.Model):
    """Modelo para representar a los autores de libros."""
    __tablename__ = 'autores'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(255), nullable=False)
    nacionalidad = db.Column(db.String(50), nullable=True)
    fecha_creacion = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relacion uno a muchos: un autor tiene muchos libros
    libros = db.relationship('Libro', back_populates='autor', cascade='all, delete-orphan', lazy=True)

    def to_dict(self, include_libros=False):
        """Convierte la entidad Autor a un diccionario serializable en JSON."""
        data = {
            'id': self.id,
            'nombre': self.nombre,
            'nacionalidad': self.nacionalidad,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }
        if include_libros:
            data['libros'] = [libro.to_dict() for libro in self.libros]
        return data

    def __repr__(self):
        return f"<Autor {self.id}: {self.nombre}>"
