<template>
  <div class="edit-container">
    <h1>{{ isReadOnly ? 'Detalle de Transacción' : 'Editar Transacción' }}</h1>

    <p v-if="isLoading">Cargando detalles...</p>

    <div v-else-if="transaction._id">
      <fieldset :disabled="isReadOnly" class="form-fieldset">
        <form @submit.prevent="updateTransaction">
          <label for="action">Tipo de Operación:</label>
          <select id="action" v-model="transaction.action" required>
            <option value="purchase">Compra</option>
            <option value="sale">Venta</option>
          </select>

          <label for="crypto-code">Criptomoneda:</label>
          <select id="crypto-code" v-model="transaction.crypto_code" required>
            <option value="btc">Bitcoin (BTC)</option>
            <option value="eth">Ethereum (ETH)</option>
            <option value="usdc">USDC</option>
            <option value="usdt">Tether (USDT)</option>
            <option value="dai">DAI</option>
            <option value="sol">Solana (SOL)</option>
          </select>

          <div v-if="!isReadOnly">
            <label for="exchange">Referencia de Precio (Exchange):</label>
            <select v-model="selectedExchange" id="exchange">
              <option v-for="ex in exchanges" :key="ex.id" :value="ex.id">
                {{ ex.name }}
              </option>
            </select>
          </div>

          <label for="crypto-amount">Cantidad:</label>
          <input
            id="crypto-amount"
            type="number"
            v-model.number="transaction.crypto_amount"
            step="any"
            min="0.000001"
            required
          />

          <label for="money-spent">
            Monto (en ARS):
            <span v-if="isPriceLoading" class="price-info">Calculando...</span>
            <span v-if="!isReadOnly" class="price-info">(Automático)</span>
          </label>
          <input
            id="money-spent"
            type="number"
            v-model.number="transaction.money"
            step="any"
            required
            readonly
            :class="{ 'disabled-input': !isReadOnly }"
          />

          <p v-if="!isReadOnly" class="date-info">
            * La fecha y hora se actualizarán al momento de guardar.
          </p>
          <p v-else class="date-info">
            Fecha registrada: {{ formatDate(transaction.datetime) }}
          </p>

          <div v-if="!isReadOnly" class="button-group">
            <button type="submit" class="update-button">Guardar Cambios</button>
            <button type="button" @click="cancelEdit" class="cancel-button">
              Cancelar
            </button>
          </div>
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
        Eliminar Transacción
      </button>
    </div>
  </div>
</template>

<script>
import apiClient from '@/services/apiClient'
import { fetchCryptoPrice } from '@/services/cryptoPriceService'

export default {
  name: 'EditTransactionView',
  data() {
    return {
      isLoading: true,
      isReadOnly: false,
      isPriceLoading: false,
      selectedExchange: 'satoshitango',
      exchanges: [
        { id: 'satoshitango', name: 'SatoshiTango' },
        { id: 'ripio', name: 'Ripio' },
        { id: 'buenbit', name: 'Buenbit' },
        { id: 'lemoncash', name: 'Lemon Cash' },
      ],
      transaction: {
        action: '',
        crypto_code: '',
        crypto_amount: 0,
        money: 0,
        datetime: '',
      },
    }
  },

  watch: {
    'transaction.crypto_code': function () {
      this.recalculatePrice()
    },
    'transaction.crypto_amount': function () {
      this.recalculatePrice()
    },
    'transaction.action': function () {
      this.recalculatePrice()
    },
    selectedExchange: function () {
      this.recalculatePrice()
    },
  },

  methods: {
    cancelEdit() {
      this.$router.push('/history')
    },

    async recalculatePrice() {
      if (
        this.isReadOnly ||
        !this.transaction.crypto_code ||
        !this.selectedExchange
      )
        return

      this.isPriceLoading = true
      try {
        const priceData = await fetchCryptoPrice(
          this.transaction.crypto_code,
          this.selectedExchange
        )

        if (priceData) {
          const unitPrice =
            this.transaction.action === 'purchase'
              ? priceData.totalAsk
              : priceData.totalBid

          if (this.transaction.crypto_amount > 0) {
            this.transaction.money = (
              this.transaction.crypto_amount * unitPrice
            ).toFixed(2)
          }
        }
      } catch (error) {
        console.error('Error calculando precio:', error)
      } finally {
        this.isPriceLoading = false
      }
    },

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
        console.error('Error al cargar:', error)
      } finally {
        this.isLoading = false
      }
    },

    async updateTransaction() {
      if (!confirm('¿Guardar cambios?')) return

      this.isLoading = true

      // VALIDACIÓN DE FONDOS (Lógica para Edición)
      if (this.transaction.action === 'sale') {
        try {
          const userId = this.$store.state.userId
          // 1. Traemos todo el historial
          const response = await apiClient.get(
            `/transactions?q={"user_id": "${userId}"}`
          )
          const allTransactions = response.data

          // 2. Filtramos: Quitamos la transacción actual para no contarla doble
          // y nos quedamos solo con la criptomoneda que queremos validar
          const otherTransactions = allTransactions.filter(
            (t) =>
              t._id !== this.transaction._id &&
              t.crypto_code === this.transaction.crypto_code
          )

          // 3. Calculamos el saldo disponible SIN esta transacción
          const availableBalance = otherTransactions.reduce((acc, t) => {
            return t.action === 'purchase'
              ? acc + parseFloat(t.crypto_amount)
              : acc - parseFloat(t.crypto_amount)
          }, 0)

          console.log(
            `Saldo disponible (excluyendo actual): ${availableBalance}`
          )

          // 4. Validamos
          // Nota: Usamos parseFloat para asegurar comparación numérica
          // ... (Cálculo de availableBalance igual que antes) ...

          const amountToSell = parseFloat(this.transaction.crypto_amount)

          if (amountToSell > availableBalance) {
            // Calculamos cuánto falta para que el mensaje sea claro
            const missing = amountToSell - availableBalance
            const cryptoSymbol = this.transaction.crypto_code.toUpperCase()

            alert(
              `Error: Fondos insuficientes para realizar esta modificación.\n\n` +
                `• Saldo disponible (sin esta transacción): ${availableBalance.toFixed(
                  6
                )} ${cryptoSymbol}\n` +
                `• Intentas vender: ${amountToSell} ${cryptoSymbol}\n\n` +
                `Resultado: Te faltan ${missing.toFixed(
                  6
                )} ${cryptoSymbol} para poder realizar la operación.`
            )

            this.isLoading = false
            return // DETENEMOS TODO
          }
        } catch (error) {
          console.error('Error validando fondos:', error)
          alert('Error al verificar consistencia de fondos.')
          this.isLoading = false
          return
        }
      }
      // FIN VALIDACIÓN

      const updatedData = {
        action: this.transaction.action,
        crypto_code: this.transaction.crypto_code,
        crypto_amount: this.transaction.crypto_amount.toString(),
        money: this.transaction.money.toString(),
        datetime: new Date().toISOString(),
      }

      try {
        await apiClient.patch(
          `/transactions/${this.transaction._id}`,
          updatedData
        )
        alert('Transacción actualizada con éxito.')
        this.$router.push('/history')
      } catch (error) {
        console.error('Error:', error)
        alert('No se pudo actualizar.')
      } finally {
        this.isLoading = false
      }
    },

    async deleteTransaction() {
      if (!confirm('¿Eliminar permanentemente?')) return
      this.isLoading = true
      try {
        await apiClient.delete(`/transactions/${this.transaction._id}`)
        alert('Eliminada.')
        this.$router.push('/history')
      } catch (error) {
        alert('Error al eliminar.')
      } finally {
        this.isLoading = false
      }
    },

    formatDate(iso) {
      if (!iso) return '-'
      return new Date(iso).toLocaleString()
    },
  },

  mounted() {
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
  text-align: center;
}
.form-fieldset {
  border: none;
  padding: 0;
  margin: 0;
  text-align: left;
}
form label,
form input,
form select,
form button {
  display: block;
  width: 100%;
  margin-bottom: 15px;
}

/* Agrupación de botones para que queden lado a lado */
.button-group {
  display: flex;
  gap: 10px;
}

.update-button {
  background-color: #4caf50;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
  flex: 2;
  margin-top: 20px;
}

.cancel-button {
  background-color: #95a5a6; /* Gris azulado */
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
  flex: 1;
  margin-top: 20px;
}
.cancel-button:hover {
  background-color: #7f8c8d;
}

.delete-button {
  background-color: #f44336;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
}
.back-button {
  background-color: #6c757d;
  color: white;
  padding: 10px;
  border: none;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
}
.disabled-input {
  background-color: #eee;
  color: #555;
  cursor: not-allowed;
}
.price-info {
  font-size: 0.8em;
  color: #666;
  margin-left: 5px;
}
.date-info {
  font-size: 0.9em;
  color: #666;
  margin-top: 5px;
  font-style: italic;
}
</style>
