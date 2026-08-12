// geography.js - helper functions for geographic conversions and distance calculations
import * as THREE from '/libs/three/three.module.js';

// Converts latitude/longitude (degrees) to a THREE.Vector3 on a sphere of given radius.
// Latitude: -90 (south pole) .. +90 (north pole)
// Longitude: -180 .. +180 (east positive)
// Orientation: X to 0° lon, Z to north? We'll use the convention:
// - longitude 0 maps to +Z axis (0,0, radius)
// - longitude positive rotates toward +X
// - latitude 0 at equator, positive north

export function latLonToVector3(latitude, longitude, radius){
  const latRad = THREE.MathUtils.degToRad(latitude);
  const lonRad = THREE.MathUtils.degToRad(longitude);

  // theta = 90 - latitude
  const theta = (Math.PI / 2) - latRad;
  const phi = lonRad;

  const x = radius * Math.sin(theta) * Math.cos(phi);
  const y = radius * Math.cos(theta);
  const z = radius * Math.sin(theta) * Math.sin(phi);

  return new THREE.Vector3(x, y, z);
}

// Haversine formula to calculate great-circle distance (in kilometers) between two lat/lon points
export function calculateDistance(origin, destination){
  const R = 6371; // Earth radius in km
  const lat1 = origin.latitude * Math.PI/180;
  const lat2 = destination.latitude * Math.PI/180;
  const dLat = (destination.latitude - origin.latitude) * Math.PI/180;
  const dLon = (destination.longitude - origin.longitude) * Math.PI/180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return d; // km
}
