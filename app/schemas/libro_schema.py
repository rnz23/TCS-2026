class LibroSchema:
    """Esquema de serializacion y validacion para Libro."""

    @staticmethod
    def dump(libro):
        if not libro:
            return None
        return libro.to_dict()

    @staticmethod
    def dump_many(libros):
        return [LibroSchema.dump(l) for l in libros]
