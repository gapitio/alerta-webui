<template>
  <div class="notificationsend">
    <notification-send-list />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import NotificationSendList from '@/components/NotificationSendList.vue'

@Component({
  components: {
    NotificationSendList
  }
})
export default class NotificationSend extends Vue {}
</script>
