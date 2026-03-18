import { useEffect } from 'react'
import {
  Chart,
  type ChartConfiguration,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

type Args = {
  canvas: HTMLCanvasElement | null
  labels: string[]
  data: number[]
}

export function useSalaryChart({ canvas, labels, data }: Args) {
  useEffect(() => {
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height || 240)
    grad.addColorStop(0, 'rgba(34, 211, 238, 0.25)')
    grad.addColorStop(1, 'rgba(139, 92, 246, 0.02)')

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Salary (simulated)',
            data,
            borderColor: 'rgba(34, 211, 238, 0.95)',
            pointRadius: 0,
            pointHitRadius: 10,
            fill: true,
            backgroundColor: grad,
            tension: 0.38,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(10, 10, 22, 0.92)',
            titleColor: 'rgba(255, 255, 255, 0.92)',
            bodyColor: 'rgba(255, 255, 255, 0.78)',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: (item) => {
                const v = Number(item.parsed.y || 0)
                return ` $${Math.round(v).toLocaleString()}`
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: 'rgba(255, 255, 255, 0.62)' },
            border: { color: 'rgba(255, 255, 255, 0.08)' },
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: {
              color: 'rgba(255, 255, 255, 0.62)',
              callback: (v) => `$${Number(v).toLocaleString()}`,
            },
            border: { color: 'rgba(255, 255, 255, 0.08)' },
          },
        },
      },
    }

    const chart = new Chart(ctx, config)
    return () => chart.destroy()
  }, [canvas, labels, data])
}

