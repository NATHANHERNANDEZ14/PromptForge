require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./src/config/db');
const routes = require('./src/routes');

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// CORS — solo orígenes permitidos desde .env
// ─────────────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Permite requests sin origin (Postman, curl) solo en desarrollo
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─────────────────────────────────────────────────────────────────────────────
// HELMET — Headers HTTP de seguridad
// ─────────────────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false // Puede ajustarse según el frontend
}));

// ─────────────────────────────────────────────────────────────────────────────
// RATE LIMITING — Protección contra fuerza bruta y DDoS
// ─────────────────────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máx 10 intentos de login por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso. Cuenta bloqueada temporalmente por 15 minutos.' },
  skipSuccessfulRequests: true // no cuenta los logins exitosos
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);

// ─────────────────────────────────────────────────────────────────────────────
// BODY PARSING & SANITIZACIÓN
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Prevenir MongoDB operator injection de forma segura para Express 5
app.use((req, res, next) => {
  if (req.body) {
    mongoSanitize.sanitize(req.body, { replaceWith: '_' });
  }
  if (req.params) {
    mongoSanitize.sanitize(req.params, { replaceWith: '_' });
  }
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE
// ─────────────────────────────────────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || 500;
  
  // Loggear el error detallado internamente en el servidor
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}:`, err);

  // Mensajes amigables para el frontend
  let userFriendlyMessage = 'Ha ocurrido un error inesperado. Por favor, intenta más tarde.';
  
  if (status === 400 || status === 401 || status === 403 || status === 404 || status === 429) {
    userFriendlyMessage = err.message; // Errores operacionales (validaciones, no encontrado) pueden mostrarse
  } else if (err.message && err.message.includes('Mongo')) {
    userFriendlyMessage = 'Error en la base de datos.';
  }

  res.status(status).json({ error: userFriendlyMessage });
});

// ─────────────────────────────────────────────────────────────────────────────
// SERVER
// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`✅ CORS permitido para: ${allowedOrigins.join(', ')}`);
});