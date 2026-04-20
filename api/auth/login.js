import connectDB from "../../backend/src/config/db.js";
import { loginAdmin } from "../../backend/src/controllers/authController.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();
    loginAdmin(req, res);
  } catch (error) {
    console.error("Login handler error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
