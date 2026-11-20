import { StoredWorkoutPlan } from "../models/workoutPlan.types";
import { WorkoutPlanRepository } from "./workoutPlanRepository";

export class InMemoryWorkoutPlanRepository implements WorkoutPlanRepository {
  private readonly plans: Map<string, StoredWorkoutPlan> = new Map();

  public save(plan: StoredWorkoutPlan): StoredWorkoutPlan {
    this.plans.set(plan.id, this.clonePlan(plan));
    return this.clonePlan(plan);
  }

  public findAll(muscleGroup?: string): StoredWorkoutPlan[] {
    const allPlans = Array.from(this.plans.values()).map((plan) =>
      this.clonePlan(plan),
    );

    if (!muscleGroup || muscleGroup.trim() === "") {
      return allPlans;
    }

    const normalizedFilter = muscleGroup.trim().toLowerCase();
    return allPlans.filter((plan) =>
      plan.targetMuscleGroup.toLowerCase().includes(normalizedFilter),
    );
  }

  public findById(id: string): StoredWorkoutPlan | undefined {
    const plan = this.plans.get(id);
    return plan ? this.clonePlan(plan) : undefined;
  }

  public update(
    id: string,
    plan: StoredWorkoutPlan,
  ): StoredWorkoutPlan | undefined {
    if (!this.plans.has(id)) {
      return undefined;
    }
    this.plans.set(id, this.clonePlan(plan));
    return this.clonePlan(plan);
  }

  public deleteById(id: string): boolean {
    return this.plans.delete(id);
  }

  public clear(): void {
    this.plans.clear();
  }

  private clonePlan(plan: StoredWorkoutPlan): StoredWorkoutPlan {
    return {
      ...plan,
      exercises: plan.exercises.map((exercise) => ({ ...exercise })),
      metrics: { ...plan.metrics },
    };
  }
}
