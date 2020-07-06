import chalk from "chalk";
import {
  defaultTo,
  descend,
  equals,
  find,
  isEmpty,
  map,
  pipe,
  pluck,
  prop,
  propEq,
  propOr,
  reduce,
  sort,
  sum,
  toLower,
} from "ramda";
import { API_URL, Gender, HolesPlayed, toGender } from "./constants";
import { course } from "./course";
import { fetchWithAuth } from "./fetchWithAuth";

let tee = null;

const fetchTee = (name) => {
  const tmpTee = pipe(
    prop("TeeSets"),
    find(
      pipe(
        prop("TeeSetRatingName"),
        toLower,
        equals(pipe(defaultTo(""), toLower)(name))
      )
    )
  )(course);

  const rating = pipe(
    prop("Ratings"),
    find(propEq("RatingType", "Total"))
  )(tmpTee);

  tee = {
    ...tmpTee,
    Par: pipe(pluck("Par"), sum)(tmpTee.Holes),
    Rating: rating,
  };
};

const TeeColor = (name) => {
  const lower = name.toLowerCase();

  const Color = {
    blue: chalk.white.bgBlue,
    gold: chalk.black.bgKeyword("gold"),
    green: chalk.white.bgHex("#2f8c4e"), // darker green
    purple: chalk.white.bgKeyword("purple"),
    red: chalk.white.bgRed,
    unknown: chalk.white.bgBlack,
    white: chalk.black.bgWhite,
  };

  const chalkFn = Color[lower] || Color.unknown;

  return chalkFn;
};

const teeNameToColor = ({ gender, holesCount, name }) => {
  const DisplayName = {
    [Gender.FEMALE]: " (W)",
    [Gender.MALE]: " (M)",
    [Gender.UNKNOWN]: "",
  };

  const countText = holesCount ? ` ${holesCount}` : "";
  const teeName = ` ${name} `;

  try {
    const colorFn = TeeColor(name);

    return `${colorFn(teeName)}${countText}${DisplayName[gender]}`;
  } catch (e) {
    return `${teeName}${countText}${DisplayName[gender]}`;
  }
};

const teeSetToNormalized = pipe((tee) => {
  const {
    Gender: tmpGender,
    Holes: tmpHoles,
    HolesNumber: numberOfHoles,
    Ratings,
    TeeSetRatingId: id,
    TeeSetRatingName: name,
    TotalYardage: yards,
  } = tee;

  const gender = toGender(tmpGender);

  const ratings = reduce((acc, rating) => {
    const name = rating.RatingType;
    const key = name.toLowerCase();

    return {
      ...acc,
      [key]: {
        course: rating.CourseRating,
        gender,
        id,
        key,
        name,
        slope: rating.SlopeRating,
      },
    };
  }, {})(Ratings);

  const holes = map((h) => ({
    handicap: h.Allocation,
    id: h.HoleId,
    length: h.Length,
    number: h.HoleNumber,
    par: h.Par,
  }))(tmpHoles);

  const displayName = teeNameToColor({ gender, holeCount: holes.length, name });

  const isNine = numberOfHoles === 9;
  const isValid = !isEmpty(holes);
  const key = name.toLowerCase();
  const par = pipe(map(propOr(0, "Par")), sum)(holes);

  return {
    displayName,
    gender,
    holes,
    id,
    isNine,
    isValid,
    key,
    name,
    par,
    ratings,
    yards,
  };
});

const courseToTeeSets = pipe(
  prop("TeeSets"),
  map(teeSetToNormalized),
  sort(descend(prop("yards")))
);

const teesToTeeChoices = map((tee) => ({
  name: tee.displayName,
  value: tee,
}));

const fetchCourseTees = async ({
  courseId,
  gender = Gender.UNKNOWN,
  numberOfHoles = HolesPlayed.UNKNOWN,
}) => {
  const pathname = `/api/v1/courses/${courseId}/tee_set_ratings.json`;
  const uri = new URL(pathname, API_URL);

  uri.searchParams.set("gender", gender);
  uri.searchParams.set("number_of_holes", numberOfHoles);

  const { data } = await fetchWithAuth(uri);

  return courseToTeeSets(data);
};

export { courseToTeeSets, fetchCourseTees, fetchTee, tee, teesToTeeChoices };
