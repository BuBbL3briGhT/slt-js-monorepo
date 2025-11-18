import { Parser } from "acorn";
import { sltPlugin } from "./plugin";

export const SLTParser = sltPlugin(Parser);
