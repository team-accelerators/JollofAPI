import axios from "axios";
import Vendor from "../models/vendors";

export const syncVendorsFromGoogle = async (lat: number, lng: number) => {
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

  for (const place of data.results) {
    const vendorData = {
      name: place.name,
      placeId: place.place_id,
      address: place.vicinity,
      location: {
        type: "Point",
        coordinates: [
          place.geometry.location.lng,
          place.geometry.location.lat,
        ],
      },
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      image: place.photos
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`
        : undefined,
    };

    await Vendor.findOneAndUpdate(
      { placeId: place.place_id },
      { $set: vendorData },
      { upsert: true, new: true }
    );
  }

  return { count: data.results.length };
};
