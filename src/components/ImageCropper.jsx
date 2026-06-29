import { useState, useRef, useEffect } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

function centerAspectCrop(mediaWidth, mediaHeight) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 80 }, 1, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageCropper({ imageSrc, onConfirm, onCancel }) {
  const imgRef      = useRef(null)
  const previewRef  = useRef(null)
  const [crop, setCrop]               = useState()
  const [completedCrop, setCompleted] = useState()

  function onImageLoad(e) {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height))
  }

  // Draw live preview whenever crop changes
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewRef.current) return
    drawToCanvas(imgRef.current, previewRef.current, completedCrop, 72)
  }, [completedCrop])

  function drawToCanvas(image, canvas, crop, outputSize) {
    const ctx    = canvas.getContext('2d')
    const scaleX = image.naturalWidth  / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width  = outputSize
    canvas.height = outputSize
    ctx.clearRect(0, 0, outputSize, outputSize)

    // Circular clip
    ctx.save()
    ctx.beginPath()
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
    ctx.clip()

    ctx.drawImage(
      image,
      crop.x      * scaleX,
      crop.y      * scaleY,
      crop.width  * scaleX,
      crop.height * scaleY,
      0, 0, outputSize, outputSize,
    )
    ctx.restore()
  }

  function handleConfirm() {
    if (!completedCrop || !imgRef.current) return

    const canvas = document.createElement('canvas')
    drawToCanvas(imgRef.current, canvas, completedCrop, 400)

    canvas.toBlob(blob => {
      if (!blob) return
      const file       = new File([blob], 'profile.jpg', { type: 'image/jpeg' })
      const previewUrl = URL.createObjectURL(blob)
      onConfirm(file, previewUrl)
    }, 'image/jpeg', 0.92)
  }

  return (
    <div
      className="modal-backdrop"
      style={{ alignItems: 'center', padding: 20 }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: '24px 20px',
          width: '100%',
          maxWidth: 440,
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'slideUpFull 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ color: 'var(--brown)', marginBottom: 4 }}>Crop Photo</h3>
        <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
          Drag to move · Pull corners to resize
        </p>

        {/* Crop area */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          background: '#111',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
        }}>
          <ReactCrop
            crop={crop}
            onChange={(pixelCrop) => setCrop(pixelCrop)}
            onComplete={(pixelCrop) => setCompleted(pixelCrop)}
            aspect={1}
            circularCrop
            minWidth={40}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop"
              onLoad={onImageLoad}
              style={{ maxHeight: '55vh', maxWidth: '100%', display: 'block' }}
            />
          </ReactCrop>
        </div>

        {/* Live circular preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0 8px' }}>
          <canvas
            ref={previewRef}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              border: '3px solid var(--brown)',
              flexShrink: 0,
              background: 'var(--cream)',
            }}
          />
          <p className="text-sm text-muted">Live preview of how your photo will look</p>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!completedCrop}
          >
            Use This Photo
          </button>
        </div>
      </div>
    </div>
  )
}
