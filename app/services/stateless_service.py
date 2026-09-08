import io
import base64
import json
import re

class StatelessService:
    """
    Servicio Stateless (Sin Estado):
    Procesa solicitudes de manera determinista y autocontenida sin persistir datos en sesión ni en base de datos.
    """

    @staticmethod
    def format_citation(data, style='apa'):
        """
        Genera al vuelo una cita bibliográfica formateada (APA 7ma, BibTeX, MLA 9na, Chicago).
        """
        titulo = str(data.get('titulo') or 'Sin título').strip()
        autor = str(data.get('autor_nombre') or 'Anónimo').strip()
        anio = str(data.get('anio_publicacion') or 's.f.').strip()
        genero = str(data.get('genero') or '').strip()
        libro_id = str(data.get('id') or '0')

        # Formatear nombre de autor si está en formato "Apellido, Nombre" o "Nombre Apellido"
        partes_autor = autor.split(',')
        if len(partes_autor) == 2:
            apellido = partes_autor[0].strip()
            nombre = partes_autor[1].strip()
            iniciales = '. '.join([p[0].upper() for p in nombre.split() if p]) + '.' if nombre else ''
            autor_apa = f"{apellido}, {iniciales}".strip()
            autor_mla = f"{apellido}, {nombre}".strip()
            autor_chicago = f"{nombre} {apellido}".strip()
        else:
            autor_apa = autor
            autor_mla = autor
            autor_chicago = autor

        style = (style or 'apa').lower().strip()

        if style == 'apa':
            # APA 7ma Edición: Apellido, A. A. (Año). Título de la obra en cursiva.
            citation = f"{autor_apa} ({anio}). {titulo}."
            if genero:
                citation += f" [{genero}]."
            return {
                'style': 'APA 7ma Edición',
                'citation': citation,
                'raw_text': citation
            }

        elif style == 'bibtex':
            # Formato BibTeX para LaTeX
            clean_key = re.sub(r'[^a-zA-Z0-9]', '', autor.split(',')[0].lower()) + (anio if anio != 's.f.' else 'nd') + libro_id
            bibtex_str = (
                f"@book{{{clean_key},\n"
                f"  author    = {{{autor}}},\n"
                f"  title     = {{{titulo}}},\n"
                f"  year      = {{{anio}}},\n"
                f"  note      = {{Género: {genero if genero else 'General'}}}\n"
                f"}}"
            )
            return {
                'style': 'BibTeX',
                'citation': bibtex_str,
                'raw_text': bibtex_str
            }

        elif style == 'mla':
            # MLA 9na Edición: Apellido, Nombre. Título de la obra. Año.
            citation = f"{autor_mla}. {titulo}."
            if anio != 's.f.':
                citation += f" {anio}."
            return {
                'style': 'MLA 9na Edición',
                'citation': citation,
                'raw_text': citation
            }

        elif style == 'chicago':
            # Chicago Manual of Style: Nombre Apellido, Título (Año).
            citation = f"{autor_chicago}, {titulo}"
            if anio != 's.f.':
                citation += f" ({anio})."
            else:
                citation += "."
            return {
                'style': 'Chicago',
                'citation': citation,
                'raw_text': citation
            }

        else:
            return {
                'style': 'Texto Estándar',
                'citation': f"\"{titulo}\" - {autor} ({anio})",
                'raw_text': f"\"{titulo}\" - {autor} ({anio})"
            }

    @staticmethod
    def generate_qr_code(data):
        """
        Genera un código QR en memoria en formato PNG Base64 con la ficha del libro.
        No almacena archivos en disco ni modifica la base de datos.
        """
        import qrcode

        libro_id = data.get('id', 'N/A')
        titulo = data.get('titulo', 'Sin título')
        autor = data.get('autor_nombre', 'Anónimo')
        genero = data.get('genero', 'N/A')
        estado = "Disponible" if data.get('disponible', True) else "Prestado"

        # Contenido para la etiqueta del libro
        qr_payload = (
            f"BIBLIOTECA MUNICIPAL / INSTITUCIONAL\n"
            f"ID: #{libro_id}\n"
            f"Título: {titulo}\n"
            f"Autor: {autor}\n"
            f"Género: {genero}\n"
            f"Estado: {estado}"
        )

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=8,
            border=2,
        )
        qr.add_data(qr_payload)
        qr.make(fit=True)

        img = qr.make_image(fill_color="#1e1b4b", back_color="#ffffff")

        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

        return {
            'success': True,
            'qr_base64': f"data:image/png;base64,{img_str}",
            'payload_text': qr_payload,
            'libro_id': libro_id,
            'titulo': titulo,
            'autor': autor
        }
