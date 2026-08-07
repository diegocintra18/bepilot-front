<script setup>
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppIcon from '@/components/AppIcon.vue'
import FormField from '@/components/auth/FormField.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import SubmitButton from '@/components/auth/SubmitButton.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const auth = useAuthStore()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const profile = reactive({
  fullName: auth.user?.fullName || '',
  email: auth.user?.email || '',
  whatsapp: auth.user?.whatsapp || '',
})
const profileErrors = reactive({ fullName: '', email: '', whatsapp: '' })
const profileApiError = ref('')
const profileSuccess = ref('')
const savingProfile = ref(false)

const password = reactive({
  currentPassword: '',
  newPassword: '',
  confirmation: '',
})
const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmation: '',
})
const passwordApiError = ref('')
const passwordSuccess = ref('')
const savingPassword = ref(false)

const userTypeLabel = computed(
  () => ({ 1: 'Aluno', 2: 'Administrador' })[auth.user?.userType] || 'Usuário',
)

function applyFieldErrors(errors, target) {
  if (!Array.isArray(errors)) return
  errors.forEach(({ field, message }) => {
    if (field in target) target[field] = message
  })
}

function validateProfile() {
  profileErrors.fullName = ''
  profileErrors.email = ''
  profileErrors.whatsapp = ''
  let valid = true
  if (!profile.fullName.trim()) {
    profileErrors.fullName = 'Informe seu nome completo.'
    valid = false
  }
  if (!profile.email) {
    profileErrors.email = 'Informe seu e-mail.'
    valid = false
  } else if (!EMAIL_PATTERN.test(profile.email)) {
    profileErrors.email = 'Informe um e-mail válido.'
    valid = false
  }
  if (profile.whatsapp.trim().length > 30) {
    profileErrors.whatsapp = 'O número deve ter no máximo 30 caracteres.'
    valid = false
  }
  return valid
}

async function saveProfile() {
  profileApiError.value = ''
  profileSuccess.value = ''
  if (!validateProfile()) return

  savingProfile.value = true
  try {
    await auth.updateProfile({
      fullName: profile.fullName.trim(),
      email: profile.email,
      whatsapp: profile.whatsapp.trim() || null,
    })
    profileSuccess.value = 'Perfil atualizado com sucesso.'
  } catch (error) {
    if (error.kind === 'validation') applyFieldErrors(error.fieldErrors, profileErrors)
    profileApiError.value = error.message || 'Não foi possível atualizar o perfil.'
  } finally {
    savingProfile.value = false
  }
}

function validatePassword() {
  passwordErrors.currentPassword = ''
  passwordErrors.newPassword = ''
  passwordErrors.confirmation = ''
  let valid = true
  if (!password.currentPassword) {
    passwordErrors.currentPassword = 'Informe sua senha atual.'
    valid = false
  }
  if (!password.newPassword) {
    passwordErrors.newPassword = 'Informe a nova senha.'
    valid = false
  } else if (password.newPassword.length < 8) {
    passwordErrors.newPassword = 'A nova senha deve ter no mínimo 8 caracteres.'
    valid = false
  }
  if (!password.confirmation) {
    passwordErrors.confirmation = 'Confirme a nova senha.'
    valid = false
  } else if (password.confirmation !== password.newPassword) {
    passwordErrors.confirmation = 'As senhas não coincidem.'
    valid = false
  }
  return valid
}

async function changePassword() {
  passwordApiError.value = ''
  passwordSuccess.value = ''
  if (!validatePassword()) return

  savingPassword.value = true
  try {
    await auth.changePassword({ ...password })
    password.currentPassword = ''
    password.newPassword = ''
    password.confirmation = ''
    passwordSuccess.value = 'Senha alterada com sucesso.'
  } catch (error) {
    if (error.kind === 'validation') applyFieldErrors(error.fieldErrors, passwordErrors)
    passwordApiError.value = error.message || 'Não foi possível alterar a senha.'
  } finally {
    savingPassword.value = false
  }
}
</script>

<template>
  <AppLayout title="Meu Perfil">
    <div class="space-y-stack-lg">
      <section class="flex flex-col justify-between gap-4 border-b border-outline-variant pb-8 md:flex-row md:items-end">
        <div>
          <h2 class="font-headline-lg text-headline-lg text-on-surface">Meu Perfil</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            {{ auth.user?.fullName }} • {{ userTypeLabel }}
          </p>
        </div>
      </section>

      <div class="grid grid-cols-1 gap-gutter lg:grid-cols-2">
        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
          <div class="mb-stack-md flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-on-primary-container"
              aria-hidden="true"
            >
              <AppIcon name="user" :size="22" />
            </div>
            <div>
              <h3 class="font-headline-md text-headline-md text-on-surface">Dados pessoais</h3>
              <p class="text-sm text-on-surface-variant">Atualize seu nome, e-mail e WhatsApp.</p>
            </div>
          </div>

          <ValidationMessages v-if="profileApiError" :message="profileApiError" class="mb-stack-md" />
          <div
            v-if="profileSuccess"
            role="status"
            class="mb-stack-md flex items-center gap-2 rounded-lg border border-tertiary bg-tertiary-fixed px-4 py-3 font-button-text text-button-text text-on-tertiary-fixed-variant"
          >
            <AppIcon name="check-circle" :size="18" />
            {{ profileSuccess }}
          </div>

          <form novalidate @submit.prevent="saveProfile">
            <div class="flex flex-col gap-stack-md">
              <FormField :error="profileErrors.fullName" label="Nome completo" name="fullName">
                <template #default="{ id, error }">
                  <input
                    :id="id"
                    v-model="profile.fullName"
                    type="text"
                    name="fullName"
                    autocomplete="name"
                    :aria-describedby="error ? `${id}-error` : undefined"
                    class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  />
                </template>
              </FormField>

              <FormField :error="profileErrors.email" label="E-mail" name="email">
                <template #default="{ id, error }">
                  <input
                    :id="id"
                    v-model="profile.email"
                    type="email"
                    name="email"
                    autocomplete="email"
                    :aria-describedby="error ? `${id}-error` : undefined"
                    class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  />
                </template>
              </FormField>

              <FormField :error="profileErrors.whatsapp" label="WhatsApp" name="whatsapp">
                <template #default="{ id, error }">
                  <input
                    :id="id"
                    v-model="profile.whatsapp"
                    type="tel"
                    name="whatsapp"
                    autocomplete="tel"
                    inputmode="tel"
                    maxlength="30"
                    placeholder="(00) 00000-0000"
                    :aria-describedby="error ? `${id}-error` : undefined"
                    class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
                  />
                </template>
              </FormField>

              <SubmitButton :loading="savingProfile">Salvar alterações</SubmitButton>
            </div>
          </form>
        </section>

        <section class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lift">
          <div class="mb-stack-md flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
              aria-hidden="true"
            >
              <AppIcon name="settings" :size="22" />
            </div>
            <div>
              <h3 class="font-headline-md text-headline-md text-on-surface">Alterar senha</h3>
              <p class="text-sm text-on-surface-variant">Defina uma nova senha de acesso.</p>
            </div>
          </div>

          <ValidationMessages v-if="passwordApiError" :message="passwordApiError" class="mb-stack-md" />
          <div
            v-if="passwordSuccess"
            role="status"
            class="mb-stack-md flex items-center gap-2 rounded-lg border border-tertiary bg-tertiary-fixed px-4 py-3 font-button-text text-button-text text-on-tertiary-fixed-variant"
          >
            <AppIcon name="check-circle" :size="18" />
            {{ passwordSuccess }}
          </div>

          <form novalidate @submit.prevent="changePassword">
            <div class="flex flex-col gap-stack-md">
              <FormField :error="passwordErrors.currentPassword" label="Senha atual" name="currentPassword">
                <template #default="{ id, error }">
                  <PasswordInput
                    :id="id"
                    v-model="password.currentPassword"
                    name="currentPassword"
                    autocomplete="current-password"
                    placeholder="Sua senha atual"
                    :aria-describedby="error ? `${id}-error` : undefined"
                  />
                </template>
              </FormField>

              <FormField :error="passwordErrors.newPassword" label="Nova senha" name="newPassword">
                <template #default="{ id, error }">
                  <PasswordInput
                    :id="id"
                    v-model="password.newPassword"
                    name="newPassword"
                    autocomplete="new-password"
                    placeholder="Mínimo de 8 caracteres"
                    :aria-describedby="error ? `${id}-error` : undefined"
                  />
                </template>
              </FormField>

              <FormField :error="passwordErrors.confirmation" label="Confirmar nova senha" name="confirmation">
                <template #default="{ id, error }">
                  <PasswordInput
                    :id="id"
                    v-model="password.confirmation"
                    name="confirmation"
                    autocomplete="new-password"
                    placeholder="Repita a nova senha"
                    :aria-describedby="error ? `${id}-error` : undefined"
                  />
                </template>
              </FormField>

              <SubmitButton :loading="savingPassword">Alterar senha</SubmitButton>
            </div>
          </form>
        </section>
      </div>
    </div>
  </AppLayout>
</template>
