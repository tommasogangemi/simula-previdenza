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
import type { YearlySnapshot } from '../simulation'
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
  data: YearlySnapshot[]
}>()

const chartData = computed(() => ({
  labels: props.data.map((s) => s.year),
  datasets: [
    {
      label: 'Montante Finale (€)',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      borderColor: '#1976D2',
      pointBackgroundColor: '#1976D2',
      pointBorderColor: '#fff',
      fill: true,
      data: props.data.map((s) => s.endValue),
      tension: 0.3,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
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
