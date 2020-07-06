import { pipe, pluck, prop, sum } from "ramda";

const teeToPar = (tee) => {
  if (!tee.isValid) {
    console.log(JSON.stringify(tee, null, 2));
    throw new Error(
      `🟥 Sorry, but this course has not provided the necessary hole information needed to calculate handicap scoring.`
    );
  }

  // TODO: Select back/front

  return pipe(prop("holes"), pluck("par"), sum)(tee);
};

export { teeToPar };
