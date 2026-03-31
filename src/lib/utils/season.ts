export function getCurrentSeason(): "winter" | "spring" | "summer" | "fall" {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;

  if (currentMonth >= 1 && currentMonth <= 3) return "winter";
  else if (currentMonth >= 4 && currentMonth <= 6) return "spring";
  else if (currentMonth >= 7 && currentMonth <= 9) return "summer";
  else return "fall";
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getSeasonLabel(): string {
  const season = getCurrentSeason();
  const year = getCurrentYear();
  return `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
}
