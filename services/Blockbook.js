const axios = require('axios')

const api = axios.create({
    baseURL: process.env.URL,
})

module.exports = {
    view: async (address) => {
        try {
            const response = await api.get(`/${address}`)
            return response
        } catch (error) {
            return { error }
        }
    },
}