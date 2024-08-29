
import express from "express";
import { getUsers, promoteUser, deleteUser } from "../Controllers/users.js";

const router = express.Router();

router.get("/users/:id",getUsers);
router.patch("/users/:id/promote", promoteUser);
router.delete("/users/delete/:id", deleteUser);

export default router;