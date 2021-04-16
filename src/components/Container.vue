<template>
  <v-container>
    <v-layout
      text-center
      wrap
    >
      <Calendar :isLoggedIn="isLoggedIn" />
    </v-layout>
  </v-container>
</template>

<script>
import Calendar from './Calendar';

export default {
  props: [
    'isLoggedIn',
  ],
  components: {
    Calendar
  },
};
</script>