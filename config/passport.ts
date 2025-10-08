
// @ts-nocheck
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import User from "../models/user";
import jwt from "jsonwebtoken";

dotenv.config()
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const email = profile.emails?.[0].value;
          const existing = await User.findOne({ email });

          if (existing) {
            existing.googleId = profile.id;
            existing.isGoogleUser = true;
            existing.avatar = existing.avatar || profile.photos?.[0]?.value;
            user = await existing.save();
          } else {
            user = await User.create({
              name: profile.displayName,
              email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
              isGoogleUser: true,
            });
          }
        }

        const token = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET as string,
          { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        return done(null, { user, token });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport;
