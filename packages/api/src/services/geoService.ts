import { distanceBetweenCoords, isWithinVenueRadius } from '@coolcliq/shared';
import { VENUE_RADIUS_METERS } from '@coolcliq/shared';

export { distanceBetweenCoords, isWithinVenueRadius, VENUE_RADIUS_METERS };

export function validateGps(
  userLat: number,
  userLng: number,
  venueLat: number,
  venueLng: number
): { valid: boolean; distanceMeters: number } {
  const distanceMeters = distanceBetweenCoords(userLat, userLng, venueLat, venueLng);
  const valid = distanceMeters <= VENUE_RADIUS_METERS;
  return { valid, distanceMeters };
}
