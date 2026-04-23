import { apiClient } from './client'

export async function generateQrCode(bookingId) {
  const response = await apiClient.post(`/bookings/${bookingId}/generate-qr`)
  return response.data
}

export async function getQrCode(bookingId) {
  const response = await apiClient.get(`/bookings/${bookingId}/qr`)
  return response.data
}

export async function verifyCheckIn(token) {
  const response = await apiClient.get('/checkin/verify', { params: { token } })
  return response.data
}
