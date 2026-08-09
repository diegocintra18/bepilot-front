<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import { USER_TYPE_LABELS, UserType } from '@/constants/userTypes'
import { ACCOUNT_STATUS_LABELS, USER_TYPE_STRING_LABELS } from '@/constants/statuses'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import FormField from '@/components/auth/FormField.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import SubmitButton from '@/components/auth/SubmitButton.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const store = useUsersStore()

const isEdit = computed(() => route.name === 'user-edit')
const userId = computed(() => Number(route.params.id))
const title = computed(() => (isEdit.value ? 'Editar Usuário' : 'Novo Usuário'))

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USER_TYPE_INTEGER_TO_STRING = { [UserType.Student]: 'student', [UserType.Admin]: 'admin' }

const form = reactive({
  fullName: '',
  email: '',
  whatsapp: '',
  userType: UserType.Student,
  status: 'active',
  freeSimulationsUsed: 0,
  password: '',
})
const fieldErrors = reactive({ fullName: '', email: '', whatsapp: '', userType: '', status: '', freeSimulationsUsed: '', password: '' })
const metaInfo = reactive({
  id: null,
  initials: '',
  createdAt: '',
  updatedAt: '',
  whatsapp: '',
  subscriptionStatus: '',
})
const original = reactive({
  userType: null,
  status: null,
})
const apiError = ref('')
const loading = ref(false)
const fetching = ref(false)
const notFound = ref(false)
const confirmSensitive = ref(false)

const statusOptions = [
  { value: 'active', label: ACCOUNT_STATUS_LABELS.active },
  { value: 'inactive', label: ACCOUNT_STATUS_LABELS.inactive },
  { value: 'blocked', label: ACCOUNT_STATUS_LABELS.blocked },
]

onMounted(async () => {
  if (!isEdit.value) return
  fetching.value = true
  try {
    const user = await store.getUser(userId.value)
    form.fullName = user.fullName || ''
    form.email = user.email || ''
    form.whatsapp = user.whatsapp || ''
    form.userType = USER_TYPE_INTEGER_TO_STRING[user.userType] ?? 'student'
    form.status = user.status || 'active'
    form.freeSimulationsUsed = user.freeSimulationsUsed ?? 0
    original.userType = form.userType
    original.status = form.status
    metaInfo.id = user.id
    metaInfo.initials = user.initials || ''
    metaInfo.createdAt = user.createdAt || ''
    metaInfo.updatedAt = user.updatedAt || ''
    metaInfo.whatsapp = user.whatsapp || ''
    metaInfo.subscriptionStatus = user.subscriptionStatus || ''
  } catch (error) {
    if (error.kind === 'notfound') {
      notFound.value = true
    } else {
      apiError.value = error.message || 'Não foi possível carregar o usuário.'
    }
  } finally {
    fetching.value = false
  }
})

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function validate() {
  fieldErrors.fullName = ''
  fieldErrors.email = ''
  fieldErrors.whatsapp = ''
  fieldErrors.userType = ''
  fieldErrors.status = ''
  fieldErrors.freeSimulationsUsed = ''
  fieldErrors.password = ''
  let valid = true

  if (!form.fullName.trim()) {
    fieldErrors.fullName = 'Informe o nome completo.'
    valid = false
  }
  if (!form.email) {
    fieldErrors.email = 'Informe o e-mail.'
    valid = false
  } else if (!EMAIL_PATTERN.test(form.email)) {
    fieldErrors.email = 'Informe um e-mail válido.'
    valid = false
  }
  if (!isEdit.value) {
    if (form.userType !== UserType.Student && form.userType !== UserType.Admin) {
      fieldErrors.userType = 'Selecione um tipo de usuário válido.'
      valid = false
    }
    if (!form.password) {
      fieldErrors.password = 'Informe uma senha para o usuário.'
      valid = false
    } else if (form.password.length < 8) {
      fieldErrors.password = 'A senha deve ter no mínimo 8 caracteres.'
      valid = false
    }
  } else {
    if (form.userType !== 'student' && form.userType !== 'admin') {
      fieldErrors.userType = 'Selecione um tipo de usuário válido.'
      valid = false
    }
    if (form.status !== 'active' && form.status !== 'inactive' && form.status !== 'blocked') {
      fieldErrors.status = 'Selecione um status válido.'
      valid = false
    }
    const free = Number(form.freeSimulationsUsed)
    if (!Number.isInteger(free) || free < 0) {
      fieldErrors.freeSimulationsUsed = 'Informe um número inteiro maior ou igual a zero.'
      valid = false
    }
  }
  return valid
}

function hasSensitiveChanges() {
  return isEdit.value && (form.userType !== original.userType || form.status !== original.status)
}

function submit() {
  apiError.value = ''
  if (!validate()) return
  if (hasSensitiveChanges()) {
    confirmSensitive.value = true
    return
  }
  doSubmit()
}

async function doSubmit() {
  apiError.value = ''
  loading.value = true
  try {
    if (isEdit.value) {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email,
        whatsapp: form.whatsapp.trim() || null,
        userType: form.userType,
        status: form.status,
        freeSimulationsUsed: Number(form.freeSimulationsUsed),
      }
      await store.updateUser(userId.value, payload)
    } else {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email,
        userType: Number(form.userType),
        password: form.password,
      }
      await store.createUser(payload)
    }
    router.push({ name: 'users' })
  } catch (error) {
    if (error.kind === 'validation' && Array.isArray(error.fieldErrors)) {
      error.fieldErrors.forEach(({ field, message }) => {
        if (field in fieldErrors) fieldErrors[field] = message
      })
    }
    apiError.value = error.message || 'Não foi possível salvar o usuário.'
  } finally {
    loading.value = false
  }
}

function cancelSensitive() {
  confirmSensitive.value = false
}
</script>

<template>
  <AppLayout :title="title">
    <div class="space-y-stack-lg">
      <RouterLink
        :to="{ name: 'users' }"
        class="inline-flex w-fit items-center gap-2 font-button-text text-button-text text-primary hover:underline"
      >
        <AppIcon name="chevron-left" :size="18" />
        Voltar para usuários
      </RouterLink>

      <section v-if="notFound" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift">
        <h2 class="font-headline-lg text-headline-lg text-on-surface">Usuário não encontrado</h2>
        <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
          O usuário que você tentou editar não existe ou foi removido.
        </p>
        <RouterLink
          :to="{ name: 'users' }"
          class="mt-stack-lg inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-button-text text-button-text font-bold text-on-primary transition-colors hover:bg-primary-container"
        >
          <AppIcon name="chevron-left" :size="18" />
          Voltar para usuários
        </RouterLink>
      </section>

      <section v-else-if="fetching" class="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lift">
        <span
          class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Carregando"
        />
      </section>

      <div v-else class="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <section class="max-w-2xl rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift md:p-8 lg:col-span-2">
          <h2 class="font-headline-lg text-headline-lg text-on-surface">
            {{ isEdit ? 'Editar usuário' : 'Novo usuário' }}
          </h2>
          <p class="mt-stack-sm font-body-md text-body-md text-on-surface-variant">
            {{ isEdit ? 'Atualize as informações do usuário.' : 'Preencha os dados para criar um novo usuário.' }}
          </p>

          <ValidationMessages :message="apiError" class="mt-stack-md" />

          <form novalidate class="mt-stack-lg flex flex-col gap-stack-md" @submit.prevent="submit">
            <FormField :error="fieldErrors.fullName" label="Nome completo" name="fullName">
              <template #default="{ id, error }">
                <input
                  :id="id"
                  v-model="form.fullName"
                  type="text"
                  name="fullName"
                  autocomplete="name"
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
              </template>
            </FormField>

            <FormField :error="fieldErrors.email" label="E-mail" name="email">
              <template #default="{ id, error }">
                <input
                  :id="id"
                  v-model="form.email"
                  type="email"
                  name="email"
                  autocomplete="email"
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
              </template>
            </FormField>

            <FormField v-if="isEdit" :error="fieldErrors.whatsapp" label="WhatsApp" name="whatsapp">
              <template #default="{ id, error }">
                <input
                  :id="id"
                  v-model="form.whatsapp"
                  type="text"
                  name="whatsapp"
                  autocomplete="tel"
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
              </template>
            </FormField>

            <FormField :error="fieldErrors.userType" label="Tipo de usuário" name="userType">
              <template #default="{ id, error }">
                <select
                  v-if="isEdit"
                  :id="id"
                  v-model="form.userType"
                  name="userType"
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
                  <option value="student">{{ USER_TYPE_STRING_LABELS.student }}</option>
                  <option value="admin">{{ USER_TYPE_STRING_LABELS.admin }}</option>
                </select>
                <select
                  v-else
                  :id="id"
                  v-model.number="form.userType"
                  name="userType"
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
                  <option :value="UserType.Student">{{ USER_TYPE_LABELS[UserType.Student] }}</option>
                  <option :value="UserType.Admin">{{ USER_TYPE_LABELS[UserType.Admin] }}</option>
                </select>
              </template>
            </FormField>

            <FormField v-if="isEdit" :error="fieldErrors.status" label="Status" name="status">
              <template #default="{ id, error }">
                <select
                  :id="id"
                  v-model="form.status"
                  name="status"
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
                  <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </template>
            </FormField>

            <FormField v-if="isEdit" :error="fieldErrors.freeSimulationsUsed" label="Simulados gratuitos utilizados" name="freeSimulationsUsed">
              <template #default="{ id, error }">
                <input
                  :id="id"
                  v-model.number="form.freeSimulationsUsed"
                  type="number"
                  name="freeSimulationsUsed"
                  min="0"
                  step="1"
                  :aria-describedby="error ? `${id}-error` : undefined"
                  class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                >
              </template>
            </FormField>

            <FormField v-if="!isEdit" :error="fieldErrors.password" label="Senha" name="password">
              <template #default="{ id, error }">
                <PasswordInput
                  :id="id"
                  v-model="form.password"
                  name="password"
                  autocomplete="new-password"
                  placeholder="Mínimo de 8 caracteres"
                  :aria-describedby="error ? `${id}-error` : undefined"
                />
              </template>
            </FormField>

            <div class="flex flex-col-reverse gap-3 pt-stack-sm sm:flex-row sm:justify-end">
              <RouterLink
                :to="{ name: 'users' }"
                class="flex items-center justify-center rounded-lg border border-outline-variant px-6 py-3 font-button-text text-button-text text-on-surface transition-colors hover:bg-surface-container-low"
              >
                Cancelar
              </RouterLink>
              <SubmitButton class="sm:!w-auto sm:!px-8" :loading="loading">
                {{ isEdit ? 'Salvar alterações' : 'Criar usuário' }}
              </SubmitButton>
            </div>
          </form>
        </section>

        <aside
          v-if="isEdit"
          class="h-fit rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift"
          aria-label="Informações do usuário"
        >
          <h3 class="font-headline-md text-headline-md text-on-surface">Informações</h3>
          <dl class="mt-stack-md space-y-stack-sm">
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">ID</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ metaInfo.id ?? '—' }}</dd>
            </div>
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Iniciais</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ metaInfo.initials || '—' }}</dd>
            </div>
            <div v-if="metaInfo.subscriptionStatus">
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Assinatura</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ metaInfo.subscriptionStatus }}</dd>
            </div>
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Criado em</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ formatDate(metaInfo.createdAt) }}</dd>
            </div>
            <div>
              <dt class="font-label-caps text-label-caps uppercase text-on-surface-variant">Atualizado em</dt>
              <dd class="font-body-md text-body-md text-on-surface">{{ formatDate(metaInfo.updatedAt) }}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmSensitive"
      title="Alterar permissões do usuário"
      message="Você está alterando as permissões deste usuário. Essa alteração pode modificar o acesso dele ao sistema."
      confirm-label="Salvar alterações"
      variant="primary"
      :loading="loading"
      @cancel="cancelSensitive"
      @confirm="doSubmit"
    />
  </AppLayout>
</template>
