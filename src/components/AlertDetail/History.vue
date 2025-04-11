<template>
  <div class="tab-item-wrapper">
    <v-data-table
      :headers="headers"
      :items="history"
      item-key="index"
      v-model:sort-by="sortBy"
    >
      <template #['header.updateTime']="{column}">
        {{ column.title }}
        <v-icon icon="mdi-menu-down"/>
      </template>
      <template #['item.id']="{item}">
        <td>
          <span class="console-text">{{ $filters.shortId(item.id) }}</span>
        </td>
      </template>
      <template #['item.updateTime']="{item}">
        <td
          class="text-no-wrap"
        >
          <date-time
            :value="item.updateTime"
            format="mediumDate"
          />
        </td>
      </template>
      <template v-for="col in ['status', 'type']" #[`item.${col}`]="{item}">
        <td
          class="text-no-wrap"
        >
        <v-chip label size="small">
          {{ $filters.capitalize(item[col]) }}
        </v-chip>
        </td>
      </template>
      <template #['item.severity']="{item}">
        <td
          :class="text-no-wrap"
        >
        <v-chip label size="small" :color="severityColor(item.severity)" >
          {{ $filters.capitalize(item.severity) }}
        </v-chip>
        </td>
      </template>
      <template #['item.timeout']="{item}">
        <td
          class="text-no-wrap"
        >
          {{ $filters.hhmmss(item.timeout) }}
        </td>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data: (a) => ({
    headers: [
      { title: a.$t('AlertOrNoteId'), value: 'id' },
      { title: a.$t('UpdateTime'), value: 'updateTime' },
      { title: a.$t('Severity'), value: 'severity' },
      { title: a.$t('Status'), value: 'status' },
      { title: a.$t('Timeout'), value: 'timeout' },
      { title: a.$t('Type'), value: 'type' },
      { title: a.$t('Event'), value: 'event' },
      { title: a.$t('Value'), value: 'value' },
      { title: a.$t('User'), value: 'user' },
      { title: a.$t('Text'), value: 'text' }
    ],
    sortBy: [{
      key:'updateTime',
      order: 'desc'
    }],
  }),
  computed: {
    history() {
      return this.item.history
        ? this.item.history.map((h, index) => ({ index: index, ...h }))
        : []
    },
  },
  methods: {
    severityColor(severity) {
      const config = this.$store.getters.getConfig('colors')
      return config.severity[severity]
    },
  }
}

</script>
<style>
  .console-text {
    font-size: 14px;
    font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
    white-space: pre;
    line-height: 1;
  }
</style>