import Vue from "vue";
import Router from "vue-router";
import BranchesPage from "./views/BranchesPage.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "Branches",
      component: BranchesPage,
    },
    // Future routes can be added here
  ],
});
