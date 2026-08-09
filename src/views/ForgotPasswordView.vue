<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import FormField from '@/components/auth/FormField.vue'
import SubmitButton from '@/components/auth/SubmitButton.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const auth = useAuthStore()

const form = reactive({
  email: '',
})
const fieldErrors = reactive({
  email: '',
})
const apiError = ref('')
const successMessage = ref('')
const loading = ref(false)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RECOVERY_SENT_MESSAGE =
  'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'

function validate() {
  fieldErrors.email = ''
  let valid = true

  if (!form.email) {
    fieldErrors.email = 'Informe seu e-mail.'
    valid = false
  } else if (!EMAIL_PATTERN.test(form.email)) {
    fieldErrors.email = 'Informe um e-mail válido.'
    valid = false
  }
  return valid
}

async function submit() {
  apiError.value = ''
  if (!validate()) return

  loading.value = true
  try {
    await auth.forgotPassword({ email: form.email })
    successMessage.value = RECOVERY_SENT_MESSAGE
  } catch (error) {
    successMessage.value = ''
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
  <AuthLayout
    title="Recuperar senha"
    subtitle="Informe seu e-mail e enviaremos um link para redefinir sua senha."
  >
    <ValidationMessages v-if="successMessage" :message="successMessage" variant="success" class="mb-stack-md" />
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

        <SubmitButton :loading="loading">Enviar link de recuperação</SubmitButton>
      </div>
    </form>

    <template #footer>
      <p class="text-body-md text-on-surface-variant">
        Lembrou a senha?
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
