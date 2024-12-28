import express, { Application, Request, Response } from "express";
import router from "./Routes/routes";
import globalErrorHandler from "./Middleware/globalErrorHandler";
import notFound from "./Middleware/notFound";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

const app: Application = express();
app.use(
  cors({
    origin: [
      "https://maniobd.com",
      "http://localhost:3000",
      "http://192.168.0.104",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "Server Running",
  });
});

app.use("/api/v1", router);
app.use(globalErrorHandler);
app.use(notFound);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

export default app;
