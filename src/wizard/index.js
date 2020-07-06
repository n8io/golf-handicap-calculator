import inquirer from "inquirer";
import { ask } from "./questions";
import { fetchGolfer } from "../golfer";
import { print } from "./print";

const main = async () => {
  const answers = await ask();

  print(answers);
};

main();
