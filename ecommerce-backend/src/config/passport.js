const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/mongo/User");

// Only register the Google strategy if credentials are actually configured.
// This lets students run the rest of the API (JWT auth etc.) without setting up
// a Google Cloud project first - the /api/auth/google routes just won't work until they do.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // 1. Check if a user already signed up with this Google account
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // 2. Or check if the email is already registered normally -> link accounts
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
              user.googleId = profile.id;
              await user.save();
            } else {
              // 3. Otherwise create a brand new user (no password needed for OAuth users)
              user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value || "",
              });
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn(
    "[Passport] Google OAuth not configured - skipping Google strategy (set GOOGLE_CLIENT_ID/SECRET in .env to enable)"
  );
}

// Required by passport even though we're fully stateless (JWT), because
// passport.authenticate() briefly touches session internals during the OAuth redirect flow.
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = passport;
