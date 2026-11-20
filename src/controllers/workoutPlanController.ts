import { Request, Response } from "express";
import { NotFoundError, ValidationError } from "../errors/appErrors";
import { WorkoutPlanService } from "../services/workoutPlanService";

export class WorkoutPlanController {
  constructor(private readonly workoutPlanService: WorkoutPlanService) {}

  public create = (req: Request, res: Response): void => {
    try {
      const createdPlan = this.workoutPlanService.createPlan(req.body);
      res.status(201).json({ success: true, data: createdPlan });
    } catch (error: unknown) {
      this.handleError(error, res);
    }
  };

  public getAll = (req: Request, res: Response): void => {
    const muscleGroup =
      typeof req.query.muscleGroup === "string"
        ? req.query.muscleGroup
        : undefined;
    const plans = this.workoutPlanService.getAllPlans(muscleGroup);
    res.status(200).json({ success: true, data: plans });
  };

  public getById = (req: Request, res: Response): void => {
    try {
      const plan = this.workoutPlanService.getPlanById(req.params.id);
      res.status(200).json({ success: true, data: plan });
    } catch (error: unknown) {
      this.handleError(error, res);
    }
  };

  public update = (req: Request, res: Response): void => {
    try {
      const updatedPlan = this.workoutPlanService.updatePlan(
        req.params.id,
        req.body,
      );
      res.status(200).json({ success: true, data: updatedPlan });
    } catch (error: unknown) {
      this.handleError(error, res);
    }
  };

  public delete = (req: Request, res: Response): void => {
    try {
      this.workoutPlanService.deletePlan(req.params.id);
      res.status(204).send();
    } catch (error: unknown) {
      this.handleError(error, res);
    }
  };

  private handleError(error: unknown, res: Response): void {
    if (error instanceof ValidationError) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }

    if (error instanceof NotFoundError) {
      res.status(404).json({ success: false, error: error.message });
      return;
    }

    res.status(500).json({ success: false, error: "Internal server error." });
  }
}
