import { Router } from "express";
import { WorkoutPlanController } from "../controllers/workoutPlanController";

export function createWorkoutPlanRouter(
  controller: WorkoutPlanController,
): Router {
  const router = Router();

  router.get("/", controller.getAll);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.delete);

  return router;
}
