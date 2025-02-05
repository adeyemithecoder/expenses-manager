import express from "express";
import expressAsyncHandler from "express-async-handler";
import prisma from "../prisma/prisma.js";

const incomesRoute = express.Router();

// Create a new income
incomesRoute.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      console.log(req.body);
      const { userId, amount, category, source, date } = req.body;
      if (!userId || !amount || !category || !source || !date) {
        return res.status(400).json({ message: "All fields are required" });
      }
      // Check if category exists for the user
      let categoryRecord = await prisma.category.findUnique({
        where: { name_userId: { name: category, userId } },
      });

      // Create category if it does not exist
      if (!categoryRecord) {
        categoryRecord = await prisma.category.create({
          data: { name: category, userId },
        });
      }

      // Create new income record
      const newIncome = await prisma.income.create({
        data: {
          userId,
          amount,
          categoryId: categoryRecord.id,
          source,
          date,
        },
      });

      res.status(201).json(newIncome);
    } catch (err) {
      console.error("Error creating income:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Get all incomes
incomesRoute.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId)
        return res.status(400).json({ message: "User ID is required" });

      const incomes = await prisma.income.findMany({
        where: { userId },
        include: { category: { select: { name: true } } },
      });

      const formattedIncomes = incomes.map(({ category, ...rest }) => ({
        ...rest,
        category: category.name,
      }));

      res.json(formattedIncomes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
);

export { incomesRoute };
