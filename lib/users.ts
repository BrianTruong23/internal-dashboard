import fs from "fs";
import path from "path";

// Path to the JSON file for storing users
const dataFilePath = path.join(process.cwd(), "data", "users.json");

export interface User {
  id: string;
  email: string;
  password: string; // In production, this should be hashed
  name: string;
  role: "admin" | "storeOwner";
  createdAt: Date;
}

// Initial default users
const defaultUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    password: "password",
    name: "Admin User",
    role: "admin",
    createdAt: new Date(),
  },
  {
    id: "2",
    email: "owner@example.com",
    password: "password",
    name: "Store Owner",
    role: "storeOwner",
    createdAt: new Date(),
  },
];

// Helper to ensure data directory and file exist
function ensureDataFile() {
  const dirPath = path.dirname(dataFilePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify(defaultUsers, null, 2));
  }
}

// Helper to read users from file
function readUsers(): User[] {
  ensureDataFile();
  try {
    const data = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users file:", error);
    return defaultUsers;
  }
}

// Helper to write users to file
function writeUsers(users: User[]) {
  ensureDataFile();
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error writing users file:", error);
  }
}

export const userStorage = {
  getAll: () => readUsers(),
  
  findByEmail: (email: string) => {
    const users = readUsers();
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  },
  
  create: (email: string, password: string, name: string, role: "admin" | "storeOwner" = "storeOwner") => {
    const users = readUsers();
    const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      throw new Error("User already exists");
    }
    
    const newUser: User = {
      id: String(users.length + 1),
      email: email.toLowerCase(),
      password, // In production, hash this!
      name,
      role,
      createdAt: new Date(),
    };
    
    users.push(newUser);
    writeUsers(users);
    console.log(`[UserStorage] Created new user: ${email} (${role})`);
    return newUser;
  },
  
  verify: (email: string, password: string) => {
    const users = readUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log(`[UserStorage] Verify failed: User not found (${email})`);
      return null;
    }
    
    // In production, compare hashed passwords
    if (user.password === password) {
      console.log(`[UserStorage] Verify success: ${email}`);
      return user;
    }
    
    console.log(`[UserStorage] Verify failed: Invalid password for ${email}`);
    return null;
  },
};
