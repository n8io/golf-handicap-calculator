import chalk from "chalk";
import fuzzy from "fuzzy";
import inquirer from "inquirer";
import autocomplete from "inquirer-autocomplete-prompt";
import {
  always,
  curry,
  evolve,
  map,
  omit,
  pick,
  pipe,
  prop,
  propOr,
  trim,
  values,
} from "ramda";
import { HolesPlayed, STATE, WhichNine } from "../constants";
import { fetchCourseDetails, fetchCourses } from "../course";
import { fetchGolfer } from "../golfer";
import { teeToPar } from "../par";
import { teesToTeeChoices } from "../tee";
import { states } from "../states";

inquirer.registerPrompt("autocomplete", autocomplete);

const ghin = {
  default: always(process.env.GHIN),
  message: "What is your ghin number?",
  name: "ghin",
  type: "number",
};

const lastName = {
  default: always(process.env.GOLFER),
  message: "What is your last name?",
  name: "lastName",
  transformer: (v) => chalk.cyan(v),
  type: "input",
  validate: pipe(trim, Boolean),
};

const search = curry((choices, _answers, input) => {
  const result = fuzzy.filter(input || "", choices, {
    extract: prop("name"),
  });

  return Promise.resolve(result.map((el) => el.original));
});

const coursesToChoices = pipe(
  map(pick(["CourseID", "CourseName", "City", "UpdatedOn"])),
  map(
    ({
      CourseID: id,
      CourseName: name,
      City,
      State = STATE,
      UpdatedOn: lastModified,
    }) => {
      const address = `${City}, ${State.split("-")[1]}`;

      return {
        name: `${name}, ${address} (Last modified: ${lastModified})`,
        value: id,
      };
    }
  )
);

const selectCourse = (courses) => {
  const choices = coursesToChoices(courses);

  return {
    message: "Where did you play?",
    name: "courseId",
    source: search(choices),
    type: "autocomplete",
  };
};

const selectTee = (course) => {
  const choices = teesToTeeChoices(course.tees);

  return {
    message: "What tee did you play?",
    name: "tee",
    source: search(choices),
    type: "autocomplete",
  };
};

const selectHolesPlayed = {
  choices: [HolesPlayed.EIGHTEEN, HolesPlayed.NINE],
  default: HolesPlayed.EIGHTEEN,
  message: "How many holes did you play?",
  name: "holesPlayed",
  type: "list",
};

const teeToWhichNineChoice = pipe(
  prop("ratings"),
  omit(["total"]),
  map((rating) => ({
    name: rating.name,
    value: rating,
  })),
  values
);

const selectWhichNine = {
  choices: ({ tee }) => teeToWhichNineChoice(tee),
  default: ({ tee }) => teeToWhichNineChoice(tee)[0],
  message: "Which 9 did you play?",
  name: "whichNine",
  type: "list",
  when: ({ holesPlayed }) => holesPlayed === HolesPlayed.NINE,
};

const selectGrossScore = {
  message: "What did you shoot?",
  name: "score",
  type: "number",
};

const selectHandicap = (golfer) => ({
  default: golfer.handicapIndex,
  message: "What was your handicap?",
  name: "handicap",
  type: "number",
});

const selectState = {
  message: "In what state did you play?",
  name: "state",
  source: search(states),
  type: "autocomplete",
};

const ask = async () => {
  const { ghin: ghinNumber, lastName: familyName } = await inquirer.prompt([
    ghin,
    lastName,
  ]);

  const golfer = await fetchGolfer(ghinNumber, familyName);
  const { handicap, state } = await inquirer.prompt([
    selectHandicap(golfer),
    selectState,
  ]);

  // Set in case the handicap entered is different
  golfer.handicapIndex = handicap;

  const courses = await fetchCourses(state);
  const { courseId } = await inquirer.prompt([selectCourse(courses)]);
  const course = await fetchCourseDetails(courseId);

  const { holesPlayed, score, tee: tmpTee, whichNine } = await inquirer.prompt([
    selectTee(course),
    selectHolesPlayed,
    selectWhichNine,
    selectGrossScore,
  ]);

  // console.log({ holesPlayed, score, tee: tmpTee, whichNine });

  const tee = evolve({
    par: () => teeToPar(tmpTee),
    ratings: () => tmpTee.ratings[propOr(WhichNine.TOTAL, "key", whichNine)],
  })(tmpTee);

  // console.log({ course, holesPlayed, score, tee, whichNine });

  return { course, golfer, holesPlayed, score, tee };
};

export { ask };
