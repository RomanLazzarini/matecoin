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
        <option value="usdt">Tether (USDT)</option>
        <option value="dai">DAI</option>
        <option value="sol">Solana (SOL)</option>
      </select>

      <label for="exchange">Exchange:</label>
      <select v-model="selectedExchange" id="exchange">
        <option
          v-for="exchange in exchanges"
          :key="exchange.id"
          :value="exchange.id"
        >
          {{ exchange.name }}
        </option>
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
        <span v-if="isPriceLoading" class="price-info"
          >Obteniendo precio...</span
        >
        <span v-if="unitPrice" class="price-info"
          >(Calculado automáticamente)</span
        >
      </label>
      <input
        id="money-spent"
        type="number"
        v-model.number="money"
        step="any"
        min="1"
        required
        :readonly="unitPrice > 0"
      />

      <button type="submit">
        Registrar {{ action === 'purchase' ? 'Compra' : 'Venta' }}
      </button>
    </form>
  </div>
</template>

<script>
import apiClient from '@/services/apiClient'
import { fetchCryptoPrice } from '@/services/cryptoPriceService'

export default {
  name: 'TransactionView',
  data() {
    return {
      action: 'purchase',
      cryptoCode: 'btc',
      cryptoAmount: 0,
      money: 0,
      // ELIMINADO: datetime ya no se necesita en data()
      selectedExchange: 'satoshitango',
      exchanges: [
        { id: 'satoshitango', name: 'SatoshiTango' },
        { id: 'ripio', name: 'Ripio' },
        { id: 'buenbit', name: 'Buenbit' },
        { id: 'lemoncash', name: 'Lemon Cash' },
      ],
      unitPrice: null,
      isPriceLoading: false,
    }
  },
  watch: {
    cryptoCode() {
      this.fetchPrice()
    },
    selectedExchange() {
      this.fetchPrice()
    },
    cryptoAmount(newAmount) {
      if (this.unitPrice) {
        this.money = (newAmount * this.unitPrice).toFixed(2)
      }
    },
  },
  methods: {
    async fetchPrice() {
      if (!this.cryptoCode || !this.selectedExchange) return

      this.isPriceLoading = true
      this.unitPrice = null
      try {
        const price = await fetchCryptoPrice(
          this.cryptoCode,
          this.selectedExchange
        )
        if (price) {
          this.unitPrice =
            this.action === 'purchase' ? price.totalAsk : price.totalBid

          if (this.cryptoAmount > 0) {
            this.money = (this.cryptoAmount * this.unitPrice).toFixed(2)
          }
        } else {
          this.unitPrice = null
        }
      } catch (error) {
        console.error('Error al obtener el precio:', error)
        alert(
          'No se pudo obtener el precio para la criptomoneda y exchange seleccionados.'
        )
        this.unitPrice = null
      } finally {
        this.isPriceLoading = false
      }
    },

    async handleSubmit() {
      // 1. Validaciones básicas de inputs
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

      // 2. NUEVA VALIDACIÓN: Verificar fondos antes de VENDER
      if (this.action === 'sale') {
        try {
          // A. Obtenemos el historial actual para calcular el saldo
          // Usamos una consulta filtrada por usuario a la API
          const response = await apiClient.get(
            `/transactions?q={"user_id": "${userId}"}`
          )
          const history = response.data

          // B. Calculamos el saldo actual de la moneda seleccionada
          const currentBalance = history
            .filter((t) => t.crypto_code === this.cryptoCode)
            .reduce((acc, t) => {
              return t.action === 'purchase'
                ? acc + parseFloat(t.crypto_amount)
                : acc - parseFloat(t.crypto_amount)
            }, 0)

          console.log(`Saldo actual de ${this.cryptoCode}: ${currentBalance}`)

          // C. Verificamos si tiene suficiente para vender
          if (this.cryptoAmount > currentBalance) {
            alert(
              `Error: Fondos insuficientes.\n\n` +
                `Intentas vender: ${
                  this.cryptoAmount
                } ${this.cryptoCode.toUpperCase()}\n` +
                `Tienes disponible: ${currentBalance.toFixed(
                  6
                )} ${this.cryptoCode.toUpperCase()}`
            )
            return // <--- DETENEMOS LA EJECUCIÓN AQUÍ (No se guarda nada)
          }
        } catch (error) {
          console.error('Error al validar fondos:', error)
          alert('Error al verificar tus fondos. Intenta nuevamente.')
          return
        }
      }
      // ---------------------------------------------------------
      // FIN DE LA VALIDACIÓN
      // ---------------------------------------------------------

      const transactionData = {
        user_id: userId,
        action: this.action,
        crypto_code: this.cryptoCode,
        crypto_amount: this.cryptoAmount.toString(),
        money: this.money.toString(),
        // Mantenemos el fix de la fecha automática que hicimos antes
        datetime: new Date().toISOString(),
      }

      try {
        await apiClient.post('/transactions', transactionData)
        alert(
          `¡Transacción de ${
            this.action === 'purchase' ? 'compra' : 'venta'
          } registrada con éxito!`
        )
        this.$router.push('/history')
      } catch (error) {
        console.error('Error al registrar la transacción:', error)
        alert(
          'Hubo un error al guardar la transacción. Revisa la consola para más detalles.'
        )
      }
    },
    // ELIMINADO: formatDate ya no se necesita
  },
  mounted() {
    this.fetchPrice()
  },
}
</script>

<style scoped>
.transaction-container {
  max-width: 700px;
  margin: 50px auto;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
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
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
.price-info {
  font-size: 0.8em;
  color: #666;
  margin-left: 5px;
}
input:read-only {
  background-color: #f2f2f2;
  cursor: not-allowed;
}

form {
  text-align: left;
}
</style>
