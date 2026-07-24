const mongoose = require("mongoose");

const DomainSchema = new mongoose.Schema({
  domain: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  inboxCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.Domain || mongoose.model("Domain", DomainSchema);
//