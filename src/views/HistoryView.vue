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
      isLoading: true, // Agregamos el estado de carga
    }
  },

  // AÑADIMOS LA SECCIÓN METHODS
  methods: {
    // Método para formatear la fecha que viene de la API (Formato ISO)
    formatDisplayDate(isoString) {
      if (!isoString) return 'Fecha desconocida'
      try {
        // Creamos un objeto Date a partir del string ISO que devuelve la API
        const date = new Date(isoString)

        // Formatea al estilo local (ej: 07/11/2021 17:50)
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
  },

  async mounted() {
    // 1. Inicializamos la carga
    this.isLoading = true

    if (!this.$store.state.userId) {
      this.$router.push('/')
      this.isLoading = false // Detenemos la carga si redirigimos
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
      // 2. Detenemos la carga al finalizar, independientemente del resultado
      this.isLoading = false
    }
  },
}
</script>
