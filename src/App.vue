<script setup lang="ts">
import { reactive } from 'vue'

interface PensionFundData {
  annualSalary: number
  fundCostPercent: number
  fundCostFixed: number
  stockAllocationPercent: number
  expectedReturnPercent: number
  yearsToRetirement: number
  voluntaryContributionPercent: number
  employerContributionPercent: number
}

const formData = reactive<PensionFundData>({
  annualSalary: 30000,
  fundCostPercent: 1.0,
  fundCostFixed: 0,
  stockAllocationPercent: 50,
  expectedReturnPercent: 4.0,
  yearsToRetirement: 30,
  voluntaryContributionPercent: 0,
  employerContributionPercent: 0,
})

const submitForm = () => {
  console.log('Dati simulazione:', JSON.parse(JSON.stringify(formData)))
  alert('Dati inviati! Controlla la console per i dettagli.')
}
</script>

<template>
  <main class="container">
    <div class="card">
      <header>
        <h1>Simulatore Previdenza Complementare</h1>
        <p class="subtitle">
          Scopri quanto potresti accumulare per il tuo futuro. Inserisci i tuoi dati per iniziare la
          simulazione.
        </p>
      </header>

      <form @submit.prevent="submitForm" class="simulation-form">
        <div class="form-group">
          <label for="salary">Retribuzione Annua Lorda (RAL)</label>
          <div class="input-wrapper">
            <input
              id="salary"
              type="number"
              v-model="formData.annualSalary"
              min="0"
              step="1000"
              required
            />
            <span class="suffix">€</span>
          </div>
          <small>Il tuo stipendio lordo annuale.</small>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label for="fundCostPercent">Costo annuo del fondo (%)</label>
            <div class="input-wrapper">
              <input
                id="fundCostPercent"
                type="number"
                v-model="formData.fundCostPercent"
                min="0"
                max="100"
                step="0.01"
              />
              <span class="suffix">%</span>
            </div>
            <small>Spese di gestione in percentuale.</small>
          </div>

          <div class="form-group half">
            <label for="fundCostFixed">Costo annuo fisso (€)</label>
            <div class="input-wrapper">
              <input
                id="fundCostFixed"
                type="number"
                v-model="formData.fundCostFixed"
                min="0"
                step="5"
              />
              <span class="suffix">€</span>
            </div>
            <small> eventuali spese fisse annuali.</small>
          </div>
        </div>

        <div class="form-group">
          <label for="stockAllocation">Allocazione Azionaria</label>
          <div class="range-wrapper">
            <input
              id="stockAllocation"
              type="range"
              v-model="formData.stockAllocationPercent"
              min="0"
              max="100"
              step="5"
            />
            <span class="range-value"
              >{{ formData.stockAllocationPercent }}% Azioni /
              {{ 100 - formData.stockAllocationPercent }}% Obbligazioni</span
            >
          </div>
          <small>Percentuale del portafoglio investita in azioni.</small>
        </div>

        <div class="form-group">
          <label for="expectedReturn">Rendimento annuo atteso (%)</label>
          <div class="input-wrapper">
            <input
              id="expectedReturn"
              type="number"
              v-model="formData.expectedReturnPercent"
              min="-100"
              max="100"
              step="0.1"
            />
            <span class="suffix">%</span>
          </div>
          <small>Stima prudenziale del rendimento lordo.</small>
        </div>

        <div class="form-group">
          <label for="yearsToRetirement">Anni al pensionamento</label>
          <div class="input-wrapper">
            <input
              id="yearsToRetirement"
              type="number"
              v-model="formData.yearsToRetirement"
              min="1"
              max="70"
              step="1"
            />
            <span class="suffix">anni</span>
          </div>
          <small>Numero di anni mancanti alla pensione.</small>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label for="voluntaryContrib">Contributo Volontario (%)</label>
            <div class="input-wrapper">
              <input
                id="voluntaryContrib"
                type="number"
                v-model="formData.voluntaryContributionPercent"
                min="0"
                max="100"
                step="0.1"
              />
              <span class="suffix">%</span>
            </div>
            <small>Extra versato dal tuo stipendio.</small>
          </div>

          <div class="form-group half">
            <label for="employerContrib">Contributo Datore (%)</label>
            <div class="input-wrapper">
              <input
                id="employerContrib"
                type="number"
                v-model="formData.employerContributionPercent"
                min="0"
                max="100"
                step="0.1"
              />
              <span class="suffix">%</span>
            </div>
            <small>Versato dall'azienda (se previsto).</small>
          </div>
        </div>

        <button type="submit" class="submit-btn">Calcola Previsione</button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f8fafc;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  padding: 2.5rem;
  width: 100%;
  max-width: 600px;
}

header {
  margin-bottom: 2rem;
  text-align: center;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.75rem;
  letter-spacing: -0.025em;
}

.subtitle {
  color: #64748b;
  line-height: 1.5;
  font-size: 1rem;
}

.simulation-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
}

.half {
  flex: 1;
}

label {
  font-size: 0.925rem;
  font-weight: 600;
  color: #334155;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

input[type='number'],
input[type='text'] {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  color: #1e293b;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  background: #f8fafc;
}

input[type='number']:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.suffix {
  position: absolute;
  right: 1rem;
  color: #64748b;
  font-weight: 500;
  pointer-events: none;
}

small {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.1rem;
}

/* Range slider styling */
.range-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

input[type='range'] {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

input[type='range']::-webkit-slider-thumb:hover {
  background: #2563eb;
}

.range-value {
  font-size: 0.9rem;
  color: #3b82f6;
  font-weight: 600;
  text-align: right;
}

.submit-btn {
  margin-top: 1rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 1rem;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition:
    transform 0.1s,
    box-shadow 0.2s;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 1.5rem;
  }
}
</style>
