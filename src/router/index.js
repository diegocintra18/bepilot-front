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
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
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
    {
      path: '/admin/users',
      name: 'users',
      component: () => import('@/views/admin/UsersListView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/users/new',
      name: 'user-new',
      component: () => import('@/views/admin/UserFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/users/:id/edit',
      name: 'user-edit',
      component: () => import('@/views/admin/UserFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/users/:id',
      name: 'user-detail',
      component: () => import('@/views/admin/UserDetailView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/subscriptions',
      name: 'subscriptions',
      component: () => import('@/views/admin/SubscriptionsListView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/subscriptions/new',
      name: 'subscription-new',
      component: () => import('@/views/admin/SubscriptionFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/subscriptions/:id',
      name: 'subscription-detail',
      component: () => import('@/views/admin/SubscriptionDetailView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/subscriptions/:id/edit',
      name: 'subscription-edit',
      component: () => import('@/views/admin/SubscriptionFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/notifications',
      name: 'notifications',
      component: () => import('@/views/admin/NotificationsListView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/perfil',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/assinatura',
      name: 'subscription',
      component: () => import('@/views/SubscriptionView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/study-plans',
      name: 'study-plans',
      component: () => import('@/views/StudyPlansView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/books',
      name: 'books',
      component: () => import('@/views/BooksView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/study-plans/:id',
      name: 'study-plan-detail',
      component: () => import('@/views/StudyPlanDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/books/new',
      name: 'book-new',
      component: () => import('@/views/admin/BookFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/books/:id/edit',
      name: 'book-edit',
      component: () => import('@/views/admin/BookFormView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/creditos-ia',
      name: 'ai-credits',
      component: () => import('@/views/AiCreditsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/creditos-ia',
      name: 'admin-ai-credits',
      component: () => import('@/views/admin/AiCreditsManagementView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home' },
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
