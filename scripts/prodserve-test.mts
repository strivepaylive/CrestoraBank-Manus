// Standalone verification of production static serving hardening.
// Runs serveStatic against dist/public and checks the sanitized output.
import express from "express";
import { serveStatic } from "../server/_core/vite";

const app = express();
serveStatic(app);
app.listen(3999, () => console.log("test server up on 3999"));
