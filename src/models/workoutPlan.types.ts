export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weightKg: number;
  rpe: number;
  restSeconds: number;
}

export interface WorkoutPlan {
  title: string;
  targetMuscleGroup: string;
  exercises: Exercise[];
}

export interface WorkoutMetrics {
  totalVolumeKg: number;
  averageRpe: number;
  estimatedDurationMinutes: number;
}

export interface StoredWorkoutPlan extends WorkoutPlan {
  id: string;
  metrics: WorkoutMetrics;
  createdAt: string;
}

export interface CreateWorkoutPlanInput {
  title: string;
  targetMuscleGroup?: string;
  exercises: Exercise[];
}
