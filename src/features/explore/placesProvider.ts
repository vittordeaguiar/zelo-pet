export type LatLng = {
  latitude: number;
  longitude: number;
};

export type PlacesResult = {
  id: string;
  name: string;
  address?: string;
  rating?: number;
  userRatingCount?: number;
  location?: LatLng;
  types?: string[];
};

type SearchParams = {
  query: string;
  locationBias?: {
    center: LatLng;
    radiusMeters: number;
  };
  languageCode?: string;
  maxResults?: number;
  apiKey: string;
};

const PLACES_ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';

export async function searchPlaces(params: SearchParams): Promise<PlacesResult[]> {
  const body: Record<string, unknown> = {
    textQuery: params.query,
    maxResultCount: params.maxResults ?? 20,
    languageCode: params.languageCode ?? 'pt-BR',
  };

  if (params.locationBias) {
    body.locationBias = {
      circle: {
        center: {
          latitude: params.locationBias.center.latitude,
          longitude: params.locationBias.center.longitude,
        },
        radius: params.locationBias.radiusMeters,
      },
    };
  }

  const response = await fetch(PLACES_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': params.apiKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.types',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Places request failed');
  }

  const data = (await response.json()) as {
    places?: Array<{
      id: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      rating?: number;
      userRatingCount?: number;
      location?: { latitude: number; longitude: number };
      types?: string[];
    }>;
  };

  return (
    data.places?.map((place) => ({
      id: place.id,
      name: place.displayName?.text ?? 'Sem nome',
      address: place.formattedAddress,
      rating: place.rating,
      userRatingCount: place.userRatingCount,
      location: place.location,
      types: place.types,
    })) ?? []
  );
}
