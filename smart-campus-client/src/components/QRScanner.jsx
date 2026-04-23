import { useEffect, useMemo, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { verifyCheckIn } from '../api/checkinApi'
import './QRScanner.css'

const SCANNER_ELEMENT_ID = 'qr-checkin-reader'

function extractTokenFromText(text) {
  try {
    const parsed = new URL(text)
    return parsed.searchParams.get('token')
  } catch {
    return null
  }
}

export default function QRScanner() {
  const scannerRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [loadingVerify, setLoadingVerify] = useState(false)
  const [result, setResult] = useState(null)
  const [isDismissing, setIsDismissing] = useState(false)

  const resultClass = useMemo(() => {
    if (!result) return ''
    return result.success ? 'result-success' : 'result-error'
  }, [result])

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => undefined)
        scannerRef.current.clear().catch(() => undefined)
      }
    }
  }, [])

  useEffect(() => {
    if (!result) {
      setIsDismissing(false)
      return undefined
    }

    setIsDismissing(false)
    const dismissStartTimer = setTimeout(() => setIsDismissing(true), 2600)
    const dismissClearTimer = setTimeout(() => {
      setResult(null)
      setIsDismissing(false)
    }, 3200)

    return () => {
      clearTimeout(dismissStartTimer)
      clearTimeout(dismissClearTimer)
    }
  }, [result])

  const stopScanner = async () => {
    if (!scannerRef.current) return

    try {
      await scannerRef.current.stop()
    } catch {
      // Ignore camera stop errors when scanner is already stopped.
    }

    try {
      await scannerRef.current.clear()
    } catch {
      // Ignore cleanup errors after stopping scanner.
    }

    scannerRef.current = null
    setIsScanning(false)
  }

  const startScanner = async () => {
    if (isScanning) return

    setResult(null)
    setIsDismissing(false)
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID)
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          const token = extractTokenFromText(decodedText)
          if (!token || loadingVerify) {
            return
          }

          setLoadingVerify(true)
          try {
            const verifyResponse = await verifyCheckIn(token)
            setResult({
              success: true,
              message: verifyResponse?.message || 'Check-in successful',
              bookingId: verifyResponse?.bookingId || '-',
            })
            await stopScanner()
          } catch (verifyError) {
            const message = verifyError?.response?.data?.error || verifyError?.message || 'Verification failed'
            setResult({ success: false, message, bookingId: '-' })
          } finally {
            setLoadingVerify(false)
          }
        },
      )
      setIsScanning(true)
    } catch (cameraError) {
      const message = cameraError?.message || 'Unable to start camera'
      setResult({ success: false, message, bookingId: '-' })
      await stopScanner()
    }
  }

  return (
    <section className="qr-scanner-card" aria-label="QR check-in scanner">
      <div className="qr-scanner-head">
        <h3>QR Check-in Scanner</h3>
        <p>Scan booking QR codes and validate check-in instantly.</p>
      </div>

      <div className="qr-preview-wrap">
        <div id={SCANNER_ELEMENT_ID} className="qr-preview" />
        {result ? (
          <div className={`qr-result qr-result-overlay ${resultClass} ${isDismissing ? 'is-dismissing' : ''}`} role="status" aria-live="polite">
            <div className="qr-result-icon" aria-hidden>
              {result.success ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12.5l2.5 2.5L16.5 9" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8.5v4.5" />
                  <path d="M12 16h.01" />
                </svg>
              )}
            </div>
            <div className="qr-result-content">
              <p className="qr-result-title">{result.success ? 'Check-in successful' : 'Check-in failed'}</p>
              <p className="qr-result-message">{result.message}</p>
              <small>Booking: {result.bookingId}</small>
            </div>
          </div>
        ) : null}
      </div>

      <div className="qr-scanner-actions">
        {!isScanning ? (
          <button type="button" onClick={startScanner} disabled={loadingVerify}>
            Start Scanner
          </button>
        ) : (
          <button type="button" className="secondary-btn" onClick={stopScanner}>
            Stop Scanner
          </button>
        )}
      </div>
    </section>
  )
}
