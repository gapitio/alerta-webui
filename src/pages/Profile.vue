<template>
  <v-container width="1000px">
    <h1 style="padding-left: 0px">{{ t('Profile') }}</h1>
    <span class="bold">{{ profile.name }}</span>
    <br />
    {{ profile.email }}
    <g-text-field v-model="profile.name" :label="t('FullName')" readonly show-header />
    <v-row>
      <v-col cols="10">
        <g-text-field v-model="profile.preferred_username" :label="t('Username')" readonly show-header />
      </v-col>
      <v-col cols="2">
        <g-text-field v-model="profile.provider" :label="t('Provider')" readonly show-header />
      </v-col>
    </v-row>
    <g-text-field v-model="profile.sub" :label="t('User ID')" readonly show-header />
    <g-text-field v-model="profile.email" :label="t('Email')" readonly show-header />
    <g-combobox v-model="profile.orgs" :label="t('Organizations')" placeholder="(None)" show-header readonly multiple />
    <g-combobox v-model="profile.groups" :label="t('Groups')" placeholder="(None)" show-header readonly multiple />
    <g-combobox v-model="profile.roles" :label="t('Roles')" placeholder="(None)" show-header readonly multiple />
    <g-combobox v-model="scope" :label="t('Scopes')" placeholder="(None)" show-header readonly multiple />
  </v-container>
</template>

<script lang="ts" setup>
import type {Store} from '@/plugins/store/types'
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {useStore} from 'vuex'

definePage({
  meta: {
    title: 'Profile',
    requiresAuth: true
  }
})

const store: Store = useStore()
const {t} = useI18n()

const profile = computed(() => store.getters['auth/getPayload'])
const scope = computed(() => store.getters['auth/scopes'])
</script>
