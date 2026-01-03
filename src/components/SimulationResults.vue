<script setup lang="ts">
import { BOND_GAINS_TAX_RATE, STOCK_GAINS_TAX_RATE } from '@/constants'
import type { SimulationResult } from '../simulation'
import { formatCurrency } from '../utils'
import ResultRow from './ResultRow.vue'

defineProps<{
  result: SimulationResult
}>()
</script>

<template>
  <div class="simulation-results">
    <h2 class="text-h6 font-weight-bold mb-4">Risultati Simulazione</h2>

    <v-card color="primary" variant="tonal" class="pa-6 mb-6 text-center border">
      <div class="text-subtitle-1 mb-1 d-flex align-center justify-center text-primary">
        Capitale Finale Disponibile
        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              icon="mdi-information-outline"
              size="16"
              class="ml-2 cursor-help"
            ></v-icon>
          </template>
          <span>
            Questo è l'importo netto finale. Tutte le tasse e i costi sono già stati detratti.
          </span>
        </v-tooltip>
      </div>
      <div class="text-h3 font-weight-bold text-primary">
        {{ formatCurrency(result.summaryData.totalAvailableAmount) }}
      </div>
    </v-card>

    <div class="mt-4 border-t pt-4">
      <ResultRow
        label="Totale Contributi Versati"
        :value="formatCurrency(result.contributionSummary.grossTotalContribution)"
        icon="mdi-account-cash-outline"
      />

      <ResultRow
        label="Totale Rendimenti Netti Ottenuti"
        :value="formatCurrency(result.summaryData.totalCapitalGains)"
        icon="mdi-trending-up"
        icon-color="success"
      />

      <ResultRow
        label="Tasse Totali sui Rendimenti"
        :value="formatCurrency(result.summaryData.totalCapitalGainsTaxPaid)"
        icon="mdi-chart-line"
        icon-color="error"
      />

      <ResultRow
        label="Totale Costi Fondo"
        :value="formatCurrency(result.summaryData.totalCostsPaid)"
        icon="mdi-cash-minus"
        icon-color="error"
      />

      <ResultRow
        label="Aliquota Rendimenti"
        :value="`${result.capitalGainsTaxRate.toFixed(2)}%`"
        icon="mdi-calculator-variant"
        :tooltip="`Tassazione media ponderata: ${STOCK_GAINS_TAX_RATE}% azionario, ${BOND_GAINS_TAX_RATE}% obbligazionario.`"
      />

      <ResultRow
        label="Aliquota Capitale"
        :value="`${result.contributionSummary.taxRate.toFixed(2)}%`"
        icon="mdi-bank-outline"
        tooltip="Tassazione agevolata sul capitale che scende dal 15% al 9% in base agli anni di adesione."
        class="mb-0"
      />
    </div>
  </div>
</template>
