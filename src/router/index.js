import Vue from "vue";
import VueRouter from "vue-router";

import HomePage from "@/components/pages/HomePage.vue";
import AdminPage from "@/components/pages/AdminPage.vue";
import ProgramsPage from "@/components/pages/ProgramsPage.vue";
import RequestPage from "@/components/pages/RequestPage.vue";
import ValidatePage from "@/components/pages/ValidatePage.vue";

Vue.use(VueRouter);

// const routes = [
//   {
//     path: "/",
//     name: "Home",
//     component: Home,
//   },
//   {
//     path: "/about",
//     name: "About",
//     // route level code-splitting
//     // this generates a separate chunk (about.[hash].js) for this route
//     // which is lazy-loaded when the route is visited.
//     component: () =>
//       import(/* webpackChunkName: "about" */ "../views/About.vue"),
//   },
// ];

const routes = [
  { path: "/", component: HomePage, name: "Home" },
  { path: "/validate", component: ValidatePage, name: "Validate" },
  { path: "/programs", component: ProgramsPage, name: "Programs" },
  { path: "/request", component: RequestPage, name: "Request" },
  { path: "/validate", component: ValidatePage, name: "Validate" },
  { path: "/admin", component: AdminPage, name: "Admin" }
];

// const router = new VueRouter({
//   mode: 'history',
//   routes: [
//     { path: '/', component: HomePage },
//     { path: '/routes/:id', component: RoutePage, props: true},
//     { path: '/routes', component: RoutesPage, props: true },
//     { path: '/profiles/:id', component: ProfilePage, props: true},
//     { path: '/profiles', component: ProfilesPage, props: true},
//     { path: '/feed', component: ShowFeed, props: true}
//   ],
//   linkActiveClass: 'active'
// })

const router = new VueRouter({
  routes,
  linkActiveClass: "active",
  mode: "history",
});

export default router;
