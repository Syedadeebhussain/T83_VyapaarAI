const requiredEnv = ["PORT", "JWT_SECRET"];

requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    console.warn(`${env} is missing`);
  }
});
