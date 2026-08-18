<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BooksCatalogView from '@/views/BooksCatalogView.vue'
import AdminBooksListView from '@/views/admin/BooksListView.vue'

const auth = useAuthStore()
const isAdmin = computed(() => auth.isAdmin)
</script>

<template>
  <AdminBooksListView v-if="isAdmin" />
  <BooksCatalogView v-else />
</template>
