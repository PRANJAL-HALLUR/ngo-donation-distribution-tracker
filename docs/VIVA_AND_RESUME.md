# Project: Cloud Based Donation and Distribution Tracker for NGOs

## 📄 Resume Bullet Points

- **Architected a full-stack cloud application** using React, Node.js, and Supabase PostgreSQL to eliminate manual tracking inefficiencies in NGO donations, ensuring 100% transparent fund allocation.
- **Integrated secure payment processing** via the Razorpay API with server-side HMAC SHA-256 validation to prevent payload tampering and securely process donor transactions.
- **Built an automated distribution verification system** leveraging Supabase Edge Storage, allowing NGOs to upload real-time proof-of-distribution documents that trigger automated Resend API email alerts to donors.
- **Developed a robust Admin Fraud Monitoring dashboard** featuring automated anomaly detection for large transactions (>$5k), manual flagging, and Role-Based Access Control (RBAC) NGO suspension capabilities.
- **Implemented interactive data visualization & mapping** using Recharts and Mapbox GL, providing donors with real-time analytics on their philanthropic impact and geographic NGO tracking.

---

## 💼 LinkedIn Project Description
🚀 I'm excited to share my latest full-stack project: **Cloud-Based Donation & Distribution Tracker for NGOs**.

One of the biggest challenges in philanthropy is transparency—donors rarely see exactly how their money is spent. To solve this, I built an end-to-end cloud platform that traces a donation from the digital wallet straight to the beneficiary on the ground. 

**Key Features:**
🔒 Secure Razorpay Payment Integration with backend HMAC verification.
📸 Distribution Proof tracking: NGOs must upload proof of resource allocation to access further funds.
📧 Automated Email Alerts: Powered by Resend, notifying donors the moment their donation is utilized.
📊 Data Visualization & Maps: Interactive analytics using Recharts and Mapbox.
🛡️ Admin Fraud Dashboard: Auto-flags suspicious transactions and manages NGO verification queues.

**Tech Stack:** React, Node.js/Express, Supabase (PostgreSQL + Auth + Storage), Tailwind CSS.

---

## 💻 GitHub Project Description
**FundHub: Transparent NGO Donation & Distribution Tracker**
An end-to-end cloud MVP built to replace manual NGO ledgers. It ensures 100% transparency by tracking donor funds through a secure Razorpay gateway and mandating NGOs to upload cryptographic proofs-of-distribution to Supabase Object Storage before verifying the transaction lifecycle. Features automated Resend email notifications, Admin Fraud monitoring, and Recharts analytics.

---

## 🎓 Viva Preparation (Q&A)

**Q1: Why did you choose Supabase over standard PostgreSQL or MongoDB?**
**A:** "I chose Supabase because it provides a fully managed PostgreSQL database while offering built-in Row Level Security (RLS), JWT-based Authentication, and Object Storage out of the box. This allowed me to securely store NGO verification documents and map them directly to database relations without setting up a separate AWS S3 bucket and Auth0 server, making the architecture highly cohesive for an MVP."

**Q2: How did you secure the payment gateway integration?**
**A:** "Instead of trusting the frontend, I implemented a two-step process. The React frontend asks the Express backend to initialize an order. Once the user pays via Razorpay, the frontend sends the Razorpay Signature back to my Express server. The server uses the `RAZORPAY_KEY_SECRET` (which is never exposed to the client) to generate an HMAC SHA-256 hash of the payload. Only if the hashes match does the server update the database to 'completed'."

**Q3: How do you handle Fraud or Suspicious Activity?**
**A:** "I built an Admin Monitoring dashboard that queries the database for anomalies. Currently, it auto-flags any transaction over $5,000. Additionally, I implemented an `audit_logs` table. Every time an admin suspends an NGO or verifies a proof document, the action, timestamp, and admin ID are permanently logged to ensure system accountability."

**Q4: How does the Notification system work without blocking the main thread?**
**A:** "When a donation or distribution is verified, the Express backend calls the Resend API. Since Node.js is asynchronous, the email dispatching is handled as a non-blocking Promise (`.catch(console.error)`), allowing the API to immediately return a success response to the React frontend while the email processes in the background."

**Q5: How did you optimize the application for production?**
**A:** "On the backend, I implemented `helmet` to secure HTTP headers, `express-rate-limit` to prevent DDoS/Brute-force attacks, and payload size limits. On the frontend, I used React `useMemo` for expensive client-side filtering (like the NGO search bar) and `lucide-react` for lightweight SVG icons."

---

## 🎬 Demo Preparation Script

**1. The Setup (The Problem)**
"Hello! My project solves the lack of transparency in NGO donations. Donors don't know where their money goes. Let me show you how my platform solves this."

**2. The Donor Experience (The Hook)**
- Log in as a Donor.
- Go to the Map/Browse page: "Here donors can see active, verified NGOs on a Mapbox interface."
- Click "Donate Now". Enter an amount.
- Complete the Razorpay Test Payment.
- "The payment is verified server-side, and the status is instantly updated."

**3. The NGO Experience (The Transparency)**
- Log out. Log in as an NGO Admin.
- "The NGO receives the funds. But to complete the cycle, they must prove how it was used."
- Click 'Distribute & Upload Proof'.
- Type in "Bought 50 textbooks", amount spent, and upload a dummy PDF/Image.
- Submit. "This document is securely pushed to Supabase Edge Storage."

**4. The Notification & Analytics (The Trust)**
- Log back in as Donor (or show the Email notification screenshot).
- "The donor instantly receives an email via Resend confirming their money was distributed."
- Show the Recharts pie charts updating dynamically.

**5. The App Admin (The Security)**
- Log in as the App Admin.
- Go to the Fraud & Monitoring tab.
- "I've built a system that auto-flags large donations and allows admins to suspend bad-actor NGOs. They also have an audit trail of every verification."

**Backup Plan if API Fails:**
- Have a pre-recorded 2-minute screen-recording of the exact perfect flow ready on your desktop. If Razorpay or Mapbox is down, immediately say: "Since APIs can be unpredictable on university networks, I have a quick architecture flow video right here..."
