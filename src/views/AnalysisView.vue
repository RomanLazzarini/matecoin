<template>
  <div class="analysis-container">
    <h1>Análisis del Estado Actual</h1>
    <p v-if="isLoading">
      Cargando transacciones y valorizando el portafolio en tiempo real...
    </p>

    <div v-else>
      <section v-if="finalAnalysis.length > 0">
        <h2>Valorización Actual (en ARS)</h2>

        <table>
          <thead>
            <tr>
              <th>Criptomoneda</th>
              <th>Cantidad</th>
              <th>Dinero (ARS)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in finalAnalysis" :key="item.cryptoCode">
              <td>{{ item.cryptoCode }}</td>
              <td>{{ item.amount.toFixed(4) }}</td>
              <td>$ {{ formatNumber(item.currentValue) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2"><strong>TOTAL EN CARTERA</strong></td>
              <td>
                <strong>$ {{ formatNumber(totalPortfolioValue) }}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <p v-else>
        No tienes tenencias positivas de criptomonedas. ¡Hora de comprar!
      </p>
    </div>
  </div>
</template>

<script>
import apiClient from '@/services/apiClient'
import axios from 'axios' // 1. IMPORTAMOS AXIOS PARA CRIPTOYA

export default {
  name: 'AnalysisView',
  data() {
    return {
      isLoading: true,
      transactions: [],
      portfolio: {},
      prices: {}, // Almacenará los precios de CriptoYa
      finalAnalysis: [], // Nuevo: El array final con {cryptoCode, amount, currentValue}
      totalPortfolioValue: 0, // Nuevo: El valor total en ARS
      exchange: 'satoshitango', // Exchange de CriptoYa a usar
    }
  },

  methods: {
    // FUNCIÓN CLAVE: Calcula la tenencia de cada criptomoneda (SIN CAMBIOS)
    calculatePortfolio(transactions) {
      const portfolio = {}

      transactions.forEach((t) => {
        const amount = parseFloat(t.crypto_amount)
        const code = t.crypto_code.toLowerCase()

        if (!portfolio[code]) {
          portfolio[code] = 0
        }

        if (t.action === 'purchase') {
          portfolio[code] += amount
        } else if (t.action === 'sale') {
          portfolio[code] -= amount
        }
      })

      const consolidated = {}
      for (const code in portfolio) {
        if (portfolio[code] > 0.00001) {
          consolidated[code] = portfolio[code]
        }
      }
      return consolidated
    },

    // NUEVO: Método para obtener el precio de una sola cripto desde CriptoYa
    async fetchCryptoPrice(cryptoCode) {
      // La URL es: https://criptoya.com/api/{exchange}/{crypto_code}/ars/
      const url = `https://criptoya.com/api/${this.exchange}/${cryptoCode}/ars`
      try {
        // Usamos axios (no apiClient) ya que es una API diferente
        const response = await axios.get(url)
        // El valor de venta (BID) es el relevante para la valorización de tu cartera
        return response.data.bid
      } catch (error) {
        console.error(`Error al obtener precio para ${cryptoCode}:`, error)
        // Devolvemos 0 si falla para evitar cálculos incorrectos
        return 0
      }
    },

    // NUEVO: Método auxiliar para formatear números a formato ARS (separador de miles)
    formatNumber(value) {
      // Asegura que el valor sea un número y usa formato local argentino (punto de miles, coma decimal)
      return parseFloat(value).toLocaleString('es-AR', {
        minimumFractionDigits: 2,
      })
    },

    // MODIFICADO: Ahora obtiene precios y valoriza
    async fetchAndCalculate() {
      const userId = this.$store.state.userId

      if (!userId) {
        this.$router.push('/')
        return
      }

      this.isLoading = true
      let calculatedPortfolio = {}

      try {
        // 1. OBTENER TRANSACCIONES Y CONSOLIDAR (Lógica ya probada)
        const response = await apiClient.get(
          `/transactions?q={"user_id": "${userId}"}`
        )
        calculatedPortfolio = this.calculatePortfolio(response.data)
        this.portfolio = calculatedPortfolio

        const cryptoCodesToFetch = Object.keys(calculatedPortfolio)

        // 2. OBTENER PRECIOS Y VALORIZAR
        let totalValue = 0
        const analysisData = []

        // Iteramos sobre las criptos que SÍ tenemos
        for (const code of cryptoCodesToFetch) {
          const amount = calculatedPortfolio[code]
          // Llamamos a la API de CriptoYa para el precio
          const priceBid = await this.fetchCryptoPrice(code)

          const currentValue = amount * priceBid
          totalValue += currentValue

          analysisData.push({
            cryptoCode: code.toUpperCase(),
            amount: amount,
            // Guardamos el valor actual para mostrar
            currentValue: currentValue.toFixed(2),
          })
          this.prices[code] = priceBid
        }

        this.finalAnalysis = analysisData
        this.totalPortfolioValue = totalValue.toFixed(2)
      } catch (error) {
        console.error('Error en la carga del análisis:', error)
      } finally {
        this.isLoading = false
      }
    },
  },

  async mounted() {
    this.fetchAndCalculate()
  },
}
</script>

<style scoped>
/* Estilos para el componente */
.analysis-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
th {
  background-color: #f2f2f2;
}
tfoot tr:last-child td {
  border-top: 2px solid #333;
  font-size: 1.1em;
}
/* Estilos de lista eliminados ya que usamos tabla */
</style>
