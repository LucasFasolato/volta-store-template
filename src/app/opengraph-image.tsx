import { ImageResponse } from 'next/og'

export const alt = 'VOLTA — Tu catálogo online para vender por WhatsApp'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#07120f',
          color: '#ffffff',
          padding: '68px 76px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              background: '#12e89a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#07120f',
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            V
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>VOLTA STORE</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 980 }}>
          <div style={{ fontSize: 72, lineHeight: 0.98, fontWeight: 800, letterSpacing: '-0.055em' }}>
            Tu catálogo online para vender por WhatsApp.
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.3, color: '#b9c7c1' }}>
            Subí productos, compartí tu tienda y recibí pedidos ordenados directamente en WhatsApp.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 22, color: '#75f5c5' }}>
          <span>Simple</span><span>•</span><span>Profesional</span><span>•</span><span>Listo para vender</span>
        </div>
      </div>
    ),
    size,
  )
}
