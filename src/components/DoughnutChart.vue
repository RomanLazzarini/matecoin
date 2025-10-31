<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<script>
// 1. Importaciones necesarias de vue-chartjs y chart.js
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from 'chart.js'

// 2. Registramos los elementos que necesita este gráfico (título, leyendas, etc.)
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

export default {
  name: 'DoughnutChart',
  components: { Doughnut },
  props: {
    // 3. Propiedad que recibirá los datos ya formateados desde AnalysisView
    chartData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      // 4. Opciones de configuración del gráfico (apariencia)
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 14,
              },
            },
          },
          title: {
            display: true,
            text: 'Composición del Portafolio por Valor (ARS)',
          },
        },
      },
    }
  },
}
</script>
