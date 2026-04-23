import { useState } from 'react'
import { generateQrCode, getQrCode } from '../api/checkinApi'
import './QRDisplay.css'

export default function QRDisplay({ booking }) {
  const [qrImage, setQrImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadQr = async (forceGenerate = false) => {
    setLoading(true)
    setError('')

    try {
      const data = forceGenerate ? await generateQrCode(booking.id) : await getQrCode(booking.id)
      setQrImage(data?.qrImageBase64 || '')
    } catch (requestError) {
      if (!forceGenerate) {
        try {
          const generated = await generateQrCode(booking.id)
          setQrImage(generated?.qrImageBase64 || '')
          return
        } catch (generationError) {
          const message = generationError?.response?.data?.error || generationError?.message || 'Unable to load QR code'
          setError(message)
          return
        }
      }

      const message = requestError?.response?.data?.error || requestError?.message || 'Unable to load QR code'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const downloadQr = () => {
    if (!qrImage) return

    const link = document.createElement('a')
    link.href = `data:image/png;base64,${qrImage}`
    link.download = `booking-${booking.id}-qr.png`
    link.click()
  }

  return (
    <section className="qr-display" aria-label={`QR for booking ${booking.id}`}>
      <div className="qr-display-header">
        <strong>Check-in QR</strong>
        <span>{booking.qrUsed ? 'Used' : 'Ready'}</span>
      </div>

      {!qrImage ? (
        <button type="button" className="secondary-btn" onClick={() => loadQr(false)} disabled={loading}>
          {loading ? 'Loading QR...' : 'Show QR'}
        </button>
      ) : (
        <>
          <img src={`data:image/png;base64,${qrImage}`} alt="Booking QR code" className="qr-image" />
          <div className="qr-actions">
            <button type="button" className="secondary-btn" onClick={() => loadQr(true)} disabled={loading}>
              Regenerate
            </button>
            <button type="button" onClick={downloadQr}>
              Download QR
            </button>
          </div>
        </>
      )}

      {error ? <p className="qr-error">{error}</p> : null}
    </section>
  )
}
