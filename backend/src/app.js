import express from "express";
import dotenv from "dotenv";
import issueRoutes from "./routes/issueRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/issues", issueRoutes);

app.get("/", (req, res) => {
  res.send("CivicFix API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});