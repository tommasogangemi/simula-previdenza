<script setup lang="ts">
import { ref, nextTick } from 'vue'
import PensionForm from './components/PensionForm.vue'
import type { PensionFundData, SimulationResult } from './types'
import { simulate } from './simulation'
import SimulationResults from './components/SimulationResults.vue'
import SimulationChart from './components/SimulationChart.vue'
import { CHART_COLORS } from './constants'

const simulations = ref<SimulationResult[]>([])
const resultsSection = ref<HTMLElement | null>(null)

const submitForm = async (formData: PensionFundData) => {
  const result = simulate(formData)
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
      <v-container class="fill-height justify-center" fluid>
        <v-card class="mx-auto pa-6" elevation="3" max-width="960" width="100%">
          <div class="text-center mb-6">
            <h1 class="text-h4 font-weight-bold text-primary mb-2">
              Simulatore Previdenza Complementare
            </h1>
            <div class="text-subtitle-1 text-medium-emphasis mx-auto" style="max-width: 800px">
              <p class="mb-4">
                Questo strumento ti aiuta a capire come potrebbero crescere i tuoi risparmi in un
                fondo pensione. Puoi confrontare diverse strategie, vedere i vantaggi fiscali e
                capire quanto incidono i costi, il tutto in modo semplice.
              </p>
            </div>
          </div>

          <PensionForm @submit="submitForm" />

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
                <div class="text-subtitle-1 font-weight-bold">Fai un confronto</div>
                <div class="text-body-2 mb-3">
                  Cambia qualche numero sopra e clicca <strong>"Aggiungi simulazione"</strong> per
                  vedere le differenze fianco a fianco.
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

    <v-footer
      class="bg-grey-lighten-4 justify-center align-center text-caption text-medium-emphasis"
    >
      <div class="px-4 py-2 text-center">
        <a
          href="https://github.com/tommasogangemi/simula-previdenza"
          target="_blank"
          class="text-decoration-none text-medium-emphasis d-inline-flex align-center"
        >
          Hai feedback o suggerimenti?
          <v-icon icon="mdi-github" size="small" class="mx-1"></v-icon>
          Contribuisci su GitHub
        </a>
      </div>
    </v-footer>
  </v-app>
</template>
