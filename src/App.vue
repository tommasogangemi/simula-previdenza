<script setup lang="ts">
import { ref } from 'vue'
import PensionForm from './components/PensionForm.vue'
import type { PensionFundData } from './types'
import { simulate, type SimulationResult } from './simulation'
import SimulationResults from './components/SimulationResults.vue'

const formData = ref<PensionFundData>({
  annualSalary: 30000,
  fundCostPercent: 1.0,
  fundCostFixed: 0,
  stockAllocationPercent: 50,
  expectedReturnPercent: 4.0,
  yearsToRetirement: 30,
  yearOfFirstContribution: 2026,
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
              <SimulationResults :result="simulationResult" />
            </div>
          </v-slide-y-transition>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
