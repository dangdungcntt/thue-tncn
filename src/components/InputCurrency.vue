<script setup lang="ts">
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from './ui/input-group';

const model = defineModel();

const maskaOption = {
  mask: "#,###,###,###,###,###,###",
  reversed: true
}

</script>
<template>
  <InputGroup>
    <InputGroupInput placeholder="0" v-model="model" v-maska:[maskaOption] />
    <InputGroupAddon align="inline-end">
      <InputGroupText>VND</InputGroupText>
    </InputGroupAddon>
  </InputGroup>
</template>
