function WorkoutList ({ workouts, onDelete, isLoading }) {
  return (
    <div>
      {workouts.map((workout) => (
        <div key={workout.id} className="workout-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>{new Date(workout.date).toLocaleDateString()}</h3>
              {workout.notes && <p>{workout.notes}</p>}
            </div>
            <button
              type="button"
              onClick={() => onDelete(workout.id)}
              disabled={isLoading}
              style={{ background: '#ef4444' }}
            >
              Delete
            </button>
          </div>

          <div>
            {workout.exercises.map((exercise, index) => (
              <div key={index} style={{ marginBottom: '0.75rem' }}>
                <strong>{exercise.name}</strong>
                <div>
                  {exercise.sets.map((set, setIndex) => (
                    <span key={setIndex} className="exercise-chip">
                      {set.reps} reps × {set.weight} lbs
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default WorkoutList
