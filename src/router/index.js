import Vue from "vue";
import VueRouter from "vue-router";
import Auth from "@/packages/auth";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import Dashboard from "../views/Home/Dashboard.vue";
import Bill from "../views/Home/Bill.vue";
import Chalan from "../views/Home/Chalan.vue";
import Customers from "../views/Home/Customers.vue";
import Products from "../views/Home/Products.vue";
import History from "../views/Home/History.vue";
import Reports from "../views/Home/Reports.vue";
import Settings from "../views/Home/Settings.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "login",
    component: Login
  },
  {
    path: "/home",
    component: Home,
    children: [
      {
        path: "/",
        name: "home.dashboard",
        component: Dashboard
      },
      {
        path: "/bill",
        name: "home.bill",
        component: Bill
      },
      {
        path: "/chalan",
        name: "home.chalan",
        component: Chalan
      },
      {
        path: "/customers",
        name: "home.customers",
        component: Customers
      },
      {
        path: "/products",
        name: "home.products",
        component: Products
      },
      {
        path: "/history",
        name: "home.history",
        component: History
      },
      {
        path: "/reports",
        name: "home.reports",
        component: Reports
      },
      {
        path: "/settings",
        name: "home.settings",
        component: Settings
      }
    ]
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!Auth.isAuthenticated()) {
      next({
        name: "login"
      });
    } else {
      next(); // make sure to always call next()!
    }
  } else {
    next(); // make sure to always call next()!
  }
});

export default router;
