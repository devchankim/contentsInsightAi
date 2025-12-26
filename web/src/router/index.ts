import { createRouter, createWebHistory } from 'vue-router';
import ProjectList from '@/views/ProjectList.vue';
import Workspace from '@/views/Workspace.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ProjectList,
    },
    {
      path: '/project/:id',
      name: 'workspace',
      component: Workspace,
    },
  ],
});

export default router;

