<template>
  <v-tooltip 
    :bottom="position == 'bottom'"
    :top="position == 'top'"
    :left="position == 'left'"
    :right="position == 'right'"
  >
    <template v-slot:activator="{ on }">
      <v-icon v-on="on">
        {{ icon }}
      </v-icon>
    </template>
    <span>{{ info }}</span>
  </v-tooltip>
</template>
  
  <script>
  
export default {
  props: {
    info: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      default: 'bottom',
    },
    icon: {
      type: String,
      default: 'info_outline',
    },
  }
}
</script>
  
<style></style>
  