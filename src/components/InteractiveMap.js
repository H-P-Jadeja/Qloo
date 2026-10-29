'use client';
import { useEffect, useRef, useState } from 'react';

// Guard: Qloo location/address fields can be objects. Always coerce to string for render.
function safeStr(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    // {city, metro, state, country, neighborhood} descriptor
    return [val.city, val.neighborhood, val.state, val.country].filter(Boolean).join(', ');
  }
  return String(val);
}

// Common city centers for fallback coordinates
const CITY_CENTERS = {
  mumbai: { lat: 19.076, lon: 72.8777 },
  berlin: { lat: 52.52, lon: 13.405 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  'new york': { lat: 40.7128, lon: -74.006 },
  nyc: { lat: 40.7128, lon: -74.006 },
  london: { lat: 51.5074, lon: -0.1278 },
  paris: { lat: 48.8566, lon: 2.3522 },
  'san francisco': { lat: 37.7749, lon: -122.4194 },
};

function getCityCenter(destination) {
  const key = (destination || '').trim().toLowerCase();
  for (const [city, coords] of Object.entries(CITY_CENTERS)) {
    if (key.includes(city)) return coords;
  }
  return { lat: 19.076, lon: 72.8777 }; // default fallback
}

export default function InteractiveMap({
  destination = 'Destination',
  places = [],
  activePlaceId = null,
  onSelectPlace = () => {},
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [mapMode, setMapMode] = useState('apple'); // 'apple' or 'google'
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter places according to selected category
  const filteredPlaces = places.filter(p => {
    if (filterCategory === 'all') return true;
    return p.sectionKey === filterCategory;
  });

  // Assign deterministic coordinates if none exist
  const cityCenter = getCityCenter(destination);
  const placesWithCoords = filteredPlaces.map((p, idx) => {
    let lat = p.location?.lat;
    let lon = p.location?.lon;
    if (!lat || !lon) {
      // Deterministic spread around city center based on string hash
      const hash = (p.name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const angle = ((hash + idx * 57) % 360) * (Math.PI / 180);
      const radius = 0.02 + ((hash % 100) / 100) * 0.04;
      lat = cityCenter.lat + Math.sin(angle) * radius;
      lon = cityCenter.lon + Math.cos(angle) * radius;
    }
    return { ...p, lat: Number(lat), lon: Number(lon) };
  });

  // Sync activePlaceId when changed from parent
  useEffect(() => {
    if (activePlaceId) {
      const match = placesWithCoords.find(p => p.id === activePlaceId || p.qlooId === activePlaceId);
      if (match) setSelectedPlace(match);
    }
  }, [activePlaceId, placesWithCoords]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isClient || mapMode !== 'apple' || !mapContainerRef.current) return;

    let L;
    let isCancelled = false;

    async function initMap() {
      L = (await import('leaflet')).default;
      if (isCancelled || !mapContainerRef.current) return;

      // Clean up previous map if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }

      const centerCoords = placesWithCoords.length > 0
        ? [placesWithCoords[0].lat, placesWithCoords[0].lon]
        : [cityCenter.lat, cityCenter.lon];

      const map = L.map(mapContainerRef.current, {
        center: centerCoords,
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Apple Dark styled Map Base (Esri World Dark Gray)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      }).addTo(map);

      // Create Custom SVG Pins for every place
      const bounds = L.latLngBounds();

      placesWithCoords.forEach((place, index) => {
        const isSelected = selectedPlace && (selectedPlace.qlooId === place.qlooId || selectedPlace.id === place.id);

        const pinColor = isSelected ? '#2997ff' : '#0071e3';
        const ringGlow = isSelected ? 'box-shadow: 0 0 16px rgba(41, 151, 255, 0.9);' : 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);';

        const customIcon = L.divIcon({
          className: 'apple-map-pin',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: ${pinColor};
              border: 2px solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 700;
              font-size: 13px;
              cursor: pointer;
              transition: all 0.25s cubic-bezier(0.2, 0, 0.2, 1);
              transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'};
              ${ringGlow}
            ">
              ${index + 1}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -20],
        });

        const marker = L.marker([place.lat, place.lon], { icon: customIcon }).addTo(map);
        markersRef.current[place.qlooId || place.id] = marker;
        bounds.extend([place.lat, place.lon]);

        // Apple Glass Popup HTML
        const popupContent = `
          <div style="width: 250px; padding: 14px; font-family: -apple-system, sans-serif;">
            ${place.image ? `<img src="${place.image}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 10px; margin-bottom: 10px;" alt="${place.name}" />` : ''}
            <div style="font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 4px;">
              ${place.name}
            </div>
            <div style="font-size: 11px; color: #30d158; margin-bottom: 6px; font-weight: 500;">
              ✔ Qloo-verified recommendation
            </div>
            <div style="font-size: 12px; color: #aaa; line-height: 1.4; margin-bottom: 10px;">
              ${place.reason || 'Taste-matched place in ' + destination}
            </div>
            <div style="display: flex; gap: 8px;">
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + (safeStr(place.address) || destination))}" target="_blank" rel="noreferrer" style="
                flex: 1;
                background: #0071e3;
                color: #fff;
                padding: 6px 10px;
                border-radius: 980px;
                text-align: center;
                font-size: 11px;
                font-weight: 500;
                text-decoration: none;
                display: inline-block;
              ">
                Google Maps ↗
              </a>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name + ' ' + (safeStr(place.address) || destination))}" target="_blank" rel="noreferrer" style="
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                padding: 6px 10px;
                border-radius: 980px;
                text-align: center;
                font-size: 11px;
                font-weight: 500;
                text-decoration: none;
                display: inline-block;
              ">
                Directions
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          setSelectedPlace(place);
          onSelectPlace(place);
          map.flyTo([place.lat, place.lon], 15, { duration: 0.8 });
        });
      });

      if (placesWithCoords.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, mapMode, filterCategory, placesWithCoords.length]);

  // Focus marker when selectedPlace changes
  useEffect(() => {
    if (!selectedPlace || !mapInstanceRef.current) return;
    const marker = markersRef.current[selectedPlace.qlooId || selectedPlace.id];
    if (marker) {
      marker.openPopup();
      mapInstanceRef.current.flyTo([selectedPlace.lat, selectedPlace.lon], 15, { duration: 0.8 });
    }
  }, [selectedPlace]);

  const activeFocus = selectedPlace || placesWithCoords[0];
  const googleEmbedQuery = activeFocus
    ? encodeURIComponent(`${activeFocus.name}, ${safeStr(activeFocus.address) || destination}`)
    : encodeURIComponent(destination);

  const googleMapsSearchUrl = activeFocus
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeFocus.name + ' ' + (safeStr(activeFocus.address) || destination))}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;

  return (
    <div className="map-container-card">
      {/* Map Control Bar */}
      <div className="map-header">
        <div className="row" style={{ gap: 10 }}>
          <span className="chip chip-map">
            📍 {placesWithCoords.length} places in {destination} (pins approximate)
          </span>

          {/* Category Filter Pills */}
          <div className="row" style={{ gap: 6 }}>
            <button
              className={filterCategory === 'all' ? 'btn-primary' : 'alt'}
              style={{ fontSize: 12, padding: '4px 12px' }}
              onClick={() => setFilterCategory('all')}
            >
              All Places ({places.length})
            </button>
            <button
              className={filterCategory === 'eat' ? 'btn-primary' : 'alt'}
              style={{ fontSize: 12, padding: '4px 12px' }}
              onClick={() => setFilterCategory('eat')}
            >
              🍽️ Dining & Bars
            </button>
            <button
              className={filterCategory === 'hood' ? 'btn-primary' : 'alt'}
              style={{ fontSize: 12, padding: '4px 12px' }}
              onClick={() => setFilterCategory('hood')}
            >
              🏘️ Neighborhoods
            </button>
          </div>
        </div>

        {/* View Toggle Segmented Control */}
        <div className="row" style={{ gap: 6 }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '3px',
              borderRadius: '980px',
              display: 'flex',
              gap: '4px',
            }}
          >
            <button
              onClick={() => setMapMode('apple')}
              style={{
                fontSize: 12,
                padding: '4px 12px',
                borderRadius: '980px',
                background: mapMode === 'apple' ? '#0071e3' : 'transparent',
                color: mapMode === 'apple' ? '#fff' : '#86868b',
                boxShadow: mapMode === 'apple' ? '0 2px 8px rgba(0, 113, 227, 0.4)' : 'none',
              }}
            >
              Interactive Map
            </button>
            <button
              onClick={() => setMapMode('google')}
              style={{
                fontSize: 12,
                padding: '4px 12px',
                borderRadius: '980px',
                background: mapMode === 'google' ? '#0071e3' : 'transparent',
                color: mapMode === 'google' ? '#fff' : '#86868b',
                boxShadow: mapMode === 'google' ? '0 2px 8px rgba(0, 113, 227, 0.4)' : 'none',
              }}
            >
              Google Maps Search
            </button>
          </div>

          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="btn alt"
            style={{ fontSize: 12, padding: '6px 12px' }}
          >
            ↗ Open in Google Maps
          </a>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="map-viewport">
        {mapMode === 'apple' ? (
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        ) : (
          <iframe
            title="Google Maps"
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${googleEmbedQuery}&z=14&output=embed`}
          />
        )}
      </div>

      {/* Venue Fast Picker Carousel */}
      {placesWithCoords.length > 0 && (
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(22, 22, 23, 0.95)',
            borderTop: '1px solid var(--apple-border)',
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
          }}
        >
          {placesWithCoords.map((place, idx) => {
            const isSelected = selectedPlace && (selectedPlace.qlooId === place.qlooId || selectedPlace.id === place.id);
            return (
              <div
                key={place.qlooId || place.id || idx}
                onClick={() => {
                  setSelectedPlace(place);
                  onSelectPlace(place);
                }}
                style={{
                  flex: '0 0 240px',
                  scrollSnapAlign: 'start',
                  background: isSelected ? '#242428' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1px solid #2997ff' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 16px rgba(41, 151, 255, 0.25)' : 'none',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isSelected ? '#2997ff' : '#0071e3',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                {place.image && (
                  <img
                    src={place.image}
                    alt={place.name}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isSelected ? '#fff' : '#e0e0e0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {place.name}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#86868b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {safeStr(place.neighborhood) || safeStr(place.address) || destination}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
