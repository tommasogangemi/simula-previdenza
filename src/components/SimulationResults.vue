<script setup lang="ts">
import { BOND_GAINS_TAX_RATE, STOCK_GAINS_TAX_RATE } from '@/constants'
import type { SimulationResult } from '../simulation'
import { formatCurrency } from '../utils'

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

    <div class="d-flex flex-wrap ga-4 text-caption text-medium-emphasis mb-2">
      <div class="d-flex align-center">
        <v-icon icon="mdi-calculator-variant" size="x-small" class="mr-1"></v-icon>
        Tassazione Rendimenti:
        <strong class="ml-1">{{ result.capitalGainsTaxRate.toFixed(2) }}%</strong>
        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              icon="mdi-information-outline"
              size="14"
              class="ml-1 cursor-help"
            ></v-icon>
          </template>

          <span>
            Tassazione sui rendimenti dell'investimento, data dalla tua allocazione ed applicata
            alla fine di ogni anno sui rendimenti del portafoglio. Rappresenta la media ponderata
            della tassazione del {{ STOCK_GAINS_TAX_RATE }}% sull'azionario e del
            {{ BOND_GAINS_TAX_RATE }}% sulle obbligazioni.
          </span>
        </v-tooltip>
      </div>

      <div class="d-flex align-center">
        <v-icon icon="mdi-bank-outline" size="x-small" class="mr-1"></v-icon>
        Tassazione Capitale:
        <strong class="ml-1">{{ result.contributionSummary.taxRate.toFixed(2) }}%</strong>
        <v-tooltip location="top">
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              icon="mdi-information-outline"
              size="14"
              class="ml-1 cursor-help"
            ></v-icon>
          </template>

          <span>
            Tassazione sui contributi versati nel fondo. Verrà applicata al momento della
            riscossione, unicamente sull'ammontare versato, ovvero la somma di TFR, contributo
            datoriale ed i contributi volontari aggiuntivi.
          </span>
        </v-tooltip>
      </div>
    </div>
  </div>
</template>
