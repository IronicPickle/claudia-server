import config from "@config/config.ts";
import { Application, Router } from "oak";
import { log, logError } from "@utils/generic.ts";
import { ConsoleColor } from "@shared/lib/enums/generic.ts";
import { httpMethodColors } from "@shared/lib/constants/generic.ts";
import { oakCors } from "cors";
import { decodeJwt } from "@utils/api.ts";
import { forbiddenError } from "@shared/lib/utils/api.ts";
import { ObjectId } from "mongo";
import User from "@mongo/schemas/User.ts";
import DiscordUser from "@mongo/schemas/DiscordUser.ts";
import { UserSchema } from "@mongo/schemas/User.ts";
import { DiscordUserSchema } from "@mongo/schemas/DiscordUser.ts";

export interface State {
  sessionUserId?: string;
  session?: {
    user: UserSchema;
    discordUser: DiscordUserSchema;
  };
}

export const createRoute = (callback: (router: Router<State>) => void) => ({
  register: callback,
});

export const app = new Application<State>();
export const router = new Router<State>();

export default async () => {
  app.use(async ({ request }, next) => {
    log(
      ConsoleColor.Green,
      "[Oak]",
      ConsoleColor.Bright,
      httpMethodColors[request.method],
      request.method,
      ConsoleColor.Reset,
      "-",
      ConsoleColor.Cyan,
      request.url.pathname,
      ConsoleColor.Reset
    );

    await next();
  });

  app.use(async ({ state, request }, next) => {
    const jwt = request.headers.get("Authorization")?.replace("BEARER ", "");
    if (jwt) {
      const payload = await decodeJwt(jwt);

      if (payload?.sub) {
        if (payload.sub !== "internal") {
          state.sessionUserId = payload.sub;
          state.session = await fetchUser(payload.sub);
        } else {
          state.sessionUserId = "internal";
        }
      }
    }

    await next();
  });

  await import("./routes.ts");

  app.use(
    oakCors({
      origin: ["http://localhost:5173", "http://localhost:5174"],
      credentials: true,
    })
  );

  app.use(async (ctx, next) => {
    if (
      ctx.request.url.pathname.startsWith("/internal") &&
      ctx.state.sessionUserId !== "internal"
    ) {
      return forbiddenError()(ctx);
    }

    await next();
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.addEventListener("listen", ({ port }) => {
    log(
      ConsoleColor.Green,
      "[Oak]",
      ConsoleColor.Reset,
      `Listening on ${port}`
    );
  });

  app.listen(config.oak.listenOptions);
};

export const fetchUser = async (_id: string) => {
  try {
    const user = await User.findOne(
      {
        _id: new ObjectId(_id),
      },
      {
        projection: {
          discordUserId: 1,
        },
      }
    );

    if (!user) return;

    const discordUser = await DiscordUser.findOne({
      userId: user.discordUserId,
    });

    if (!discordUser) return;

    return { user, discordUser };
  } catch (err) {
    logError(err);
  }
};
