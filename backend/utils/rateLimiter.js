let requests = {};

module.exports = (req, res, next) => {
  const ip = req.ip;

  if (!requests[ip]) requests[ip] = 0;

  requests[ip]++;

  if (requests[ip] > 100) {
    return res.status(429).json({ message: "Too many requests" });
  }

  next();
};
