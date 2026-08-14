<script setup>
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  users: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  selectedUserId: {
    type: Number,
    default: null,
  },
  page: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
})

const emit = defineEmits(['select-user', 'page-change'])

const handleSelectUser = (user) => {
  emit('select-user', user)
}

const handlePrevPage = () => {
  if (props.page > 1) {
    emit('page-change', props.page - 1)
  }
}

const handleNextPage = () => {
  if (props.page < props.totalPages) {
    emit('page-change', props.page + 1)
  }
}
</script>

<template>
  <div class="rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden">
    <!-- Header -->
    <div class="border-b border-outline-variant px-6 py-4">
      <h3 class="text-headline-md font-title-lg text-on-surface">Usuários</h3>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="divide-y divide-outline-variant">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-6 py-4">
        <div class="h-4 w-1/3 animate-pulse rounded bg-outline-variant"></div>
        <div class="h-4 w-1/3 animate-pulse rounded bg-outline-variant"></div>
        <div class="h-4 w-1/6 animate-pulse rounded bg-outline-variant"></div>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-outline-variant bg-surface-variant text-left">
          <tr>
            <th class="px-6 py-3 font-title-sm text-on-surface">Usuário</th>
            <th class="px-6 py-3 font-title-sm text-on-surface">E-mail</th>
            <th class="px-6 py-3 font-title-sm text-on-surface text-right">Saldo</th>
            <th class="px-6 py-3 font-title-sm text-on-surface text-center">Ação</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant">
          <tr
            v-for="user in users"
            :key="user.id"
            :class="[
              'hover:bg-surface-variant/50 cursor-pointer transition-colors',
              selectedUserId === user.id ? 'bg-primary-container' : '',
            ]"
          >
            <td class="px-6 py-4">
              <p class="font-title-sm text-on-surface">{{ user.fullName }}</p>
            </td>
            <td class="px-6 py-4">
              <p class="text-sm text-on-surface-variant">{{ user.email }}</p>
            </td>
            <td class="px-6 py-4 text-right">
              <p class="font-title-md text-on-surface">
                {{ (user.aiCreditsRemaining ?? user.balance ?? 0).toLocaleString('pt-BR') }}
              </p>
            </td>
            <td class="px-6 py-4 text-center">
              <button
                @click="handleSelectUser(user)"
                class="inline-flex items-center gap-1 rounded px-3 py-1.5 text-sm font-title-sm text-primary hover:bg-primary-container transition-colors"
                :title="`Editar créditos de ${user.fullName}`"
              >
                <AppIcon name="edit-2" size="sm" />
                <span class="hidden sm:inline">Editar</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="users.length === 0 && !isLoading" class="p-12 text-center">
        <AppIcon name="inbox" size="xl" class="mx-auto mb-4 text-on-surface-variant opacity-50" />
        <p class="text-on-surface-variant">Nenhum usuário encontrado.</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1 && users.length > 0" class="flex items-center justify-between border-t border-outline-variant px-6 py-4">
      <p class="text-xs text-on-surface-variant">
        Página {{ page }} de {{ totalPages }}
      </p>
      <div class="flex gap-2">
        <button
          @click="handlePrevPage"
          :disabled="page === 1 || isLoading"
          class="rounded border border-outline px-3 py-1.5 text-sm font-title-sm text-on-surface hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Anterior
        </button>
        <button
          @click="handleNextPage"
          :disabled="page === totalPages || isLoading"
          class="rounded border border-outline px-3 py-1.5 text-sm font-title-sm text-on-surface hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Próxima →
        </button>
      </div>
    </div>
  </div>
</template>
