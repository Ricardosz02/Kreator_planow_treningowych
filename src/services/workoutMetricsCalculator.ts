import { WorkoutMetrics, WorkoutPlan } from "../models/workoutPlan.types";

export class WorkoutMetricsCalculator {
  private readonly averageSetExecutionSeconds: number = 40;

  public calculateTotalVolume(plan: WorkoutPlan): number {
    return plan.exercises.reduce((total, exercise) => {
      return total + exercise.sets * exercise.reps * exercise.weightKg;
    }, 0);
  }

  public calculateAverageRpe(plan: WorkoutPlan): number {
    if (plan.exercises.length === 0) {
      return 0;
    }

    const totalRpe = plan.exercises.reduce(
      (sum, exercise) => sum + exercise.rpe,
      0,
    );
    return Number((totalRpe / plan.exercises.length).toFixed(2));
  }

  public estimateDurationMinutes(plan: WorkoutPlan): number {
    const totalSeconds = plan.exercises.reduce((sum, exercise) => {
      const workTime = exercise.sets * this.averageSetExecutionSeconds;
      const restTime = exercise.sets * exercise.restSeconds;
      return sum + workTime + restTime;
    }, 0);

    return Math.ceil(totalSeconds / 60);
  }

  public calculateAll(plan: WorkoutPlan): WorkoutMetrics {
    return {
      totalVolumeKg: this.calculateTotalVolume(plan),
      averageRpe: this.calculateAverageRpe(plan),
      estimatedDurationMinutes: this.estimateDurationMinutes(plan),
    };
  }
}
