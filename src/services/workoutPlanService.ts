import { randomUUID } from "crypto";
import { WorkoutPlanBuilder } from "../builders/workoutPlanBuilder";
import { NotFoundError, ValidationError } from "../errors/appErrors";
import {
  CreateWorkoutPlanInput,
  StoredWorkoutPlan,
  WorkoutPlan,
} from "../models/workoutPlan.types";
import { WorkoutPlanRepository } from "../repositories/workoutPlanRepository";
import { WorkoutMetricsCalculator } from "./workoutMetricsCalculator";

export class WorkoutPlanService {
  constructor(
    private readonly repository: WorkoutPlanRepository,
    private readonly metricsCalculator: WorkoutMetricsCalculator,
  ) {}

  public createPlan(input: CreateWorkoutPlanInput): StoredWorkoutPlan {
    const builtPlan = this.buildPlanFromInput(input);
    const metrics = this.metricsCalculator.calculateAll(builtPlan);

    const storedPlan: StoredWorkoutPlan = {
      id: randomUUID(),
      ...builtPlan,
      metrics,
      createdAt: new Date().toISOString(),
    };

    return this.repository.save(storedPlan);
  }

  public getAllPlans(muscleGroup?: string): StoredWorkoutPlan[] {
    return this.repository.findAll(muscleGroup);
  }

  public getPlanById(id: string): StoredWorkoutPlan {
    const plan = this.repository.findById(id);
    if (!plan) {
      throw new NotFoundError(`Workout plan with id '${id}' was not found.`);
    }
    return plan;
  }

  public updatePlan(
    id: string,
    input: CreateWorkoutPlanInput,
  ): StoredWorkoutPlan {
    const existingPlan = this.getPlanById(id);
    const builtPlan = this.buildPlanFromInput(input);
    const metrics = this.metricsCalculator.calculateAll(builtPlan);

    const updatedPlan: StoredWorkoutPlan = {
      id: existingPlan.id,
      ...builtPlan,
      metrics,
      createdAt: existingPlan.createdAt,
    };

    const saved = this.repository.update(id, updatedPlan);
    if (!saved) {
      throw new NotFoundError(`Workout plan with id '${id}' was not found.`);
    }
    return saved;
  }

  public deletePlan(id: string): void {
    const deleted = this.repository.deleteById(id);
    if (!deleted) {
      throw new NotFoundError(`Workout plan with id '${id}' was not found.`);
    }
  }

  private buildPlanFromInput(input: CreateWorkoutPlanInput): WorkoutPlan {
    if (!input || !Array.isArray(input.exercises)) {
      throw new ValidationError("Exercises must be provided as an array.");
    }

    const builder = new WorkoutPlanBuilder().setTitle(input.title);

    if (input.targetMuscleGroup) {
      builder.setTargetMuscleGroup(input.targetMuscleGroup);
    }

    input.exercises.forEach((exercise) => builder.addExercise(exercise));

    return builder.build();
  }
}
