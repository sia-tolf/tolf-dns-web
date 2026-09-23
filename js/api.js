const API = "https://api.tolf.is";

async function apiRequest(path, options = {}) {
  const response = await fetch(API + path, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.detail || "Request failed");
    error.status = response.status;
    throw error;
  }

  return data;
}
