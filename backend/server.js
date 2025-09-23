// server.js
import { fileURLToPath } from "url";
import { dirname } from "path";
import express from "express";
import cors from "cors";
import { sequelize } from "./config/db.js";
import applicationRouter from "./routes/applicationRouter.js";
import campusAmbassadorRoutes from "./routes/campusAmbassadorRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || ["http://localhost:3000"],
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	})
);
app.use(express.json());
app.use("/api/applications", applicationRouter);
app.use("/api/campus-ambassadors", campusAmbassadorRoutes);

(async () => {
	try {
		await sequelize.authenticate();
		console.log("✅ DB Connected");
		await sequelize.sync(); // creates table if not exists
	} catch (err) {
		console.error("❌ DB Connection Error:", err);
	}
})();

// Example route
app.get("/", (req, res) => {
	res.send("Hello, World! 🚀 Server is running.");
});

// Start server
app.listen(PORT, () => {
	console.log(`✅ Server running on http://localhost:${PORT}`);
});
