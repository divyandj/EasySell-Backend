const admin = require("firebase-admin");

// ==========================================
//  FIREBASE ADMIN INITIALIZATION
// ==========================================

let serviceAccount;

try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT env variable missing");
  }

  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch (error) {
  console.error("⚠️ Firebase service account not configured properly:", error.message);
}

// Initialize Firebase only once
if (serviceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin Initialized");
}

const messaging = serviceAccount ? admin.messaging() : null;

// ==========================================
//  NOTIFICATION HELPERS
// ==========================================

/**
 * Sends a push notification to the 'admin_orders' topic
 */
async function notifyNewOrder(orderId, amount, customerName) {
  if (!messaging) {
    console.warn("⚠️ Firebase messaging not available. Order notification skipped.");
    return;
  }

  const message = {
    notification: {
      title: "🎉 New Order Received!",
      body: `Order #${orderId} from ${customerName} for ₹${amount}`,
    },
    data: {
      orderId: String(orderId),
      type: "order",
    },
    topic: "admin_orders",
  };

  try {
    await messaging.send(message);
    console.log(`🔔 Order notification sent (Order ID: ${orderId})`);
  } catch (error) {
    console.error("❌ FCM Error (Order):", error.message);
  }
}

/**
 * Sends a push notification to the 'admin_new_users' topic
 */
async function notifyNewUser(userName, userEmail) {
  if (!messaging) {
    console.warn("⚠️ Firebase messaging not available. User notification skipped.");
    return;
  }

  const message = {
    notification: {
      title: "👤 New User Registered",
      body: `${userName} just joined.`,
    },
    data: {
      email: userEmail,
      type: "user",
    },
    topic: "admin_new_users",
  };

  try {
    await messaging.send(message);
    console.log(`🔔 User notification sent (${userEmail})`);
  } catch (error) {
    console.error("❌ FCM Error (User):", error.message);
  }
}

module.exports = {
  notifyNewOrder,
  notifyNewUser,
};
