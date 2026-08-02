<script setup>
defineProps({
  showName: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <div class="flex items-center gap-3">
    <span
      class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-on-primary shadow-active"
      aria-hidden="true"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M20.6 3.4c-1.4-.7-3.1-.2-4.4 1.1L13 7.7 5.4 6c-.6-.1-1.2.1-1.5.6l-.4.6c-.3.5-.2 1.1.3 1.5l6.2 4.3-2.3 3.4H5l-1.3 1.3 3.4 2.3 2.3 3.4 1.3-1.3v-2.7l3.4-2.3 4.3 6.2c.4.5 1 .6 1.5.3l.6-.4c.5-.3.7-.9.6-1.5l-1.7-7.6 3.2-3.2c1.3-1.3 1.8-3 .1-4.4z"
        />
      </svg>
    </span>
    <span
      v-if="showName"
      class="font-display-lg text-headline-md font-bold text-primary"
    >
      Vou ser Piloto
    </span>
  </div>
</template>
