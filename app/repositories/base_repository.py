from app.extensions import db

class BaseRepository:
    """Repositorio base con operaciones genericas CRUD."""

    def __init__(self, model):
        self.model = model

    def get_all(self):
        """Retorna todos los registros del modelo."""
        return self.model.query.all()

    def get_by_id(self, entity_id):
        """Retorna un registro por su ID primario."""
        return db.session.get(self.model, entity_id)

    def create(self, entity):
        """Persiste una nueva entidad en la base de datos."""
        db.session.add(entity)
        db.session.commit()
        return entity

    def update(self):
        """Confirma los cambios realizados en una entidad existente."""
        db.session.commit()

    def delete(self, entity):
        """Elimina una entidad de la base de datos."""
        db.session.delete(entity)
        db.session.commit()
