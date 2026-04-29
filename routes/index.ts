import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import businessesRouter from "./businesses";
import chatsRouter from "./chats";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import analyticsRouter from "./analytics";
import chatbotRouter from "./chatbot";
import webhookRouter from "./webhook";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/businesses", businessesRouter);
router.use("/chats", chatsRouter);
router.use("/orders", ordersRouter);
router.use("/payments", paymentsRouter);
router.use("/analytics", analyticsRouter);
router.use("/chatbot", chatbotRouter);
router.use("/webhook", webhookRouter);

export default router;
