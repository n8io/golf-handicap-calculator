import { flatten, map, pipe, pluck, take } from "ramda";
import { fetchCourses, fetchCourseByName } from "./course";
import { fetchGolfer } from "./golfer";
import { fetchCourseTees } from "./tee";

import chalk from "chalk";

const teeSetsToTeeNames = pluck("name");

const main = async () => {
  // const ghin = 1750968;
  // const lastName = "Dilyard";

  // // login
  // const golfer = await fetchGolfer(ghin, lastName);

  // const course = await fetchCourseByName("Chippewa Golf Club");

  console.log(
    `${chalk.white.bgKeyword("purple")(" PURPLE ")} ${chalk
      .keyword("pink")
      .bgBlack("(W)")}`
  );
};

main();
