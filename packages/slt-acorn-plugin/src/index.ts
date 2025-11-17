import { Parser } from "acorn";
import { sltPlugin } from "./plugin";

export const SLTParser = Parser.extend(sltPlugin);
