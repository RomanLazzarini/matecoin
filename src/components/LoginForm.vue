//Este componente será el encargado de la UI y de la Validación
<template>
  <div class="login-form-container">
    <form @submit.prevent="validateAndSubmit">
      <label for="userIdInput" class="form-label">{{ labelText }}</label>

      <input
        id="userIdInput"
        type="text"
        v-model="inputValue"
        :placeholder="placeholderText"
        :class="{ 'input-error': errorMessage }"
      />

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <button type="submit">{{ buttonText }}</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',
  props: {
    labelText: {
      type: String,
      default: 'Usuario ID',
    },
    placeholderText: {
      type: String,
      default: 'Ingresa ID',
    },
    buttonText: {
      type: String,
      default: 'Ingresar',
    },
  },
  data() {
    return {
      inputValue: '',
      errorMessage: '',
    }
  },
  methods: {
    validateAndSubmit() {
      // 2. VALIDACIONES (Regex Alfanumérico)
      // ^ = inicio, [a-zA-Z0-9] = solo letras y números, + = uno o más, $ = fin
      const alphanumericRegex = /^[a-zA-Z0-9]+$/

      // Validación 1: Vacío
      if (!this.inputValue.trim()) {
        this.errorMessage = 'Por favor, ingresa un ID.'
        return
      }

      // Validación 2: Caracteres especiales
      if (!alphanumericRegex.test(this.inputValue)) {
        this.errorMessage =
          'El ID debe ser alfanumérico (solo letras y números).'
        return
      }

      // Si todo está bien, limpiamos error y emitimos
      this.errorMessage = ''

      this.$emit('submit-login', this.inputValue)
    },
  },
}
</script>

<style scoped>
.login-form-container {
  width: 100%;
}
.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #2c3e50;
}
input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* Importante para que el padding no rompa el ancho */
}
.input-error {
  border-color: #e74c3c;
  background-color: #fceceb;
}
.error-text {
  color: #e74c3c;
  font-size: 0.85em;
  margin-top: -5px;
  margin-bottom: 10px;
  text-align: left;
}
button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  font-size: 1em;
}
button:hover {
  background-color: #3aa876;
}
</style>
