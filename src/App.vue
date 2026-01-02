<script setup lang="ts">
import { ref } from 'vue'
import PensionForm from './components/PensionForm.vue'
import type { PensionFundData } from './types'
import { simulate, type SimulationResult } from './simulation'
import { formatCurrency } from './utils'

const formData = ref<PensionFundData>({
  annualSalary: 30000,
  fundCostPercent: 1.0,
  fundCostFixed: 0,
  stockAllocationPercent: 50,
  expectedReturnPercent: 4.0,
  yearsToRetirement: 30,
  voluntaryContributionPercent: 0,
  employerContributionPercent: 0,
  additionalDeductibleContributionPercent: 0,
})

const simulationResult = ref<SimulationResult | null>(null)

const submitForm = () => {
  simulationResult.value = simulate(formData.value)
  console.log('Risultato simulazione:', simulationResult.value)
}
</script>

<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">
      <v-container class="fill-height justify-center">
        <v-card class="mx-auto pa-6" elevation="3" max-width="800" width="100%">
          <div class="text-center mb-6">
            <h1 class="text-h4 font-weight-bold text-primary mb-2">
              Simulatore Previdenza Complementare
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Scopri quanto potresti accumulare per il tuo futuro. Inserisci i tuoi dati per
              iniziare la simulazione.
              <br />
              La simulazione parte dal presupposto che il TFR sia sempre versato nel fondo pensione.
            </p>
          </div>

          <PensionForm v-model="formData" @submit="submitForm" />

          <v-slide-y-transition>
            <div v-if="simulationResult" class="mt-8">
              <v-divider class="mb-6"></v-divider>
              <h2 class="text-h5 font-weight-bold mb-4">Risultati Simulazione</h2>

              <v-alert color="info" variant="tonal" icon="mdi-calculator" class="mb-4">
                <div class="text-h6">
                  Aliquota tassazione rendimenti:
                  <strong>{{ simulationResult.capitalGainsTaxRate.toFixed(2) }}%</strong>
                </div>
                <div class="text-caption">
                  Media ponderata tra titoli di stato (12.5%) e azioni/altri (20%) basata sulla tua
                  allocazione.
                </div>
              </v-alert>

              <v-alert color="success" variant="tonal" icon="mdi-cash-multiple" class="mb-4">
                <div class="text-h6">
                  TFR Annuo:
                  <strong>{{ formatCurrency(simulationResult.annualTFR) }}</strong>
                </div>
                <div class="text-caption">
                  Quota annuale del Trattamento Fine Rapporto (RAL / 13.5).
                </div>
              </v-alert>
            </div>
          </v-slide-y-transition>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
