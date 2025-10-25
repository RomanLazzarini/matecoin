<template>
  <div class="transaction-container">
    <h1>Dar de Alta una Nueva Transacción</h1>
    <p>Ingresa los detalles de tu movimiento.</p>

    <form @submit.prevent="handleSubmit">
      <label for="action">Tipo de Operación:</label>
      <select id="action" v-model="action" required>
        <option value="purchase">Compra</option>
        <option value="sale">Venta</option>
      </select>

      <label for="crypto-code">Criptomoneda:</label>
      <select id="crypto-code" v-model="cryptoCode" required>
        <option value="" disabled>Selecciona una cripto</option>
        <option value="btc">Bitcoin (BTC)</option>
        <option value="eth">Ethereum (ETH)</option>
        <option value="usdc">USDC</option>
      </select>

      <label for="crypto-amount">Cantidad (ej: 0.00070):</label>
      <input
        id="crypto-amount"
        type="number"
        v-model.number="cryptoAmount"
        step="any"
        min="0.000001"
        required
      />

      <label for="money-spent">
        Monto {{ action === 'purchase' ? 'pagado' : 'cobrado' }} (en ARS):
      </label>
      <input
        id="money-spent"
        type="number"
        v-model.number="money"
        step="any"
        min="1"
        required
      />

      <label for="datetime">Fecha y Hora de la Transacción:</label>
      <input id="datetime" type="datetime-local" v-model="datetime" required />

      <button type="submit">
        Registrar {{ action === 'purchase' ? 'Compra' : 'Venta' }}
      </button>
    </form>
  </div>
</template>

<script>
import apiClient from '@/services/apiClient'

export default {
  name: 'TransactionView',
  data() {
    return {
      cryptoCode: 'btc',
      cryptoAmount: 0,
      money: 0,
      datetime: new Date().toISOString().slice(0, 16),
      action: 'purchase', // Estado inicial para la acción
    }
  },
  methods: {
    async handleSubmit() {
      if (this.cryptoAmount <= 0 || this.money <= 0) {
        alert('La cantidad y el monto deben ser mayores a cero.')
        return
      }

      const userId = this.$store.state.userId
      if (!userId) {
        alert('Error: Debes iniciar sesión para registrar una transacción.')
        this.$router.push('/')
        return
      }

      const transactionData = {
        user_id: userId,
        action: this.action, // Usa el valor dinámico del SELECT
        crypto_code: this.cryptoCode,
        crypto_amount: this.cryptoAmount.toString(),
        money: this.money.toString(),
        datetime: this.formatDate(this.datetime),
      }

      try {
        const response = await apiClient.post('/transactions', transactionData)

        console.log('Transacción registrada con éxito:', response.data)
        alert(
          `¡Transacción de ${
            this.action === 'purchase' ? 'compra' : 'venta'
          } registrada con éxito! Verifica el historial.`
        )

        this.$router.push('/history')
      } catch (error) {
        console.error('Error al registrar la transacción:', error)
        alert(
          'Hubo un error al guardar la transacción. Revisa la consola para más detalles.'
        )
      }
    },

    // Función de ayuda para convertir el formato del input datetime-local
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
}
</script>

<style scoped>
.transaction-container {
  max-width: 500px;
  margin: 50px auto;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
form label,
form input,
form select,
form button {
  display: block;
  width: 100%;
  margin-bottom: 10px;
}
form button {
  margin-top: 20px;
  padding: 10px;
  background-color: #42b983; /* Vue green */
  color: white;
  border: none;
  cursor: pointer;
}
</style>
