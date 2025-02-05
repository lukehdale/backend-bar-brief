const axios = require("axios");
const NodeCache = require("node-cache");
const Bar = require("../models/Bar");

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 1800 });

exports.getBarsNearby = async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required" });
  }

  const cacheKey = `bars:${lat},${lng}`;

  const defaultTags = [
    { tagName: "Busy", tagCount: 0, tagCategory: "Crowd" },
    { tagName: "Packed", tagCount: 0, tagCategory: "Crowd" },
    { tagName: "Empty", tagCount: 0, tagCategory: "Crowd" },
    { tagName: "Old Crowd", tagCount: 0, tagCategory: "Age" },
    { tagName: "Young Crowd", tagCount: 0, tagCategory: "Age" },
    { tagName: "Mixed Crowd", tagCount: 0, tagCategory: "Age" },
    { tagName: "Relaxed", tagCount: 0, tagCategory: "Vibe" },
    { tagName: "Party", tagCount: 0, tagCategory: "Vibe" },
    { tagName: "DJ", tagCount: 0, tagCategory: "Entertainment" },
    { tagName: "Band", tagCount: 0, tagCategory: "Entertainment" },
    { tagName: "Quiet", tagCount: 0, tagCategory: "Vibe" },
    { tagName: "Loud", tagCount: 0, tagCategory: "Vibe" },
    { tagName: "Seated", tagCount: 0, tagCategory: "Seating" },
    { tagName: "Standing", tagCount: 0, tagCategory: "Seating" },
    { tagName: "Food", tagCount: 0, tagCategory: "Food" },
    { tagName: "No Food", tagCount: 0, tagCategory: "Food" },
  ];

  try {
    if (cache.has(cacheKey)) {
      console.log("Serving from cache");
      return res.json(cache.get(cacheKey));
    }

    const bars = [];
    let nextPageToken = null;

    const firstPageUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?location=${lat},${lng}&radius=3000&query=bar|brewery|pub|lounge|distillery|winery|night_club|bar_and_grill&key=${process.env.GOOGLE_MAPS_API}`;
    const firstPageResponse = await axios.get(firstPageUrl);
    bars.push(...firstPageResponse.data.results);

    nextPageToken = firstPageResponse.data.next_page_token;

    const fetchPromises = [];

    while (nextPageToken) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${process.env.GOOGLE_MAPS_API}`;
      fetchPromises.push(
        axios.get(url).then((response) => {
          bars.push(...response.data.results);
          nextPageToken = response.data.next_page_token;
        })
      );
    }

    await Promise.all(fetchPromises);

    const tags = defaultTags.map((tag) => ({ ...tag }));

    const formattedBars = bars.map((bar) => {
      const photoUrl =
        bar.photos && bar.photos.length > 0
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${bar.photos[0].photo_reference}&key=${process.env.GOOGLE_MAPS_API}`
          : null;

      return {
        place_id: bar.place_id,
        business_status: bar.business_status || null,
        geometry: {
          location: {
            lat: bar.geometry.location.lat,
            lng: bar.geometry.location.lng,
          },
        },
        icon: bar.icon || null,
        icon_background_color: bar.icon_background_color || null,
        icon_mask_bar_uri: bar.icon_mask_base_uri || null,
        name: bar.name,
        photoUrl,
        photos: bar.photos
          ? bar.photos.map((photo) => ({
              height: photo.height,
              width: photo.width,
              photo_reference: photo.photo_reference,
            }))
          : [],
        price_level: bar.price_level || null,
        types: bar.types || [],
        vicinity: bar.formatted_address || null,
        tags: tags,
      };
    });

    for (const bar of formattedBars) {
      let existingBar = await Bar.findOne({ place_id: bar.place_id });

      if (!existingBar) {
        existingBar = await Bar.create(bar);
      }
      bar._id = existingBar._id;
    }

    cache.set(cacheKey, formattedBars);

    res.json(formattedBars);
  } catch (error) {
    console.error("Error fetching bars:", error.message);
    res.status(500).json({ error: "Failed to fetch bars" });
  }
};
