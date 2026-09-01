class AutorSchema:
    """Esquema de serializacion y validacion para Autor."""

    @staticmethod
    def dump(autor, include_libros=False):
        if not autor:
            return None
        return autor.to_dict(include_libros=include_libros)

    @staticmethod
    def dump_many(autores, include_libros=False):
        return [AutorSchema.dump(a, include_libros=include_libros) for a in autores]
