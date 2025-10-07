import express from 'express';
import categoryRepository from '../repositories/categoryRepository.js';

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const categories = categoryRepository.findAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Failed to load categories." });
    }
});

router.post('/', (req, res) => {
    try {
        const categories = categoryRepository.findAll();
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: "Category name is required." });
        }
        
        const isDuplicate = categories.some(cat => cat.name.toLowerCase() === name.toLowerCase());
        if (isDuplicate) {
            return res.status(400).json({ message: "Category with this name already exists." });
        }
        
        const newId = categories.length > 0 ? Math.max(...categories.map(c => parseInt(c.id || 0))) + 1 : 1;

        const newCategory = {
            id: String(newId),
            name: name
        };

        categories.push(newCategory);
        categoryRepository.saveAll(categories);

        res.status(201).json(newCategory);
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Failed to create a new category." });
    }
});

export default router;