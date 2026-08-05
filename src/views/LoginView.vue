<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import FormField from '@/components/auth/FormField.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import SubmitButton from '@/components/auth/SubmitButton.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})
const fieldErrors = reactive({
  email: '',
  password: '',
})
const apiError = ref('')
const loading = ref(false)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  fieldErrors.email = ''
  fieldErrors.password = ''
  let valid = true

  if (!form.email) {
    fieldErrors.email = 'Informe seu e-mail.'
    valid = false
  } else if (!EMAIL_PATTERN.test(form.email)) {
    fieldErrors.email = 'Informe um e-mail válido.'
    valid = false
  }
  if (!form.password) {
    fieldErrors.password = 'Informe sua senha.'
    valid = false
  }
  return valid
}

async function submit() {
  apiError.value = ''
  if (!validate()) return

  loading.value = true
  try {
    await auth.login({ email: form.email, password: form.password })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : 'app'
    router.push({ name: redirect })
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
  <AuthLayout title="Entrar" subtitle="Acesse sua conta para continuar seus simulados.">
    <ValidationMessages :message="apiError" class="mb-stack-md" />
    <form novalidate @submit.prevent="submit">
      <div class="flex flex-col gap-stack-md">
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
              autocomplete="current-password"
              placeholder="Sua senha"
              :aria-describedby="error ? `${id}-error` : undefined"
            />
          </template>
        </FormField>

        <SubmitButton :loading="loading">Entrar</SubmitButton>
      </div>
    </form>

    <template #footer>
      <p class="text-body-md text-on-surface-variant">
        Ainda não tem conta?
        <RouterLink
          to="/register"
          class="font-button-text font-bold text-primary underline-offset-4 hover:underline"
        >
          Cadastre-se
        </RouterLink>
      </p>
    </template>
  </AuthLayout>
</template>
