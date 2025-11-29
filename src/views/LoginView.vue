<template>
  <div class="login-view">
    <img alt="MateCoin logo" src="@/assets/logo.png" class="main-logo" />

    <h1>Bienvenido a MateCoin</h1>
    <p>Ingresa tu credencial para gestionar tu portafolio.</p>

    <div class="form-wrapper">
      <LoginForm
        label-text="Tu ID Alfanumérico:"
        placeholder-text="Ej: usuario123"
        button-text="Acceder al Sistema"
        @submit-login="handleLoginSuccess"
      />
    </div>
  </div>
</template>

<script>
import LoginForm from '@/components/LoginForm.vue'

export default {
  name: 'LoginView',
  components: {
    LoginForm,
  },
  methods: {
    handleLoginSuccess(userIdReceived) {
      console.log(
        `ID validado recibido: ${userIdReceived}. Iniciando sesión...`
      )

      // 1. Vuex: Despachamos la acción
      this.$store.dispatch('login', userIdReceived)

      // 2. Router: Redirigimos
      this.$router.push('/analysis')
    },
  },
}
</script>

<style scoped>
.login-view {
  max-width: 450px;
  margin: 60px auto;
  text-align: center;
  padding: 20px;
}

.form-wrapper {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #42b983;
}

.main-logo {
  width: 150px;
  height: auto;
  margin-bottom: 20px;
  /* Efecto de brillo opcional */
  filter: drop-shadow(0 0 10px rgba(66, 185, 131, 0.5));
}
</style>
