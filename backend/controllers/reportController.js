import * as reportService from '../services/reportService.js';

export const postReport = (req, res) => {
    try {
        const reporterId = req.user.id; 
        const newReport = reportService.createReport(req.body, reporterId);
        res.status(201).json(newReport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAll = (req, res) => {
    try {
        const allReports = reportService.getAllReports();
        res.json(allReports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const accept = (req, res) => {
    try {
        const updatedReport = reportService.acceptReport(req.params.id);
        res.json(updatedReport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const reject = (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason || reason.trim() === '') {
            throw new Error("The reason for rejection is mandatory.");
        }
        const updatedReport = reportService.rejectReport(req.params.id, reason);
        res.json(updatedReport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};