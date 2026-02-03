const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin/Admins");
const Invitation = require("../models/Admin/Invitation");
const { sendInvitationEmail } = require("../utils/emailService");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const invitation = await Invitation.findOne({ token, accepted: false });

    if (!invitation) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token has expired" });
    }

    res.json({
      email: invitation.email,
      role: invitation.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.sendInvitation = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role)
      return res.status(400).json({ message: "Email and role required" });

    // Delete any expired invitations for this email first
    await Invitation.deleteMany({
      email,
      accepted: false,
      expiresAt: { $lt: new Date() }
    });

    // Now check for existing valid (non-expired) invitations
    const existingInvite = await Invitation.findOne({ 
      email, 
      accepted: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (existingInvite)
      return res.status(400).json({ message: "Invitation already sent and still valid" });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await Invitation.create({ email, role, token, expiresAt });

    const invitationLink = `${FRONTEND_URL}/admin/register?token=${token}`;

    // Send email invitation
    await sendInvitationEmail(email, invitationLink);

    res.status(200).json({ message: "Invitation sent via email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.registerAdmin = async (req, res) => {
  try {
    const { token, name, email, phone, address, image, password } = req.body;

    if (!token || !name || !email || !password)
      return res.status(400).json({ message: "Missing required fields" });

    const invite = await Invitation.findOne({ token, email, accepted: false });
    if (!invite)
      return res
        .status(400)
        .json({ message: "Invalid or expired invitation token" });
    if (invite.expiresAt < new Date())
      return res.status(400).json({ message: "Invitation token has expired" });

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res
        .status(400)
        .json({ message: "Admin with this email already registered" });

    const admin = new Admin({
      name,
      email,
      phone: phone || "",
      address: address || "",
      image: image || "", // Store base64 string directly
      role: invite.role,
      password,
      isActive: true,
      invitationToken: token,
      invitationExpiresAt: invite.expiresAt,
    });

    await admin.save();

    invite.accepted = true;
    await invite.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const admin = await Admin.findOne({ email });
    if (!admin || !admin.isActive)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const payload = { id: admin._id, role: admin.role, email: admin.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({ token, admin: payload });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
    // Fetch admins and editors in parallel (much faster)
    const [admins, editors] = await Promise.all([
      Admin.find(
        { role: "admin" },
        "-password -invitationToken -invitationExpiresAt"
      ).lean(),

      Admin.find(
        { role: "editor" },
        "-password -invitationToken -invitationExpiresAt"
      ).lean(),
    ]);

    res.json({ admins, editors });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({ message: "Server error" });
  }
};
