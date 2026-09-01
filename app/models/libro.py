from datetime import datetime, timezone
from app.extensions import db

class Libro(db.Model):
    """Modelo para representar los libros en el inventario."""
    __tablename__ = 'libros'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    titulo = db.Column(db.String(500), nullable=False)
    genero = db.Column(db.String(50), nullable=True)
    anio_publicacion = db.Column(db.Integer, nullable=True)
    disponible = db.Column(db.Boolean, default=True, nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Clave foranea que apunta a la tabla autores
    autor_id = db.Column(db.Integer, db.ForeignKey('autores.id', ondelete='CASCADE'), nullable=False)

    # Relacion inversa con Autor
    autor = db.relationship('Autor', back_populates='libros')

    def to_dict(self):
        """Convierte la entidad Libro a un diccionario serializable en JSON."""
        return {
            'id': self.id,
            'titulo': self.titulo,
            'genero': self.genero,
            'anio_publicacion': self.anio_publicacion,
            'disponible': self.disponible,
            'autor_id': self.autor_id,
            'autor_nombre': self.autor.nombre if self.autor else None,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }

    def __repr__(self):
        return f"<Libro {self.id}: {self.titulo}>"
