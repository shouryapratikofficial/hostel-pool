const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

const router = express.Router();

// Get unread notifications for a user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id, read: false }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- YEH HAI NAYA ROUTE ---
// Mark a single notification as read
router.patch('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id }, // Sirf apne hi notification ko mark kar sakte ho
            { read: true },
            { new: true } // updated document wapas bhejta hai
        );
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// --- NAYA ROUTE KHATAM ---

// Mark all notifications as read for a user
router.patch('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;