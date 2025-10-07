import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');

const readUsers = () => {
    try {
        const data = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading users.json:", error);
        return [];
    }
};

const writeUsers = (users) => {
    try {
         fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing to users.json:", error);
    }
};



export const findAll = () => {
    return readUsers();
};

export const findById = (id) => {
    const users = readUsers();
    return users.find(user => user.id === id);
};

export const findByUsername = (username) => {
    const users = readUsers();
    return users.find(user => user.korisnickoIme === username);
};

export const findByEmail = (email) => {
    const users = readUsers();
    return users.find(user => user.email === email);
};

export const save = (userToSave) => {
    const users = readUsers();
    const userIndex = users.findIndex(user => user.id === userToSave.id);

    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...userToSave };
    } else {
        users.push(userToSave);
    }

    writeUsers(users);
    return userToSave;
};

export const deleteById = (id) => {
    let users = readUsers();
    const initialLength = users.length;
    users = users.filter(user => user.id !== id);

    if (users.length < initialLength) {
        writeUsers(users);
        return true; 
    }
    return false; 
};