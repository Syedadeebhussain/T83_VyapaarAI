const { getDashboardStats } = require("../services/analyticsService");

exports.getStats = async (req, res) => {
  const stats = await getDashboardStats();
  res.json(stats);
};
