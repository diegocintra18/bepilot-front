<template>
  <div class="loading-container">
    <div class="spinner" aria-live="polite" aria-busy="true" aria-label="Analisando seu desempenho..."></div>
    <p class="loading-text">
      Analisando seu desempenho...
      <br />
      Estamos identificando os conteúdos que precisam
      <br />
      ser reforçados e os pontos em que você apresentou
      <br />
      maior dificuldade.
    </p>
  </div>
</template>

<style scoped>
.loading-container {
  text-align: center;
  margin-top: 2rem;
  color: var(--md-sys-color-on-surface-variant);
}
.spinner {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem auto;
  border: 6px solid var(--md-sys-color-primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0%   { transform: rotate(0deg) }
  100% { transform: rotate(360deg) }
}
.loading-text {
  font-weight: 600;
  white-space: pre-line;
  font-size: 1rem;
}
</style>
