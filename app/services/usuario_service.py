from app.repositories.usuario_repository import UsuarioRepository
from app.utils.validators import validate_required_fields
from app.models.usuario import Usuario

class UsuarioService:
    """Capa de logica de negocio para usuarios."""

    def __init__(self):
        self.repository = UsuarioRepository()

    def get_all(self, search=None, tipo=None):
        """Retorna usuarios filtrados opcionalmente por nombre o tipo."""
        if search:
            usuarios = self.repository.search_by_name(search)
        elif tipo:
            usuarios = self.repository.get_by_tipo(tipo)
        else:
            usuarios = self.repository.get_all()

        return [u.to_dict() for u in usuarios]

    def get_by_id(self, usuario_id, include_prestamos=False):
        """Retorna un usuario por su ID."""
        usuario = self.repository.get_by_id(usuario_id)
        if not usuario:
            return None
        return usuario.to_dict(include_prestamos=include_prestamos)

    def create(self, data):
        """Valida y crea un nuevo usuario."""
        is_valid, error = validate_required_fields(data, ['nombre', 'email'])
        if not is_valid:
            raise ValueError(error)

        email = data['email'].strip().lower()
        if self.repository.get_by_email(email):
            raise ValueError(f"Ya existe un usuario registrado con el correo '{email}'.")

        tipo_usuario = data.get('tipo_usuario', 'Estudiante').strip()
        if tipo_usuario not in ['Estudiante', 'Profesor', 'General']:
            raise ValueError("El tipo de usuario debe ser 'Estudiante', 'Profesor' o 'General'.")

        nuevo_usuario = Usuario(
            nombre=data['nombre'].strip(),
            email=email,
            tipo_usuario=tipo_usuario,
            telefono=data.get('telefono', '').strip() if data.get('telefono') else None
        )

        created = self.repository.create(nuevo_usuario)
        return created.to_dict()

    def update(self, usuario_id, data):
        """Actualiza la informacion de un usuario."""
        usuario = self.repository.get_by_id(usuario_id)
        if not usuario:
            return None

        if 'nombre' in data:
            if not data['nombre'] or not data['nombre'].strip():
                raise ValueError("El campo 'nombre' no puede estar vacio.")
            usuario.nombre = data['nombre'].strip()

        if 'email' in data:
            email = data['email'].strip().lower()
            existente = self.repository.get_by_email(email)
            if existente and existente.id != usuario_id:
                raise ValueError(f"El correo '{email}' ya esta registrado por otro usuario.")
            usuario.email = email

        if 'tipo_usuario' in data:
            tipo = data['tipo_usuario'].strip()
            if tipo not in ['Estudiante', 'Profesor', 'General']:
                raise ValueError("El tipo de usuario debe ser 'Estudiante', 'Profesor' o 'General'.")
            usuario.tipo_usuario = tipo

        if 'telefono' in data:
            usuario.telefono = data['telefono'].strip() if data['telefono'] else None

        self.repository.update()
        return usuario.to_dict()

    def delete(self, usuario_id):
        """Elimina un usuario por su ID."""
        usuario = self.repository.get_by_id(usuario_id)
        if not usuario:
            return False

        self.repository.delete(usuario)
        return True

