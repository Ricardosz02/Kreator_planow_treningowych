import { StoredWorkoutPlan } from "../models/workoutPlan.types";

export interface WorkoutPlanRepository {
  save(plan: StoredWorkoutPlan): StoredWorkoutPlan;
  findAll(muscleGroup?: string): StoredWorkoutPlan[];
  findById(id: string): StoredWorkoutPlan | undefined;
  update(id: string, plan: StoredWorkoutPlan): StoredWorkoutPlan | undefined;
  deleteById(id: string): boolean;
  clear(): void;
}
