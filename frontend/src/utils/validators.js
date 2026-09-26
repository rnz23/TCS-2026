/**
 * Utilidades de validación mediante Expresiones Regulares (Regex)
 * para formularios de la aplicación.
 */

// 1. Nombre: Solo letras del alfabeto (incluye tildes y ñ) y espacios, longitud entre 3 y 50 caracteres.
export const REGEX_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{3,50}$/;

// 2. Correo electrónico: Formato estándar RFC (usuario@dominio.extension).
export const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 3. Teléfono: Opcional signo '+' al inicio, seguido de 7 a 15 dígitos numéricos.
export const REGEX_TELEFONO = /^\+?[0-9]{7,15}$/;

// 4. Año de publicación (para libros): 4 dígitos numéricos entre 1000 y 2099.
export const REGEX_ANIO = /^(1[0-9]{3}|20[0-9]{2})$/;

/**
 * Valida un campo individual contra su expresión regular correspondiente.
 * @param {string} campo - 'nombre' | 'email' | 'telefono' | 'anio'
 * @param {string} valor - Valor a validar
 * @returns {boolean} true si cumple con el patrón regex
 */
export const validarCampo = (campo, valor) => {
  if (!valor || typeof valor !== 'string') return false;
  const val = valor.trim();

  switch (campo) {
    case 'nombre':
      return REGEX_NOMBRE.test(val);
    case 'email':
      return REGEX_EMAIL.test(val);
    case 'telefono':
      return REGEX_TELEFONO.test(val);
    case 'anio':
      return REGEX_ANIO.test(val);
    default:
      return true;
  }
};

/**
 * Valida todos los campos del formulario de usuario.
 * @param {Object} data - { nombre, email, telefono }
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validarFormularioUsuario = ({ nombre, email, telefono }) => {
  const errors = {};

  if (!nombre || !nombre.trim()) {
    errors.nombre = 'required';
  } else if (!REGEX_NOMBRE.test(nombre.trim())) {
    errors.nombre = 'invalid';
  }

  if (!email || !email.trim()) {
    errors.email = 'required';
  } else if (!REGEX_EMAIL.test(email.trim())) {
    errors.email = 'invalid';
  }

  // Teléfono es opcional, pero si se ingresa debe cumplir con la expresión regular
  if (telefono && telefono.trim() && !REGEX_TELEFONO.test(telefono.trim())) {
    errors.telefono = 'invalid';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

