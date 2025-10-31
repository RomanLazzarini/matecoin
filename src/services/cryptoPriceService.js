// src/services/cryptoPriceService.js
import axios from 'axios'

// Usaremos este exchange como constante
const EXCHANGE = 'satoshitango'

export async function fetchCryptoPrice(cryptoCode) {
  // La URL es: https://criptoya.com/api/{exchange}/{crypto_code}/ars/
  const url = `https://criptoya.com/api/${EXCHANGE}/${cryptoCode}/ars`
  try {
    const response = await axios.get(url)
    // El valor de venta (BID) es el relevante
    return response.data.bid
  } catch (error) {
    console.error(`Error al obtener precio para ${cryptoCode}:`, error)
    return 0
  }
}
