const bcrypt = require("bcryptjs");
const supabase = require("../config/supabase");
const generateToken = require("../utils/generateToken");

// SIGNUP
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([{ name, email, password: hashedPassword }]);

  if (error) return res.status(400).json({ error: error.message });

  res.json({
    message: "User registered",
  });
};

// LOGIN
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data)
    return res.status(400).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, data.password);

  if (!isMatch)
    return res.status(400).json({ error: "Invalid credentials" });

  res.json({
    token: generateToken(data.id),
    user: {
      id: data.id,
      email: data.email,
      name: data.name,
    },
  });
};
