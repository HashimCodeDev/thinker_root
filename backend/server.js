// server.js
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import { sequelize } from './config/db.js';
import applicationRouter from './routes/applicationRouter.js';
import campusAmbassadorRoutes from './routes/campusAmbassadorRoutes.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

/* ✅ Apply CORS before routes */
app.use(
  cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // set to false if not using cookies
  })
);

/* ✅ Parse JSON bodies before routers */
app.use(express.json());

/* ✅ Mount routers */
app.use('/api/applications', applicationRouter);
app.use('/api/campus-ambassadors', campusAmbassadorRoutes);

/* ✅ Database connection */
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB Connected');
    await sequelize.sync(); // creates tables if not exists
  } catch (err) {
    console.error('❌ DB Connection Error:', err);
  }
})();

/* ✅ Health check route */
app.get('/', (req, res) => {
  res.send('Hello, World! 🚀 Server is running.');
});

/* ✅ Start server */
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
