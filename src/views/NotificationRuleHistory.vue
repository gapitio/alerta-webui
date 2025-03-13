<template>
  <div class="notificationrulehistory">
    <notification-rule-history-list :id="id" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import NotificationRuleHistoryList from '@/components/NotificationRuleHistoryList.vue'

@Component({
  components: {
    NotificationRuleHistoryList
  },
})
export default class NotificationRuleHistory extends Vue {
  @Prop() public id!: string
}
</script>
