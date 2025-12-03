export async function fetchWithFallback(url, options = {}) {
  const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  try {
    const response = await fetch(API + url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
      return response.json();
    }

    return response;
  } catch (err) {
    console.error("Error en fetchWithFallback:", err);
    throw err;
  }
}
