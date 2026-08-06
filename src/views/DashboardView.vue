<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import StudentDashboard from '@/views/StudentDashboard.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'

const auth = useAuthStore()

const isAdmin = computed(() => auth.isAdmin)
</script>

<template>
  <AdminDashboard v-if="isAdmin" />
  <StudentDashboard v-else />
</template>
