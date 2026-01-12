import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CreateView from "../views/CreateView.vue";
import ResultView from "../views/ScoreboardView.vue";
import PlayerDrawingView from "../views/minigames/drawing/PlayerDrawingView.vue";
import AdminView from "../views/AdminView.vue";
import RouletteView from "../views/minigames/roulette/RouletteView.vue";
import RoulettePlayerView from "@/views/minigames/roulette/RoulettePlayerView.vue";

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
      path: "/result",
      name: "Result",
      component: ResultView,
    },
    {
      path: "/admin",
      name: "Admin",
      component: AdminView,
    },
    {
      path: "/join/:id",
      name: "JoinView",
      component: () => import("../views/JoinView.vue"),
    },
    {
      path: "/lobby/:id",
      name: "LobbyView",
      component: () => import("../views/LobbyView.vue"),
    },
    {
      path: "/game",
      name: "GameView",
      component: () => import("../views/GameView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
