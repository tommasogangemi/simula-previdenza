<script setup lang="ts">
import { BOND_GAINS_TAX_RATE, STOCK_GAINS_TAX_RATE } from '@/constants'
import type { SimulationResult } from '../types'
import { formatCurrency } from '../utils'
import ResultRow from './ResultRow.vue'

defineProps<{
  result: SimulationResult
}>()
</script>

<template>
  <div class="simulation-results">
    <h2 class="text-h6 font-weight-bold mb-4">Risultati Simulazione</h2>

    <v-card color="primary" variant="tonal" class="pa-6 mb-4 text-center border">
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

    <v-card
      v-if="
        result.contributionSummary.annualVoluntaryContribution ||
        result.contributionSummary.annualAdditionalContribution
      "
      color="warning"
      variant="tonal"
      class="pa-4 mb-4 border"
    >
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="text-subtitle-2 font-weight-medium d-flex align-center">
          <v-icon icon="mdi-account-minus-outline" size="18" class="mr-2"></v-icon>
          Versamento Percentuale dallo Stipendio
        </div>
        <div class="text-h6 font-weight-bold text-warning-darken-3">
          {{ formatCurrency(result.contributionSummary.annualVoluntaryContribution) }}
        </div>
      </div>
      <div class="d-flex align-center justify-space-between">
        <div class="text-subtitle-2 font-weight-medium d-flex align-center">
          <v-icon icon="mdi-cash-plus" size="18" class="mr-2"></v-icon>
          Versamento Deducibile Aggiuntivo

          <v-tooltip
            location="top"
            :text="`Qualora ti avvalessi delle deduzioni dovute dai versamenti aggiuntivi (parcentuale, datoriale oppure questo stesso) dal secondo anno potresti mantenere questo stesso versamento scontato del risparmio fiscale dell'anno precendente, quindi per un totale di ${formatCurrency(Math.max(0, result.contributionSummary.annualAdditionalContribution - result.contributionSummary.annualTaxSavings))} invece di ${formatCurrency(result.contributionSummary.annualAdditionalContribution)}`"
          >
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                icon="mdi-information-outline"
                size="16"
                class="ml-2 cursor-help"
              ></v-icon>
            </template>
          </v-tooltip>
        </div>
        <div class="text-h6 font-weight-bold text-warning-darken-3">
          {{ formatCurrency(result.contributionSummary.annualAdditionalContribution) }}
        </div>
      </div>
    </v-card>

    <v-card
      v-if="
        result.contributionSummary.annualTaxSavings ||
        result.contributionSummary.annualEmployerContribution
      "
      color="success"
      variant="tonal"
      class="pa-4 mb-4 border"
    >
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="text-subtitle-2 font-weight-medium d-flex align-center">
          <v-icon icon="mdi-piggy-bank-outline" size="18" class="mr-2"></v-icon>
          Risparmio Fiscale Annuo
        </div>
        <div class="text-h6 font-weight-bold text-success">
          {{ formatCurrency(result.contributionSummary.annualTaxSavings) }}
        </div>
      </div>
      <div class="d-flex align-center justify-space-between">
        <div class="text-subtitle-2 font-weight-medium d-flex align-center">
          <v-icon icon="mdi-hand-coin-outline" size="18" class="mr-2"></v-icon>
          Contributo Datoriale Annuo
        </div>
        <div class="text-h6 font-weight-bold text-success">
          {{ formatCurrency(result.contributionSummary.annualEmployerContribution) }}
        </div>
      </div>
    </v-card>

    <v-card
      v-if="result.contributionSummary.annualCashFlow !== 0"
      :color="result.contributionSummary.annualCashFlow >= 0 ? 'success' : 'warning'"
      variant="tonal"
      class="pa-4 mb-4 border"
    >
      <div class="d-flex align-center justify-space-between">
        <div class="text-subtitle-2 font-weight-bold d-flex align-center">
          <v-icon
            :icon="
              result.contributionSummary.annualCashFlow >= 0 ? 'mdi-cash-plus' : 'mdi-cash-minus'
            "
            size="20"
            class="mr-2"
          ></v-icon>
          Flusso di Cassa Annuo Reale

          <v-tooltip
            location="top"
            text="Flusso di cassa effettivo per il mantenimento del piano simulato. Considera i versamenti volontari percentuali e non come flussi negativi ed il risparmio fiscale dovuto a deduzioni come flusso positivo."
          >
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                icon="mdi-information-outline"
                size="16"
                class="ml-2 cursor-help"
              ></v-icon>
            </template>
          </v-tooltip>
        </div>
        <div
          class="text-h6 font-weight-bold"
          :class="
            result.contributionSummary.annualCashFlow >= 0
              ? 'text-success'
              : 'text-warning-darken-3'
          "
        >
          {{ formatCurrency(result.contributionSummary.annualCashFlow) }}
        </div>
      </div>
    </v-card>

    <v-expansion-panels class="mt-4">
      <v-expansion-panel elevation="0" class="border" title="Informazioni aggiuntive">
        <v-expansion-panel-text>
          <ResultRow
            label="Totale Contributi Versati"
            :value="formatCurrency(result.contributionSummary.grossTotalContribution)"
            icon="mdi-account-cash-outline"
          />

          <ResultRow
            label="Totale Contributo Datore"
            :value="formatCurrency(result.contributionSummary.totalEmployerContribution)"
            icon="mdi-hand-coin-outline"
            icon-color="success"
          />

          <ResultRow
            label="Totale Rendimenti Netti"
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
            label="Tasse Totali sul Versato"
            :value="formatCurrency(result.contributionSummary.totalTaxAmount)"
            icon="mdi-bank-minus"
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
            label="Aliquota Versato"
            :value="`${result.contributionSummary.taxRate.toFixed(2)}%`"
            icon="mdi-bank-outline"
            tooltip="Tassazione agevolata sul capitale che scende dal 15% al 9% in base agli anni di adesione."
            class="mb-0"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>
