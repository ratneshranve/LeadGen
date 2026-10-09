/**
 * Creates (or updates) the phone + OTP login accounts for the admin and sales portals.
 * Safe to re-run: users are matched by the last 10 digits of their phone number.
 *
 *   node src/scripts/seedLoginUsers.js
 */
require("../../config/env");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../models/User.model");

const LOGIN_USERS = [
  { name: "Ratnesh Ranve", phone: "9770133148", role: "admin", email: "ratnesh.ranve@leadgen.app" },
  { name: "Trisha Mishra", phone: "8839044030", role: "salesperson", email: "trisha.mishra@leadgen.app" },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const entry of LOGIN_USERS) {
    const phone = `+91${entry.phone}`;
    const existing = await User.findOne({ phone: { $regex: `${entry.phone}$` } });

    if (existing) {
      existing.name = entry.name;
      existing.role = entry.role;
      existing.status = "active";
      await existing.save();
      console.log(`Updated ${entry.name} (${phone}) as ${entry.role}`);
    } else {
      // Login is OTP-only, so the (required) password is a random unusable value.
      await User.create({
        name: entry.name,
        email: entry.email,
        phone,
        passwordHash: crypto.randomBytes(24).toString("hex"),
        role: entry.role,
        status: "active",
      });
      console.log(`Created ${entry.name} (${phone}) as ${entry.role}`);
    }
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Failed to seed login users:", err.message);
  process.exit(1);
});
