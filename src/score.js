import chalk from "chalk";

const toPlusMinus = (overUnder) => {
  let plusMinus = chalk.red(overUnder);

  if (overUnder > 0) {
    plusMinus = chalk.yellow(`+${overUnder}`);
  } else if (overUnder === 0) {
    plusMinus = chalk.cyan(`E`);
  }

  return plusMinus;
};

export { toPlusMinus };
