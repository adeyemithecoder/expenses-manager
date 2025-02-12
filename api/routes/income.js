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
      let categoryRecord = await prisma.category.findUnique({
        where: { name_userId: { name: category, userId } },
      });

      if (!categoryRecord) {
        categoryRecord = await prisma.category.create({
          data: { name: category, userId },
        });
      }

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
        orderBy: { createdAt: "desc" }, // Sort by latest first
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

// Get income by ID
incomesRoute.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      const income = await prisma.income.findUnique({
        where: { id },
        include: { category: { select: { name: true } } },
      });

      if (!income) {
        return res.status(404).json({ message: "Income not found" });
      }

      res.json({
        ...income,
        category: income.category.name,
      });
    } catch (err) {
      console.error("Error fetching income:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Update an income
incomesRoute.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    try {
      const { userId, amount, category, source, date } = req.body;

      let categoryRecord = await prisma.category.findUnique({
        where: {
          name_userId: {
            name: category,
            userId: userId,
          },
        },
      });

      if (!categoryRecord) {
        categoryRecord = await prisma.category.create({
          data: {
            name: category,
            userId,
          },
        });
      }

      const updatedIncome = await prisma.income.update({
        where: { id: req.params.id },
        data: {
          amount,
          categoryId: categoryRecord.id,
          source,
          date: new Date(date),
        },
      });

      res.json(updatedIncome);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: err.message });
    }
  })
);

// Delete an income
incomesRoute.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    try {
      const deletedIncome = await prisma.income.delete({
        where: { id: req.params.id },
      });

      res.json({ message: "Income deleted successfully", deletedIncome });
    } catch (err) {
      console.error("Error deleting income:", err);
      res.status(500).json({ message: "Failed to delete income" });
    }
  })
);

export { incomesRoute };
