import { courseHandicap } from "../course";
import { toPlusMinus } from "../score";

const print = ({ course, golfer, score, tee }) => {
  const courseNetHandicap = courseHandicap({
    courseRating: tee.ratings.course,
    handicapIndex: golfer.handicapIndex,
    par: tee.par,
    slopeRating: tee.ratings.slope,
  });

  const overUnder = score - tee.par;
  const netScore = score - courseNetHandicap;
  const netOverUnder = netScore - tee.par;
  const plusMinus = toPlusMinus(overUnder);
  const netPlusMinus = toPlusMinus(netOverUnder);

  console.log(`
  Golfer:
    Name:     ${golfer.firstName} ${golfer.lastName}
    Handicap: ${golfer.handicapIndex}

  Course:
    Name:          ${course.name}
    Location:      ${course.address}
    Adj. Handicap: ${courseNetHandicap}

  Tees:
    Set:     ${tee.name}
    Par:     ${tee.par}
    Rating:  ${tee.ratings.course}
    Slope:   ${tee.ratings.slope}
    Yardage: ${tee.yards}

  Gross Score: ${score} (${plusMinus})

  Net Score:   ${netScore} (${netPlusMinus})
`);
};

export { print };
