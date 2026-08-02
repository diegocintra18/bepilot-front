<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import Hero from '@/components/Hero.vue'
import FeatureGrid from '@/components/FeatureGrid.vue'
import PricingSection from '@/components/PricingSection.vue'
</script>

<template>
  <div class="min-h-screen">
    <Header />
    <main class="pt-16">
      <Hero />
      <FeatureGrid />
      <PricingSection />
    </main>
    <Footer />
  </div>
</template>
