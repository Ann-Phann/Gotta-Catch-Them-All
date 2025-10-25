# Gotta-Catch-Them-All
Pokemon Cards Management

This is the project for COMP SCI 2207, which is clone from our works of private Univeristy of Adelaide repo.

Welcome to the Pokémon Management project! This is a fun and interactive web app where users can:

* **Play games to earn points** 🕹️
* **Use those points to buy their favorite Pokémon** 🔥
* **Explore their personal Pokédex** 📘
* **Manage their account securely** ⚙️

---

## 🚀 Project Setup Instructions

Follow these steps to set up and run the project on your local machine.

### 1. Clone the Repository

To get started, clone the repository using Git:

```bash
git clone https://github.com/Ann-Phann/Gotta-Catch-Them-All.git
```
After cloning, you can open the repository folder. Alternatively, you can download it as a ZIP file and extract it.

### 2. Install Backend Dependency
```bash
cd backend
npm install
```
This will install all required libraries and frameworks based on `package.json`.

Ensure that you have `nvm` installed. As we use `shape` to support `multer`, please check correct `node.js` version or we can upgrade the `node.js`.

This is how you do it:
1. Install `nvm`
If you are on Linux/MacOS:

Open your terminal and run
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```
or
```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Then restart your terminal, and run this to verify:
```bash
command -v nvm
```

If you are on Windows
Download the official nvm for Windows installer from:

👉 https://github.com/coreybutler/nvm-windows/releases

Download the .exe installer, install it, and restart Command Prompt or PowerShell.

To verify:
```bash
nvm version
```

2. Install Node.js using NVM
For example, to install Node.js version 20 (works well with sharp and multer):

```bash
nvm install 20
nvm use 20
```

3. Install `sharp`
```bash
npm install sharp
```

### 3. Start MySQL Service
Make sure your SQL service is running
* Start your server
```bash
sudo service mysql start

# Connect to mysql
mysql -u root -p

# Press enter as the password is empty
```

* Windows:
```bash
service mysql start
```

* MacOS:
```bash
brew services start mysql
```
You can open a separate terminal to interact with the database during runtime.

### 4. Run the Backend Server
While still inside the backend folder, start the development server with:
```bash
npm run dev
```
This will launch the backend using nodemon.

### 5. Port Configuration
Frontend: http://localhost:5500

Backend (API): http://localhost:8080

Ensure these ports are used so the frontend and backend can communicate correctly.

### 6. Admin Account
To access admin features, use the following pre-configured account:
    Username: admin
    Password: adminaA!

For development/testing purposes only. Please secure or update credentials in production.

### 7.  Features
🎮 Game System: Earn points by playing

🛒 Pokémon Shop: Purchase Pokémon with earned points

📖 Pokédex: View and manage your collection

👤 User Management: Register, log in, and update your profile

### Notes
Ensure your MySQL credentials and database settings are correctly configured in your backend (e.g., via .env or config files).

If CORS issues occur, verify that requests from localhost:5500 are allowed in the backend configuration.

Enjoy collecting and managing your Pokémon!
Feel free to contribute or report issues! 😄