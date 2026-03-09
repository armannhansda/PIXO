import {TRPCError} from "@trpc/server";
import { middleware } from "../trpc";
import { ratelimit } from "@/lib/rate-limit";

export const rateLimitMiddleware = middleware(async({ ctx, next}) => {
  const ip = ctx.headers.get("x-forwarded-for") ?? "anonymous";

  const {success} = await ratelimit.limit(ip);

  if(!success){
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again later.",
    });
  }

  return next();
})