import * as userService from '../services/userService.js';

export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const userProfile = userService.getUserProfile(userId);

        res.json(userProfile);
    } catch (error) {
 
        res.status(404).json({ message: error.message });
    }
};

export const updateBasic = async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedProfile = userService.updateBasicProfile(userId, req.body);
        res.json(updatedProfile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateSensitive = async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedProfile = await userService.updateSensitiveProfile(userId, req.body);
        res.json(updatedProfile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getPublicProfileById = (req, res) => {
    try {
        const { userId } = req.params;
        const viewerId = req.user ? req.user.id : null; 
        
        const publicProfile = userService.getPublicProfile(userId, viewerId);

        res.json(publicProfile);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};