import axios from "axios";
import Vendor from "../models/vendors";
import SyncLog from "../models/syncLog";

/* Helper: Log sync attempt */
const logSync = async (
  source: string,
  lat: number,
  lng: number,
  count: number,
  success: boolean,
  message?: string
) => {
  await SyncLog.create({
    source,
    lat,
    lng,
    count,
    success,
    message,
  });
};

/* -------------------------------------------------
 * 1. Google Places API
 * ------------------------------------------------- */
export const syncFromGoogle = async (lat: number, lng: number) => {
  try {
    const { data } = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lng}`,
          radius: 5000,
          type: "restaurant|grocery_or_supermarket",
          key: process.env.GOOGLE_PLACES_API_KEY,
        },
      }
    );

    const vendors = data.results.map((place: any) => ({
      name: place.name,
      placeId: place.place_id,
      address: place.vicinity,
      location: {
        type: "Point",
        coordinates: [place.geometry.location.lng, place.geometry.location.lat],
      },
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      image: place.photos
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
        : undefined,
      source: "google",
    }));

    for (const v of vendors) {
      await Vendor.findOneAndUpdate({ placeId: v.placeId }, { $set: v }, { upsert: true, new: true });
    }

    await logSync("google", lat, lng, vendors.length, true);
    return { source: "google", count: vendors.length };
  } catch (error: any) {
    await logSync("google", lat, lng, 0, false, error.message);
    throw error;
  }
};

/* -------------------------------------------------
 * 2. Foursquare API
 * ------------------------------------------------- */
export const syncFromFoursquare = async (lat: number, lng: number) => {
  try {
    const { data } = await axios.get(
      "https://api.foursquare.com/v3/places/nearby",
      {
        params: {
          ll: `${lat},${lng}`,
          radius: 5000,
          categories: "13065,13032",
        },
        headers: {
          Authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}`,
        },
      }
    );

    const vendors = data.results.map((place: any) => ({
      name: place.name,
      placeId: place.fsq_id,
      address: place.location?.formatted_address,
      location: {
        type: "Point",
        coordinates: [place.geocodes.main.longitude, place.geocodes.main.latitude],
      },
      rating: place.rating,
      userRatingsTotal: place.stats?.total_ratings,
      image: place.photos?.[0]
        ? `${place.photos[0].prefix}original${place.photos[0].suffix}`
        : undefined,
      source: "foursquare",
    }));

    for (const v of vendors) {
      await Vendor.findOneAndUpdate({ placeId: v.placeId }, { $set: v }, { upsert: true, new: true });
    }

    await logSync("foursquare", lat, lng, vendors.length, true);
    return { source: "foursquare", count: vendors.length };
  } catch (error: any) {
    await logSync("foursquare", lat, lng, 0, false, error.message);
    throw error;
  }
};

/* -------------------------------------------------
 * 3. HERE Places API
 * ------------------------------------------------- */
export const syncFromHere = async (lat: number, lng: number) => {
  try {
    const { data } = await axios.get(
      "https://discover.search.hereapi.com/v1/discover",
      {
        params: {
          at: `${lat},${lng}`,
          q: "restaurant,grocery,supermarket",
          limit: 50,
          apiKey: process.env.HERE_API_KEY,
        },
      }
    );

    const vendors = data.items.map((place: any) => ({
      name: place.title,
      placeId: place.id,
      address: place.address?.label,
      location: {
        type: "Point",
        coordinates: [place.position.lng, place.position.lat],
      },
      rating: place.averageRating,
      image: place.icon,
      source: "here",
    }));

    for (const v of vendors) {
      await Vendor.findOneAndUpdate({ placeId: v.placeId }, { $set: v }, { upsert: true, new: true });
    }

    await logSync("here", lat, lng, vendors.length, true);
    return { source: "here", count: vendors.length };
  } catch (error: any) {
    await logSync("here", lat, lng, 0, false, error.message);
    throw error;
  }
};

/* -------------------------------------------------
 * 4. OpenStreetMap (Overpass)
 * ------------------------------------------------- */
export const syncFromOSM = async (lat: number, lng: number) => {
  try {
    const query = `
      [out:json];
      (
        node["shop"~"supermarket|grocery"](around:5000,${lat},${lng});
        node["amenity"="restaurant"](around:5000,${lat},${lng});
      );
      out;
    `;

    const { data } = await axios.get("https://overpass-api.de/api/interpreter", {
      params: { data: query },
    });

    const vendors = data.elements.map((place: any) => ({
      name: place.tags?.name || "Unnamed Place",
      placeId: String(place.id),
      address: place.tags?.["addr:full"] || "",
      location: { type: "Point", coordinates: [place.lon, place.lat] },
      source: "osm",
    }));

    for (const v of vendors) {
      await Vendor.findOneAndUpdate({ placeId: v.placeId }, { $set: v }, { upsert: true, new: true });
    }

    await logSync("osm", lat, lng, vendors.length, true);
    return { source: "osm", count: vendors.length };
  } catch (error: any) {
    await logSync("osm", lat, lng, 0, false, error.message);
    throw error;
  }
};

/* -------------------------------------------------
 * 5. Fallback Wrapper
 * ------------------------------------------------- */
export const syncVendors = async (lat: number, lng: number) => {
  try {
    return await syncFromGoogle(lat, lng);
  } catch (err) {
    console.warn("❌ Google failed:", (err as any).message);
    try {
      return await syncFromFoursquare(lat, lng);
    } catch (err2) {
      console.warn("❌ Foursquare failed:", (err2 as any).message);
      try {
        return await syncFromHere(lat, lng);
      } catch (err3) {
        console.warn("❌ HERE failed:", (err3 as any).message);
        return await syncFromOSM(lat, lng);
      }
    }
  }
};
