const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// ─────────────────────────────────────────────────────────────────────────────
// Validación de JWT_SECRET en arranque
// ─────────────────────────────────────────────────────────────────────────────
if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET no está definido en las variables de entorno. El servidor no puede arrancar de forma segura.');
  process.exit(1);
}

if (JWT_SECRET.length < 32) {
  console.warn('⚠️  ADVERTENCIA: JWT_SECRET es demasiado corto. Se recomienda al menos 32 caracteres aleatorios.');
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware: Verificar token JWT
// ─────────────────────────────────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: Token de autorización no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'La sesión ha expirado. Por favor, inicia sesión nuevamente.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido. Por favor, inicia sesión nuevamente.' });
    }
    return res.status(401).json({ error: 'Error de autenticación. Por favor, inicia sesión.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Middleware: Verificar rol de Administrador
// ─────────────────────────────────────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: Se requieren permisos de Administrador.' });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// Generar token JWT de acceso
// ─────────────────────────────────────────────────────────────────────────────
const generateToken = (user) => {
  const payload = {
    id: user.id || user._id?.toString(),
    username: user.username,
    name: user.name,
    role: user.role,
    email: user.email
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'command-vault',
    audience: 'command-vault-client'
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken
};
