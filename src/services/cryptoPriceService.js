import axios from 'axios'

// Usaremos este exchange como constante
// Eliminamos la constante fija que te ataba a un solo exchange
//const EXCHANGE = 'satoshitango'

// Modificamos la función para aceptar 'exchange' como parámetro
// Le ponemos un valor por defecto ('satoshitango') para no romper el código existente

export async function fetchCryptoPrice(cryptoCode, exchange = 'satoshitango') {
  const exchangeClean = exchange.toLowerCase()
  const cryptoClean = cryptoCode.toLowerCase()
  const url = `https://criptoya.com/api/${exchangeClean}/${cryptoClean}/ars`

  try {
    const response = await axios.get(url)
    // Devolvemos el objeto completo (ask, bid, etc.)
    return response.data
  } catch (error) {
    console.error(
      `Error al obtener precio para ${cryptoClean} en ${exchangeClean}:`,
      error
    )
    // Devolvemos null para que el componente pueda manejar el error
    return null
  }
}
