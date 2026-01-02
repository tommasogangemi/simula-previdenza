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
})

const submitForm = () => {
  console.log('Dati simulazione:', JSON.parse(JSON.stringify(formData.value)))
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

      <PensionForm v-model="formData" @submit="submitForm" />
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
</style>
