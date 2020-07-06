export const API_URL = "https://api.ghin.com/";
export const STATE = "US-OH";
export const COUNTRY = "USA";

export const Gender = {
  FEMALE: "W",
  MALE: "M",
  UNKNOWN: "",
};

export const toGender = (g) => {
  const isMale = (g || "").toLowerCase().startsWith("m");
  const isFemale = (g || "").toLowerCase().startsWith("m");

  if (isMale) return Gender.MALE;
  if (isFemale) return Gender.FEMALE;

  return Gender.UNKNOWN;
};

export const HolesPlayed = {
  NINE: 9,
  EIGHTEEN: 18,
  UNKNOWN: 18,
};

export const WhichNine = {
  BACK: "back",
  FRONT: "front",
  TOTAL: "total",
  UNKNOWN: "unknown",
};
