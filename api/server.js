import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { userRoute } from "./routes/users.js";
import { expensesRoute } from "./routes/expenses.js";
import { incomesRoute } from "./routes/income.js";
import { budgetsRoute } from "./routes/budget.js";
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const port = process.env.port || 4000;

app.use("/api/expenses", expensesRoute);
app.use("/api/incomes", incomesRoute);
app.use("/api/budgets", budgetsRoute);
app.use("/api/users", userRoute);

app.get("/", (req, res) => res.send("welcome to expenses manager app"));
app.use((err, req, res, next) => {
  res.status(500).send({ message: `My Mistake= ${err.message}` });
});
app.listen(port, () =>
  console.log(`server is currently running on port http://localhost:${port}`)
);
