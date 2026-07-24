const STORAGE_KEY = "khazak-likes";

export function getLikes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function toggleLike(id) {
  const likes = getLikes();
  likes[id] = !likes[id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(likes));
  return likes[id];
}

export function isLiked(id) {
  return !!getLikes()[id];
}

export function likeCount(id, base = 0) {
  return base + (isLiked(id) ? 1 : 0);
}
