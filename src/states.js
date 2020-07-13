import json from "./data/states";

const states = Object.keys(json).map((name) => ({
  name,
  value: `US-${name.toUpperCase()}`,
}));

export { states };
