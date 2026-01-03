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

              <v-alert color="primary" variant="tonal" icon="mdi-percent" class="mb-4">
                <div class="text-h6">
                  Aliquota tassazione capitale:
                  <strong>{{ simulationResult.contributionSummary.taxRate.toFixed(2) }}%</strong>
                </div>
                <div class="text-caption">
                  Tassazione sul capitale accumulato al momento del pensionamento. Parte dal 15% e
                  diminuisce dello 0,3% all'anno dopo 5 anni di adesione, fino a un minimo del 9%.
                </div>
              </v-alert>

              <v-divider class="my-6"></v-divider>
              <h3 class="text-h6 font-weight-bold mb-4">Proiezione Contributi Totali</h3>

              <v-row>
                <v-col cols="12" md="4">
                  <v-card variant="outlined" class="pa-4 text-center">
                    <div class="text-overline mb-1">Totale Versato (Lordo)</div>
                    <div class="text-h6 font-weight-bold text-primary">
                      {{
                        formatCurrency(simulationResult.contributionSummary.grossTotalContribution)
                      }}
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card variant="outlined" class="pa-4 text-center">
                    <div class="text-overline mb-1">Tassazione Totale</div>
                    <div class="text-h6 font-weight-bold text-error">
                      - {{ formatCurrency(simulationResult.contributionSummary.totalTaxAmount) }}
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card variant="outlined" class="pa-4 text-center bg-primary-lighten-5">
                    <div class="text-overline mb-1">Contributi Netti</div>
                    <div class="text-h6 font-weight-bold text-success">
                      {{
                        formatCurrency(simulationResult.contributionSummary.netTotalContribution)
                      }}
                    </div>
                  </v-card>
                </v-col>
              </v-row>
              <div class="text-caption mt-2 text-medium-emphasis">
                Questa proiezione considera la somma di TFR, contributi volontari, datoriali e
                aggiuntivi per tutto l'orizzonte temporale scelto, al netto della tassazione finale.
              </div>
            </div>
          </v-slide-y-transition>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
