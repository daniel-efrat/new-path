const jwt = require("jsonwebtoken");

// Use the exact same secret as GOTRUE_JWT_SECRET / SERVICE_PASSWORD_JWT
const secret = process.env.GOTRUE_JWT_SECRET || "REPLACE_WITH_YOUR_SECRET";

function gen(role) {
  return jwt.sign(
    {
      role, // "anon" or "service_role"
      iss: "supabase",
      aud: "authenticated",
    },
    secret,
    { algorithm: "HS256" }
  );
}

console.log("ANON KEY:\n", gen("anon"));
console.log("\nSERVICE ROLE KEY:\n", gen("service_role"));
