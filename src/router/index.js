import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CreateView from "../views/CreateView.vue";
import PlayerMazeGameView from "../views/minigames/mazegame/PlayerMazeGameView.vue";
import ResultView from "../views/ResultView.vue";
import PlayerDrawingView from "../views/minigames/drawing/PlayerDrawingView.vue";
import HostDrawingView from "../views/minigames/drawing/HostDrawingView.vue";
import AdminView from "../views/AdminView.vue";
import HostMazeGameView from "../views/minigames/mazegame/HostMazeGameView.vue";

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
      path: "/hostcanvas",
      name: "HostCanvas",
      component: HostDrawingView,
    },
    {
      path: "/canvas",
      name: "Canvas",
      component: PlayerDrawingView,
    },
    {
      path: "/create",
      name: "Create",
      component: CreateView,
    },
    {
      path: "/result",
      name: "Result",
      component: ResultView,},
    {
      path: "/MazeGame",
      name: "MazeGame",
      component: PlayerMazeGameView,
    },
    {
      path: "/admin",
      name: "Admin",
      component: AdminView,
      path: "/MazeHost",
      name: "MazeHost",
      component: HostMazeGameView
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
