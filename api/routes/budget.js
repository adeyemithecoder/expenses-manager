import express from "express";
import expressAsyncHandler from "express-async-handler";
import prisma from "../prisma/prisma.js";

const budgetsRoute = express.Router();

// Create a new budget
budgetsRoute.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    try {
      const { userId, amount, category, startDate, endDate } = req.body;

      // Find or create category for the user
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

      // Create the budget
      const newBudget = await prisma.budget.create({
        data: {
          userId,
          amount,
          categoryId: categoryRecord.id,
          startDate,
          endDate,
        },
      });

      res.status(201).json(newBudget);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
);

// Get all budgets for a user
budgetsRoute.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const budgets = await prisma.budget.findMany({
        where: { userId },
        include: {
          category: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" }, // Sort by latest first
      });

      const formattedBudgets = budgets.map(({ category, ...rest }) => ({
        ...rest,
        category: category.name,
      }));

      res.json(formattedBudgets);
    } catch (err) {
      console.log(err.meta?.message || err.message);
      res.status(500).json({ message: err.message });
    }
  })
);

// Get budget by ID
budgetsRoute.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    try {
      const budget = await prisma.budget.findUnique({
        where: { id: req.params.id },
        include: {
          category: {
            select: { name: true },
          },
        },
      });

      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }

      const { category, ...rest } = budget;
      const formattedBudget = { ...rest, category: category.name };

      res.json(formattedBudget);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
);

// Update a budget
budgetsRoute.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    try {
      const { userId, amount, category, startDate, endDate } = req.body;

      // Find or create category for the user
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

      // Update the budget with the new or existing category ID
      const updatedBudget = await prisma.budget.update({
        where: { id: req.params.id },
        data: {
          amount,
          categoryId: categoryRecord.id,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      });

      res.json(updatedBudget);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: err.message });
    }
  })
);

// Delete a budget
budgetsRoute.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    try {
      await prisma.budget.delete({ where: { id: req.params.id } });
      res.json({ message: "Budget deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
);

export { budgetsRoute };
