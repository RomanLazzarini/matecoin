<template>
  <div class="history-container">
    <h1>Historial de Movimientos</h1>

    <p v-if="isLoading">Cargando historial de movimientos...</p>

    <div v-else-if="transactions.length > 0">
      <MovementsTable
        :transactions="transactions"
        @view-transaction="handleView"
        @edit-transaction="handleEdit"
        @delete-transaction="handleDelete"
      />
    </div>

    <p v-else>No hay transacciones registradas.</p>
  </div>
</template>

<script>
import apiClient from '@/services/apiClient'
import MovementsTable from '@/components/MovementsTable.vue'

export default {
  name: 'HistoryView',
  components: {
    MovementsTable,
  },
  data() {
    return {
      transactions: [],
      isLoading: true,
    }
  },

  methods: {
    // --- MANEJO DE ACCIONES (Eventos del Hijo) ---

    // Acción VER: Agregamos el parámetro '?mode=view' a la URL
    handleView(id) {
      console.log('Viendo transacción (Modo Lectura):', id)
      this.$router.push({
        name: 'editTransaction',
        params: { id: id },
        query: { mode: 'view' }, // <--- ESTA ES LA CLAVE
      }) // <--- ¡AQUÍ ESTABA EL ERROR! Faltaba cerrar el paréntesis.
    },

    // Acción EDITAR: Navegación normal (sin query, o query vacía)
    handleEdit(id) {
      console.log('Editando transacción:', id)
      this.$router.push({ name: 'editTransaction', params: { id: id } })
    },

    // Acción BORRAR (Lógica nueva en el Padre)
    async handleDelete(id) {
      if (
        !confirm(
          '¿Estás seguro de que deseas eliminar esta transacción permanentemente?'
        )
      ) {
        return
      }

      this.isLoading = true
      try {
        // Hacemos el DELETE a la API
        await apiClient.delete(`/transactions/${id}`)

        alert('Transacción eliminada con éxito.')

        // Recargamos la lista para que la tabla se actualice
        await this.fetchTransactions()
      } catch (error) {
        console.error('Error al eliminar:', error)
        alert('No se pudo eliminar la transacción. Intenta nuevamente.')
        this.isLoading = false
      }
    },

    // --- CARGA DE DATOS ---
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
        alert('Hubo un error al cargar el historial.')
      } finally {
        this.isLoading = false
      }
    },
  },

  async mounted() {
    this.fetchTransactions()
  },
}
</script>

<style scoped>
.history-container {
  max-width: 1000px;
  margin: 50px auto;
  padding: 20px;
  text-align: center;
}
</style>
