import { any, complement } from "ramda";
import { course, courseHandicap, fetchCourse } from "./course";
import { fetchGolfer, golfer } from "./golfer";
import { toPlusMinus } from "./score";
import { fetchTee, tee } from "./tee";

const { COURSE, GHIN, GOLFER, TEE } = process.env;

const main = async () => {
  const [SCORE] = process.argv.slice(2);
  const score = Math.round(parseInt(SCORE, 10));

  if (any(complement(Boolean), [COURSE, GHIN, GOLFER, TEE])) {
    console.error(
      "🤷‍♂️ COURSE, GHIN, GOLFER, and TEE environment variables not set."
    );

    process.exit(1);
  }

  if (!SCORE) {
    console.error("🤷‍♂️ Score must be provided. E.g., yarn start 84");

    process.exit(1);
  }

  await fetchGolfer(GHIN, GOLFER);
  await fetchCourse(COURSE);
  await fetchTee(TEE);

  const courseNetHandicap = courseHandicap({
    courseRating: tee.Rating.CourseRating,
    handicapIndex: golfer.Value,
    par: tee.Par,
    slopeRating: tee.Rating.SlopeRating,
  });

  const overUnder = score - tee.Par;
  const netScore = score - courseNetHandicap;
  const netOverUnder = netScore - tee.Par;
  const plusMinus = toPlusMinus(overUnder);
  const netPlusMinus = toPlusMinus(netOverUnder);

  console.log(`
  Golfer: ${golfer.PlayerName}

  Course:
    Name:     ${course.CourseName}
    Location: ${course.Facility.GeoLocationFormattedAddress}
    Handicap: ${courseNetHandicap}

  Tees:
    Set:     ${tee.TeeSetRatingName}
    Par:     ${tee.Par}
    Rating:  ${tee.Rating.CourseRating}
    Slope:   ${tee.Rating.SlopeRating}
    Yardage: ${tee.TotalYardage}

  Gross Score: ${score} (${plusMinus})

  Net Score:   ${netScore} (${netPlusMinus})
  `);
};

main();
