import { ValidationError } from "../errors/appErrors";
import { Exercise, WorkoutPlan } from "../models/workoutPlan.types";

export class WorkoutPlanBuilder {
  private title: string = "";
  private targetMuscleGroup: string = "Full Body";
  private exercises: Exercise[] = [];
  private readonly maxExercisesLimit: number = 15;

  public setTitle(title: string): this {
    this.title = typeof title === "string" ? title.trim() : "";
    return this;
  }

  public setTargetMuscleGroup(muscleGroup: string): this {
    if (typeof muscleGroup === "string" && muscleGroup.trim() !== "") {
      this.targetMuscleGroup = muscleGroup.trim();
    }
    return this;
  }

  public addExercise(exercise: Exercise): this {
    this.validateExercise(exercise);

    if (this.exercises.length >= this.maxExercisesLimit) {
      throw new ValidationError(
        `Cannot exceed ${this.maxExercisesLimit} exercises per plan.`,
      );
    }

    this.exercises.push({
      ...exercise,
      name: exercise.name.trim(),
    });
    return this;
  }

  public reset(): this {
    this.title = "";
    this.targetMuscleGroup = "Full Body";
    this.exercises = [];
    return this;
  }

  public build(): WorkoutPlan {
    if (!this.title) {
      throw new ValidationError("Workout plan title cannot be empty.");
    }

    if (this.exercises.length === 0) {
      throw new ValidationError(
        "Workout plan must contain at least one exercise.",
      );
    }

    return {
      title: this.title,
      targetMuscleGroup: this.targetMuscleGroup,
      exercises: this.exercises.map((exercise) => ({ ...exercise })),
    };
  }

  private validateExercise(exercise: Exercise): void {
    if (
      !exercise ||
      typeof exercise.name !== "string" ||
      exercise.name.trim() === ""
    ) {
      throw new ValidationError("Exercise name cannot be empty.");
    }
    if (
      typeof exercise.sets !== "number" ||
      typeof exercise.reps !== "number" ||
      Number.isNaN(exercise.sets) ||
      Number.isNaN(exercise.reps) ||
      exercise.sets <= 0 ||
      exercise.reps <= 0
    ) {
      throw new ValidationError("Sets and reps must be greater than zero.");
    }
    if (
      typeof exercise.weightKg !== "number" ||
      Number.isNaN(exercise.weightKg) ||
      exercise.weightKg < 0
    ) {
      throw new ValidationError("Weight cannot be negative.");
    }
    if (
      typeof exercise.rpe !== "number" ||
      Number.isNaN(exercise.rpe) ||
      exercise.rpe < 1 ||
      exercise.rpe > 10
    ) {
      throw new ValidationError("RPE must be between 1 and 10.");
    }
    if (
      typeof exercise.restSeconds !== "number" ||
      Number.isNaN(exercise.restSeconds) ||
      exercise.restSeconds < 0
    ) {
      throw new ValidationError("Rest time cannot be negative.");
    }
  }
}
