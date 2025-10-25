import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import HistoryView from '@/views/HistoryView.vue'
import TransactionView from '@/views/TransactionView.vue'
import AnalysisView from '@/views/AnalysisView.vue'
import EditTransactionView from '@/views/EditTransactionView.vue'
import AboutView from '@/views/AboutView.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryView,
  },
  {
    path: '/transaction',
    name: 'transaction',
    component: TransactionView,
  },
  {
    path: '/analysis',
    name: 'analysis',
    component: AnalysisView,
  },
  {
    path: '/edit-transaction/:id',
    name: 'editTransaction',
    component: EditTransactionView,
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
