<template>
  <div class="login-container">
    <h1>Bienvenido a MateCoin</h1>
    <p>Ingresa tu ID de usuario para gestionar tu portafolio.</p>

    <form @submit.prevent="handleLogin">
      <input type="text" v-model="userId" placeholder="Tu ID alfanumérico" />
      <button type="submit">Ingresar</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      userId: '', // Aquí guardaremos lo que el usuario escriba en el input
    }
  },
  methods: {
    handleLogin() {
      // Validación para asegurar que el campo no esté vacío
      if (this.userId.trim() === '') {
        alert('Por favor, ingresa un ID para continuar.')
        return
      }

      // 1. Despachamos la acción 'login' que creamos en Vuex
      this.$store.dispatch('login', this.userId)

      // 2. Redirigimos al usuario a la página de análisis
      console.log(`Usuario ${this.userId} ha iniciado sesión. Redirigiendo...`)
      this.$router.push('/analysis')
    },
  },
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  text-align: center;
}

input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
}
</style>
