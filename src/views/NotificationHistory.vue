<template>
  <div class="notificationhistory">
    <notification-history-list />
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import NotificationHistoryList from '@/components/NotificationHistoryList.vue'

@Component({
  components: {
    NotificationHistoryList
  },
  props: {
    query: {
      type: Object,
      required: false,
      default: () => {}
    }
  },
  created (){
    this.setSearch(this.query)
  },
  methods: {
    setSearch(query) {
      this.$store.dispatch('notificationHistory/updateQuery', query)
    }
  },
})
export default class NotificationHistory extends Vue {}
</script>
