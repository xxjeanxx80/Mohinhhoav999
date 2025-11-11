"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix Leaflet default icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface Spa {
  id: number
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  phone?: string | null
  rating?: number
}

interface SpaMapViewProps {
  spas: Spa[]
  center?: [number, number]
  zoom?: number
  height?: string
}

// Component to recenter map when spas change
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center)
  }, [center, map])
  return null
}

export function SpaMapView({ spas, center = [10.8231, 106.6297], zoom = 13, height = "500px" }: SpaMapViewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter spas with valid coordinates
  const validSpas = spas.filter((spa) => spa.latitude !== null && spa.longitude !== null)

  // Calculate center from spas if available
  const mapCenter: [number, number] = validSpas.length > 0
    ? [
        validSpas.reduce((sum, spa) => sum + (spa.latitude || 0), 0) / validSpas.length,
        validSpas.reduce((sum, spa) => sum + (spa.longitude || 0), 0) / validSpas.length,
      ]
    : center

  if (!mounted) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-slate-100 rounded-lg">
        <p className="text-slate-500">Đang tải bản đồ...</p>
      </div>
    )
  }

  if (validSpas.length === 0) {
    return (
      <div style={{ height }} className="flex flex-col items-center justify-center bg-slate-100 rounded-lg">
        <p className="text-slate-600 font-medium">Không có spa nào có tọa độ</p>
        <p className="text-sm text-slate-500 mt-2">Vui lòng thêm latitude/longitude cho các spa</p>
      </div>
    )
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-slate-200">
      <MapContainer center={mapCenter} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={mapCenter} />
        {validSpas.map((spa) => (
          <Marker key={spa.id} position={[spa.latitude!, spa.longitude!]}>
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-lg mb-2">{spa.name}</h3>
                {spa.address && (
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>Địa chỉ:</strong> {spa.address}
                  </p>
                )}
                {spa.phone && (
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>SĐT:</strong> {spa.phone}
                  </p>
                )}
                {spa.rating !== undefined && (
                  <p className="text-sm text-slate-600">
                    <strong>Đánh giá:</strong> ⭐ {spa.rating.toFixed(1)}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

