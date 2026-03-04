import React from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement)

export function PieChart({ labels, data, title = 'Distribution' }) {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(72, 187, 120, 0.8)',
          'rgba(246, 173, 85, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(66, 153, 225, 0.8)'
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(118, 75, 162, 1)',
          'rgba(72, 187, 120, 1)',
          'rgba(246, 173, 85, 1)',
          'rgba(245, 101, 101, 1)',
          'rgba(66, 153, 225, 1)'
        ],
        borderWidth: 2
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--text-primary)',
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    }
  }

  return <Pie data={chartData} options={options} />
}

export function BarChart({ labels, datasets, title = 'Statistics' }) {
  const chartData = {
    labels,
    datasets: datasets.map((dataset, idx) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(72, 187, 120, 0.8)',
        'rgba(246, 173, 85, 0.8)',
        'rgba(245, 101, 101, 0.8)'
      ][idx % 4],
      borderColor: [
        'rgba(102, 126, 234, 1)',
        'rgba(72, 187, 120, 1)',
        'rgba(246, 173, 85, 1)',
        'rgba(245, 101, 101, 1)'
      ][idx % 4],
      borderWidth: 2,
      borderRadius: 8,
      tension: 0.4
    }))
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: 'var(--text-primary)',
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'var(--bg-tertiary)'
        },
        ticks: {
          color: 'var(--text-secondary)'
        },
        beginAtZero: true
      },
      x: {
        grid: {
          color: 'var(--bg-tertiary)'
        },
        ticks: {
          color: 'var(--text-secondary)'
        }
      }
    }
  }

  return <Bar data={chartData} options={options} />
}

export function LineChart({ labels, datasets, title = 'Trend' }) {
  const chartData = {
    labels,
    datasets: datasets.map((dataset, idx) => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: [
        'rgba(102, 126, 234, 1)',
        'rgba(72, 187, 120, 1)',
        'rgba(246, 173, 85, 1)',
        'rgba(245, 101, 101, 1)'
      ][idx % 4],
      backgroundColor: [
        'rgba(102, 126, 234, 0.1)',
        'rgba(72, 187, 120, 0.1)',
        'rgba(246, 173, 85, 0.1)',
        'rgba(245, 101, 101, 0.1)'
      ][idx % 4],
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: [
        'rgba(102, 126, 234, 1)',
        'rgba(72, 187, 120, 1)',
        'rgba(246, 173, 85, 1)',
        'rgba(245, 101, 101, 1)'
      ][idx % 4],
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }))
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: 'var(--text-primary)',
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'var(--bg-tertiary)'
        },
        ticks: {
          color: 'var(--text-secondary)'
        },
        beginAtZero: true
      },
      x: {
        grid: {
          color: 'var(--bg-tertiary)'
        },
        ticks: {
          color: 'var(--text-secondary)'
        }
      }
    }
  }

  return <Line data={chartData} options={options} />
}

export function CircularProgress({ percentage, label = 'Progress', size = 200 }) {
  const radius = size / 2 - 10
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-secondary)" />
          </linearGradient>
        </defs>
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dy=".3em"
          fontSize={size / 5}
          fontWeight="700"
          fill="var(--text-primary)"
        >
          {percentage}%
        </text>
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{label}</div>
      </div>
    </div>
  )
}
