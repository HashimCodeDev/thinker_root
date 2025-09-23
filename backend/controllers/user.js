import Application from "../model/UserRegistration.js";
import { uploadToS3, deleteFromS3 } from "../s3config.js";

// CREATE
const createApplication = async (req, res) => {
    try {
        const { email } = req.body;

        // ✅ Check if email already exists
        const existingApp = await Application.findOne({ where: { email } });
        if (existingApp) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const files = req.files || {};
        
        // Check multiple possible field names for LinkedIn screenshot
        const linkedinFile = files.linkedin_screenshot?.[0] || 
                           files.linkedinScreenshot?.[0] || 
                           files.linkedin?.[0];
        
        // Check multiple possible field names for payment screenshot
        const paymentFile = files.payment_screenshot?.[0] || 
                          files.paymentScreenshot?.[0] || 
                          files.payment?.[0] ||
                          files.paymentProof?.[0];
        
        const linkedinUrl = linkedinFile ? await uploadToS3(linkedinFile) : null;
        const paymentUrl = paymentFile ? await uploadToS3(paymentFile) : null;

        const app = await Application.create({
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            organization: req.body.organization,
            role: req.body.role,
            preferred_theme: req.body.theme,
            experience_level: req.body.experience,
            technical_skills: req.body.skills,
            motivation: req.body.motivation,
            linkedin_post_link: req.body.linkedinLink,
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
