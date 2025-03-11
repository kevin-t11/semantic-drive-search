import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router } from "./route";
import { errorHandler } from "./middleware/error";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
