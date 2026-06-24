import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const getPedidoIcon = (orden) => L.divIcon({
  className: "map-marker-pedido",
  html: `<div style="background:#2563eb;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);font-weight:bold">${orden ? orden : '📦'}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const repartidorIcon = L.divIcon({
  className: "map-marker-repartidor",
  html: '<div style="background:#16a34a;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)">🛵</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapBounds({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (!markers.length) return;

    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [map, markers]);

  return null;
}

export default function MapView({
  center = [-34.6037, -58.3816],
  zoom = 13,
  height = "500px",
  pedidos = [],
  repartidores = [],
  rutas = [],
  fitBounds = true,
}) {
  const allMarkers = [
    ...pedidos.map((p) => ({ lat: parseFloat(p.latitud), lng: parseFloat(p.longitud) })),
    ...repartidores.map((r) => ({
      lat: parseFloat(r.latitud),
      lng: parseFloat(r.longitud),
    })),
  ];

  return (
    <div style={{ height, width: "100%", borderRadius: 8, overflow: "hidden" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {fitBounds && allMarkers.length > 0 && <MapBounds markers={allMarkers} />}

        {pedidos.map((p) => (
          <Marker
            key={`pedido-${p.id}`}
            position={[parseFloat(p.latitud), parseFloat(p.longitud)]}
            icon={getPedidoIcon(p.orden_entrega)}
          >
            <Popup>
              <strong>Pedido #{p.id} {p.orden_entrega ? `(Parada ${p.orden_entrega})` : ''}</strong>
              <br />
              {p.direccion_entrega}
              <br />
              <small>{p.cliente_nombre}</small>
              <br />
              <small>Estado: {p.estado}</small>
            </Popup>
          </Marker>
        ))}

        {repartidores.map((r) => (
          <Marker
            key={`rep-${r.repartidor_id || r.id}`}
            position={[parseFloat(r.latitud), parseFloat(r.longitud)]}
            icon={repartidorIcon}
          >
            <Popup>
              <strong>{r.repartidor_nombre || "Repartidor"}</strong>
              <br />
              <small>Actualizado: {new Date(r.fecha_hora).toLocaleTimeString()}</small>
            </Popup>
          </Marker>
        ))}

        {rutas.map((ruta, i) =>
          ruta.length >= 2 ? (
            <Polyline
              key={`ruta-${i}`}
              positions={ruta}
              color="#4338ca"
              weight={3}
              opacity={0.7}
              dashArray="8 8"
            />
          ) : null
        )}
      </MapContainer>
    </div>
  );
}
