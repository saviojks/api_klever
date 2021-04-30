const axios = require('axios')

const api = axios.create({
    baseURL: process.env.URL,
})

module.exports = {
    view: async (address) => {
        try {
            const response = await api.get(`/utxo/${address}`)
            return response
        } catch (error) {
            return { error }
        }
    },
    healthcheck: async () => {
        try {
            const response = await api.get(`/`)
            return response
        } catch (error) {
            return { error }
        }
    },
}