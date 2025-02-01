import express from "express";
import prisma from "../prisma/prisma.js";
const userRoute = express.Router();
import expressAsyncHandler from "express-async-handler";

//create-user
userRoute.get("/one", (req, res) => res.send("welcome to react-native app"));
userRoute.post(
  "/create-user",
  expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    try {
      const userAlreadyExist = await prisma.user.findFirst({
        where: { username: req.body.username },
      });

      if (userAlreadyExist) {
        res.status(409).send({
          message: `User with the name '${req.body.username}' already exists`,
        });
        return;
      }
      const newUser = await prisma.user.create({
        data: req.body,
      });

      res.status(200).json(newUser);
    } catch (err) {
      res
        .status(500)
        .json({ message: "An error occurred", error: err.message });
    }
  })
);

userRoute.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    try {
      const userByUsername = await prisma.user.findUnique({
        where: {
          username: username,
        },
      });

      if (!userByUsername) {
        console.log("Username not found");
        res.status(404).send({
          message: "Username not found",
        });
      }
      const user = await prisma.user.findFirst({
        where: {
          AND: [{ username: username }, { password: password }],
        },
      });

      if (!user) {
        console.log("Wrong password");
        res.status(404).send({
          message: "Wrong password",
        });
      }
      res.status(200).json(user);
    } catch (err) {
      res
        .status(500)
        .json({ message: "An error occurred", error: err.message });
    }
  })
);

export { userRoute };
