<script setup>
import { onMounted, watch } from 'vue'
import { useAiCreditsAdminStore } from '@/stores/aiCreditsAdmin'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import AiCreditsTable from '@/components/aiCredits/AiCreditsTable.vue'
import AiCreditsAdminForm from '@/components/aiCredits/AiCreditsAdminForm.vue'
import AiCreditsHistory from '@/components/aiCredits/AiCreditsHistory.vue'

const store = useAiCreditsAdminStore()

const handleSelectUser = (user) => {
  store.selectUser(user)
}

const handleAddCredits = async ({ userId, amount, reason }) => {
  try {
    await store.addCreditsToUser(userId, amount, reason)
    // Toast de sucesso (pode ser integrado com sistema de notificação global)
  } catch (err) {
    // Erro já está em store.error
  }
}

const handleRemoveCredits = async ({ userId, amount, reason }) => {
  try {
    await store.removeCreditsFromUser(userId, amount, reason)
    // Toast de sucesso
  } catch (err) {
    // Erro já está em store.error
  }
}

const handleSearchChange = (search) => {
  store.setFilter('search', search)
}

const handlePageChange = (page) => {
  store.goToPage(page)
}

const handleClearError = () => {
  store.clearError()
}

const handleClearErrorHistory = () => {
  store.clearErrorHistory()
}

onMounted(async () => {
  await store.fetchUserCredits()
})

// Auto-clear errors after 5 seconds
watch(
  () => store.error,
  () => {
    if (store.error) {
      setTimeout(() => {
        store.clearError()
      }, 5000)
    }
  },
)

watch(
  () => store.errorHistory,
  () => {
    if (store.errorHistory) {
      setTimeout(() => {
        store.clearErrorHistory()
      }, 5000)
    }
  },
)
</script>

<template>
  <AppLayout title="Gestão de Créditos de IA">
    <div class="space-y-6">
      <!-- Header -->
      <section class="flex flex-col justify-between gap-4 border-b border-outline-variant pb-8 md:flex-row md:items-end">
        <div>
          <h2 class="text-headline-lg font-headline-lg text-on-surface">Gestão de Créditos de IA</h2>
          <p class="text-body-md font-body-md text-on-surface-variant">
            Visualize e gerencie os créditos de IA dos usuários.
          </p>
        </div>
      </section>

      <!-- Grid Layout: Table (left/full) + Form (right/below) -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Left: Users Table -->
        <div class="lg:col-span-1">
          <!-- Search Bar -->
          <div class="mb-4 flex items-center gap-2 rounded-lg border border-outline bg-surface px-3 py-2">
            <AppIcon name="search" size="md" class="text-on-surface-variant" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              :value="store.filters.search"
              @input="handleSearchChange($event.target.value)"
              class="flex-1 bg-transparent text-on-surface placeholder-on-surface-variant focus:outline-none"
            />
          </div>

          <AiCreditsTable
            :users="store.users"
            :is-loading="store.isLoading"
            :selected-user-id="store.selectedUser?.id"
            :page="store.filters.page"
            :page-size="store.filters.limit"
            :total-pages="store.meta.lastPage"
            @select-user="handleSelectUser"
            @page-change="handlePageChange"
          />
        </div>

        <!-- Right: Admin Form -->
        <div v-if="store.selectedUser" class="lg:col-span-1 lg:sticky lg:top-6 lg:h-fit">
          <AiCreditsAdminForm
            :user="store.selectedUser"
            :is-loading="store.loading"
            :error="store.error"
            @add-credits="handleAddCredits"
            @remove-credits="handleRemoveCredits"
            @clear-error="handleClearError"
          />
        </div>
      </div>

      <!-- History Section: shown when user selected -->
      <div v-if="store.selectedUser">
        <div class="mb-4 flex items-center gap-2">
          <AppIcon name="history" size="md" class="text-on-surface" />
          <h3 class="text-headline-md font-headline-md text-on-surface">
            Histórico de {{ store.selectedUser.fullName }}
          </h3>
        </div>
        <AiCreditsHistory
          :history="store.history"
          :is-loading="store.isLoadingHistory"
          :error="store.errorHistory"
          @clear-error="handleClearErrorHistory"
        />
      </div>

      <!-- Empty State: no user selected -->
      <div v-else class="rounded-lg border border-outline-variant bg-surface-container-lowest p-12 text-center">
        <AppIcon name="users" size="xl" class="mx-auto mb-3 text-on-surface-variant opacity-50" />
        <p class="text-on-surface-variant">Selecione um usuário na tabela para gerenciar seus créditos.</p>
      </div>
    </div>
  </AppLayout>
</template>
