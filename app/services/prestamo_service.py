from datetime import datetime, timedelta, timezone
from app.repositories.prestamo_repository import PrestamoRepository
from app.repositories.libro_repository import LibroRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.models.prestamo import Prestamo

class PrestamoService:
    """Capa de logica de negocio para prestamos de libros."""

    def __init__(self):
        self.repository = PrestamoRepository()
        self.libro_repository = LibroRepository()
        self.usuario_repository = UsuarioRepository()

    def get_all(self, usuario_id=None, activos_only=False):
        """Retorna la lista de prestamos con filtros opcionales."""
        if usuario_id:
            prestamos = self.repository.get_by_usuario(usuario_id)
        elif activos_only:
            prestamos = self.repository.get_activos()
        else:
            prestamos = self.repository.get_all()

        return [p.to_dict() for p in prestamos]

    def get_by_id(self, prestamo_id):
        """Retorna un prestamo especifico por su ID."""
        prestamo = self.repository.get_by_id(prestamo_id)
        if not prestamo:
            return None
        return prestamo.to_dict()

    def registrar_prestamo(self, data):
        """Valida y crea un nuevo prestamo, marcando el libro como prestado."""
        if 'libro_id' not in data or 'usuario_id' not in data:
            raise ValueError("Se requieren los campos 'libro_id' y 'usuario_id'.")

        libro_id = data['libro_id']
        usuario_id = data['usuario_id']

        libro = self.libro_repository.get_by_id(libro_id)
        if not libro:
            raise ValueError(f"El libro con ID {libro_id} no existe.")

        if not libro.disponible:
            raise ValueError(f"El libro '{libro.titulo}' ya esta prestado y no se encuentra disponible.")

        usuario = self.usuario_repository.get_by_id(usuario_id)
        if not usuario:
            raise ValueError(f"El usuario con ID {usuario_id} no existe.")

        # Calcular dias de prestamo por defecto segun tipo de usuario
        dias_prestamo = 7
        if usuario.tipo_usuario == 'Profesor':
            dias_prestamo = 14
        elif usuario.tipo_usuario == 'General':
            dias_prestamo = 5

        ahora = datetime.now(timezone.utc)
        fecha_esperada = ahora + timedelta(days=dias_prestamo)

        nuevo_prestamo = Prestamo(
            libro_id=libro_id,
            usuario_id=usuario_id,
            fecha_prestamo=ahora,
            fecha_devolucion_esperada=fecha_esperada,
            estado='ACTIVO'
        )

        # Cambiar el estado del libro a NO disponible
        libro.disponible = False

        self.repository.create(nuevo_prestamo)
        self.libro_repository.update()

        return nuevo_prestamo.to_dict()

    def registrar_devolucion(self, prestamo_id):
        """Registra la devolucion de un libro prestado y restaura su disponibilidad."""
        prestamo = self.repository.get_by_id(prestamo_id)
        if not prestamo:
            return None

        if prestamo.estado == 'DEVUELTO':
            raise ValueError("Este prestamo ya fue marcado como devuelto previamente.")

        ahora = datetime.now(timezone.utc)
        prestamo.fecha_devolucion_real = ahora
        prestamo.estado = 'DEVUELTO'

        # Restaurar la disponibilidad del libro
        if prestamo.libro:
            prestamo.libro.disponible = True
            self.libro_repository.update()

        self.repository.update()
        return prestamo.to_dict()

