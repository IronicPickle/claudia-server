import ky from "../deps/ky.ts";

export const discordApi = ky.create({
  prefixUrl: "https://discord.com/api/v10/",
  hooks: {
    beforeRequest: [],
    beforeError: [
      (error) => {
        return error;
      },
    ],
    beforeRetry: [(options) => {}],
  },
});
