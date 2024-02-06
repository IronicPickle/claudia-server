import ky from "ky";

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
