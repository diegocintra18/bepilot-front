<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import FormField from '@/components/auth/FormField.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import SubmitButton from '@/components/auth/SubmitButton.vue'
import ValidationMessages from '@/components/auth/ValidationMessages.vue'

const route = useRoute()
const auth = useAuthStore()

const form = reactive({
  password: '',
  passwordConfirmation: '',
})
const fieldErrors = reactive({
  password: '',
  passwordConfirmation: '',
})
const apiError = ref('')
const successMessage = ref('')
const loading = ref(false)

const hasToken = computed(() => typeof route.query.token === 'string' && route.query.token.length > 0)

function validate() {
  fieldErrors.password = ''
  fieldErrors.passwordConfirmation = ''
  let valid = true

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
    await auth.resetPassword({
      token: route.query.token,
      password: form.password,
      passwordConfirmation: form.passwordConfirmation,
    })
    successMessage.value = 'Senha redefinida com sucesso.'
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
  <AuthLayout title="Redefinir senha" subtitle="Defina uma nova senha para a sua conta.">
    <ValidationMessages
      v-if="!hasToken"
      message="Para redefinir sua senha, acesse o link enviado para o seu e-mail."
      class="mb-stack-md"
    />
    <ValidationMessages
      v-else-if="successMessage"
      :message="successMessage"
      variant="success"
      class="mb-stack-md"
    />
    <ValidationMessages :message="apiError" class="mb-stack-md" />

    <form v-if="hasToken && !successMessage" novalidate @submit.prevent="submit">
      <div class="flex flex-col gap-stack-md">
        <FormField :error="fieldErrors.password" label="Nova senha" name="password">
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

        <SubmitButton :loading="loading">Redefinir senha</SubmitButton>
      </div>
    </form>

    <template #footer>
      <p class="text-body-md text-on-surface-variant">
        <RouterLink
          to="/login"
          class="font-button-text font-bold text-primary underline-offset-4 hover:underline"
        >
          Ir para o login
        </RouterLink>
      </p>
    </template>
  </AuthLayout>
</template>
