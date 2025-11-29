<template>
  <div class="history-container">
    <h1>Historial de Movimientos</h1>

    <p v-if="isLoading">Cargando historial de movimientos...</p>

    <ul v-else-if="transactions.length > 0">
      <li v-for="transaction in transactions" :key="transaction._id">
        {{ formatDisplayDate(transaction.datetime) }} -
        {{ transaction.action.toUpperCase() }} -
        {{ transaction.crypto_amount }}
        {{ transaction.crypto_code.toUpperCase() }}

        <router-link
          :to="{ name: 'editTransaction', params: { id: transaction._id } }"
          class="edit-link"
        >
          [Editar/Borrar]
        </router-link>
      </li>
    </ul>

    <p v-else>No hay transacciones registradas.</p>
  </div>
</template>

<script>
import apiClient from '@/services/apiClient'

export default {
  name: 'HistoryView',
  data() {
    return {
      transactions: [],
      isLoading: true,
    }
  },

  methods: {
    // Método para formatear la fecha (sin cambios)
    formatDisplayDate(isoString) {
      if (!isoString) return 'Fecha desconocida'
      try {
        const date = new Date(isoString)

        return (
          date.toLocaleDateString() +
          ' ' +
          date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        )
      } catch (e) {
        console.error('Error al formatear fecha:', e)
        return 'Formato Inválido'
      }
    },

    // Método para obtener transacciones (sin cambios)
    async fetchTransactions() {
      this.isLoading = true

      if (!this.$store.state.userId) {
        this.$router.push('/')
        this.isLoading = false
        return
      }

      try {
        const userId = this.$store.state.userId

        const response = await apiClient.get(
          `/transactions?q={"user_id": "${userId}"}`
        )

        this.transactions = response.data
        console.log('Transacciones obtenidas:', this.transactions)
      } catch (error) {
        console.error('Error al obtener las transacciones:', error)
        alert(
          'Hubo un error al cargar el historial. Intenta nuevamente más tarde.'
        )
      } finally {
        this.isLoading = false
      }
    },
  },

  // LLAMAMOS AL NUEVO MÉTODO DE CARGA
  async mounted() {
    this.fetchTransactions()
  },
}
</script>

<style scoped>
/* Añade un poco de estilo al link de edición si lo deseas */
.edit-link {
  font-size: 0.9em;
  margin-left: 15px;
  color: #42b983; /* Color verde de Vue */
  text-decoration: none;
  font-weight: bold;
}
.edit-link:hover {
  text-decoration: underline;
}

/* El resto de tus estilos de HistoryView */
.history-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  text-align: center;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background-color: #f9f9f9;
  margin: 10px 0;
  padding: 15px;
  border-radius: 5px;
  border-left: 5px solid #42b983; /* Borde verde decorativo */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  /* Flexbox para alinear el contenido y el enlace de editar */
  display: flex;
  justify-content: center; /* Centrado horizontal */
  align-items: center;
  gap: 10px;
  flex-wrap: wrap; /* Para que se adapte en móviles */
}
</style>
