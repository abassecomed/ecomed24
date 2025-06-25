const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const i18n = require("i18n");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const cron = require("node-cron");
require("dotenv/config");
const { Server } = require("socket.io");

const sequelize = require("./config").sequelize;
const { emailSchedule } = require("./controllers/cron.controller");
const depenseTypeRoutes = require("./routes/depenseType.routes");

if (process.env.NODE_ENV === "production") {
  cron.schedule("*/5 * * * * *", emailSchedule);
}

const app = express();

// 🔐 SSL
let server;
if (process.env.SSL === "enabled") {
  const options = {
    key: fs.readFileSync(process.env.SSL_KEY, "utf8"),
    cert: fs.readFileSync(process.env.SSL_CERT, "utf8"),
  };
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

// 🌐 Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("✅ Utilisateur connecté :", socket.id);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`📦 Rejoint la salle : ${room}`);
  });

  socket.on("request_access", ({ roomId }) => {
    console.log(`🔒 Demande d'accès : ${roomId}`);
    io.to(roomId).emit("access_request", { roomId }); // 🔁 corriger ici
  });

  socket.on("access_response", ({ roomId, accepted }) => {
    console.log(`🔓 Réponse du patient : ${accepted}`);
    io.to(roomId).emit("access_response_result", {
      granted: accepted,
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ Utilisateur déconnecté :", socket.id);
  });
});

// 🌍 i18n
i18n.configure({
  locales: ["en", "fr", "es"],
  defaultLocale: "fr",
  directory: path.join(__dirname, "/locales"),
  objectNotation: true,
  updateFiles: false,
});
app.use(i18n.init);
app.use((req, res, next) => {
  req.setLocale("fr");
  res.locals.currentLocale = "fr";
  next();
});

// 🛡️ Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use("/uploads/invoicefile", express.static("uploads/invoicefile"));

// 📦 Routes
app.get("/", (req, res) => {
  const welcomeMessage = res.__("index");
  res.json(welcomeMessage);
});

// 👇 Toutes les routes importées
const authRouter = require("./routes/auth.routes");
const helperRouter = require("./routes/helper.routes");
const labRoutes = require("./routes/lab.routes");
const patientsRoutes = require("./routes/patient.routes");
const billingRoutes = require("./routes/billing.routes");
const organizationRoutes = require("./routes/organization.routes");
const rolesRoutes = require("./routes/role.routes");
const permissionRoutes = require("./routes/permission.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const slotRoutes = require("./routes/slots.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportRoutes = require("./routes/report.routes");
const helpRoutes = require("./routes/helpTopic.routes");
const moduleRoutes = require("./routes/module.routes");
const OHADAAccountsRoutes = require("./routes/OHADAAccounts.routes");
const OHADATransactionRoutes = require("./routes/OHADATransactions.routes");
const transactionScenarioRoutes = require("./routes/transactionScenario.routes");
const paymentMethodRoutes = require("./routes/paymentMethod.routes");
const drugRoutes = require("./routes/drug.routes");
const productRoutes = require("./routes/product.routes");
const StockRoute = require("./routes/stock.routes");
// const  RequestStock = require("./routes/requestStock.routes");
const StockRoutes = require("./routes/stock-request.routes");
const prescriptionRoutes = require("./routes/prescription.routes");
const PrescriptionSalesRoutes = require("./routes/prescription-sales.routes");
const labTubesRoutes=require("./routes/lab-tubes.routes");

if (app.get("env") === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}
app.set("subdomain offset", 1);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.use(cookieParser());

app.use(function (req, res, next) {
  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  const welcomeMessage = res.__("index");
  // res.send(welcomeMessage);
  res.json(welcomeMessage);
});
app.use("/auth", authRouter);
app.use("/helper", helperRouter);
app.use("/patient", patientsRoutes);
app.use("/acts", labRoutes);
app.use("/billing", billingRoutes);
app.use("/organization", organizationRoutes);
app.use("/roles", rolesRoutes);
app.use("/permissions", permissionRoutes);
app.use("/appointment", appointmentRoutes);
app.use("/slot", slotRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/report", reportRoutes);
app.use("/help", helpRoutes);
app.use("/modules", moduleRoutes);
app.use("/accounts", OHADAAccountsRoutes);
app.use("/transactions", OHADATransactionRoutes);
app.use("/scenarios", transactionScenarioRoutes);
app.use("/payment-methods", paymentMethodRoutes);
app.use("/drugs", drugRoutes);
app.use("/product", productRoutes);
// app.use("/transactionHandler", transactionHandlerRoutes);
app.use("/payment-methods", paymentMethodRoutes);
app.use("/stock", StockRoute);
// app.use("/stocks", RequestStock);
app.use("/stock-request", StockRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/prescription-sales", PrescriptionSalesRoutes);
app.use("/api/depense-types", require("./routes/depenseType.routes"));
app.use("/lab-tubes",labTubesRoutes);
// Start server
const PORT = process.env.PORT || 2001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🚀 Serveur API + Socket.IO lancé sur http://localhost:${PORT}`);
});

module.exports = { app, server };
