import axios from "axios";
import { defaultTo, last, pipe } from "ramda";
import { API_URL, toGender } from "./constants";
import { setToken } from "./token";

const pathname = "/api/v1/public/login.json";
const uri = new URL(pathname, API_URL);

let golfer = null;

const normalize = (g) => ({
  association: g.AssocName,
  firstName: g.FirstName,
  gender: toGender(g.Gender),
  handicapIndex: parseFloat(g.Value, 10),
  homeCourse: {
    id: parseInt(g.ClubId, 10),
    name: g.ClubName,
  },
  id: parseInt(g.GHINNumber, 10),
  lastName: g.LastName,
  revDate: `${g.RevDate}Z`,
});

const fetchGolfer = async (ghin, lastName) => {
  uri.searchParams.set("ghinNumber", ghin);
  uri.searchParams.set("lastName", lastName);
  uri.searchParams.set("remember_me", true);

  const { data } = await axios.get(uri.href);
  const { golfers } = data;

  golfer = pipe(defaultTo([]), last)(golfers);

  const { NewUserToken: token } = golfer;

  setToken(token);

  return normalize(golfer);
};

export { fetchGolfer, golfer };
