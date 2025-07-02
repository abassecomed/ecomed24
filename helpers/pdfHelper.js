
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { Invoice, InvoiceItem, Organisation } = require('../models');
const moment = require('moment');

async function generateInvoicePDF(invoiceId) {
  // 1. Récupération des données
  const invoice = await Invoice.findByPk(invoiceId, {
    include: [
      { model: InvoiceItem, as: 'items' },
      { model: Organisation, as: 'origine' }, // doit exister
      { model: Organisation, as: 'destinataire' } // doit exister
    ]
  });

  if (!invoice) throw new Error('Facture introuvable');

  const doc = new PDFDocument();
  const dateStr = moment(invoice.date_facture).format('DD/MM/YYYY');
  const numero = invoice.numero;
  const total = invoice.montant;

  // 2. QR Code génération (contenu = numéro + date)
  const qrDataUrl = await QRCode.toDataURL(`Facture: ${numero} - ${dateStr}`);

  // 3. En-tête
  doc.setFontSize(16);
  doc.text(invoice.origine?.nom || 'Cabinet Médical Partenaires', 10, 20);
  doc.setFontSize(10);
  doc.text(invoice.origine?.email || 'Email: -', 10, 26);
  doc.text(invoice.origine?.telephone || 'Tel: -', 10, 32);
  doc.text(invoice.origine?.adresse || '', 10, 38);

  doc.setFontSize(20);
  doc.text('FACTURE', 150, 20);

  // 4. Infos facture
  doc.setFontSize(12);
  doc.text(`Facture N°: ${numero}`, 10, 50);
  doc.text(`Date: ${dateStr}`, 10, 56);
  doc.text(`Émise par: ${invoice.par}`, 10, 62);
  doc.text(`Facturé à: ${invoice.destinataire?.nom || '-'}`, 10, 68);

  // 5. QR Code
  doc.addImage(qrDataUrl, 'PNG', 150, 50, 40, 40);

  // 6. Table items
  let y = 80;
  doc.setFontSize(12);
  doc.text('Détail des services', 10, y);
  y += 6;

  doc.setFontSize(10);
  doc.text('Description', 10, y);
  doc.text('Bénéficiaire', 80, y);
  doc.text('Référence', 130, y);
  doc.text('Montant', 170, y, { align: 'right' });

  y += 6;

  for (const item of invoice.items) {
    doc.text(item.description || '-', 10, y);
    doc.text(item.beneficiaire || 'Patient - À définir', 80, y);
    doc.text(item.reference || '', 130, y);
    doc.text(`${parseFloat(item.total).toLocaleString()} FCFA`, 170, y, { align: 'right' });
    y += 6;
  }

  // 7. Total
  doc.setFontSize(12);
  doc.text('TOTAL', 130, y + 4);
  doc.text(`${parseFloat(total).toLocaleString()} FCFA`, 170, y + 4, { align: 'right' });

  // 8. Notes
  y += 12;
  doc.setFontSize(10);
  doc.text('Notes :', 10, y);
  doc.text(invoice.notes || '', 10, y + 6);

  // 9. Bas de page
  y += 20;
  doc.setFontSize(9);
  doc.text('Merci pour votre confiance - Cabinet Médical Partenaires', 10, y);

  // 10. Retourner le buffer PDF
  return doc.output('arraybuffer'); // utile pour envoi email en pièce jointe
}

module.exports = { generateInvoicePDF };
