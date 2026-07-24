module.exports = {
  app: {
    name: "NOXXY",
    version: "1.0.0",
    secret: process.env.JWT_SECRET || "noxxy_secret_key_2024"
  },

  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb+srv://faymantap_db_user:CTKhFeGx9GPYfdBx@noxxy-cluster.hyu7hqv.mongodb.net/noxxy?retryWrites=true&w=majority&appName=noxxy-cluster"
  },

  cloudflare: {
    workerEndpoint: "/api/inbound-email",
    workerSecret: process.env.WORKER_SECRET || ""
  },

  domains: [
    "noxxyrorr.biz.id",
    "noxnoy.web.id",
    "noxxytech.eu.cc"
  ],

  inbox: {
    expirationHours: 24,
    maxEmailsPerInbox: 1000,
    maxInboxPerIP: 50
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  },

  admin: {
    username: process.env.ADMIN_USER || "admin",
    password: process.env.ADMIN_PASS || "noxxy_admin_2026"
  }
};
//
