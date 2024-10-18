import { Notification } from "../models/notification.model.js";

const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({ to: userId }).populate({ path: "from", select: "username profileImg" });

        await Notification.updateMany({ to: userId }, { read: true });

        return res.status(500).json(notifications);
    }

    catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
}

const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.deleteMany({ to: userId });

        return res.status(500).json({ message: "Notifications deleted successfully" });
    }

    catch (error) {
        console.log(error.message);
        return res.status(200).json({ error: "Internal server error" });
    }
}

const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;


        const userId = req.user._id;

        const notification = await Notification.findById(notificationId);

        if(!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        if(notification.to.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You are not allowed to delete this notification" });
        }

        await Notification.findByIdAndDelete(notificationId);
        
        return res.status(200).json({ message: "Notification deleted successfully" });
    }

    catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export { deleteNotification, getNotifications, deleteNotifications };