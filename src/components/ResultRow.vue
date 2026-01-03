<script setup lang="ts">
defineProps<{
  label: string
  value: string
  icon?: string
  iconColor?: string
  tooltip?: string
}>()
</script>

<template>
  <div class="d-flex justify-space-between align-center mb-2">
    <div class="text-medium-emphasis d-flex align-center">
      <v-icon v-if="icon" :icon="icon" :color="iconColor" size="14" class="mr-2"></v-icon>
      {{ label }}
      <v-tooltip v-if="tooltip" location="top" :text="tooltip">
        <template v-slot:activator="{ props }">
          <v-icon
            v-bind="props"
            icon="mdi-information-outline"
            size="12"
            class="ml-1 cursor-help"
          ></v-icon>
        </template>
      </v-tooltip>
    </div>
    <div class="text-body-2 font-weight-medium text-right">
      {{ value }}
    </div>
  </div>
</template>
