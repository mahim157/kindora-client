import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { db } from "@/lib/mongodb";

export const auth = betterAuth({
  database: mongodbAdapter(db),

  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins: [
    "http://localhost:3000",

    // Current production URL
    "https://kindora-client-qvje.vercel.app",

    // Stable git branch production URL
    "https://kindora-client-git-main-mahim12.vercel.app",

    // Existing preview URL
    "https://kindora-client-psi.vercel.app",

    // Kindora preview deployments only
    "https://kindora-client-*-mahim12.vercel.app",
  ],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  plugins: [jwt()],
});