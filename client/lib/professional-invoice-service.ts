import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface InvoiceCustomization {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite?: string;
  gstNumber?: string;
  showTermsAndConditions: boolean;
  termsAndConditions: string[];
  footerText?: string;
  signatureImage?: string;
  signatureName: string;
  signatureDesignation: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  hsn?: string;
  quantity: number;
  unit: string;
  rate: number;
  discount?: number;
  taxRate?: number;
  amount: number;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customer: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gstNumber?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  taxAmount: number;
  totalAmount: number;
  totalInWords: string;
  notes?: string;
  paymentTerms?: string;
  paymentMode?: 'Cash' | 'UPI' | 'Card';
  paymentStatus?: 'Paid' | 'Pending';
  salespersonName?: string;
  commissionRatePct?: number;
  commissionAmount?: number;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    branch: string;
  };
}

export class ProfessionalInvoiceService {
  private static instance: ProfessionalInvoiceService;
  
  private defaultCustomization: InvoiceCustomization = {
    primaryColor: '#000000',
    secondaryColor: '#64748b',
    companyName: 'Your Company Name',
    companyAddress: 'Your Business Address\nCity, State - PIN Code',
    companyPhone: '+91 XXXXX XXXXX',
    companyEmail: 'contact@yourcompany.com',
    gstNumber: '',
    showTermsAndConditions: false,
    termsAndConditions: [
      'Payment is due within 30 days of invoice date',
      'Late payments may be subject to interest charges',
      'All goods sold are subject to our standard terms and conditions',
      'Any disputes must be raised within 7 days of delivery'
    ],
    signatureName: 'Authorized Signatory',
    signatureDesignation: 'Director'
  };

  static getInstance(): ProfessionalInvoiceService {
    if (!ProfessionalInvoiceService.instance) {
      ProfessionalInvoiceService.instance = new ProfessionalInvoiceService();
    }
    return ProfessionalInvoiceService.instance;
  }

  /**
   * Generate professional invoice HTML
   */
  generateInvoiceHTML(invoiceData: InvoiceData, customization?: Partial<InvoiceCustomization>): string {
    const config = { ...this.defaultCustomization, ...customization };
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoiceData.invoiceNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #000000;
              background: white;
            }
            
            .invoice-container {
              max-width: 794px; /* A4 width in pixels at 96 DPI */
              margin: 0 auto;
              padding: 40px;
              min-height: 1123px; /* A4 height in pixels at 96 DPI */
              position: relative;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid ${config.primaryColor};
            }
            
            .company-info {
              flex: 1;
            }
            
            .company-logo {
              max-width: 150px;
              max-height: 80px;
              margin-bottom: 15px;
            }
            
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: ${config.primaryColor};
              margin-bottom: 8px;
            }
            
            .company-details {
              color: #000000;
              line-height: 1.5;
            }
            
            .invoice-title {
              text-align: right;
              flex: 0 0 auto;
            }
            .avatar-circle {
              width: 56px;
              height: 56px;
              border-radius: 9999px;
              background: ${config.primaryColor};
              color: white;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 20px;
              margin-bottom: 8px;
            }
            .order-link {
              color: ${config.primaryColor};
              font-weight: 600;
              text-decoration: none;
            }
            .muted {
              color: ${config.secondaryColor};
              font-size: 12px;
            }
            
            /* Removed big INVOICE title per requirements */
            
            .invoice-meta {
              background: #E0E0E0;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #000000;
            }
            
            .invoice-meta table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .invoice-meta td {
              padding: 4px 0;
              vertical-align: top;
            }
            
            .invoice-meta .label {
              font-weight: 600;
              color: #444444;
              width: 120px;
            }
            
            .customer-billing {
              display: flex;
              justify-content: space-between;
              margin: 30px 0;
            }
            
            .customer-info, .billing-info {
              flex: 1;
              margin-right: 30px;
            }
            
            .customer-info:last-child, .billing-info:last-child {
              margin-right: 0;
            }
            
            .section-title {
              font-size: 14px;
              font-weight: bold;
              color: ${config.primaryColor};
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .customer-details {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              line-height: 1.6;
            }
            
            .customer-name {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 8px;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
              border: 1px solid #e5e7eb;
            }
            
            .items-table th {
              background: ${config.primaryColor};
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: 600;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .items-table td {
              padding: 10px 8px;
              border-bottom: 1px solid #e5e7eb;
              vertical-align: top;
            }
            
            .items-table tbody tr:nth-child(even) {
              background: #f9fafb;
            }
            
            .items-table tbody tr:hover {
              background: #f3f4f6;
            }
            
            .text-right {
              text-align: right;
            }
            
            .text-center {
              text-align: center;
            }
            
            .amount {
              font-weight: 600;
              font-family: 'Courier New', monospace;
            }
            
            .totals-section {
              display: flex;
              justify-content: flex-end;
              margin: 30px 0;
            }
            
            .totals-table {
              width: 300px;
              border-collapse: collapse;
            }
            
            .totals-table td {
              padding: 8px 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .totals-table .label {
              font-weight: 600;
              color: ${config.secondaryColor};
              text-align: right;
            }
            
            .totals-table .amount {
              text-align: right;
              font-family: 'Courier New', monospace;
              font-weight: 600;
            }
            
            .total-row {
              background: ${config.primaryColor};
              color: white;
              font-weight: bold;
              font-size: 14px;
            }
            
            .total-row td {
              border-bottom: none;
            }
            
            .amount-in-words {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid ${config.primaryColor};
            }
            
            .amount-in-words .label {
              font-weight: bold;
              color: ${config.primaryColor};
              margin-bottom: 5px;
            }
            
            .terms-section {
              margin: 30px 0;
            }
            
            .terms-list {
              list-style-type: none;
              padding: 0;
            }
            
            .terms-list li {
              padding: 4px 0;
              position: relative;
              padding-left: 20px;
            }
            
            .terms-list li:before {
              content: "•";
              color: ${config.primaryColor};
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            
            .footer {
              position: absolute;
              bottom: 40px;
              left: 40px;
              right: 40px;
              border-top: 2px solid ${config.primaryColor};
              padding-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            
            .bank-details {
              flex: 1;
              margin-right: 30px;
            }
            
            .signature-section {
              text-align: right;
              flex: 0 0 200px;
            }
            
            .signature-image {
              max-width: 150px;
              max-height: 60px;
              margin-bottom: 10px;
            }
            
            .signature-line {
              border-top: 1px solid #6b7280;
              width: 150px;
              margin-left: auto;
              margin-bottom: 5px;
            }
            
            .signature-details {
              font-size: 11px;
              color: ${config.secondaryColor};
            }
            
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 72px;
              color: rgba(0, 0, 0, 0.05);
              font-weight: bold;
              pointer-events: none;
              z-index: -1;
            }
            
            @media print {
              .invoice-container {
                max-width: none;
                margin: 0;
                padding: 20mm;
                min-height: auto;
              }
              
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .footer {
                position: fixed;
                bottom: 20mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="company-info">
                ${config.logoUrl ? `<img src="${config.logoUrl}" alt="Company Logo" class="company-logo">` : ''}
                <div class="company-name">${config.companyName}</div>
                <div class="company-details">
                  ${config.companyAddress.replace(/\n/g, '<br>')}<br>
                  Phone: ${config.companyPhone}<br>
                  Email: ${config.companyEmail}
                  ${config.companyWebsite ? `<br>Website: ${config.companyWebsite}` : ''}
                  ${config.gstNumber ? `<br>GST No: ${config.gstNumber}` : ''}
                </div>
              </div>
              <div class="invoice-title">
                <div style="font-weight:700; color:#6b7280; margin-bottom:6px">INVOICE</div>
                <div class="avatar-circle">${(config.companyName || 'B').trim().charAt(0).toUpperCase()}</div>
                <div class="invoice-meta">
                  <table>
                    <tr>
                      <td class="label">Order #:</td>
                      <td><a class="order-link">${invoiceData.invoiceNumber}</a></td>
                    </tr>
                    <tr>
                      <td class="label">Date:</td>
                      <td>${new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td class="label">Time:</td>
                      <td>${new Date(invoiceData.invoiceDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
            
            <!-- Customer & Billing Information -->
            <div class="customer-billing">
              <div class="customer-info">
                <div class="section-title">Bill To</div>
                <div class="customer-details">
                  <div class="customer-name">${invoiceData.customer.name}</div>
                  <div>${invoiceData.customer.address.replace(/\n/g, '<br>')}</div>
                  <div>Phone: ${invoiceData.customer.phone}</div>
                  ${invoiceData.customer.email ? `<div>Email: ${invoiceData.customer.email}</div>` : ''}
                  ${invoiceData.customer.gstNumber ? `<div>GST No: ${invoiceData.customer.gstNumber}</div>` : ''}
                </div>
              </div>
            </div>
            
            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 5%">#</th>
                  <th style="width: 35%">Product Name</th>
                  <th style="width: 10%" class="text-center">Size</th>
                  <th style="width: 10%" class="text-center">Color</th>
                  <th style="width: 10%" class="text-center">Qty</th>
                  <th style="width: 12%" class="text-right">Price</th>
                  <th style="width: 10%" class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceData.items.map((item: any, index) => `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${item.description}</td>
                    <td class="text-center">${item.size || '-'}</td>
                    <td class="text-center">${item.color || '-'}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right amount">₹${Number(item.rate).toFixed(2)}</td>
                    <td class="text-right amount">₹${Number(item.amount).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <!-- Totals Section -->
            <div class="totals-section">
              <table class="totals-table">
                <tr>
                  <td class="label">Subtotal (${invoiceData.items.reduce((n, i) => n + (i.quantity || 0), 0)} items):</td>
                  <td class="amount">₹${invoiceData.subtotal.toFixed(2)}</td>
                </tr>
                ${invoiceData.totalDiscount > 0 ? `
                  <tr>
                    <td class="label">Total Discount:</td>
                    <td class="amount">-₹${invoiceData.totalDiscount.toFixed(2)}</td>
                  </tr>
                ` : ''}
                ${(() => { const rate = invoiceData.subtotal > 0 ? Math.round((invoiceData.taxAmount / invoiceData.subtotal) * 100) : 0; return invoiceData.taxAmount > 0 ? `
                  <tr>
                    <td class=\"label\">Tax (GST ${rate}%):</td>
                    <td class=\"amount\">₹${invoiceData.taxAmount.toFixed(2)}</td>
                  </tr>` : '' })()}
                ${(() => { const ship:any = (invoiceData as any).shippingFee || 0; return `<tr><td class=\"label\">Shipping:</td><td class=\"amount\">${ship > 0 ? '₹'+ship.toFixed(2) : 'FREE'}</td></tr>` })()}
                <tr class="total-row">
                  <td class="label">Total Amount:</td>
                  <td class="amount">₹${invoiceData.totalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <!-- Amount in Words -->
            <div class="amount-in-words">
              <div class="label">Amount in Words:</div>
              <div>${invoiceData.totalInWords}</div>
            </div>
            
            ${invoiceData.notes ? `
              <div class="section-title">Notes</div>
              <div style="margin-bottom: 20px; padding: 10px; background: #f9fafb; border-radius: 4px;">
                ${invoiceData.notes}
              </div>
            ` : ''}

            <!-- Sales Info -->
            ${(invoiceData.salespersonName || invoiceData.paymentMode || invoiceData.paymentStatus || invoiceData.commissionAmount) ? `
              <div class="terms-section">
                <div class="section-title">Sales Info</div>
                <div style="background:#f8fafc;padding:12px;border-radius:8px">
                  ${invoiceData.salespersonName ? `<div><strong>Salesperson:</strong> ${invoiceData.salespersonName}</div>` : ''}
                  ${(invoiceData.commissionRatePct != null && invoiceData.commissionAmount != null) ? `<div><strong>Commission:</strong> ${invoiceData.commissionRatePct}% | Amount: ₹${Number(invoiceData.commissionAmount).toFixed(2)}</div>` : ''}
                  ${invoiceData.paymentMode ? `<div><strong>Payment Mode:</strong> ${invoiceData.paymentMode}</div>` : ''}
                  ${invoiceData.paymentStatus ? `<div><strong>Payment Status:</strong> ${invoiceData.paymentStatus}</div>` : ''}
                </div>
              </div>
            ` : ''}

            <!-- Terms and Conditions -->
            ${config.showTermsAndConditions ? `
              <div class="terms-section">
                <div class="section-title">Terms & Conditions</div>
                <ul class="terms-list">
                  ${config.termsAndConditions.map(term => `<li>${term}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <!-- Payment Information -->
            ${(invoiceData.paymentMode || invoiceData.paymentStatus || (invoiceData as any).paymentId) ? `
              <div class="terms-section">
                <div class="section-title">Payment Information</div>
                <div style="background:#f8fafc;padding:12px;border-radius:8px">
                  ${invoiceData.paymentMode ? `<div><strong>Payment Method:</strong> ${invoiceData.paymentMode}</div>` : ''}
                  ${(invoiceData as any).paymentId ? `<div><strong>Payment ID:</strong> ${(invoiceData as any).paymentId}</div>` : ''}
                  ${invoiceData.paymentStatus ? `<div><strong>Status:</strong> ${invoiceData.paymentStatus}</div>` : ''}
                </div>
              </div>
            ` : ''}

            <div style="text-align:center; color:${config.secondaryColor}; margin: 20px 0 0;">
              <div style="font-weight:700; color:${config.primaryColor}; font-size:18px;">Thank you for choosing ${config.companyName.toUpperCase()}!</div>
              <div style="font-size:13px; margin-top:6px; color:#6b7280;">We appreciate your business and hope you love your new items.</div>
              <div style="font-size:12px; margin-top:8px; color:#9ca3af;">For support, contact us at ${config.companyEmail}${config.companyPhone ? ' or ' + config.companyPhone : ''}</div>
              <div style="font-size:11px; margin-top:8px; color:#c4c4c4;">This is a computer-generated invoice and does not require a signature.</div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="bank-details">
                ${invoiceData.bankDetails ? `
                  <div class="section-title">Bank Details</div>
                  <div>
                    <strong>Account Name:</strong> ${invoiceData.bankDetails.accountName}<br>
                    <strong>Account No:</strong> ${invoiceData.bankDetails.accountNumber}<br>
                    <strong>Bank:</strong> ${invoiceData.bankDetails.bankName}<br>
                    <strong>IFSC:</strong> ${invoiceData.bankDetails.ifscCode}<br>
                    <strong>Branch:</strong> ${invoiceData.bankDetails.branch}
                  </div>
                ` : ''}
                ${config.footerText ? `<div style="margin-top: 15px; font-size: 11px; color: ${config.secondaryColor};">${config.footerText}</div>` : ''}
              </div>
              <!-- Signature section removed per requirements -->
            </div>
          </div>
        </body>
      </html>
    `;
    
    return html;
  }

  /**
   * Generate PDF from invoice data
   */
  async generatePDF(invoiceData: InvoiceData, customization?: Partial<InvoiceCustomization>): Promise<Blob> {
    const html = this.generateInvoiceHTML(invoiceData, customization);
    
    // Create a temporary container for the HTML
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);
    
    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(container.querySelector('.invoice-container') as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      return pdf.output('blob');
    } finally {
      // Clean up
      document.body.removeChild(container);
    }
  }

  /**
   * Download invoice as PDF
   */
  async downloadPDF(invoiceData: InvoiceData, customization?: Partial<InvoiceCustomization>): Promise<void> {
    const blob = await this.generatePDF(invoiceData, customization);
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoiceData.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Convert number to words (Indian numbering system)
   */
  convertToWords(amount: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertHundreds = (num: number): string => {
      let result = '';
      
      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
      }
      
      if (num >= 20) {
        result += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
      } else if (num >= 10) {
        result += teens[num - 10] + ' ';
        return result;
      }
      
      if (num > 0) {
        result += ones[num] + ' ';
      }
      
      return result;
    };

    if (amount === 0) return 'Zero Rupees Only';

    let rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let result = '';

    if (rupees >= 10000000) { // Crores
      const crores = Math.floor(rupees / 10000000);
      result += convertHundreds(crores) + 'Crore ';
      rupees %= 10000000;
    }

    if (rupees >= 100000) { // Lakhs
      const lakhs = Math.floor(rupees / 100000);
      result += convertHundreds(lakhs) + 'Lakh ';
      rupees %= 100000;
    }

    if (rupees >= 1000) { // Thousands
      const thousands = Math.floor(rupees / 1000);
      result += convertHundreds(thousands) + 'Thousand ';
      rupees %= 1000;
    }

    if (rupees > 0) {
      result += convertHundreds(rupees);
    }
    
    result += 'Rupees';
    
    if (paise > 0) {
      result += ' and ' + convertHundreds(paise) + 'Paise';
    }
    
    return result.trim() + ' Only';
  }

  /**
   * Get default customization
   */
  getDefaultCustomization(): InvoiceCustomization {
    return { ...this.defaultCustomization };
  }

  /**
   * Save customization to localStorage
   */
  saveCustomization(customization: Partial<InvoiceCustomization>): void {
    const config = { ...this.defaultCustomization, ...customization };
    localStorage.setItem('invoice_customization', JSON.stringify(config));
  }

  /**
   * Load customization from localStorage
   */
  loadCustomization(): InvoiceCustomization {
    const saved = localStorage.getItem('invoice_customization');
    if (saved) {
      try {
        return { ...this.defaultCustomization, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Error loading invoice customization:', error);
      }
    }
    return this.defaultCustomization;
  }

  /**
   * Store invoice to Document Vault
   */
  async storeToDocumentVault(
    invoiceData: InvoiceData,
    pdfBlob: Blob,
    customization?: Partial<InvoiceCustomization>
  ): Promise<string> {
    try {
      // Import Document Vault service
      const { documentVaultService } = await import('./document-vault-service');

      // Convert blob to data URL safely without overflowing the call stack
      const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const dataUrl = await blobToDataUrl(pdfBlob);

      const documentData = {
        type: 'invoice' as const,
        title: `Invoice ${invoiceData.invoiceNumber}`,
        description: `Professional invoice for ${invoiceData.customer.name}`,
        fileName: `Invoice_${invoiceData.invoiceNumber}.pdf`,
        fileSize: pdfBlob.size,
        mimeType: 'application/pdf',
        fileContent: dataUrl,
        documentNumber: invoiceData.invoiceNumber,
        amount: invoiceData.totalAmount,
        currency: 'INR',
        customerName: invoiceData.customer.name,
        customerPhone: invoiceData.customer.phone,
        date: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate,
        status: (invoiceData.paymentStatus === 'Paid' ? 'paid' : 'sent') as const,
        tags: ['invoice', 'professional', 'generated'],
        category: 'invoices',
        folderId: 'invoices',
        businessType: 'general',
        accessLevel: 'restricted' as const,
        allowedRoles: ['owner', 'co_founder', 'manager', 'accountant', 'sales_executive'] as const,
        metadata: {
          gstNumber: invoiceData.customer.gstNumber || '',
          taxAmount: invoiceData.taxAmount.toString(),
          discountAmount: invoiceData.totalDiscount.toString(),
          totalBeforeTax: invoiceData.subtotal.toString(),
          paymentMethod: String(invoiceData.paymentMode || ''),
          paymentStatus: String(invoiceData.paymentStatus || ''),
          saleId: String(invoiceData.id || ''),
          invoiceNo: invoiceData.invoiceNumber,
          dateTime: invoiceData.invoiceDate,
          subtotal: invoiceData.subtotal.toString(),
          total: invoiceData.totalAmount.toString(),
          lineItemsJson: JSON.stringify(invoiceData.items || []),
          salespersonName: invoiceData.salespersonName || '',
          commissionRatePct: invoiceData.commissionRatePct != null ? String(invoiceData.commissionRatePct) : '',
          commissionAmount: invoiceData.commissionAmount != null ? String(invoiceData.commissionAmount) : '',
          fileUrl: '',
          customizationJson: JSON.stringify(customization || {})
        }
      };

      // Try to add document with fileContent. If it fails (likely due to localStorage quota), retry without fileContent.
      let addRes = documentVaultService.addDocument(documentData as any);

      if (!addRes.success || !addRes.document) {
        // Retry without fileContent to avoid localStorage quota issues
        const minimalData = { ...documentData } as any;
        delete minimalData.fileContent;
        minimalData.fileUrl = '';

        const retryRes = documentVaultService.addDocument(minimalData);
        if (!retryRes.success || !retryRes.document) {
          throw new Error(retryRes.message || addRes.message || 'Failed to add document');
        }

        console.warn('Document stored without file content due to storage limits');
        const documentId = retryRes.document.id;
        console.log(`Invoice ${invoiceData.invoiceNumber} stored to Document Vault with ID: ${documentId} (content omitted)`);
        return documentId;
      }

      const documentId = addRes.document.id;

      console.log(`Invoice ${invoiceData.invoiceNumber} stored to Document Vault with ID: ${documentId}`);
      return documentId;
    } catch (error) {
      console.error('Error storing invoice to Document Vault:', error);
      throw error;
    }
  }

  /**
   * Generate PDF and automatically store to Document Vault
   */
  async generateAndStoreInvoice(
    invoiceData: InvoiceData,
    customization?: Partial<InvoiceCustomization>,
    storeToVault: boolean = true
  ): Promise<{ blob: Blob; documentId?: string }> {
    const blob = await this.generatePDF(invoiceData, customization);

    let documentId: string | undefined;
    if (storeToVault) {
      try {
        documentId = await this.storeToDocumentVault(invoiceData, blob, customization);
      } catch (error) {
        console.warn('Failed to store invoice to Document Vault:', error);
        // Continue even if vault storage fails
      }
    }

    return { blob, documentId };
  }

  /**
   * Download invoice and store to Document Vault
   */
  async downloadAndStoreInvoice(
    invoiceData: InvoiceData,
    customization?: Partial<InvoiceCustomization>,
    storeToVault: boolean = true
  ): Promise<string | undefined> {
    const { blob, documentId } = await this.generateAndStoreInvoice(
      invoiceData,
      customization,
      storeToVault
    );

    // Download the file
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoiceData.invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return documentId;
  }
}

export const professionalInvoiceService = ProfessionalInvoiceService.getInstance();
