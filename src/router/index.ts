import AdminView from "@/features/admin/AdminView.vue";
import CreateView from "@/features/create/CreateView.vue";
import GameView from "@/features/game/GameView.vue";
import HomeView from "@/features/home/HomeView.vue";
import JoinView from "@/features/join/JoinView.vue";
import LobbyView from "@/features/lobby/LobbyView.vue";
import { createRouter, createWebHistory } from "vue-router";

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
      children: [
        { path: "/admin", redirect: "/admin/overview" },
        { path: "/admin/:pathMatch(.*)*", redirect: "/admin/overview" },
        {
          path: "overview",
          name: "admin-overview",
          component: () => import("@/features/admin/pages/Overview.vue"),
        },
        {
          path: "lobbies",
          name: "admin-lobbies",
          component: () => import("@/features/admin/pages/Lobbies.vue"),
        },
        {
          path: "logs",
          name: "admin-logs",
          component: () => import("@/features/admin/pages/Logs.vue"),
        },
        {
          path: "crashes",
          name: "admin-crashes",
          component: () => import("@/features/admin/pages/Crashes.vue"),
        },
      ],
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
