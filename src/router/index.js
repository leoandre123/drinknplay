import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import CreateView from "@/views/CreateView.vue";
import AdminView from "@/views/AdminView.vue";
import JoinView from "@/views/JoinView.vue";
import LobbyView from "@/views/LobbyView.vue";
import GameView from "@/views/GameView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
    },
    {
      path: "/join",
      redirect: "/",
    },
    {
      path: "/create",
      name: "Create",
      component: CreateView,
    },
    {
      path: "/admin",
      name: "Admin",
      component: AdminView,
    },
    {
      path: "/join/:id",
      name: "JoinView",
      component: JoinView,
    },
    {
      path: "/lobby/:id",
      name: "LobbyView",
      component: LobbyView,
    },
    {
      path: "/game",
      name: "GameView",
      component: GameView,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
