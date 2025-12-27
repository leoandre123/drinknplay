import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CreateView from "../views/CreateView.vue";
import MazeGameView from "../views/MazeGameView.vue";
import ResultView from "../views/ResultView.vue";
import drawingCanvas from "../components/drawingCanvas.vue";
import DrawingView from "../views/minigames/drawing/PlayerDrawingView.vue";
import HostDrawingView from "../views/minigames/drawing/HostDrawingView.vue";

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
      component: HostDrawingView
    },
     {
      path: "/canvas",
      name: "Canvas",
      component: DrawingView,
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
      component: MazeGameView,
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
