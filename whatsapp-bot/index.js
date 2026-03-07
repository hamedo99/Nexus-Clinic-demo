const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { Client: PgClient } = require('pg');
require('dotenv').config();

// Global states for Express API
let qrCodeDataURL = '';
let isConnected = false;
let isPolling = false;

// Postgres DB Setup
const connectionString = process.env.DATABASE_URL;
const dbObj = new PgClient({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

dbObj.connect()
    .then(() => console.log('🟢 connected to Postgres DB'))
    .catch(err => console.error('connection error', err.stack));

console.log("🟢 Initializing WhatsApp Bot & Express Server...");

// 1. Setup Express Server
const app = express();
app.use(cors()); // Allow cross-origin requests from the Next.js frontend
app.use(express.json());

// Expose Status Endpoint
app.get('/api/whatsapp/status', (req, res) => {
    res.json({
        isConnected,
        qrCode: qrCodeDataURL
    });
});

// Test Message Endpoint
app.post('/api/whatsapp/test', async (req, res) => {
    if (!isConnected) return res.status(400).json({ success: false, message: 'البوت غير متصل بالواتساب' });

    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'الرجاء إدخال رقم الهاتف' });

    try {
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) formattedPhone = '964' + formattedPhone.substring(1);
        else if (!formattedPhone.startsWith('964')) formattedPhone = '964' + formattedPhone;

        const phoneId = `${formattedPhone}@c.us`;
        const testMsg = "👋 رسالة تجريبية من نظام Nexus Clinic! بوت الواتساب يعمل بنجاح ومستعد لإرسال الإشعارات التلقائية للمرضى.";

        await client.sendMessage(phoneId, testMsg);
        res.json({ success: true, message: 'تم إرسال الرسالة بنجاح' });
    } catch (err) {
        console.error("Test message error:", err);
        res.status(500).json({ success: false, message: 'تعذر إرسال الرسالة', error: err.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Express API running on http://localhost:${PORT}`);
});

// 2. Configure WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Generate QR Code for WhatsApp Web login as Base64 format
client.on('qr', async (qr) => {
    console.log("\n🕒 New QR Code received. Check the Dashboard to scan!\n");
    try {
        qrCodeDataURL = await qrcode.toDataURL(qr);
        isConnected = false;
    } catch (err) {
        console.error("❌ Failed to generate Base64 QR code.", err);
    }
});

// When bot has successfully logged in
client.on('ready', () => {
    console.log('✅ WhatsApp Bot is Ready and Connected!');
    isConnected = true;
    qrCodeDataURL = ''; // Clear QR since it's connected

    // Check for appointments every 1 minute
    setInterval(pollUpcomingAppointments, 60000);
    pollUpcomingAppointments();
});

// Authentication errors
client.on('auth_failure', msg => {
    console.error('❌ Authentication failed:', msg);
    isConnected = false;
    qrCodeDataURL = '';
});

// Disconnection
client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Client was disconnected:', reason);
    isConnected = false;
    qrCodeDataURL = ''; // The client will destroy its session and trigger 'qr' again on restart
    // Or you can initialize it again manually here:
    // client.initialize(); 
});

async function pollUpcomingAppointments() {
    if (!isConnected) return; // Don't poll if not connected

    if (isPolling) {
        console.log('⏳ [Polling] Previous query still running, skipping this tick...');
        return;
    }
    isPolling = true;

    console.log("⏳ [Polling] Checking for upcoming unnotified appointments...");

    try {
        const now = new Date();
        const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const doctorsResult = await dbObj.query(`
            SELECT id, name, is_reminders_enabled, whatsapp_message_template 
            FROM doctors 
            WHERE is_reminders_enabled = true
        `);
        const doctors = doctorsResult.rows;

        if (!doctors || doctors.length === 0) return;

        const doctorIds = doctors.map(d => `'${d.id}'`).join(',');

        const appointmentsResult = await dbObj.query(`
            SELECT id, "startTime", status, reminder_sent, "doctorId", "patientId"
            FROM appointments
            WHERE "doctorId" IN (${doctorIds})
            AND status = 'CONFIRMED'
            AND reminder_sent = false
            AND "startTime" >= $1
            AND "startTime" <= $2
        `, [now.toISOString(), next24Hours.toISOString()]);
        const appointments = appointmentsResult.rows;

        if (!appointments || appointments.length === 0) return;

        const patientIds = [...new Set(appointments.map(a => `'${a.patientId}'`))].join(',');

        const patientsResult = await dbObj.query(`
            SELECT id, "fullName", "phoneNumber"
            FROM patients
            WHERE id IN (${patientIds})
        `);
        const patients = patientsResult.rows;

        const patientMap = {};
        patients.forEach(p => patientMap[p.id] = p);

        for (const appointment of appointments) {
            const doc = doctors.find(d => d.id === appointment.doctorId);
            const pat = patientMap[appointment.patientId];

            if (!pat || !pat.phoneNumber) continue;

            const dateObj = new Date(appointment.startTime);
            const optionsDate = { timeZone: 'Asia/Baghdad', year: 'numeric', month: 'long', day: 'numeric' };
            const optionsTime = { timeZone: 'Asia/Baghdad', hour: '2-digit', minute: '2-digit' };

            const dateStr = dateObj.toLocaleDateString('ar-IQ', optionsDate);
            const timeStr = dateObj.toLocaleTimeString('ar-IQ', optionsTime);

            let finalMessage = "";
            if (doc.whatsapp_message_template && doc.whatsapp_message_template.trim() !== "") {
                finalMessage = doc.whatsapp_message_template
                    .replace(/{{patient_name}}/g, pat.fullName)
                    .replace(/{{time}}/g, timeStr)
                    .replace(/{{date}}/g, dateStr);
            } else {
                finalMessage = `مرحباً ${pat.fullName}، نود تذكيرك بموعدك القادم في عيادة د. ${doc.name} يوم ${dateStr} الساعة ${timeStr}. نتمنى لك دوام الصحة.`;
            }

            let formattedPhone = pat.phoneNumber.replace(/\D/g, '');
            if (formattedPhone.startsWith('0')) formattedPhone = '964' + formattedPhone.substring(1);
            else if (!formattedPhone.startsWith('964')) formattedPhone = '964' + formattedPhone;

            const phoneId = `${formattedPhone}@c.us`;

            console.log(`\n============================`);
            console.log(`📱 Sending WhatsApp to: ${phoneId}`);
            console.log(`💬 Message: \n${finalMessage}`);
            console.log(`============================\n`);

            try {
                await client.sendMessage(phoneId, finalMessage);
                await dbObj.query(`
                    UPDATE appointments 
                    SET reminder_sent = true 
                    WHERE id = $1
                `, [appointment.id]);
                console.log(`✅ Message sent to ${pat.fullName} and DB updated.`);
            } catch (sendError) {
                console.error(`❌ Failed to send message to ${phoneId}:`, sendError);
            }

            // Small delay to prevent ban
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

    } catch (error) {
        console.error("❌ Polling error details:", error);
    } finally {
        isPolling = false; // Always release the lock
    }
}

// Start WhatsApp Client
client.initialize();
