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

        <h2 style="margin-top: 40px">Distribución de la Cartera</h2>
        <div style="max-width: 500px; height: 300px; margin: 0 auto">
          <DoughnutChart
            :chart-data="chartDataObject"
            v-if="chartDataObject.labels && chartDataObject.labels.length > 0"
          />
        </div>
      </section>

      <p v-else>
        No tienes tenencias positivas de criptomonedas. ¡Hora de comprar!
      </p>
    </div>
  </div>
</template>

<script>
import apiClient from '@/services/apiClient'
// ELIMINAMOS LA IMPORTACIÓN DE AXIOS para solucionar el error de linter
import { fetchCryptoPrice } from '@/services/cryptoPriceService'
import DoughnutChart from '@/components/DoughnutChart.vue'

export default {
  name: 'AnalysisView',
  components: { DoughnutChart },
  data() {
    return {
      isLoading: true,
      transactions: [],
      portfolio: {},
      prices: {},
      finalAnalysis: [],
      totalPortfolioValue: 0,
      exchange: 'satoshitango',
      chartDataObject: {},
    }
  },

  methods: {
    // 1. FUNCIÓN CLAVE: Calcula la tenencia de cada criptomoneda
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

    // 2. FUNCIÓN AUXILIAR: Formato de números ARS
    formatNumber(value) {
      return parseFloat(value).toLocaleString('es-AR', {
        minimumFractionDigits: 2,
      })
    },

    // 3. LÓGICA PRINCIPAL (MODIFICADA para usar el servicio externo)
    async fetchAndCalculate() {
      const userId = this.$store.state.userId

      if (!userId) {
        this.$router.push('/')
        return
      }

      this.isLoading = true
      let calculatedPortfolio = {}

      try {
        // OBTENER TRANSACCIONES
        const response = await apiClient.get(
          `/transactions?q={"user_id": "${userId}"}`
        )
        calculatedPortfolio = this.calculatePortfolio(response.data)
        this.portfolio = calculatedPortfolio

        const cryptoCodesToFetch = Object.keys(calculatedPortfolio)

        // OBTENER PRECIOS Y VALORIZAR
        let totalValue = 0
        const analysisData = []
        const chartLabels = []
        const chartValues = []

        for (const code of cryptoCodesToFetch) {
          const amount = calculatedPortfolio[code]
          const priceData = await fetchCryptoPrice(code) // Ahora devuelve un objeto
          const priceBid = priceData ? priceData.bid : 0 // Usar el BID para valorizar

          if (priceBid > 0) {
            const currentValue = amount * priceBid
            totalValue += currentValue

            analysisData.push({
              cryptoCode: code.toUpperCase(),
              amount: amount,
              currentValue: currentValue.toFixed(2),
            })
            this.prices[code] = priceBid

            chartLabels.push(code.toUpperCase())
            chartValues.push(currentValue)
          }
        }

        this.finalAnalysis = analysisData
        this.totalPortfolioValue = totalValue.toFixed(2)

        // 4. CONSTRUIR EL OBJETO FINAL PARA EL GRÁFICO
        this.chartDataObject = {
          labels: chartLabels,
          datasets: [
            {
              // 🟢 NUEVO ARRAY DE COLORES (8 opciones distintas)
              backgroundColor: [
                '#D32F2F', // Rojo
                '#36A2EB', // Azul
                '#FFCE56', // Amarillo
                '#4BC0C0', // Turquesa
                '#9966FF', // Violeta
                '#28A745', // Verde
              ],
              data: chartValues,
            },
          ],
        }
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
</style>
