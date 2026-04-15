const ExpressError = require("./ExpressError");
const https = require("https");

function buildLocationQuery({ location, country }) {
  return [location, country]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
    .join(", ");
}

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getResultScore(result, location, country) {
  const normalizedLocation = normalizeValue(location);
  const normalizedCountry = normalizeValue(country);
  const address = result.address || {};

  const candidateFields = [
    address.city,
    address.town,
    address.village,
    address.hamlet,
    address.municipality,
    address.county,
    address.state_district,
    address.state,
    result.name,
  ].map(normalizeValue);

  let score = 0;

  if (normalizeValue(address.country) === normalizedCountry) {
    score += 8;
  } else if (normalizeValue(result.display_name).includes(normalizedCountry)) {
    score += 4;
  }

  if (candidateFields.includes(normalizedLocation)) {
    score += 12;
  } else if (normalizeValue(result.display_name).includes(normalizedLocation)) {
    score += 6;
  }

  if (result.addresstype === "city" || result.addresstype === "town" || result.addresstype === "village") {
    score += 3;
  }

  if (typeof result.importance === "number") {
    score += result.importance;
  }

  return score;
}

function fetchGeocodeResults(query) {
  const searchParams = new URLSearchParams({
    format: "json",
    addressdetails: "1",
    limit: "5",
    q: query,
  });

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: "nominatim.openstreetmap.org",
        path: "/search?" + searchParams.toString(),
        method: "GET",
        headers: {
          "User-Agent": "full-stack-project/1.0",
          Accept: "application/json",
        },
      },
      (response) => {
        let body = "";

        response.on("data", (chunk) => {
          body += chunk;
        });

        response.on("end", () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(new ExpressError("Unable to fetch map coordinates right now", 502));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new ExpressError("Received an invalid geocoding response", 502));
          }
        });
      },
    );

    request.setTimeout(10000, () => {
      request.destroy(new ExpressError("Geocoding request timed out", 504));
    });

    request.on("error", () => {
      reject(new ExpressError("Unable to connect to the geocoding service right now", 502));
    });

    request.end();
  });
}

module.exports = async function geocodeListingLocation(listingInput) {
  const query = buildLocationQuery(listingInput);
  const location = listingInput?.location;
  const country = listingInput?.country;

  if (!query) {
    throw new ExpressError("Location is required to generate map coordinates", 400);
  }

  const results = await fetchGeocodeResults(query);

  if (!Array.isArray(results) || !results.length) {
    throw new ExpressError("Could not find coordinates for the selected location", 400);
  }

  const rankedResults = results
    .map((result) => ({
      result,
      score: getResultScore(result, location, country),
    }))
    .sort((first, second) => second.score - first.score);

  const match = rankedResults[0].result;
  const latitude = Number(match.lat);
  const longitude = Number(match.lon);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new ExpressError("Received invalid map coordinates for this listing", 502);
  }

  return {
    type: "Point",
    coordinates: [longitude, latitude],
  };
};
