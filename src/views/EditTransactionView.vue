<template>
  <div class="edit-container">
    <h1>Editar/Borrar Transacción</h1>
    <p v-if="isLoading">Cargando detalles de la transacción...</p>

    <div v-else-if="transaction._id">
      <h2>Transacción ID: {{ transaction._id }}</h2>

      <form @submit.prevent="updateTransaction" class="edit-form">
        <label for="action">Tipo de Operación:</label>
        <input
          type="text"
          :value="transaction.action.toUpperCase()"
          disabled
          class="disabled-input"
        />

        <label for="crypto-code">Criptomoneda:</label>
        <select id="crypto-code" v-model="transaction.crypto_code" required>
          <option value="btc">Bitcoin (BTC)</option>
          <option value="eth">Ethereum (ETH)</option>
          <option value="usdc">USDC</option>
        </select>

        <label for="crypto-amount">Cantidad:</label>
        <input
          id="crypto-amount"
          type="number"
          v-model.number="transaction.crypto_amount"
          step="any"
          min="0.000001"
          required
        />

        <label for="money-spent">Monto (en ARS):</label>
        <input
          id="money-spent"
          type="number"
          v-model.number="transaction.money"
          step="any"
          min="1"
          required
        />

        <label for="datetime">Fecha y Hora:</label>
        <input
          id="datetime"
          type="datetime-local"
          v-model="localDatetime"
          required
        />

        <button type="submit" class="update-button">
          Guardar Cambios (PATCH)
        </button>
      </form>
      <button @click="deleteTransaction" class="delete-button">
        Eliminar Transacción (DELETE)
      </button>

      <p class="warning">
        Advertencia: Cualquier cambio o eliminación afectará tu historial y
        análisis de portafolio.
      </p>
    </div>

    <p v-else>No se encontró la transacción o hubo un error.</p>
  </div>
</template>

<script>
import apiClient from '@/services/apiClient'

export default {
  name: 'EditTransactionView',
  data() {
    return {
      isLoading: true,
      transaction: {
        action: '', // Inicializar propiedades para evitar errores de Vue al inicio
        crypto_code: '',
        crypto_amount: 0,
        money: 0,
        datetime: '',
      },
    }
  },

  // SECCIÓN COMPUTED para manejar la fecha (GET y SET)
  computed: {
    // Convierte el ISO de la API a formato YYYY-MM-DDThh:mm para input datetime-local
    localDatetime: {
      get() {
        // El API devuelve un string ISO (e.g., "2021-11-07T17:50:00.000Z")
        // El input necesita YYYY-MM-DDThh:mm
        if (this.transaction.datetime) {
          return this.transaction.datetime.slice(0, 16)
        }
        return ''
      },
      set(value) {
        // Cuando el input cambia, actualiza la propiedad 'datetime' del objeto
        this.transaction.datetime = value
      },
    },
  },

  methods: {
    // 1. OBTENER DATOS DE LA TRANSACCIÓN ESPECÍFICA (GET)
    async fetchTransaction() {
      const transactionId = this.$route.params.id
      if (!transactionId) {
        this.isLoading = false
        return
      }

      this.isLoading = true
      try {
        const response = await apiClient.get(`/transactions/${transactionId}`)
        // Asignamos directamente la respuesta al objeto transaction
        this.transaction = response.data

        // Hacemos una conversión a número de los campos que deben ser numéricos
        // La API devuelve string, pero v-model.number necesita un número para funcionar bien
        this.transaction.crypto_amount = parseFloat(
          this.transaction.crypto_amount
        )
        this.transaction.money = parseFloat(this.transaction.money)
      } catch (error) {
        console.error('Error al cargar la transacción:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 2. LÓGICA DE ACTUALIZACIÓN (PATCH)
    async updateTransaction() {
      if (
        !confirm(
          '¿Estás seguro de que quieres guardar los cambios en esta transacción?'
        )
      ) {
        return
      }

      this.isLoading = true

      // El body solo necesita los campos a actualizar
      const updatedData = {
        crypto_code: this.transaction.crypto_code,
        // Convertimos a string para la API
        crypto_amount: this.transaction.crypto_amount.toString(),
        money: this.transaction.money.toString(),
        // Usamos el método para asegurar el formato de fecha correcto
        datetime: this.formatDate(this.transaction.datetime),
      }

      try {
        const transactionId = this.transaction._id
        // PATCH a /transactions/{id}
        await apiClient.patch(`/transactions/${transactionId}`, updatedData)

        alert('Transacción actualizada con éxito.')
        this.$router.push('/history')
      } catch (error) {
        console.error('Error al actualizar la transacción:', error)
        alert(
          'No se pudo actualizar la transacción. Revisa la consola para más detalles.'
        )
      } finally {
        this.isLoading = false
      }
    },

    // 3. LÓGICA DE BORRADO (DELETE)
    async deleteTransaction() {
      if (
        !confirm(
          '¿Estás seguro de que quieres eliminar esta transacción? Esta acción es irreversible y afectará tu portafolio.'
        )
      ) {
        return
      }

      this.isLoading = true
      try {
        const transactionId = this.transaction._id
        await apiClient.delete(`/transactions/${transactionId}`)

        alert('Transacción eliminada con éxito.')
        this.$router.push('/history')
      } catch (error) {
        console.error('Error al eliminar la transacción:', error)
        alert('No se pudo eliminar la transacción.')
      } finally {
        this.isLoading = false
      }
    },

    // 4. FUNCIÓN AUXILIAR DE FORMATO DE FECHA (Copiada de TransactionView)
    formatDate(isoDateString) {
      const date = new Date(isoDateString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')

      return `${day}-${month}-${year} ${hours}:${minutes}`
    },
  },
  async mounted() {
    this.fetchTransaction()
  },
}
</script>

<style scoped>
.edit-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.edit-form label,
.edit-form input:not([type='checkbox']),
.edit-form select,
.edit-form button {
  display: block;
  width: 100%;
  margin-bottom: 15px;
}
.update-button {
  background-color: #4caf50; /* Verde */
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  margin-top: 20px;
}
.delete-button {
  background-color: #f44336; /* Rojo */
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  margin-top: 10px;
}
.disabled-input {
  background-color: #eee;
  font-weight: bold;
  color: #555;
}
.warning {
  color: orange;
  margin-top: 15px;
  padding: 10px;
  border: 1px solid orange;
  border-radius: 4px;
}
</style>
