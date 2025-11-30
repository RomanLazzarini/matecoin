<template>
  <div class="table-container">
    <table class="table-crypto">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Tipo</th>
          <th>Cripto</th>
          <th>Cantidad</th>
          <th>Dinero (ARS)</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in transactions" :key="t._id">
          <td>{{ formatDate(t.datetime) }}</td>
          <td>
            <span
              :class="
                t.action === 'purchase' ? 'positive-result' : 'negative-result'
              "
            >
              {{ t.action === 'purchase' ? 'COMPRA' : 'VENTA' }}
            </span>
          </td>
          <td>{{ t.crypto_code.toUpperCase() }}</td>
          <td>{{ t.crypto_amount }}</td>
          <td>$ {{ t.money }}</td>
          <td class="actions-cell">
            <button
              class="btn-action btn-view"
              @click="$emit('view-transaction', t._id)"
              title="Ver Detalle"
            >
              VER
            </button>

            <button
              class="btn-action btn-edit"
              @click="$emit('edit-transaction', t._id)"
              title="Editar"
            >
              EDITAR
            </button>

            <button
              class="btn-action btn-delete"
              @click="$emit('delete-transaction', t._id)"
              title="Eliminar"
            >
              BORRAR
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'MovementsTable',
  props: {
    transactions: {
      type: Array,
      required: true,
    },
  },
  // Declaramos los 3 eventos que este componente puede disparar
  emits: ['view-transaction', 'edit-transaction', 'delete-transaction'],
  methods: {
    formatDate(isoString) {
      if (!isoString) return '-'
      const date = new Date(isoString)
      return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      )
    },
  },
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  margin: 20px auto;
  max-width: 1000px;
}

.table-crypto {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin-top: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.table-crypto th,
.table-crypto td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.table-crypto th {
  background-color: #2c3e50;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.table-crypto tr:nth-of-type(even) {
  background-color: #f3f3f3;
}

.table-crypto tr:hover {
  background-color: #f1f1f1;
  transform: scale(1.01);
  transition: transform 0.2s;
}

/* --- Acciones y Botones --- */

.actions-cell {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.btn-action {
  border: none;
  border-radius: 4px;
  color: white;
  padding: 6px 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.8em;
  transition: opacity 0.2s;
}

.btn-action:hover {
  opacity: 0.8;
}

.btn-view {
  background-color: #17a2b8;
}

.btn-edit {
  background-color: #ffc107;
  color: #333;
}

.btn-delete {
  background-color: #dc3545;
}

/* --- Indicadores de Estado --- */

.positive-result {
  color: #28a745;
  font-weight: bold;
}

.negative-result {
  color: #dc3545;
  font-weight: bold;
}
</style>
