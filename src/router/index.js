import { createRouter, createWebHistory } from "vue-router";
import StartView from "../views/StartView.vue";
import HomeView from "../views/HomeView.vue";
import CreateView from "../views/CreateView.vue";
import BlackjackView from "../views/minigames/blackjack/BlackjackView.vue";

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
      path: "/blackjack",
      name: "Black",
      component: BlackjackView,
    },
    {
      path: "/test",
      name: "Test",
      component: () => import("../views/TestView.vue"),
    },
    {
      path: "/editor",
      name: "MapEditor",
      component: () => import("../views/MapEditorView.vue"),
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
  ],
});

export default router;
