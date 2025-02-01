import express from "express";
import expressAsyncHandler from "express-async-handler";
import prisma from "../prisma/prisma.js";

const expensesRoute = express.Router();

// Create a new expense
expensesRoute.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      console.log(req.body);
      const { userId, amount, category, description, date } = req.body;

      // First, try to find if the category already exists for the given userId
      let categoryRecord = await prisma.category.findUnique({
        where: {
          name_userId: {
            name: category,
            userId: userId,
          },
        },
      });

      if (!categoryRecord) {
        // If category does not exist, create it
        categoryRecord = await prisma.category.create({
          data: {
            name: category,
            userId,
          },
        });
      }

      // Proceed with creating the new expense, using the found or newly created categoryId
      const newExpense = await prisma.expense.create({
        data: {
          userId,
          amount,
          categoryId: categoryRecord.id, // Use the id of the category
          description,
          date,
        },
      });

      res.status(201).json(newExpense);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: err.message });
    }
  })
);

// Get all expenses
expensesRoute.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    try {
      const { userId } = req.query; // Get userId from query parameters
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const expenses = await prisma.expense.findMany({
        where: { userId: userId },
      });

      res.json(expenses);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
);

// Get expense by ID
expensesRoute.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    try {
      const expense = await prisma.expense.findUnique({
        where: { id: req.params.id },
      });
      if (!expense)
        return res.status(404).json({ message: "Expense not found" });
      res.json(expense);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
);

// Update an expense
expensesRoute.put(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    try {
      const { amount, categoryId, description, date } = req.body;
      const updatedExpense = await prisma.expense.update({
        where: { id: req.params.id },
        data: { amount, categoryId, description, date: new Date(date) },
      });
      res.json(updatedExpense);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
);

// Delete an expense
expensesRoute.delete(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    try {
      await prisma.expense.delete({ where: { id: req.params.id } });
      res.json({ message: "Expense deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
);

export { expensesRoute };
