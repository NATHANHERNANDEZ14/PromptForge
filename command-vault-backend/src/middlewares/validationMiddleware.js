const Joi = require('joi');

// ─────────────────────────────────────────────────────────────────────────────
// Schemas de validación
// ─────────────────────────────────────────────────────────────────────────────

const schemas = {

  // Login
  login: Joi.object({
    username: Joi.string().trim().min(3).max(50).required()
      .messages({
        'string.empty': 'El usuario es requerido.',
        'string.min': 'El usuario debe tener al menos 3 caracteres.',
        'any.required': 'El usuario es requerido.'
      }),
    password: Joi.string().min(1).required()
      .messages({
        'string.empty': 'La contraseña es requerida.',
        'any.required': 'La contraseña es requerida.'
      })
  }),

  // Crear usuario
  createUser: Joi.object({
    name: Joi.string().trim().min(2).max(100).required()
      .messages({
        'string.empty': 'El nombre es requerido.',
        'string.min': 'El nombre debe tener al menos 2 caracteres.',
        'any.required': 'El nombre completo es requerido.'
      }),
    username: Joi.string().trim().min(3).max(50)
      .pattern(/^[a-z0-9_.-]+$/)
      .lowercase()
      .required()
      .messages({
        'string.empty': 'El usuario es requerido.',
        'string.pattern.base': 'El usuario solo puede contener letras minúsculas, números, puntos, guiones y guiones bajos.',
        'string.min': 'El usuario debe tener al menos 3 caracteres.',
        'any.required': 'El usuario es requerido.'
      }),
    email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required()
      .messages({
        'string.email': 'El correo electrónico no tiene un formato válido.',
        'string.empty': 'El correo electrónico es requerido.',
        'any.required': 'El correo electrónico es requerido.'
      }),
    password: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres.',
        'string.max': 'La contraseña no puede exceder 128 caracteres.',
        'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número.',
        'string.empty': 'La contraseña es requerida.',
        'any.required': 'La contraseña es requerida.'
      }),
    role: Joi.string().valid('user', 'admin').default('user'),
    active: Joi.boolean().default(true)
  }),

  // Actualizar usuario
  updateUser: Joi.object({
    name: Joi.string().trim().min(2).max(100)
      .messages({ 'string.min': 'El nombre debe tener al menos 2 caracteres.' }),
    username: Joi.string().trim().min(3).max(50)
      .pattern(/^[a-z0-9_.-]+$/).lowercase()
      .messages({ 'string.pattern.base': 'El usuario solo puede contener letras minúsculas, números, puntos y guiones.' }),
    email: Joi.string().email({ tlds: { allow: false } }).lowercase().trim()
      .messages({ 'string.email': 'El correo electrónico no tiene un formato válido.' }),
    password: Joi.string().min(8).max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres.',
        'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número.'
      }),
    role: Joi.string().valid('user', 'admin'),
    active: Joi.boolean()
  }).min(1).messages({ 'object.min': 'Se debe enviar al menos un campo para actualizar.' })

};

// ─────────────────────────────────────────────────────────────────────────────
// Factory: crea middleware de validación para un schema dado
// ─────────────────────────────────────────────────────────────────────────────
function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      console.warn(`[Validation] Schema "${schemaName}" no encontrado.`);
      return next();
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,  // Retornar todos los errores, no solo el primero
      stripUnknown: true, // Eliminar campos no definidos en el schema
      convert: true       // Aplicar conversiones (lowercase, trim, etc.)
    });

    if (error) {
      const errors = error.details.map(d => d.message);
      return res.status(400).json({
        error: errors[0],    // Mensaje principal
        errors               // Lista completa
      });
    }

    req.body = value; // Reemplazar con los datos validados y sanitizados
    next();
  };
}

module.exports = { validate, schemas };
