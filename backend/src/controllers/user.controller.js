import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs';

import { v2 as cloudinary } from "cloudinary";

const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;

        console.log(username);

        const user = await User.findOne({ username }).select("-password")

        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    }

    catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: error.message });
    }
}

// const getSuggestedUsers = async (req, res) => {
//     try {
//         const userId = req.user._id;

//         const usersFollowedByMe = await User.findById(userId).select("following");

//         const users = await User.aggregate([
//             {
//                 $match: {
//                     _id : {
//                         $ne: userId,
//                     }
//                 }
//             },
//             {
//                 $sample: {
//                     size: 10,
//                 }
//             }
//         ]);

//         const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id));
//         const suggestedUsers = filteredUsers.slice(0, 4);

//         suggestedUsers.forEach(user => user.password = null);

//         return res.status(200).json(suggestedUsers);
//     }

//     catch (error) {
//         console.log(error.message);
//         return res.status(500).json({ error: error.message });
//     }
// }

const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(id.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: "You can't follow/unfollow yourself" });
        }

        if(!userToModify || !currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing) {
            // Unfollow the user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id }})
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id }})

            // Return the id of the user as a response

            res.status(200).json({ message: "User unfollowed successfully" });
        }
        else {
            // Follow the user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id }});
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id }});

            // Send notification to the user
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });

            await newNotification.save();

            // Return the id of the user as a response

            res.status(200).json({ message: "User followed successfully" });
        }
    }

    catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: error.message });
    }
}

const updateUser = async (req, res) => {
    try {
        const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
        let { profileImg, coverImg } = req.body;

        const userId = req.user._id;

        const options = {
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        }

        let user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if((!currentPassword && newPassword) || (!newPassword && currentPassword)) {
            return res.status(400).json({ error: "Please provide both current password and new password" });
        }

        if(currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch) {
                return res.status(400).json({ error: "Current password is incorrect" });
            }

            if(newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be atleast 6 characters" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if(profileImg) {
            const uploadedResponse = await cloudinary.uploader.upload(profileImg, options);
            profileImg = uploadedResponse.secure_url;
        }
        
        if(coverImg) {
            const uploadedResponse = await cloudinary.uploader.upload(coverImg, options);
            coverImg = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        // Password should be null in the response
        user.password = null;

        return res.status(200).json(user);
    }

    catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: error.message });
    }
}

export { getUserProfile, followUnfollowUser, updateUser };