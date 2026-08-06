import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/LandingPage.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/simulados/historico',
      name: 'simulation-history',
      component: () => import('@/views/SimulationHistoryView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/simulados/iniciar',
      name: 'simulation-start',
      component: () => import('@/views/SimulationStartView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/simulados/:id',
      name: 'simulation-execution',
      component: () => import('@/views/SimulationExecutionView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/simulados/:id/resultado',
      name: 'simulation-result',
      component: () => import('@/views/SimulationResultView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/courses',
      name: 'courses',
      component: () => import('@/views/admin/CoursesListView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/statistics/courses/:courseId',
      name: 'admin-course-stats',
      component: () => import('@/views/AdminCourseStatsDetail.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/courses/new',
      name: 'course-new',
      component: () => import('@/views/admin/CourseFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/courses/:id/edit',
      name: 'course-edit',
      component: () => import('@/views/admin/CourseFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/subjects',
      name: 'subjects',
      component: () => import('@/views/admin/SubjectsListView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/subjects/new',
      name: 'subject-new',
      component: () => import('@/views/admin/SubjectFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/subjects/:id/edit',
      name: 'subject-edit',
      component: () => import('@/views/admin/SubjectFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/questions',
      name: 'questions',
      component: () => import('@/views/admin/QuestionsListView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/questions/new',
      name: 'question-new',
      component: () => import('@/views/admin/QuestionFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/questions/:id/edit',
      name: 'question-edit',
      component: () => import('@/views/admin/QuestionFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (auth.isRestoring) {
    await auth.restorePromise
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'dashboard' }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
