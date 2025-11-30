<template>
  <nav>
    <div class="nav-brand">
      <img src="@/assets/logo.png" alt="MateCoin Logo" class="nav-logo" />
      <span class="brand-text">MATECOIN</span>
    </div>

    <div class="nav-links">
      <span v-if="!isLoggedIn">
        <router-link to="/">Iniciar Sesión</router-link> |
        <router-link to="/about">About</router-link>
      </span>

      <span v-else>
        <router-link to="/history">Movimientos</router-link> |
        <router-link to="/transaction">Nueva Transacción</router-link> |
        <router-link to="/analysis">Análisis</router-link> |
        <router-link to="/about">About</router-link> |

        <a href="#" @click.prevent="logout" class="logout-link">
          Cerrar Sesión ({{ currentUserId }})
        </a>
      </span>
    </div>
  </nav>
  <router-view />
</template>

<script>
export default {
  name: 'App',
  computed: {
    isLoggedIn() {
      return !!this.$store.state.userId
    },
    currentUserId() {
      return this.$store.state.userId
    },
  },
  methods: {
    logout() {
      this.$store.dispatch('logout')
      if (this.$route.path !== '/') {
        this.$router.push('/')
      }
    },
  },
}
</script>

<style>
/* Estilos generales de la App */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

h1 {
  text-decoration: underline;
}

/* Estilos de la Barra de Navegación (Flexbox) */
nav {
  display: flex; /* Activa el modo flexible */
  justify-content: space-between; /* Separa Logo (Izq) de Links (Der) */
  align-items: center; /* Centra verticalmente */
  padding: 15px 30px; /* Espaciado interno */
  background-color: #ffffff; /* Fondo blanco */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Sombra sutil debajo */
  margin-bottom: 20px;
}

/* Estilos de la Marca (Logo + Texto) */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px; /* Espacio entre logo y texto */
}

.nav-logo {
  height: 40px; /* Tamaño controlado del logo */
  width: auto; /* Mantiene la proporción */
}

.brand-text {
  font-size: 1.5em;
  font-weight: bold;
  color: #2c3e50;
  /* Opcional: usar el verde de Vue para la marca */
  /* color: #42b983; */
}

/* Estilos de los Enlaces */
.nav-links {
  display: flex;
  align-items: center;
  gap: 5px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 5px;
  font-size: 0.95em;
}

nav a.router-link-exact-active {
  color: #42b983;
}

/* Botón de Logout */
.logout-link {
  color: #e74c3c !important;
  cursor: pointer;
  border: 1px solid #e74c3c;
  padding: 5px 12px;
  border-radius: 20px; /* Bordes más redondeados */
  transition: all 0.3s ease;
  margin-left: 10px;
}

.logout-link:hover {
  background-color: #e74c3c;
  color: white !important;
}
</style>
