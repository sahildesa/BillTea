# BillTea Mobile App

Welcome to the BillTea Mobile App repository! This guide is written for **complete beginners**—even if you have never written a line of code, you will be able to get this app running on your phone in just a few minutes.

---

## 🛠️ What You Need First (Prerequisites)

Before starting, make sure you have the following ready:

1. **Node.js**: This is a program that lets your computer run JavaScript.
   - Go to [nodejs.org](https://nodejs.org/) and download the **"LTS" (Long Term Support)** version.
   - Run the installer and click "Next" through all the default options until it is finished.

2. **Expo Go (On Your Phone)**: This is an app that lets you view and test the mobile app directly on your physical smartphone without needing complicated emulator setups.
   - **Android users**: Open the Google Play Store and download **"Expo Go"**.
   - **iPhone users**: Open the Apple App Store and download **"Expo Go"**.

3. **Your Computer and Phone must be on the same Wi-Fi network**.

---

## 🚀 Step-by-Step Setup Guide

Follow these steps carefully to start the app.

### Step 1: Open the Terminal
You need to open a command line tool on your computer.
- **Windows**: Press the `Windows Key`, type `cmd`, and press Enter to open the Command Prompt.
- **Mac**: Press `Cmd + Space`, type `Terminal`, and press Enter.

### Step 2: Go to the Mobile Folder
In your terminal, you need to navigate to the folder where this mobile app is located. Type the following command and press Enter (replace the path with your actual folder path if it's different):
```bash
cd "C:\Sarang\Indux Tech\BillTea\mobile"
```

### Step 3: Install the App Files
Now, you need to download all the necessary background files that make the app work. Type this command and press Enter:
```bash
npm install
```
*(Wait a minute or two for this to finish. You will see a lot of text scrolling by—this is normal!)*

### Step 4: Find Your Computer's IP Address
Since your phone needs to talk to the backend server running on your computer, it needs to know your computer's "address" on your Wi-Fi network.

**On Windows:**
1. In your terminal, type `ipconfig` and press Enter.
2. Look for the line that says **IPv4 Address** (it will look something like `192.168.1.100` or `10.0.0.5`).
3. Write this number down.

**On Mac:**
1. In your terminal, type `ipconfig getifaddr en0` and press Enter.
2. The number that prints out is your IP address.

### Step 5: Connect the App to the Server
We need to tell the mobile app where to find the server using that IP address.

1. Open the `mobile` folder in your file explorer.
2. Look for a file named `.env`. If it doesn't exist, create a new text file and name it exactly `.env` (don't forget the dot at the beginning!).
3. Open the `.env` file in Notepad (or any text editor) and type the following line, replacing `<YOUR_IP_ADDRESS>` with the number you found in Step 4:
```text
EXPO_PUBLIC_API_URL=http://<YOUR_IP_ADDRESS>:5000/api/v1
```
*Example: If your IP was 192.168.1.5, you would write: `EXPO_PUBLIC_API_URL=http://192.168.1.5:5000/api/v1`*
4. Save and close the file.

### Step 6: Ensure Your Backend is Running
The mobile app needs the server to work. Make sure your server is running in a **separate terminal window**.
1. Open a new terminal.
2. Go to the server folder: `cd "C:\Sarang\Indux Tech\BillTea\server"`
3. Run: `npm run start:dev`

### Step 7: Start the Mobile App!
Go back to your **first terminal** (the one that is in the `mobile` folder) and type:
```bash
npx expo start
```
Press Enter. After a few seconds, a large **QR Code** will appear in your terminal window.

### Step 8: Open the App on Your Phone
1. Connect your phone to the same Wi-Fi network as your computer.
2. **If you have an Android**: Open the "Expo Go" app on your phone and tap **"Scan QR Code"**. Point your camera at the QR code on your computer screen.
3. **If you have an iPhone**: Open your standard Camera app, point it at the QR code, and tap the "Expo Go" notification that pops up on your screen.

**Congratulations! 🎉** 
You should now see the app building on your phone screen. Wait for the percentage to reach 100%, and you will be interacting with the BillTea Mobile App!

---

## 🛑 Troubleshooting

- **The app is stuck on a loading screen or says "Network Error"**: 
  - Double-check that your phone and computer are on the exact same Wi-Fi network.
  - Make sure your `.env` file has the correct IP address. If your router restarted recently, your computer's IP address might have changed. Repeat Step 4 to check it.
- **"Command not found" when typing `npm`**: Node.js was not installed correctly. Please restart your computer after installing Node.js (Step 1) and try again.
