import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import assistantRoutes from "./routes/assistantRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";

dotenv.config();

const app = express();

// Increase payload size limits for image uploads with base64 encoding
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
    return res.sendStatus(200);
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/assistant", assistantRoutes);
console.log('Mounting issue routes...');
app.use("/api/issues", issueRoutes);
console.log('Mounted issue routes');
app.use("/api/comments", commentRoutes);
app.use("/api/team", teamRoutes);

app.get("/", (req, res) => {
  res.send("CivicFix API running");
});

export default app;
