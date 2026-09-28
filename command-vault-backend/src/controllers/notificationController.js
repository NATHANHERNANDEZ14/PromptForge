const Notification = require('../models/Notification');

class NotificationController {
  async getAll(req, res) {
    try {
      const notifs = await Notification.find().sort({ createdAt: -1 }).limit(50);
      res.json(notifs);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching notifications' });
    }
  }

  async markAsRead(req, res) {
    try {
      await Notification.updateMany({ read: false }, { read: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Error updating notifications' });
    }
  }
}

module.exports = new NotificationController();
