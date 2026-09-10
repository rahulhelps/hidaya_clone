// Location resolution + qibla bearing math.
// Default city is Dhaka; users can pick from a small curated list or use the
// browser geolocation API. Persisted to localStorage.

export type Coords = { lat: number; lng: number };
export type Place = { id: string; city: string; country: string } & Coords;

export const KAABA: Coords = { lat: 21.4225, lng: 39.8262 };

export const CITIES: Place[] = [
  { id: "dhaka", city: "Dhaka", country: "Bangladesh", lat: 23.8103, lng: 90.4125 },
  { id: "chattogram", city: "Chattogram", country: "Bangladesh", lat: 22.3569, lng: 91.7832 },
  { id: "sylhet", city: "Sylhet", country: "Bangladesh", lat: 24.8949, lng: 91.8687 },
  { id: "khulna", city: "Khulna", country: "Bangladesh", lat: 22.8456, lng: 89.5403 },
  { id: "rajshahi", city: "Rajshahi", country: "Bangladesh", lat: 24.3636, lng: 88.6241 },
  { id: "mecca", city: "Makkah", country: "Saudi Arabia", lat: 21.3891, lng: 39.8579 },
  { id: "medina", city: "Madinah", country: "Saudi Arabia", lat: 24.5247, lng: 39.5692 },
  { id: "london", city: "London", country: "United Kingdom", lat: 51.5072, lng: -0.1276 },
  { id: "newyork", city: "New York", country: "United States", lat: 40.7128, lng: -74.006 },
  { id: "kualalumpur", city: "Kuala Lumpur", country: "Malaysia", lat: 3.139, lng: 101.6869 },
  { id: "istanbul", city: "Istanbul", country: "Türkiye", lat: 41.0082, lng: 28.9784 },
  { id: "dubai", city: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
];

export const DEFAULT_PLACE: Place = CITIES[0];

const PLACE_KEY = "hidayah_place";

export function loadPlace(): Place {
  if (typeof window === "undefined") return DEFAULT_PLACE;
  try {
    const raw = localStorage.getItem(PLACE_KEY);
    if (!raw) return DEFAULT_PLACE;
    const p = JSON.parse(raw) as Place;
    if (typeof p.lat === "number" && typeof p.lng === "number" && p.city) return p;
  } catch {
    /* ignore */
  }
  return DEFAULT_PLACE;
}

export function savePlace(p: Place): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLACE_KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("hidayah-place-change"));
}

export function detectLocation(): Promise<Place> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation not available"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const place: Place = {
          id: "current",
          city: "Current location",
          country: "",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        resolve(place);
      },
      (err) => reject(new Error(err.message || "Permission denied")),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  });
}

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Initial great-circle bearing (degrees from true north) toward the Kaaba. */
export function qiblaBearing(from: Coords): number {
  const phi1 = toRad(from.lat);
  const phi2 = toRad(KAABA.lat);
  const dLng = toRad(KAABA.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Great-circle distance to the Kaaba in kilometres. */
export function qiblaDistanceKm(from: Coords): number {
  const R = 6371;
  const dLat = toRad(KAABA.lat - from.lat);
  const dLng = toRad(KAABA.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(KAABA.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
