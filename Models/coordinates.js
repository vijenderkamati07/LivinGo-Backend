module.exports = async function getCoordinates(cityName) {
  try {

    let cleanCity = cityName.trim().toLowerCase();
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanCity)}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "AirbnbClone/1.0 (kumar@gmail.com)"
      }
    });

    const data = await res.json();

    if (!data || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };

  } catch (err) {
    console.log("Error fetching city coordinates:", err);
    return null;
  }
};
