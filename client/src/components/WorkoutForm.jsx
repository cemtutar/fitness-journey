import { useState } from 'react'

const createEmptyExercise = () => ({
  name: '',
  sets: [{ reps: 8, weight: 0 }]
})

function WorkoutForm ({ onSubmit, isLoading }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    exercises: [createEmptyExercise()]
  })

  const updateExercise = (index, update) => {
    setForm((prev) => {
      const exercises = prev.exercises.map((exercise, idx) =>
        idx === index ? { ...exercise, ...update } : exercise
      )
      return { ...prev, exercises }
    })
  }

  const updateSet = (exerciseIndex, setIndex, update) => {
    setForm((prev) => {
      const exercises = prev.exercises.map((exercise, idx) => {
        if (idx !== exerciseIndex) return exercise
        const sets = exercise.sets.map((set, sIdx) =>
          sIdx === setIndex ? { ...set, ...update } : set
        )
        return { ...exercise, sets }
      })
      return { ...prev, exercises }
    })
  }

  const addExercise = () => {
    setForm((prev) => ({
      ...prev,
      exercises: [...prev.exercises, createEmptyExercise()]
    }))
  }

  const removeExercise = (index) => {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== index)
    }))
  }

  const addSet = (exerciseIndex) => {
    setForm((prev) => {
      const exercises = prev.exercises.map((exercise, idx) => {
        if (idx !== exerciseIndex) return exercise
        return {
          ...exercise,
          sets: [...exercise.sets, { reps: 8, weight: 0 }]
        }
      })
      return { ...prev, exercises }
    })
  }

  const removeSet = (exerciseIndex, setIndex) => {
    setForm((prev) => {
      const exercises = prev.exercises.map((exercise, idx) => {
        if (idx !== exerciseIndex) return exercise
        return {
          ...exercise,
          sets: exercise.sets.filter((_, sIdx) => sIdx !== setIndex)
        }
      })
      return { ...prev, exercises }
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = {
      date: form.date,
      notes: form.notes,
      exercises: form.exercises.map((exercise) => ({
        name: exercise.name,
        sets: exercise.sets.map((set) => ({
          reps: Number(set.reps),
          weight: Number(set.weight)
        }))
      }))
    }

    const maybePromise = onSubmit(payload)

    const resetForm = () => {
      setForm({
        date: new Date().toISOString().slice(0, 10),
        notes: '',
        exercises: [createEmptyExercise()]
      })
    }

    if (maybePromise && typeof maybePromise.then === 'function') {
      maybePromise.then(() => {
        resetForm()
      }).catch(() => {})
    } else {
      resetForm()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div>
        <label htmlFor="date">Date</label>
        <input
          id="date"
          name="date"
          type="date"
          value={form.date}
          onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
        />
      </div>

      <div>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          rows="3"
          value={form.notes}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          placeholder="Energy levels, focus areas, etc."
        />
      </div>

      {form.exercises.map((exercise, exerciseIndex) => (
        <div key={exerciseIndex} className="card" style={{ background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Exercise {exerciseIndex + 1}</h3>
            {form.exercises.length > 1 && (
              <button
                type="button"
                onClick={() => removeExercise(exerciseIndex)}
                style={{ background: '#f87171' }}
              >
                Remove exercise
              </button>
            )}
          </div>

          <label htmlFor={`exercise-${exerciseIndex}`}>Name</label>
          <input
            id={`exercise-${exerciseIndex}`}
            type="text"
            value={exercise.name}
            onChange={(event) => updateExercise(exerciseIndex, { name: event.target.value })}
            placeholder="Bench Press"
            required
          />

          <div className="exercise-set-grid">
            {exercise.sets.map((set, setIndex) => (
              <div key={setIndex} className="card" style={{ background: 'white', boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                <label htmlFor={`reps-${exerciseIndex}-${setIndex}`}>Reps</label>
                <input
                  id={`reps-${exerciseIndex}-${setIndex}`}
                  type="number"
                  min="1"
                  value={set.reps}
                  onChange={(event) => updateSet(exerciseIndex, setIndex, { reps: event.target.value })}
                  required
                />
                <label htmlFor={`weight-${exerciseIndex}-${setIndex}`}>Weight (lbs)</label>
                <input
                  id={`weight-${exerciseIndex}-${setIndex}`}
                  type="number"
                  min="0"
                  step="0.5"
                  value={set.weight}
                  onChange={(event) => updateSet(exerciseIndex, setIndex, { weight: event.target.value })}
                  required
                />
                {exercise.sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSet(exerciseIndex, setIndex)}
                    style={{ background: '#f97316', marginTop: '0.5rem' }}
                  >
                    Remove set
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addSet(exerciseIndex)}
            style={{ marginTop: '0.75rem', background: '#22c55e' }}
          >
            Add set
          </button>
        </div>
      ))}

      <button type="button" onClick={addExercise} style={{ background: '#38bdf8' }}>
        Add another exercise
      </button>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving…' : 'Log workout'}
      </button>
    </form>
  )
}

export default WorkoutForm
