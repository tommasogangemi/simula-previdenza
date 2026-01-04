<script setup lang="ts">
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { CHART_COLORS } from '../constants'
import type { SimulationResult } from '../types'
import { formatCurrency } from '../utils'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const props = defineProps<{
  simulations: SimulationResult[]
}>()

const chartData = computed(() => {
  if (props.simulations.length === 0) return { labels: [], datasets: [] }

  // Use the labels from the simulation with most years
  const maxYearsSimulation = props.simulations.reduce((prev, current) =>
    prev.yearlyData.length > current.yearlyData.length ? prev : current,
  )
  const labels = maxYearsSimulation.yearlyData.map((s) => s.year)

  const datasets = props.simulations.map((sim, index) => {
    const color = CHART_COLORS[index % CHART_COLORS.length]
    const label = sim.fundName || `Scenario ${index + 1}`

    return {
      label: `${label} (€)`,
      backgroundColor: `${color}1A`, // 0.1 opacity
      borderColor: color,
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      fill: props.simulations.length === 1, // Only fill if single scenario
      data: sim.yearlyData.map((s) => s.endValue),
      tension: 0.3,
    }
  })

  return { labels, datasets }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: props.simulations.length > 1,
      position: 'top' as const,
    },
    tooltip: {
      callbacks: {
        label: (context: { parsed: { y: number | null } }) => {
          const value = context.parsed.y ?? 0
          return ` ${formatCurrency(value)}`
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: string | number) => {
          const numValue = typeof value === 'string' ? parseFloat(value) : value
          if (numValue >= 1000) {
            return `${(numValue / 1000).toFixed(0)}K €`
          }
          return `${numValue} €`
        },
      },
    },
  },
}
</script>

<template>
  <div class="simulation-chart mt-6">
    <div class="d-flex align-center mb-4">
      <h3 class="text-subtitle-1 font-weight-bold">Proiezione Temporale</h3>

      <v-tooltip
        location="top"
        text="Il grafico mostra il montante finale per ogni anno, senza aver applicato le tasse sui contributi. Serve principalmente a scopo comparativo, il valore finale deve essere ancora tassato per ottenere il totale mostrato nei risultati di sopra."
      >
        <template v-slot:activator="{ props }">
          <v-icon
            v-bind="props"
            icon="mdi-information-outline"
            size="12"
            class="ml-1 cursor-help"
          ></v-icon>
        </template>
      </v-tooltip>
    </div>
    <div style="height: 300px">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
