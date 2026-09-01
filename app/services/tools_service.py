from datetime import datetime, timedelta

class ToolsService:
    """Capa de servicios stateless para utilidades y calculos puramente algoritmitos."""

    @staticmethod
    def generar_cita_bibliografica(data):
        """
        Genera citas bibliograficas en diferentes formatos de estilo (APA 7, IEEE, MLA, Chicago).
        Es totalmente stateless: recibe parametros y devuelve el texto formateado.
        """
        titulo = data.get('titulo', '').strip() or 'Título Desconocido'
        autor = data.get('autor', '').strip() or 'Autor Desconocido'
        anio = str(data.get('anio_publicacion') or data.get('anio') or 's.f.').strip()
        genero = data.get('genero', '').strip() or 'Libro'
        formato = (data.get('formato') or 'APA7').strip().upper()

        # Formatear nombre de autor para estilos academicos (Apellido, I.) si es posible
        partes_autor = autor.split()
        if len(partes_autor) >= 2:
            apellido = partes_autor[-1]
            iniciales = ". ".join([p[0].upper() for p in partes_autor[:-1]]) + "."
            autor_apa = f"{apellido}, {iniciales}"
        else:
            autor_apa = autor

        citas = {}

        # 1. APA 7ª Edición
        citas['APA7'] = f"{autor_apa} ({anio}). {titulo}. [{genero}]."

        # 2. IEEE
        citas['IEEE'] = f'{autor}, "{titulo}," {genero}, {anio}.'

        # 3. MLA 9ª Edición
        citas['MLA'] = f'{autor}. {titulo}. {anio}.'

        # 4. Chicago Manual of Style
        citas['CHICAGO'] = f'{autor}. {titulo}. {anio}.'

        cita_seleccionada = citas.get(formato, citas['APA7'])

        return {
            'formato': formato,
            'cita': cita_seleccionada,
            'todas_las_citas': citas,
            'detalles': {
                'titulo': titulo,
                'autor': autor,
                'anio': anio,
                'genero': genero
            }
        }

    @staticmethod
    def calcular_multa_y_fechas(data):
        """
        Calcula la fecha de devolucion limite y estimacion de multa por mora.
        Es totalmente stateless: no consulta ni altera la base de datos.
        """
        tipo_usuario = (data.get('tipo_usuario') or 'Estudiante').strip()
        dias_retraso_manual = int(data.get('dias_retraso', 0))

        # Parsear fecha de inicio o usar la fecha actual si no se provee
        fecha_inicio_str = data.get('fecha_inicio')
        if fecha_inicio_str:
            try:
                fecha_inicio = datetime.fromisoformat(fecha_inicio_str.replace('Z', '+00:00'))
            except Exception:
                fecha_inicio = datetime.now()
        else:
            fecha_inicio = datetime.now()

        # Reglas de negocio por perfil
        reglas_perfil = {
            'Estudiante': {'dias_permitidos': 7, 'tarifa_multa_dia': 1.50},
            'Profesor': {'dias_permitidos': 14, 'tarifa_multa_dia': 1.00},
            'General': {'dias_permitidos': 5, 'tarifa_multa_dia': 2.00}
        }

        regla = reglas_perfil.get(tipo_usuario, reglas_perfil['Estudiante'])
        dias_permitidos = regla['dias_permitidos']
        tarifa_diaria = regla['tarifa_multa_dia']

        fecha_limite = fecha_inicio + timedelta(days=dias_permitidos)

        # Si se paso dias_retraso directamente o se calcula respecto a la fecha actual
        dias_retraso = max(0, dias_retraso_manual)
        monto_multa = round(dias_retraso * tarifa_diaria, 2)

        return {
            'tipo_usuario': tipo_usuario,
            'fecha_inicio': fecha_inicio.strftime('%Y-%m-%d'),
            'dias_permitidos': dias_permitidos,
            'fecha_limite_devolucion': fecha_limite.strftime('%Y-%m-%d'),
            'dias_retraso': dias_retraso,
            'tarifa_diaria_multa': f"${tarifa_diaria:.2f}",
            'monto_total_multa': f"${monto_multa:.2f}",
            'es_moroso': dias_retraso > 0
        }

