import express, { Express } from "express";
import path from "path";
import { WorkoutPlanController } from "./controllers/workoutPlanController";
import { InMemoryWorkoutPlanRepository } from "./repositories/inMemoryWorkoutPlanRepository";
import { WorkoutPlanRepository } from "./repositories/workoutPlanRepository";
import { createWorkoutPlanRouter } from "./routes/workoutPlanRoutes";
import { WorkoutMetricsCalculator } from "./services/workoutMetricsCalculator";
import { WorkoutPlanService } from "./services/workoutPlanService";

export function createApp(
  repository: WorkoutPlanRepository = new InMemoryWorkoutPlanRepository(),
): Express {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, "../public")));

  const metricsCalculator = new WorkoutMetricsCalculator();
  const workoutPlanService = new WorkoutPlanService(
    repository,
    metricsCalculator,
  );
  const workoutPlanController = new WorkoutPlanController(workoutPlanService);

  app.use("/api/workout-plans", createWorkoutPlanRouter(workoutPlanController));

  return app;
}
