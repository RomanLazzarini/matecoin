<template>
  <div class="edit-container">
    <h1>{{ isReadOnly ? 'Detalle de Transacción' : 'Editar Transacción' }}</h1>

    <p v-if="isLoading">Cargando detalles de la transacción...</p>

    <div v-else-if="transaction._id">
      <h2>Transacción ID: {{ transaction._id }}</h2>

      <fieldset :disabled="isReadOnly" class="form-fieldset">
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
            <option value="usdt">Tether (USDT)</option>
            <option value="dai">DAI</option>
            <option value="sol">Solana (SOL)</option>
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

          <button v-if="!isReadOnly" type="submit" class="update-button">
            Guardar Cambios (PATCH)
          </button>
        </form>
      </fieldset>

      <button
        v-if="isReadOnly"
        @click="$router.push('/history')"
        class="back-button"
      >
        Volver al Historial
      </button>

      <button
        v-if="!isReadOnly"
        @click="deleteTransaction"
        class="delete-button"
      >
        Eliminar Transacción (DELETE)
      </button>

      <p class="warning" v-if="!isReadOnly">
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
      // Variable para controlar el modo
      isReadOnly: false,
      transaction: {
        action: '',
        crypto_code: '',
        crypto_amount: 0,
        money: 0,
        datetime: '',
      },
    }
  },

  computed: {
    localDatetime: {
      get() {
        if (this.transaction.datetime) {
          return this.transaction.datetime.slice(0, 16)
        }
        return ''
      },
      set(value) {
        // Al editar, guardamos en formato ISO completo para evitar bugs de fecha
        this.transaction.datetime = new Date(value).toISOString()
      },
    },
  },

  methods: {
    async fetchTransaction() {
      const transactionId = this.$route.params.id
      if (!transactionId) {
        this.isLoading = false
        return
      }

      this.isLoading = true
      try {
        const response = await apiClient.get(`/transactions/${transactionId}`)
        this.transaction = response.data

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

    async updateTransaction() {
      if (
        !confirm(
          '¿Estás seguro de que quieres guardar los cambios en esta transacción?'
        )
      ) {
        return
      }

      this.isLoading = true

      const updatedData = {
        crypto_code: this.transaction.crypto_code,
        crypto_amount: this.transaction.crypto_amount.toString(),
        money: this.transaction.money.toString(),
        // Usamos la fecha que ya está en el objeto (que el computed set actualizó a ISO)
        datetime: this.transaction.datetime,
      }

      try {
        const transactionId = this.transaction._id
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
  },

  // AL CARGAR: Verificamos el modo y cargamos datos
  async mounted() {
    // Si la URL tiene ?mode=view, activamos el modo lectura
    if (this.$route.query.mode === 'view') {
      this.isReadOnly = true
    }
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
  text-align: center; /* Centrar textos */
}

/* Quitamos el borde del fieldset para que sea invisible visualmente */
.form-fieldset {
  border: none;
  padding: 0;
  margin: 0;
  text-align: left; /* Volvemos a alinear formulario a la izquierda */
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
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  margin-top: 20px;
}
.delete-button {
  background-color: #f44336;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  margin-top: 10px;
  width: 100%; /* Botón full width para consistencia */
}
.back-button {
  background-color: #6c757d; /* Gris */
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
}
.back-button:hover {
  background-color: #5a6268;
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
