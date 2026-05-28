import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth";
import { securityRouter } from "./routes/security";
import { transactionRouter } from "./routes/transactions";
import { walletRouter } from "./routes/wallets";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "wallax-api" });
});

app.use("/auth", authRouter);
app.use("/wallets", walletRouter);
app.use("/transactions", transactionRouter);
app.use("/security", securityRouter);

app.listen(port, () => {
  console.log(`Wallax API listening on http://localhost:${port}`);
});
