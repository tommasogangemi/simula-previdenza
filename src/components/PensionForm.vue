<script setup lang="ts">
import { computed } from 'vue'
import type { PensionFundData } from '../types'
import {
  DEDUCTIBLE_LIMIT,
  MAX_TAX_RATE,
  MIN_TAX_RATE,
  TAX_RATE_DECREASE,
  YEARS_BEFORE_TAX_RATE_DECREASE,
} from '../constants'
import { formatCurrency } from '../utils'

const formData = defineModel<PensionFundData>({ required: true })

const emit = defineEmits<{
  (e: 'submit'): void
}>()

const voluntaryAmount = computed(() => {
  return (formData.value.annualSalary * formData.value.voluntaryContributionPercent) / 100
})

const employerAmount = computed(() => {
  return (formData.value.annualSalary * formData.value.employerContributionPercent) / 100
})

const remainingDeductible = computed(() => {
  return Math.max(0, DEDUCTIBLE_LIMIT - voluntaryAmount.value - employerAmount.value)
})

const additionalContributionAmount = computed(() => {
  return (remainingDeductible.value * formData.value.additionalDeductibleContributionPercent) / 100
})
</script>

<template>
  <v-form @submit.prevent="emit('submit')">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="formData.fundName"
          label="Nome del Fondo"
          type="text"
          hint="Il nome del fondo pensione che stai considerando."
          persistent-hint
          variant="outlined"
          color="primary"
          clearable
        ></v-text-field>
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model.number="formData.annualSalary"
          label="Retribuzione Annua Lorda (RAL)"
          type="number"
          min="0"
          step="1000"
          suffix="€"
          hint="Il tuo stipendio lordo annuale."
          persistent-hint
          variant="outlined"
          color="primary"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="formData.fundCostPercent"
          label="Costo annuo del fondo (%)"
          type="number"
          min="0"
          max="100"
          step="0.01"
          suffix="%"
          hint="Spese di gestione in percentuale."
          persistent-hint
          variant="outlined"
          color="primary"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="formData.fundCostFixed"
          label="Costo annuo fisso (€)"
          type="number"
          min="0"
          step="5"
          suffix="€"
          hint="Eventuali spese fisse annuali."
          persistent-hint
          variant="outlined"
          color="primary"
        ></v-text-field>
      </v-col>

      <v-col cols="12">
        <div class="d-flex align-center mb-2">
          <div class="text-subtitle-1 font-weight-bold">Allocazione Azionaria</div>
          <v-tooltip location="top">
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                icon="mdi-help-circle-outline"
                size="small"
                color="medium-emphasis"
                class="ml-2"
              ></v-icon>
            </template>

            <span>
              Scegli quanto investire in azioni. Di norma, per periodi lunghi (>10 anni), una quota
              azionaria più alta può offrire rendimenti migliori.
            </span>
          </v-tooltip>
        </div>
        <v-slider
          v-model.number="formData.stockAllocationPercent"
          min="0"
          max="100"
          step="5"
          color="primary"
          track-color="grey-lighten-2"
          thumb-label
          hide-details
          class="mb-1"
        ></v-slider>
        <div class="d-flex justify-center align-center ga-2">
          <span class="text-body-2 font-weight-medium text-medium-emphasis">
            {{ 100 - formData.stockAllocationPercent }}% Obbligazioni
          </span>
          <span class="text-body-2 font-weight-medium text-medium-emphasis"> - </span>
          <span class="text-body-2 font-weight-bold text-primary">
            {{ formData.stockAllocationPercent }}% Azioni
          </span>
        </div>
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model.number="formData.expectedReturnPercent"
          label="Rendimento annuo atteso (%)"
          type="number"
          min="-100"
          max="100"
          step="0.1"
          suffix="%"
          hint="Stima prudente del rendimento lordo annuo."
          persistent-hint
          variant="outlined"
          color="primary"
        >
          <template v-slot:append-inner>
            <v-tooltip location="top" interactive>
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  icon="mdi-help-circle-outline"
                  size="small"
                  color="medium-emphasis"
                ></v-icon>
              </template>

              <span>
                Stima del rendimento annuo lordo atteso in base all'allocazione. Per una allocazione
                100% azionaria un rendimento realistico potrebbe essere tra il 7 e l'8%. Per una
                allocazione 100% obbligazioni potrebbe essere invece tra il 2 e il 3%. I rendimenti
                storici dei principali fondi pensione sono reperibili tramite il sito
                <a
                  href="https://www.covip.it/per-gli-operatori/fondi-pensione/costi-e-rendimenti-dei-fondi-pensione/elenco-dei-rendimenti"
                  target="_blank"
                  >covip.it</a
                >.
              </span>
            </v-tooltip>
          </template>
        </v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="formData.yearsToRetirement"
          label="Anni al pensionamento"
          type="number"
          min="1"
          max="70"
          step="1"
          suffix="anni"
          hint="Numero di anni mancanti alla pensione."
          persistent-hint
          variant="outlined"
          color="primary"
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="formData.yearOfFirstContribution"
          label="Inizio previdenza complementare"
          type="number"
          min="2026"
          max="2100"
          step="1"
          hint="L'anno in cui hai aperto il tuo primo fondo pensione."
          persistent-hint
          variant="outlined"
          color="primary"
        >
          <template v-slot:append-inner>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  icon="mdi-help-circle-outline"
                  size="small"
                  color="medium-emphasis"
                ></v-icon>
              </template>

              <span>
                L'anno di apertura del tuo primo fondo. È importante perché l'anzianità premia: dopo
                {{ YEARS_BEFORE_TAX_RATE_DECREASE }} anni, la ritenuta fiscale scende dello
                {{ TAX_RATE_DECREASE }}% ogni anno, passando dal {{ MAX_TAX_RATE }}% fino a un
                minimo del {{ MIN_TAX_RATE }}%.
              </span>
            </v-tooltip>
          </template>
        </v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="formData.voluntaryContributionPercent"
          label="Contributo Volontario (%)"
          type="number"
          min="0"
          max="100"
          step="0.1"
          suffix="%"
          hint="Extra versato (in percentuale dal tuo stipendio)."
          persistent-hint
          variant="outlined"
          color="primary"
        >
          <template v-slot:append-inner>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  icon="mdi-help-circle-outline"
                  size="small"
                  color="medium-emphasis"
                ></v-icon>
              </template>

              <span>
                La percentuale del tuo stipendio che decidi di versare. Spesso serve per sbloccare
                anche il contributo del datore di lavoro.
              </span>
            </v-tooltip>
          </template>
        </v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model.number="formData.employerContributionPercent"
          label="Contributo Datoriale (%)"
          type="number"
          min="0"
          max="100"
          step="0.1"
          suffix="%"
          hint="Versato dall'azienda (se previsto)."
          persistent-hint
          variant="outlined"
          color="primary"
        >
          <template v-slot:append-inner>
            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  icon="mdi-help-circle-outline"
                  size="small"
                  color="medium-emphasis"
                ></v-icon>
              </template>

              <span>
                Soldi extra! La quota che la tua azienda versa se tu contribuisci col minimo
                richiesto (verifica il tuo contratto).
              </span>
            </v-tooltip>
          </template>
        </v-text-field>
      </v-col>

      <v-col cols="12">
        <div class="d-flex gap-4">
          <v-text-field
            v-model.number="formData.additionalDeductibleContributionPercent"
            label="Versamento deducibile aggiuntivo (%)"
            type="number"
            min="0"
            max="100"
            step="0.1"
            suffix="%"
            :hint="`Percentuale del plafond di deducibilità residuo (${DEDUCTIBLE_LIMIT}€).`"
            persistent-hint
            variant="outlined"
            color="primary"
          >
            <template v-slot:append-inner>
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-icon
                    v-bind="props"
                    icon="mdi-help-circle-outline"
                    size="small"
                    color="medium-emphasis"
                  ></v-icon>
                </template>

                <span>
                  Versare di più conviene: puoi dedurre fino a {{ DEDUCTIBLE_LIMIT }}€ (sommando
                  contributo percentuale, datoriale e questo aggiuntivo) l'anno dal tuo reddito
                  imponibile. Più alto è il tuo scaglione IRPEF, maggiore sarà il risparmio.
                </span>
              </v-tooltip>
            </template>
          </v-text-field>

          <div class="text-h6 text-no-wrap font-weight-bold ml-4 mt-1 text-primary">
            = {{ formatCurrency(additionalContributionAmount) }}
          </div>
        </div>
      </v-col>

      <v-alert
        color="info"
        variant="tonal"
        icon="mdi-information-outline"
        class="text-left mt-2"
        density="comfortable"
      >
        <div class="text-body-2">
          <strong>Nota:</strong> Questa simulazione serve per fare confronti utili tra diversi
          scenari e non per ottenere una previsione precisa al centesimo. Per questo usiamo alcune
          semplificazioni:
          <ul class="ml-4 mt-2">
            <li>
              <strong>Rendimenti costanti:</strong> Usiamo una media fissa per il rendimento annuo.
            </li>
            <li>
              <strong>Stipendio stabile:</strong> Non sono considerati futuri aumenti di stipendio,
              che aumenterebbero i versamenti di TFR e percentuali.
            </li>
            <li>
              <strong>Calcolo conservativo:</strong> Gli interessi sono calcolati sul saldo
              dell'anno precedente, non considerando i versamenti che avvengono nell'arco dell'anno.
            </li>
          </ul>
        </div>
      </v-alert>

      <v-col cols="12" class="mt-4">
        <v-btn
          type="submit"
          block
          color="primary"
          size="x-large"
          elevation="4"
          class="text-none font-weight-bold"
        >
          Aggiungi simulazione
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>
