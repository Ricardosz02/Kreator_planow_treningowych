const API_BASE_URL = "/api/workout-plans";

let draftExercises = [];
let editingPlanId = null;

const feedbackBanner = document.getElementById("feedbackBanner");
const formHeading = document.getElementById("formHeading");
const planTitleInput = document.getElementById("planTitle");
const muscleGroupInput = document.getElementById("muscleGroup");
const exerciseNameInput = document.getElementById("exerciseName");
const exerciseSetsInput = document.getElementById("exerciseSets");
const exerciseRepsInput = document.getElementById("exerciseReps");
const exerciseWeightInput = document.getElementById("exerciseWeight");
const exerciseRpeInput = document.getElementById("exerciseRpe");
const exerciseRestInput = document.getElementById("exerciseRest");
const draftCountSpan = document.getElementById("draftCount");
const draftExerciseList = document.getElementById("draftExerciseList");
const savedPlansContainer = document.getElementById("savedPlansContainer");
const filterMuscleInput = document.getElementById("filterMuscleInput");
const savePlanBtn = document.getElementById("savePlanBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

function showFeedback(message, type) {
  feedbackBanner.textContent = message;
  feedbackBanner.className = `banner ${type}`;
}

function clearFeedback() {
  feedbackBanner.textContent = "";
  feedbackBanner.className = "banner hidden";
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value);
  return div.innerHTML;
}

function renderDraftExercises() {
  draftCountSpan.textContent = String(draftExercises.length);
  draftExerciseList.innerHTML = "";

  if (draftExercises.length === 0) {
    draftExerciseList.innerHTML =
      '<li class="empty-state">Brak dodanych ćwiczeń. Dodaj co najmniej jedno ćwiczenie powyżej.</li>';
    return;
  }

  draftExercises.forEach((exercise, index) => {
    const item = document.createElement("li");
    item.className = "draft-item";
    item.innerHTML = `
      <span>
        <strong>${escapeHtml(exercise.name)}</strong> —
        ${exercise.sets} x ${exercise.reps} @ ${exercise.weightKg} kg
        (RPE ${exercise.rpe}, przerwa ${exercise.restSeconds}s)
      </span>
      <button type="button" class="btn btn-danger" data-remove-index="${index}">Usuń</button>
    `;
    draftExerciseList.appendChild(item);
  });
}

function handleAddExercise() {
  clearFeedback();

  const exercise = {
    name: exerciseNameInput.value.trim(),
    sets: Number(exerciseSetsInput.value),
    reps: Number(exerciseRepsInput.value),
    weightKg: Number(exerciseWeightInput.value),
    rpe: Number(exerciseRpeInput.value),
    restSeconds: Number(exerciseRestInput.value),
  };

  if (!exercise.name) {
    showFeedback("Podaj nazwę ćwiczenia przed dodaniem go do listy.", "error");
    return;
  }

  draftExercises.push(exercise);
  exerciseNameInput.value = "";
  renderDraftExercises();
}

function resetForm() {
  editingPlanId = null;
  draftExercises = [];
  planTitleInput.value = "";
  muscleGroupInput.value = "Full Body";
  exerciseNameInput.value = "";
  formHeading.textContent = "Nowy plan treningowy";
  savePlanBtn.textContent = "Zapisz plan treningowy";
  cancelEditBtn.classList.add("hidden");
  renderDraftExercises();
}

async function handleSavePlan() {
  clearFeedback();

  const payload = {
    title: planTitleInput.value,
    targetMuscleGroup: muscleGroupInput.value,
    exercises: draftExercises,
  };

  const url = editingPlanId ? `${API_BASE_URL}/${editingPlanId}` : API_BASE_URL;
  const method = editingPlanId ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      showFeedback(result.error || "Nie udało się zapisać planu.", "error");
      return;
    }

    const successMsg = editingPlanId
      ? "Plan treningowy został zaktualizowany."
      : "Plan treningowy został utworzony.";

    resetForm();
    showFeedback(successMsg, "success");
    await loadPlans(filterMuscleInput.value);
  } catch {
    showFeedback("Błąd połączenia z serwerem.", "error");
  }
}

async function loadPlans(muscleGroup = "") {
  const query = muscleGroup.trim()
    ? `?muscleGroup=${encodeURIComponent(muscleGroup.trim())}`
    : "";

  const response = await fetch(`${API_BASE_URL}${query}`);
  const result = await response.json();
  renderSavedPlans(result.data || []);
}

function renderSavedPlans(plans) {
  savedPlansContainer.innerHTML = "";

  if (plans.length === 0) {
    savedPlansContainer.innerHTML =
      '<p class="empty-state">Brak zapisanych planów treningowych.</p>';
    return;
  }

  plans.forEach((plan) => {
    const card = document.createElement("article");
    card.className = "plan-card";

    const exercisesHtml = plan.exercises
      .map(
        (ex) =>
          `<li><strong>${escapeHtml(ex.name)}</strong>: ${ex.sets} × ${ex.reps} @ ${ex.weightKg} kg (RPE ${ex.rpe}, przerwa ${ex.restSeconds}s)</li>`,
      )
      .join("");

    card.innerHTML = `
      <div class="plan-card-header">
        <h3>${escapeHtml(plan.title)}</h3>
        <span class="badge">${escapeHtml(plan.targetMuscleGroup)}</span>
      </div>
      <div class="metrics-row">
        <span class="metric-pill">Objętość: <strong>${plan.metrics.totalVolumeKg} kg</strong></span>
        <span class="metric-pill">Średnie RPE: <strong>${plan.metrics.averageRpe}</strong></span>
        <span class="metric-pill">Szacowany czas: <strong>${plan.metrics.estimatedDurationMinutes} min</strong></span>
      </div>
      <ul class="plan-exercises">${exercisesHtml}</ul>
      <div class="plan-actions">
        <button type="button" class="btn btn-secondary" data-edit-id="${plan.id}">Edytuj</button>
        <button type="button" class="btn btn-danger" data-delete-id="${plan.id}">Usuń</button>
      </div>
    `;

    savedPlansContainer.appendChild(card);
  });
}

async function startEditingPlan(id) {
  clearFeedback();
  const response = await fetch(`${API_BASE_URL}/${id}`);
  const result = await response.json();

  if (!response.ok) {
    showFeedback(result.error || "Nie znaleziono planu.", "error");
    return;
  }

  const plan = result.data;
  editingPlanId = plan.id;
  planTitleInput.value = plan.title;
  muscleGroupInput.value = plan.targetMuscleGroup;
  draftExercises = plan.exercises.map((ex) => ({ ...ex }));
  formHeading.textContent = `Edycja planu: ${plan.title}`;
  savePlanBtn.textContent = "Zapisz zmiany";
  cancelEditBtn.classList.remove("hidden");
  renderDraftExercises();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deletePlan(id) {
  clearFeedback();
  const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });

  if (!response.ok) {
    showFeedback("Nie udało się usunąć planu.", "error");
    return;
  }

  if (editingPlanId === id) {
    resetForm();
  }

  showFeedback("Plan został usunięty.", "success");
  await loadPlans(filterMuscleInput.value);
}

document
  .getElementById("addExerciseBtn")
  .addEventListener("click", handleAddExercise);
savePlanBtn.addEventListener("click", handleSavePlan);
cancelEditBtn.addEventListener("click", resetForm);

document.getElementById("filterBtn").addEventListener("click", () => {
  loadPlans(filterMuscleInput.value);
});

document.getElementById("clearFilterBtn").addEventListener("click", () => {
  filterMuscleInput.value = "";
  loadPlans();
});

draftExerciseList.addEventListener("click", (event) => {
  const target = event.target;
  if (
    target instanceof HTMLElement &&
    target.dataset.removeIndex !== undefined
  ) {
    draftExercises.splice(Number(target.dataset.removeIndex), 1);
    renderDraftExercises();
  }
});

savedPlansContainer.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  if (target.dataset.editId) {
    startEditingPlan(target.dataset.editId);
  }
  if (target.dataset.deleteId) {
    deletePlan(target.dataset.deleteId);
  }
});

renderDraftExercises();
loadPlans();
