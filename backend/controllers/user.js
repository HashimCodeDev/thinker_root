import Application from "../model/UserRegistration.js";
import { uploadToS3, deleteFromS3 } from "../s3config.js";

// CREATE
 const createApplication = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      organization,
      role,
      theme,
      experience,
      skills,
      motivation,
      linkedinLink,
    } = req.body;

    const existingApp = await Application.findOne({ where: { email } });
    if (existingApp) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Handle uploaded files
    const files = req.files || {};
    const linkedinUrl = files.linkedin_screenshot
      ? await uploadToS3(files.linkedin_screenshot[0])
      : null;
    const paymentUrl = files.payment_screenshot
      ? await uploadToS3(files.payment_screenshot[0])
      : null;

    const app = await Application.create({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      organization,
      role,
      preferred_theme: theme,
      experience_level: experience,
      technical_skills: skills,
      motivation,
      linkedin_post_link: linkedinLink,
      linkedin_post_screenshot_url: linkedinUrl,
      payment_screenshot_url: paymentUrl,
    });

    res.status(201).json(app);
  } catch (err) {
    console.error("Error creating application:", err);
    res.status(500).json({ error: "Something went wrong while creating the application" });
  }
};


// READ ALL
const getAllApplications = async (req, res) => {
    try {
        const apps = await Application.findAll();
        res.json(apps);
    } catch (err) {
        console.error("Error fetching applications:", err);
        res.status(500).json({ error: "Failed to fetch applications" });
    }
};

// READ ONE
const getApplicationById = async (req, res) => {
    try {
        const app = await Application.findByPk(req.params.id);
        if (!app) return res.status(404).json({ error: "Application not found" });
        res.json(app);
    } catch (err) {
        console.error("Error fetching application:", err);
        res.status(500).json({ error: "Failed to fetch application" });
    }
};

// COUNT
const getApplicationCount = async (req, res) => {
    try {
        const count = await Application.count();
        res.json({ count });
    } catch (err) {
        console.error("Error counting applications:", err);
        res.status(500).json({ error: "Failed to count applications" });
    }
};

// UPDATE
const updateApplication = async (req, res) => {
    try {
        const app = await Application.findByPk(req.params.id);
        if (!app) return res.status(404).json({ error: "Application not found" });

        // If new files uploaded, delete old ones
        if (req.files) {
            if (req.files.linkedin_screenshot) {
                if (app.linkedin_post_screenshot_url) {
                    await deleteFromS3(app.linkedin_post_screenshot_url);
                }
                req.body.linkedin_post_screenshot_url = await uploadToS3(req.files.linkedin_screenshot[0]);
            }
            if (req.files.payment_screenshot) {
                if (app.payment_screenshot_url) {
                    await deleteFromS3(app.payment_screenshot_url);
                }
                req.body.payment_screenshot_url = await uploadToS3(req.files.payment_screenshot[0]);
            }
        }

        await app.update(req.body);
        res.json(app);
    } catch (err) {
        console.error("Error updating application:", err);
        res.status(500).json({ error: "Failed to update application" });
    }
};

// DELETE
const deleteApplication = async (req, res) => {
    try {
        const app = await Application.findByPk(req.params.id);
        if (!app) return res.status(404).json({ error: "Application not found" });

        if (app.linkedin_post_screenshot_url) await deleteFromS3(app.linkedin_post_screenshot_url);
        if (app.payment_screenshot_url) await deleteFromS3(app.payment_screenshot_url);

        await app.destroy();
        res.json({ message: "Application deleted successfully" });
    } catch (err) {
        console.error("Error deleting application:", err);
        res.status(500).json({ error: "Failed to delete application" });
    }
};

export {
    createApplication,
    getAllApplications,
    getApplicationById,
    getApplicationCount,
    updateApplication,
    deleteApplication,
};
