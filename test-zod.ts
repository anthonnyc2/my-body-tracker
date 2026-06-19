import { z } from "zod";
import { evaluationSchema } from "./src/types/evaluation";
type Eval = z.infer<typeof evaluationSchema>;
const e: Eval = {} as unknown as Eval;
console.log(e);
