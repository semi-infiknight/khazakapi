const VALIDATE_URL =
  'https://data.egov.kz/api/v4/fuel_prices/v1?apiKey=__KEY__&source={"size":1}';

export const DATA_EGOV_LINKS = {
  portal: "https://data.egov.kz/",
  samples: "https://data.egov.kz/pages/samples",
  developerCabinet: "https://data.egov.kz/profile/apikeylist",
  register: "https://idp.egov.kz/idp/register.jsp",
  login: "https://data.egov.kz/security/loginwithproposalmodal",
};

export async function validateDataEgovKey(apiKey) {
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
    return { valid: false, error: "API key is required." };
  }

  const key = apiKey.trim();
  if (key.length < 8 || key.length > 256) {
    return { valid: false, error: "API key length looks invalid." };
  }

  const url = VALIDATE_URL.replace("__KEY__", encodeURIComponent(key));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    const text = await res.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text.slice(0, 500) };
    }

    if (res.ok) {
      return {
        valid: true,
        status: res.status,
        message: "Key works — one key unlocks all data.egov.kz datasets in Qazaq Stack.",
      };
    }

    const message =
      body?.error ||
      body?.message ||
      (res.status === 403 ? "API key is invalid." : `Validation failed (HTTP ${res.status}).`);

    return { valid: false, status: res.status, error: message };
  } catch (err) {
    const message = err.name === "AbortError" ? "Validation timed out." : err.message;
    return { valid: false, error: message };
  } finally {
    clearTimeout(timer);
  }
}
