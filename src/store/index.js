import { createStore } from 'vuex'

export default createStore({
  state: {
    // 1. Define el estado para el ID del usuario
    userId: null,
  },
  mutations: {
    // 2. Crea una mutación para cambiar el estado de forma segura
    SET_USER_ID(state, id) {
      state.userId = id
    },
  },
  actions: {
    // 3. Crea la acción que tu componente va a llamar
    login(context, userId) {
      // La acción "dispara" la mutación
      context.commit('SET_USER_ID', userId)
    },
  },
  getters: {}, // Puedes dejarlo vacío por ahora
  modules: {}, // Puedes dejarlo vacío por ahora
})
