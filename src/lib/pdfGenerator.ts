import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { getVerificationUrl } from './settings';
import { generateMatrixStamp } from './stampGenerator';

export interface DocumentData {
  id: string;
  type: 'certificate' | 'offer_letter' | 'lor';
  student_name: string;
  student_email: string;
  verification_code: string;
  internship_domain: string;
  issue_date: string;
  additional_fields?: {
    duration?: string;
    performance?: string;
    position?: string;
    start_date?: string;
    end_date?: string;
    stipend?: string;
  };
}

const addHeaderFooter = (doc: jsPDF, logoDataUrl: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add logo
  doc.addImage(logoDataUrl, 'PNG', 15, 10, 25, 25);
  
  // Company name
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 128, 141); // #21808D
  doc.text('MATRIX INDUSTRIES', 45, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Innovation in Technology & Engineering', 45, 28);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Matrix Industries Pvt. Ltd. | www.matrixindustries.com', pageWidth / 2, pageHeight - 10, { align: 'center' });
};

export const generateCertificatePDF = async (data: DocumentData, logoDataUrl: string): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Elegant background gradient effect (using rectangles)
  doc.setFillColor(245, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Decorative corner elements
  doc.setFillColor(33, 128, 141);
  doc.triangle(0, 0, 30, 0, 0, 30, 'F');
  doc.triangle(pageWidth, 0, pageWidth - 30, 0, pageWidth, 30, 'F');
  
  // Main decorative border with double lines
  doc.setDrawColor(33, 128, 141);
  doc.setLineWidth(2);
  doc.rect(15, 20, pageWidth - 30, pageHeight - 40);
  
  doc.setLineWidth(0.5);
  doc.rect(18, 23, pageWidth - 36, pageHeight - 46);
  
  // Inner accent border
  doc.setDrawColor(50, 184, 198);
  doc.setLineWidth(0.3);
  doc.rect(20, 25, pageWidth - 40, pageHeight - 50);
  
  // Logo and header
  doc.addImage(logoDataUrl, 'PNG', pageWidth / 2 - 15, 32, 30, 30);
  
  // Company name under logo
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 128, 141);
  doc.text('MATRIX INDUSTRIES', pageWidth / 2, 68, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(80, 80, 80);
  doc.text('Innovation in Technology & Engineering', pageWidth / 2, 74, { align: 'center' });
  
  // Certificate title - larger, bold, no decorative lines
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 128, 141);
  doc.text('INTERNSHIP COMPLETION', pageWidth / 2, 90, { align: 'center' });
  
  doc.setFontSize(30);
  doc.text('CERTIFICATE', pageWidth / 2, 102, { align: 'center' });
  
    // Decorative underline
  doc.setDrawColor(50, 184, 198);
  doc.setLineWidth(0.5);
  doc.line(40, 107, pageWidth - 40, 107);
  
  // Certificate body
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('This is to certify that', pageWidth / 2, 122, { align: 'center' });
  
  // Student name with decorative box
  doc.setFillColor(250, 252, 253);
  doc.setDrawColor(50, 184, 198);
  doc.setLineWidth(0.3);
  doc.roundedRect(30, 129, pageWidth - 60, 18, 2, 2, 'FD');
  
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 128, 141);
  doc.text(data.student_name.toUpperCase(), pageWidth / 2, 140, { align: 'center' });
  
  // Completion text
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('has successfully completed the internship program in', pageWidth / 2, 158, { align: 'center' });
  
  // Domain with elegant border and subtle background
  doc.setFillColor(250, 252, 253); // Very light green tint
  doc.setDrawColor(50, 184, 198); // Green border
  doc.setLineWidth(1);
  doc.roundedRect(40, 164, pageWidth - 80, 16, 3, 3, 'FD');
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(39, 151, 86); // Bright green text
  doc.text(data.internship_domain.toUpperCase(), pageWidth / 2, 174, { align: 'center' });
  
  // Duration and date info box
  let infoY = 188;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  
  if (data.additional_fields?.duration) {
    doc.text(`Duration: ${data.additional_fields.duration}`, pageWidth / 2, infoY, { align: 'center' });
    infoY += 6;
  }
  
  doc.text(`Issue Date: ${new Date(data.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, infoY, { align: 'center' });
  
  // QR Code with border - optimized position
  // Points to configured verification URL (from Settings)
  const qrCodeUrl = getVerificationUrl(data.verification_code);
  const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, { width: 300, margin: 1 });
  
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(50, 184, 198);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth / 2 - 21, 202, 42, 42, 2, 2, 'FD');
  doc.addImage(qrDataUrl, 'PNG', pageWidth / 2 - 18, 205, 36, 36);
  
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('Scan to verify', pageWidth / 2, 249, { align: 'center' });
  
  // Signature section with professional layout - optimized spacing
  const sigY = 257;
  
  // Check if we have enough space, otherwise adjust
  const minFooterSpace = pageHeight - 15;
  const actualSigY = Math.min(sigY, minFooterSpace - 25);
  
  // Add Matrix Industries circular stamp (centered above signature)
  const stampDataUrl = await generateMatrixStamp();
  const stampSize = 52; // Stamp diameter in PDF units
  const stampX = 34; // Centered above signature (85 - 45/2 = centered at 85)
  const stampY = actualSigY - 45  ; // Positioned above the signature line
  doc.addImage(stampDataUrl, 'PNG', stampX, stampY, stampSize, stampSize);
  
  // Signature section (left side, mirroring Date of Issue position)
  doc.setLineWidth(0.3);
  doc.setDrawColor(100, 100, 100);
  doc.line(35, actualSigY, 85, actualSigY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Authorized Signatory', 60, actualSigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Matrix Industries', 60, actualSigY + 10, { align: 'center' });
  
  // Date stamp
  doc.line(pageWidth - 85, actualSigY, pageWidth - 35, actualSigY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Date of Issue', pageWidth - 60, actualSigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(new Date(data.issue_date).toLocaleDateString(), pageWidth - 60, actualSigY + 10, { align: 'center' });
  
  // Footer
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('Matrix Industries Pvt. Ltd. | www.matrixindustries.com | Email: info@matrixindustries.com', pageWidth / 2, pageHeight - 8, { align: 'center' });
  
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  doc.text(`Certificate ID: ${data.id.substring(0, 8)}`, pageWidth / 2, pageHeight - 4, { align: 'center' });
  
  return doc.output('blob');
};

export const generateOfferLetterPDF = async (data: DocumentData, logoDataUrl: string): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Professional letterhead background
  doc.setFillColor(33, 128, 141);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Logo in header (uses JPEG format for offer letter)
  doc.addImage(logoDataUrl, 'JPEG', 15, 10, 25, 25);
  
  // Company name in header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('MATRIX INDUSTRIES', 45, 22);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Innovation in Technology & Engineering', 45, 30);
  
  // Contact info in header
  doc.setFontSize(7);
  doc.text('www.matrixindustries.com | info@matrixindustries.com', 45, 36);
  
  // Accent line
  doc.setDrawColor(50, 184, 198);
  doc.setLineWidth(1.5);
  doc.line(0, 45, pageWidth, 45);
  
  // Letter title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 128, 141);
  doc.text('INTERNSHIP OFFER LETTER', pageWidth / 2, 60, { align: 'center' });
  
  // Reference number and date box
  doc.setFillColor(245, 250, 252);
  doc.roundedRect(15, 70, pageWidth - 30, 20, 2, 2, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(`Reference No: MI/INT/${new Date(data.issue_date).getFullYear()}/${data.id.substring(0, 6).toUpperCase()}`, 20, 78);
  doc.text(`Date: ${new Date(data.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 85);
  
  // Recipient details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('To,', 20, 102);
  
  doc.setFontSize(12);
  doc.setTextColor(33, 128, 141);
  doc.text(data.student_name, 20, 110);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(data.student_email, 20, 117);
  
  // Salutation
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Dear ' + data.student_name.split(' ')[0] + ',', 20, 132);
  
  // Calculate internship dates
  const startDate = data.additional_fields?.start_date 
    ? new Date(data.additional_fields.start_date) 
    : new Date();
  
  // Calculate end date: if provided use it, otherwise add 4 weeks (28 days)
  const endDate = data.additional_fields?.end_date 
    ? new Date(data.additional_fields.end_date)
    : new Date(startDate.getTime() + 28 * 24 * 60 * 60 * 1000);
  
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : 
                   day === 2 || day === 22 ? 'nd' : 
                   day === 3 || day === 23 ? 'rd' : 'th';
    return `${day}${suffix} ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };
  
  // Letter body with new content
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9.5);
  
  const position = data.additional_fields?.position || 'Intern';
  
  const bodyLines = [
    `We are pleased to offer you the position of ${position} at Matrix Industries.`,
    'This is an educational internship opportunity, designed to provide you with meaningful,',
    'hands-on experience in your chosen domain.',
    '',
    `Your internship is scheduled to begin on ${formatDate(startDate)} and will conclude`,
    `on ${formatDate(endDate)}, with a total duration of one month (4 weeks).`,
    '',
    'By accepting this offer, you acknowledge and agree that your participation in this program',
    'is not an offer of employment, and successful completion of the internship does not',
    'guarantee any employment or job offer from Matrix Industries.',
    '',
    'You further agree to abide by all company policies applicable to non-employee interns.',
    'This letter forms the complete understanding between you and Matrix Industries regarding',
    'your internship and supersedes any prior discussions or agreements. Modifications to this',
    'letter, if any, must be made in writing and signed by both parties.',
    '',
    'We look forward to welcoming you to the Matrix Industries internship program and wish',
    'you an enriching and successful experience.',
  ];
  
  let yPos = 142;
  bodyLines.forEach(line => {
    doc.text(line, 20, yPos);
    yPos += 5.5;
  });
  
  // Closing and Signature section
  yPos += 8;
  doc.setFontSize(10);
  doc.text('Sincerely,', 20, yPos);
  yPos += 5;
  doc.text('Matrix Industries', 20, yPos);
  
  yPos += 12;
  // Signature (left side)
  doc.setLineWidth(0.3);
  doc.setDrawColor(100, 100, 100);
  doc.line(20, yPos, 70, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('Authorized Signatory', 20, yPos + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('Human Resources Department', 20, yPos + 10);
  doc.text('Matrix Industries Pvt. Ltd.', 20, yPos + 15);
  
  // Add Matrix Industries circular stamp (bottom right side)
  const stampDataUrl = await generateMatrixStamp();
  const stampSize = 52; // Stamp diameter in PDF units
  const stampX = pageWidth - 65; // Right side position
  const stampY = yPos - 40; // Moved up to avoid footer overlap
  doc.addImage(stampDataUrl, 'PNG', stampX, stampY, stampSize, stampSize);
  
  // Acceptance section - with proper spacing check
  const acceptY = yPos + 22;
  
  // Only add acceptance section if there's enough space (at least 45mm from bottom)
  if (acceptY + 35 < pageHeight - 15) {
    doc.setFillColor(245, 250, 252);
    doc.roundedRect(20, acceptY, pageWidth - 40, 28, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 128, 141);
    doc.text('ACCEPTANCE', 25, acceptY + 6);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text('I, ' + data.student_name + ', accept this internship offer.', 25, acceptY + 13);
    
    doc.setLineWidth(0.3);
    doc.setDrawColor(100, 100, 100);
    doc.line(25, acceptY + 22, 75, acceptY + 22);
    doc.line(pageWidth - 75, acceptY + 22, pageWidth - 25, acceptY + 22);
    
    doc.setFontSize(7);
    doc.text('Signature', 50, acceptY + 26, { align: 'center' });
    doc.text('Date', pageWidth - 50, acceptY + 26, { align: 'center' });
  }
  
  // QR Code with professional styling
  // Points to configured verification URL (from Settings)
  const qrCodeUrl = getVerificationUrl(data.verification_code);
  const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, { width: 250, margin: 1 });
  
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(50, 184, 198);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth - 41, 70, 32, 32, 2, 2, 'FD');
  doc.addImage(qrDataUrl, 'PNG', pageWidth - 39, 72, 28, 28);
  
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text('Verify Offer', pageWidth - 25, 105, { align: 'center' });
  
  // Footer
  doc.setFillColor(240, 240, 240);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('Matrix Industries Pvt. Ltd. | Regd. Office: Technology Park, Innovation District', pageWidth / 2, pageHeight - 7, { align: 'center' });
  
  doc.setFontSize(6);
  doc.setTextColor(130, 130, 130);
  doc.text(`Document ID: ${data.id.substring(0, 16)} | This is a system-generated document`, pageWidth / 2, pageHeight - 3, { align: 'center' });
  
  return doc.output('blob');
};

export const generateLoRPDF = async (data: DocumentData, logoDataUrl: string): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  addHeaderFooter(doc, logoDataUrl);
  
  // Letter title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 128, 141);
  doc.text('LETTER OF RECOMMENDATION', pageWidth / 2, 50, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Date: ${new Date(data.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 65);
  
  // Salutation
  doc.setFontSize(11);
  doc.text('To Whom It May Concern,', 20, 80);
  
  // Letter body
  const performance = data.additional_fields?.performance || 'Good';
  const performanceText = performance === 'Excellent' 
    ? 'exceptional dedication, outstanding technical skills, and remarkable professionalism'
    : 'strong work ethic, good technical abilities, and professional conduct';
  
  const bodyLines = [
    `This letter is to recommend ${data.student_name} who completed an internship`,
    `with Matrix Industries in the ${data.internship_domain} department.`,
    '',
    `During the internship period${data.additional_fields?.duration ? ' of ' + data.additional_fields.duration : ''}, ${data.student_name.split(' ')[0]}`,
    `demonstrated ${performanceText}.`,
    performance === 'Excellent' ? `${data.student_name.split(' ')[0]} consistently exceeded expectations and` : `${data.student_name.split(' ')[0]}`,
    performance === 'Excellent' ? 'made significant contributions to our projects.' : 'contributed effectively to our team projects.',
    '',
    `${data.student_name.split(' ')[0]} showed excellent learning capabilities and adapted quickly to`,
    'our work environment. The technical skills and knowledge gained during this',
    'internship have prepared them well for future professional endeavors.',
    '',
    'We highly recommend ' + data.student_name.split(' ')[0] + ' for future opportunities and believe',
    'they will be a valuable asset to any organization.',
  ];
  
  let yPos = 95;
  bodyLines.forEach(line => {
    doc.text(line, 20, yPos);
    yPos += 7;
  });
  
  // QR Code
  // Points to configured verification URL (from Settings)
  const qrCodeUrl = getVerificationUrl(data.verification_code);
  const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, { width: 150, margin: 1 });
  doc.addImage(qrDataUrl, 'PNG', pageWidth - 50, 170, 30, 30);
  
  // Add Matrix Industries circular stamp (left side, before signature)
  const stampDataUrl = await generateMatrixStamp();
  const stampSize = 45; // Stamp diameter in PDF units
  const stampX = 20; // Far left position
  const stampY = yPos + 10; // Positioned to not overlap with signature
  doc.addImage(stampDataUrl, 'PNG', stampX, stampY, stampSize, stampSize);
  
  // Signature (positioned to the right of stamp)
  doc.text('Best Regards,', 55, yPos + 20);
  doc.line(55, yPos + 35, 105, yPos + 35);
  doc.text('Authorized Signatory', 55, yPos + 42);
  doc.text('Matrix Industries', 55, yPos + 49);
  
  // Document ID
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`LoR ID: ${data.id}`, pageWidth / 2, 280, { align: 'center' });
  
  return doc.output('blob');
};

export const loadLogoAsDataUrl = async (logoUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        // Detect format from URL - use JPEG for .jpeg/.jpg files, PNG for others
        const isJpeg = /\.(jpe?g)$/i.test(logoUrl);
        const format = isJpeg ? 'image/jpeg' : 'image/png';
        resolve(canvas.toDataURL(format));
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    img.onerror = reject;
    img.src = logoUrl;
  });
};
