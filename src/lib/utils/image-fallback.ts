export const getImageWithFallback = (imageUrl: string | null | undefined): string => {
  if (imageUrl?.includes("apple-touch-icon") || !imageUrl) {
    return "/placeholder.png";
  }
  return imageUrl;
};
