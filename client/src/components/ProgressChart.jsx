import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const palette = ['#6366f1', '#f97316', '#22c55e', '#a855f7', '#ef4444', '#14b8a6']

function ProgressChart ({ data }) {
  const chartData = useMemo(() => {
    const dateMap = new Map()

    data.forEach((exercise) => {
      exercise.data.forEach(({ date, volume }) => {
        if (!dateMap.has(date)) {
          dateMap.set(date, { date })
        }
        dateMap.get(date)[exercise.name] = Number(volume.toFixed(2))
      })
    })

    return Array.from(dateMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [data])

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
          <YAxis label={{ value: 'Total volume (lbs)', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value, name) => [`${value} lbs`, name]}
          />
          <Legend />
          {data.map((exercise, index) => (
            <Line
              key={exercise.name}
              type="monotone"
              dataKey={exercise.name}
              stroke={palette[index % palette.length]}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ProgressChart
