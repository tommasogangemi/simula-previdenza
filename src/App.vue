<script setup lang="ts">
import { ref } from 'vue'
import PensionForm from './components/PensionForm.vue'
import type { PensionFundData } from './types'

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

const submitForm = () => {
  console.log('Dati simulazione:', JSON.parse(JSON.stringify(formData.value)))
  alert('Dati inviati! Controlla la console per i dettagli.')
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
            </p>
          </div>

          <PensionForm v-model="formData" @submit="submitForm" />
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
/* Custom styles removed in favor of Vuetify utility classes */
</style>
