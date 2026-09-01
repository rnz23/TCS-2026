def validate_required_fields(data, required_fields):
    """
    Verifica que el diccionario 'data' contenga todos los campos requeridos
    y que no sean valores vacios o nulos.
    """
    if not isinstance(data, dict):
        return False, "El cuerpo de la solicitud debe ser un objeto JSON valido."
    
    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None or (isinstance(data[field], str) and not data[field].strip()):
            missing_fields.append(field)
            
    if missing_fields:
        return False, f"Faltan los siguientes campos requeridos: {', '.join(missing_fields)}"
        
    return True, None
