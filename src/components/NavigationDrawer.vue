<template>
  <v-card>
    <v-navigation-drawer v-model="drawer" app clipped :mini-variant.sync="mini" permanent>
      <v-list-item>
        <v-list-item-avatar class="mr-2">
          <v-icon>fas fa-user-circle</v-icon>
        </v-list-item-avatar>

        <v-list-item-title>{{ userDetails }}</v-list-item-title>

        <v-btn icon @click="mini = !mini">
          <v-icon>fas fa-chevron-left</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          color="primary"
          class="my-3"
          link
          :to="{ name: item.route }"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-card>
</template>
<script>
export default {
  name: "NavigationDrawer",
  props: {
    items: {
      default: () => [],
      type: Array
    }
  },
  data() {
    return {
      drawer: true,
      mini: true
    };
  },
  computed: {
    userDetails() {
      return "Sagar Makhija";
    }
  },
  methods: {
    //
  }
};
</script>
