import { apiClient } from './client'

const BASE_URL = '/resources'

export const getAllResources = () => apiClient.get(BASE_URL)

export const searchResources = (params) => apiClient.get(`${BASE_URL}/search`, { params })

export const createResource = (data) => apiClient.post(BASE_URL, data)

export const updateResource = (id, data) => apiClient.put(`${BASE_URL}/${id}`, data)

export const deleteResource = (id) => apiClient.delete(`${BASE_URL}/${id}`)