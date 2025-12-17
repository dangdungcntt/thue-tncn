<script setup lang="ts">
import { ref } from 'vue';

const links: { text: string, href: string }[] = [
  { text: 'Tính thuế TNCN', href: '/' },
  { text: 'Tính lương Gross - Net', href: '/tinh-luong-gross-net' },
];

const showMenu = ref(false);
</script>
<template>
  <header
    class="flex items-center justify-between px-6 py-3 md:py-4 shadow max-w-5xl rounded-full mx-auto w-full bg-white">

    <router-link to="/" class="flex items-center gap-3">
      <img src="/favicon-96x96.png" alt="logo" class="size-8">
      <span class="font-semibold">TNCN - NDDAPP</span>
    </router-link>

    <nav id="menu"
      class="max-md:absolute max-md:top-0 max-md:left-0 max-md:overflow-hidden items-center justify-center max-md:h-full transition-[width] bg-white/50 backdrop-blur flex-col md:flex-row flex gap-8 text-gray-900 text-sm font-normal z-1"
      :class="{ 'max-md:w-0': !showMenu, 'max-md:w-full': showMenu }">

      <router-link v-for="link in links" :key="link.href" :to="link.href" class="hover:text-indigo-600"
        @click="showMenu = false">

        {{ link.text }}

      </router-link>

      <button id="closeMenu" class="md:hidden text-gray-600" @click="showMenu = false">

        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
          stroke-linecap="round" stroke-linejoin="round">

          <path d="M6 18L18 6M6 6l12 12" />

        </svg>

      </button>

    </nav>

    <div class="flex items-center space-x-4">

      <button id="openMenu" class="md:hidden text-gray-600" @click="showMenu = true">

        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
          stroke-linecap="round" stroke-linejoin="round">

          <path d="M4 6h16M4 12h16M4 18h16" />

        </svg>

      </button>

    </div>

  </header>
</template>
