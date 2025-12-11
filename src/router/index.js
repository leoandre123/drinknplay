import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CreateView from "../views/CreateView.vue";
import ResultView from "../views/ResultView.vue";
import drawingCanvas from "../components/drawingCanvas.vue";
import DrawingView from "../views/DrawingView.vue";
import ReactionGame from "../views/minigames/reaction/ReactionGame.vue";
import ReactionGamePlayerView from "../views/minigames/reaction/ReactionGamePlayerView.vue";

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
      path: "/canvas",
      name: "canvas",
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
      component: ResultView,
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
    {
      path: "/reactiongame",
      name: "ReactionGame",
      component: () => import("../views/minigames/reaction/ReactionGame.vue"),
    },
    { 
      path: "/reactiongameplayerview",
      name: "ReactionGamePlayerView",
      component: ReactionGamePlayerView,
    },
  ],
});

export default router;
