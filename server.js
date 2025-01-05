import dotenv from "dotenv";
import express from "express";
import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";

import * as AdminJSMongoose from "@adminjs/mongoose";
import { connect, model, Schema } from "mongoose";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import Listing from "./models/Listing.js";
import Location from "./models/Location.js";
import User from "./models/User.js";

dotenv.config();

// Connect to MongoDB
try {
  connect("mongodb://127.0.0.1:27018/classifieds", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1);
}

// Register AdminJS adapter for Mongoose
AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

// Setup AdminJS
const adminJs = new AdminJS({
  resources: [
    { resource: Listing },
    { resource: Location },
    { resource: User },
  ],
  rootPath: "/admin",
});
console.log("AdminJS initialized");

const allowedEmails = process.env.ALLOWED_EMAILS.split(',');

// Passport setup for Google authentication
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      if (allowedEmails.includes(profile.emails[0].value)) {
        return done(null, profile);
      } else {
        return done(null, false, { message: "Unauthorized" });
      }
    }
  )
);
console.log("Passport GoogleStrategy initialized");

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
console.log("Passport serialization setup");

// Initialize Express app
const app = express();
console.log("Express app initialized");

// Setup session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
console.log("Session middleware setup");

app.use(passport.initialize());
app.use(passport.session());
console.log("Passport middleware setup");

// Routes for Google OAuth
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
console.log("Google OAuth route setup");

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure" }),
  (req, res) => {
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        return res.status(500).send("Error saving session");
      }
      res.redirect("/admin");
    });
  }
);

console.log("Google OAuth callback route setup");

app.get("/auth/failure", (req, res) => res.send("Failed to authenticate"));
console.log("Auth failure route setup");

// Middleware to ensure user is authenticated before accessing AdminJS
app.use(adminJs.options.rootPath, (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/google");
});

console.log("AdminJS router setup");

app.use(adminJs.options.rootPath, (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/google");
});

// Mount AdminJS at rootPath
app.use(adminJs.options.rootPath, AdminJSExpress.buildRouter(adminJs));
console.log(`AdminJS mounted at ${adminJs.options.rootPath}`);

// Start the server
app.listen(3002, () => {
  console.log("AdminJS running at http://localhost:3002/admin");
});
console.log("Server started");
