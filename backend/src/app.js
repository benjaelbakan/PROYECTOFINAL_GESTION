import express from "express";
import cors from "cors";
import { db } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando correctamente 😎");
});

app.listen(3001, () => {
  console.log("Servidor backend corriendo en puerto 3001");
});
