import axios from 'axios'

const BASE_URL = 'http://localhost:8081/api/resources'

export const getAllResources = () => axios.get(BASE_URL)

export const searchResources = (params) => axios.get(`${BASE_URL}/search`, { params })

export const createResource = (data) => axios.post(BASE_URL, data)

export const updateResource = (id, data) => axios.put(`${BASE_URL}/${id}`, data)

export const deleteResource = (id) => axios.delete(`${BASE_URL}/${id}`)