<script setup lang="ts">
import { ref, nextTick } from 'vue'
import PensionForm from './components/PensionForm.vue'
import type { PensionFundData } from './types'
import { simulate, type SimulationResult } from './simulation'
import SimulationResults from './components/SimulationResults.vue'
import SimulationChart from './components/SimulationChart.vue'
import { CHART_COLORS } from './constants'

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

const simulations = ref<SimulationResult[]>([])
const resultsSection = ref<HTMLElement | null>(null)

const submitForm = async () => {
  const result = simulate(formData.value)
  simulations.value.push(result)
  await nextTick()
  if (resultsSection.value) {
    resultsSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const removeSimulation = (index: number) => {
  simulations.value.splice(index, 1)
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
            <div v-if="simulations.length > 0" ref="resultsSection" class="mt-8">
              <v-row>
                <v-col v-for="(res, index) in simulations" :key="index" cols="12">
                  <v-card
                    variant="outlined"
                    class="pa-4 mb-2"
                    :style="{
                      borderColor: `${CHART_COLORS[index % CHART_COLORS.length]} !important`,
                      borderWidth: '2px',
                    }"
                  >
                    <div class="d-flex justify-space-between align-center mb-4">
                      <h3
                        class="text-h6 font-weight-bold"
                        :style="{ color: CHART_COLORS[index % CHART_COLORS.length] }"
                      >
                        {{ res.fundName || `Scenario ${index + 1}` }}
                      </h3>
                      <v-btn
                        v-if="simulations.length > 0"
                        icon="mdi-close"
                        size="small"
                        variant="text"
                        color="error"
                        @click="removeSimulation(index)"
                      ></v-btn>
                    </div>
                    <SimulationResults :result="res" />
                  </v-card>
                </v-col>
              </v-row>

              <v-alert
                color="info"
                variant="tonal"
                class="mt-4 border"
                icon="mdi-compare"
                border="start"
              >
                <div class="text-subtitle-1 font-weight-bold">Confronta diversi scenari</div>
                <div class="text-body-2 mb-3">
                  Puoi cambiare i dati nel modulo sopra e cliccare su
                  <strong>"Aggiungi simulazione"</strong> per vedere come diverse scelte impattano
                  sul tuo capitale finale.
                </div>
                <div class="d-flex justify-end">
                  <v-btn
                    variant="outlined"
                    color="info"
                    prepend-icon="mdi-arrow-up"
                    class="text-none"
                    @click="scrollToTop"
                  >
                    Torna al modulo
                  </v-btn>
                </div>
              </v-alert>

              <SimulationChart :simulations="simulations" />
            </div>
          </v-slide-y-transition>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
