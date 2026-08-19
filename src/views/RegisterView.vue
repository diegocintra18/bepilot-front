<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import FormField from '@/components/auth/FormField.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import SubmitButton from '@/components/auth/SubmitButton.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
})
const fieldErrors = reactive({
  fullName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
})
const apiError = ref('')
const loading = ref(false)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  fieldErrors.fullName = ''
  fieldErrors.email = ''
  fieldErrors.password = ''
  fieldErrors.passwordConfirmation = ''
  let valid = true

  if (!form.fullName.trim()) {
    fieldErrors.fullName = 'Informe seu nome completo.'
    valid = false
  }
  if (!form.email) {
    fieldErrors.email = 'Informe seu e-mail.'
    valid = false
  } else if (!EMAIL_PATTERN.test(form.email)) {
    fieldErrors.email = 'Informe um e-mail válido.'
    valid = false
  }
  if (!form.password) {
    fieldErrors.password = 'Informe uma senha.'
    valid = false
  } else if (form.password.length < 8) {
    fieldErrors.password = 'A senha deve ter no mínimo 8 caracteres.'
    valid = false
  }
  if (!form.passwordConfirmation) {
    fieldErrors.passwordConfirmation = 'Confirme sua senha.'
    valid = false
  } else if (form.passwordConfirmation !== form.password) {
    fieldErrors.passwordConfirmation = 'As senhas não coincidem.'
    valid = false
  }
  return valid
}

async function submit() {
  apiError.value = ''
  if (!validate()) return

  loading.value = true
  try {
    await auth.signup({ ...form })
    router.push({ name: 'signup-success' })
  } catch (error) {
    if (error.kind === 'validation' && Array.isArray(error.fieldErrors)) {
      error.fieldErrors.forEach(({ field, message }) => {
        if (field in fieldErrors) fieldErrors[field] = message
      })
    }
    if (error.message) apiError.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout title="Criar conta" subtitle="Cadastre-se para começar a se preparar para o exame da ANAC.">
    <ValidationMessages :message="apiError" class="mb-stack-md" />
    <form novalidate @submit.prevent="submit">
      <div class="flex flex-col gap-stack-md">
        <FormField :error="fieldErrors.fullName" label="Nome completo" name="fullName">
          <template #default="{ id, error }">
            <input
              :id="id"
              v-model="form.fullName"
              type="text"
              name="fullName"
              autocomplete="name"
              placeholder="Seu nome completo"
              :aria-describedby="error ? `${id}-error` : undefined"
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            />
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
              placeholder="voce@exemplo.com"
              :aria-describedby="error ? `${id}-error` : undefined"
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-background placeholder:text-on-surface-variant focus:border-primary focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary"
            />
          </template>
        </FormField>

        <FormField :error="fieldErrors.password" label="Senha" name="password">
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

        <FormField :error="fieldErrors.passwordConfirmation" label="Confirmar senha" name="passwordConfirmation">
          <template #default="{ id, error }">
            <PasswordInput
              :id="id"
              v-model="form.passwordConfirmation"
              name="passwordConfirmation"
              autocomplete="new-password"
              placeholder="Repita sua senha"
              :aria-describedby="error ? `${id}-error` : undefined"
            />
          </template>
        </FormField>

        <SubmitButton :loading="loading">Criar conta</SubmitButton>
      </div>
    </form>

    <template #footer>
      <p class="text-body-md text-on-surface-variant">
        Já tem conta?
        <RouterLink
          to="/login"
          class="font-button-text font-bold text-primary underline-offset-4 hover:underline"
        >
          Entrar
        </RouterLink>
      </p>
    </template>
  </AuthLayout>
</template>
