const React = require("react");
const {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} = require("@react-pdf/renderer");
const { formatNumberOfPatients } = require("../services/formatNumber.js");
const { numberToWordsFR } = require("../services/numberToWordsFR.js");

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 8,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  left: { width: "48%" },
  right: { width: "48%", alignItems: "flex-end" },
  box: {
    border: "1 solid #222",
    backgroundColor: "#fff",
    padding: 4,
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #222",
    alignItems: "center",
    minHeight: 10,
  },
  lastRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 10,
  },
  cellLabel: {
    width: "50%",
    fontWeight: "bold",
    fontSize: 8,
    padding: 1,
    borderRight: "1 solid #222",
    textAlign: "right",
  },
  cellValue: {
    width: "50%",
    fontSize: 8,
    padding: 1,
    textAlign: "left",
  },
  barcode: {
    marginTop: 4,
    fontSize: 8,
    letterSpacing: 1,
    textAlign: "center",
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
    fontSize: 8,
    border: "1 solid #222",
    textAlign: "center",
    padding: 3,
  },
  tableCell: {
    fontSize: 8,
    border: "1 solid #222",
    padding: 3,
    textAlign: "center",
  },
  footerWrapper: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: "1 solid #000",
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLeft: {
    flexBasis: "48%",
    fontSize: 8,
    lineHeight: 1.6,
  },
  footerRight: {
    flexBasis: "48%",
    fontSize: 8,
    lineHeight: 1.6,
    textAlign: "left",
  },
  poweredBy: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 8,
    color: "#2F558E",
    fontWeight: "bold",
  },
});

function InvoicePDF({
  invoiceNumber,
  prestations,
  totalAmount,
  partnerType,
  userName,
  organisationOrigine,
  organisationPartenaire,
  invoiceDate,
  barcodeUrl,
}) {
  const grouped = [];
  let lastPatient = null;

  if (Array.isArray(prestations)) {
    prestations.forEach((p) => {
      const same = p.patient === lastPatient;
      grouped.push({ ...p, showPatient: !same });
      lastPatient = p.patient;
    });
  }

  const total =
    totalAmount ??
    grouped.reduce((s, i) => s + Number(i.doit_payer_partenaire || 0), 0);

  const formatDate = (d) => {
    const date = new Date(d);
    return isNaN(date)
      ? ""
      : `${String(date.getDate()).padStart(2, "0")}/${String(
          date.getMonth() + 1
        ).padStart(2, "0")}/${date.getFullYear()} ${String(
          date.getHours()
        ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const signatureUrl = organisationOrigine.signature?.startsWith("http")
    ? organisationOrigine.signature
    : `${process.env.APP_URL}/${organisationOrigine.signature}`;

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      // Tu dois ici construire manuellement les View/Text/Image comme avec React.createElement
      // Mais pour un fichier aussi long, je te recommande d’utiliser `babel` ou `react-dom/server` pour générer depuis JSX

    )
  );
}

module.exports = InvoicePDF;
