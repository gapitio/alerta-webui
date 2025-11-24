<template>
  <alert-detail :id="route.params.id" />
</template>

<script setup lang="ts">
import {useRoute} from 'vue-router'

definePage({
  meta: {
    title: 'Alert',
    requiresAuth: true
  }
})

const route = useRoute('users-id')
</script>
