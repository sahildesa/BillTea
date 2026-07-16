import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Quotation, QuotationItem, Company, Branch, Customer } from '@prisma/client';

function numberToWordsRupees(amount: number): string {
  const words = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertToWords(num: number): string {
    if (num === 0) return 'Zero';
    let result = '';
    
    if (Math.floor(num / 10000000) > 0) {
      result += convertToWords(Math.floor(num / 10000000)) + ' Crore ';
      num %= 10000000;
    }
    
    if (Math.floor(num / 100000) > 0) {
      result += convertToWords(Math.floor(num / 100000)) + ' Lakh ';
      num %= 100000;
    }
    
    if (Math.floor(num / 1000) > 0) {
      result += convertToWords(Math.floor(num / 1000)) + ' Thousand ';
      num %= 1000;
    }
    
    if (Math.floor(num / 100) > 0) {
      result += convertToWords(Math.floor(num / 100)) + ' Hundred ';
      num %= 100;
    }
    
    if (num > 0) {
      if (num < 20) {
        result += words[num];
      } else {
        result += tens[Math.floor(num / 10)];
        if (num % 10 > 0) {
          result += ' ' + words[num % 10];
        }
      }
    }
    return result.trim();
  }
  
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let str = convertToWords(rupees) + ' rupees';
  if (paise > 0) {
    str += ' and ' + convertToWords(paise).toLowerCase() + ' paise';
  }
  return str + ' Only';
}

@Injectable()
export class PdfService {
  constructor() {}

  async generateQuotationPdf(
    quotation: any, 
    company: Company, 
    branch: Branch,
    customer: any
  ): Promise<Buffer> {
    const qDate = new Date(quotation.quotationDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
    const validTillDate = new Date(quotation.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/');
    
    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
    // items table html
    let itemsHtml = '';
    
    if (quotation.items && quotation.items.length > 0) {
      quotation.items.forEach((item: any, index: number) => {
        const itemName = item.productSnapshot?.name || 'Item';
        const hsn = item.productSnapshot?.hsnNumber || '-';
        const sku = item.productSnapshot?.skuNumber || '-';
        const desc = item.editedDescription || '-';
        
        let taxPercent = '0%';
        let discountPercent = '0%';
        if (item.discountAmount > 0 && item.subtotal > 0) {
            discountPercent = Math.round((item.discountAmount / item.subtotal) * 100) + '%';
        }

        if (item.taxAmount > 0 && item.subtotal > 0) {
            taxPercent = Math.round((item.taxAmount / item.subtotal) * 100) + '%';
        }

        const imgPlaceholder = `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg" class="mx-auto block h-[65px] w-auto max-w-[120px]">
          <rect width="160" height="100" fill="#CCCBC9" />
          <g transform="translate(0, 10)">
              <ellipse cx="80" cy="30" rx="42" ry="7" fill="#1B1C1D"/>
              <path d="M38 30 C 38 75, 122 75, 122 30 Z" fill="#3D3E42" />
              <ellipse cx="80" cy="30" rx="40" ry="6" fill="#1B1C1D" />
              <ellipse cx="80" cy="31" rx="36" ry="4" fill="#2B2D31" />
          </g>
        </svg>`;

        let imageUrl = item.editedImage || item.originalImage;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) imageUrl = `${baseUrl}/${imageUrl.replace(/^\/+/, '')}`;
        const itemImage = imageUrl 
          ? `<img src="${imageUrl}" class="mx-auto block h-[65px] w-auto max-w-[120px] object-cover" />`
          : imgPlaceholder;

        itemsHtml += `
          <tr class="bg-[#F9F7F5] border-b border-[#e2e2e2]">
            <td class="py-2 px-2 border-x border-[#e2e2e2] text-[14px]">${index + 1}</td>
            <td class="py-2 px-2 border-x border-[#e2e2e2]">
              <div class="font-bold text-[13px] text-[#192C27] tracking-[0.05em] uppercase leading-tight mb-1 mt-1">${itemName}</div>
              <div class="text-[#74777c] font-medium text-[11px] uppercase pb-1">${desc}</div>
            </td>
            <td class="py-2 px-2 border-x border-[#e2e2e2]">
              <div class="text-[14px]">${sku}</div>
              <div class="text-[#74777c] text-[12px]">HSN: ${hsn}</div>
            </td>
            <td class="py-2 px-2 border-x border-[#e2e2e2] text-[14px]">${item.quantity}</td>
            <td class="py-2 px-2 border-x border-[#e2e2e2] text-[14px]">${item.editedPrice.toLocaleString('en-IN')}</td>
            <td class="py-2 px-2 border-x border-[#e2e2e2]">
              <div class="text-[14px]">${discountPercent}</div>
              <div class="text-[#74777c] text-[12px]">(₹ ${item.discountAmount.toLocaleString('en-IN')})</div>
            </td>
            <td class="py-2 px-2 border-x border-[#e2e2e2]">
              <div class="text-[14px]">${taxPercent}</div>
              <div class="text-[#74777c] text-[12px]">(₹ ${item.taxAmount.toLocaleString('en-IN')})</div>
            </td>
            <td class="py-2 px-2 border-x border-[#e2e2e2] text-[14px]">${item.total.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
            <td class="py-2 px-2 border-x border-[#e2e2e2]">
              ${itemImage}
            </td>
          </tr>
        `;
      });
    }

    let tncList: string[] = [];
    const tncRaw = quotation.termsAndConditions;
    if (Array.isArray(tncRaw)) {
      tncList = tncRaw;
    } else if (tncRaw && typeof tncRaw === 'object') {
      if (Array.isArray((tncRaw as any).terms)) {
         tncList = (tncRaw as any).terms;
      } else if (typeof (tncRaw as any).text === 'string') {
         tncList = (tncRaw as any).text.split('\\n').filter((t: string) => t.trim() !== '');
      } else {
         tncList = Object.values(tncRaw).filter(v => typeof v === 'string') as string[];
      }
    } else if (typeof tncRaw === 'string') {
      try {
         const parsed = JSON.parse(tncRaw);
         if (Array.isArray(parsed)) tncList = parsed;
         else if (parsed && Array.isArray(parsed.terms)) tncList = parsed.terms;
         else if (parsed && typeof parsed.text === 'string') tncList = parsed.text.split('\\n').filter((t: string) => t.trim() !== '');
         else if (parsed && typeof parsed === 'object') tncList = Object.values(parsed).filter(v => typeof v === 'string') as string[];
         else tncList = tncRaw.split('\\n').filter(t => t.trim() !== '');
      } catch (e) {
         tncList = tncRaw.split('\\n').filter(t => t.trim() !== '');
      }
    }

    let tncHtml = '';
    if (tncList && tncList.length > 0) {
      tncHtml = tncList.map((t: string) => `
        <li class="flex items-start text-xs">
          <span class="mr-2 text-[#9D7E6C]">•</span>
          <span class="flex-1">${t.trim()}</span>
        </li>
      `).join('');
    } else {
      tncHtml = `
        <li class="flex items-start text-xs">
          <span class="mr-2 text-[#9D7E6C]">•</span>
          <span class="flex-1">As per mutual discussion</span>
        </li>
      `;
    }

    const upiLink = `upi://pay?pa=${branch.upiId}&pn=${encodeURIComponent(company.name)}&cu=INR`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}&color=000&bgcolor=fff&margin=0`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Great+Vibes&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            background: #fff;
          }
          .font-serif {
            font-family: 'Playfair Display', serif;
          }
          .font-signature {
            font-family: 'Great Vibes', cursive;
          }
        </style>
      </head>
      <body class="w-[1000px] bg-[#FFFFFF] relative overflow-hidden flex flex-col text-[#1a1c1c] mx-auto min-h-[1414px]">
        
        <div class="flex relative h-[250px]">
          <div 
            class="absolute left-0 top-0 h-full w-[40%] bg-[#1B1C1D] z-0"
            style="clip-path: polygon(0 0, 100% 0, 75% 100%, 0 100%);"
          ></div>

          <div class="w-[30%] text-[#9D7E6C] p-8 pr-6 flex flex-col items-center justify-center relative z-10 h-full">
            ${company.logo ? `
                <img src="${company.logo.startsWith('http') || company.logo.startsWith('data:') ? company.logo : `${baseUrl}/${company.logo.replace(/^\/+/, '')}`}" alt="${company.name}" class="w-[180px] h-[64px] mb-6 object-contain opacity-90" />
            ` : `
                <div class="text-center font-serif text-[28px] italic text-[#9D7E6C] leading-snug tracking-wider">
                  <p>${company.name}</p>
                </div>
            `}
          </div>

          <div class="w-[70%] flex items-center justify-end pr-16 relative z-10 h-full">
            <div class="flex flex-col items-end text-right">
              <h2 class="font-serif text-[46px] text-[#1a1c1c] leading-none tracking-widest mb-4 uppercase">QUOTATION</h2>
              <div class="flex items-center justify-end w-40 mb-5 opacity-80">
                <div class="flex-1 h-[1.5px] bg-[#9D7E6C]"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-[#9D7E6C] mx-2"></div>
                <div class="w-8 h-[1.5px] bg-[#9D7E6C]"></div>
              </div>
              
              <p class="text-[12px] leading-[1.7] text-[#43474b] max-w-[260px] opacity-90">
                Thank you for considering ${company.name}.<br/>
                We are pleased to submit our quotation<br/>
                as per your requirements.
              </p>
            </div>
          </div>
        </div>

        <div class="px-10 mt-6 mb-8 flex">
          <div class="w-[26%] pl-2 pr-4">
            <div class="flex items-center mb-3">
              <h3 class="uppercase text-[#9D7E6C] text-[10px] font-semibold tracking-[0.2em] mr-4">COMPANY DETAILS</h3>
              <div class="w-10 h-[1.5px] bg-[#9D7E6C]"></div>
            </div>
            <h4 class="font-semibold text-[13px] text-[#192C27] mb-1">${branch.name || company.name}</h4>
            <p class="text-[12px] text-[#43474b] leading-[1.7]">
              ${branch.address || ''}<br/>
              ${branch.city || ''} ${branch.state ? '- ' + branch.state : ''}<br/>
              ${branch.pincode ? 'Pincode: ' + branch.pincode : ''}
            </p>
            <p class="text-[11px] text-[#1a1c1c] mt-4 tracking-wide font-medium">GSTIN: ${company.identifiers ? (Array.isArray(company.identifiers) ? (company.identifiers as any[]).find((i:any) => i.name === 'GSTIN')?.value || '-' : '-') : '-'}</p>
          </div>
          
          <div class="w-[42%] pl-6 border-l border-[#9D7E6C]">
            <div class="flex items-center mb-3">
              <h3 class="uppercase text-[#9D7E6C] text-[10px] font-semibold tracking-[0.2em] mr-4">CLIENT DETAILS</h3>
              <div class="w-10 h-[1.5px] bg-[#9D7E6C]"></div>
            </div>
            <h4 class="font-semibold text-[13px] text-[#192C27] mb-0.5">${customer.customerName}</h4>
            <p class="text-[11px] text-[#74777c] mb-2 uppercase tracking-wide">${customer.companyName || ''}</p>
            <div class="text-[12px] text-[#43474b] leading-[1.7]">
              <p class="mb-1">${customer.mobileNumber || ''} <span class="mx-2 text-[#e2e2e2]">|</span> GST: ${customer.gstin || '-'}</p>
              <p class="mb-1"><span class="font-semibold text-[#1a1c1c]">Billing:</span> ${quotation.billingAddressSnapshot?.address || '-'}, ${quotation.billingAddressSnapshot?.city || ''}</p>
              <p><span class="font-semibold text-[#1a1c1c]">Shipping:</span> ${quotation.shippingAddressSnapshot?.address || '-'}, ${quotation.shippingAddressSnapshot?.city || ''}</p>
            </div>
          </div>
          
          <div class="w-[32%] pl-6 border-l border-[#9D7E6C]">
            <div class="flex items-center mb-3">
              <h3 class="uppercase text-[#9D7E6C] text-[10px] font-semibold tracking-[0.2em] mr-4">ORDER DETAILS</h3>
              <div class="w-10 h-[1.5px] bg-[#9D7E6C]"></div>
            </div>
            <div class="flex flex-col gap-3 text-[11px] text-[#1a1c1c]">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-[14px] text-[#9D7E6C]">description</span>
                <div class="flex flex-1">
                  <span class="w-24 font-medium text-[#43474b]">Quotation No.</span>
                  <span class="font-semibold">: ${quotation.quotationNumber}</span>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-[14px] text-[#9D7E6C]">calendar_month</span>
                <div class="flex flex-1">
                  <span class="w-24 font-medium text-[#43474b]">Date</span>
                  <span class="font-semibold">: ${qDate}</span>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-[14px] text-[#9D7E6C]">event_available</span>
                <div class="flex flex-1">
                  <span class="w-24 font-medium text-[#43474b]">Valid Till</span>
                  <span class="font-semibold">: ${validTillDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-8 mb-6 mt-2">
          <table class="w-full text-center border-collapse border-b border-[#e2e2e2]">
            <thead>
              <tr class="bg-[#1B1C1D] text-[#9D7E6C] text-[10px] uppercase font-bold tracking-[0.1em]">
                <th class="py-[16px] px-2 font-bold w-[5%]">#</th>
                <th class="py-[16px] px-2 font-bold w-[19%]">PRODUCT</th>
                <th class="py-[16px] px-2 font-bold w-[15%]">SKU / HSN NUMBER</th>
                <th class="py-[16px] px-2 font-bold w-[5%]">QTY</th>
                <th class="py-[16px] px-2 font-bold w-[12%]">UNIT PRICE (₹)</th>
                <th class="py-[16px] px-2 font-bold w-[10%]">DISCOUNT %</th>
                <th class="py-[16px] px-2 font-bold w-[8%]">TAX %</th>
                <th class="py-[16px] px-2 font-bold w-[12%]">TOTAL (₹)</th>
                <th class="py-[16px] px-2 font-bold w-[14%]">PRODUCT IMG</th>
              </tr>
            </thead>
            <tbody class="text-[13px] text-[#1a1c1c] align-middle">
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div class="px-8 flex">
          <div class="w-[33%] pr-4 pb-2">
            <div class="flex items-center mb-4">
              <h3 class="uppercase text-[#9D7E6C] text-[11px] font-semibold tracking-wider mr-4">TERMS & CONDITIONS</h3>
              <div class="w-10 h-[1.5px] bg-[#9D7E6C]"></div>
            </div>
            <ul class="text-[11px] text-[#1a1c1c] leading-[1.6] space-y-[10px]">
              ${tncHtml}
            </ul>
          </div>

          <div class="w-[33%] pl-8 border-l border-[#9D7E6C] pb-2">
            <div class="flex items-center mb-4">
              <h3 class="uppercase text-[#9D7E6C] text-[11px] font-semibold tracking-wider mr-4">BANK DETAILS</h3>
              <div class="w-10 h-[1.5px] bg-[#9D7E6C]"></div>
            </div>
            <div class="text-[11px] text-[#1a1c1c] space-y-3">
              <div class="flex">
                <span class="w-[75px] font-medium text-[#43474b]">Bank Name</span><span class="mr-8 text-[#43474b]">:</span><span class="font-medium text-[#1a1c1c]">${branch.bankName || '-'}</span>
              </div>
              <div class="flex">
                <span class="w-[75px] font-medium text-[#43474b]">A/C Name</span><span class="mr-8 text-[#43474b]">:</span><span class="font-medium text-[#1a1c1c]">${company.name}</span>
              </div>
              <div class="flex">
                <span class="w-[75px] font-medium text-[#43474b]">A/C No.</span><span class="mr-8 text-[#43474b]">:</span><span class="font-medium text-[#1a1c1c]">${branch.accountNumber || '-'}</span>
              </div>
              <div class="flex">
                <span class="w-[75px] font-medium text-[#43474b]">IFSC Code</span><span class="mr-8 text-[#43474b]">:</span><span class="font-medium text-[#1a1c1c]">${branch.ifscCode || '-'}</span>
              </div>
              <div class="flex">
                <span class="w-[75px] font-medium text-[#43474b]">UPI ID</span><span class="mr-8 text-[#43474b]">:</span><span class="font-medium text-[#1a1c1c]">${branch.upiId || '-'}</span>
              </div>
            </div>
          </div>

          <div class="w-[34%] ml-auto bg-[#FFFFFF] flex flex-col">
            <div class="flex border border-[#e2e2e2] border-b-0 bg-[#F9F7F5]">
               <span class="px-5 py-4 uppercase text-[10px] tracking-widest text-[#43474b] w-1/2 border-r border-[#e2e2e2]">SUBTOTAL</span>
               <span class="px-5 py-4 text-right w-1/2 text-sm font-medium">₹ ${quotation.subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="flex border border-[#e2e2e2] border-b-0 bg-[#F9F7F5]">
               <span class="px-5 py-4 uppercase text-[10px] tracking-widest text-[#43474b] w-1/2 border-r border-[#e2e2e2]">DISCOUNT %</span>
               <span class="px-5 py-4 text-right w-1/2 text-sm font-medium">₹ ${quotation.discountAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="flex border border-[#e2e2e2] border-b-0 bg-[#F9F7F5]">
               <span class="px-5 py-4 uppercase text-[10px] tracking-widest text-[#43474b] w-1/2 border-r border-[#e2e2e2]">TAX %</span>
               <span class="px-5 py-4 text-right w-1/2 text-sm font-medium">₹ ${quotation.taxAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="bg-[#1B1C1D] text-white p-5 flex flex-col">
               <span class="uppercase text-[10px] tracking-widest text-[#9D7E6C] mb-1">GRAND TOTAL</span>
               <span class="font-serif text-[32px] text-[#9D7E6C] tracking-wide leading-none mb-2">₹ ${quotation.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
               <p class="text-[10px] text-[#c3c7cb] leading-snug">
                 (Rupees ${numberToWordsRupees(quotation.grandTotal)})
               </p>
            </div>
          </div>
        </div>

        <!-- Pre-Footer Grid (Pushed to bottom using mt-auto if needed, but min-h makes it stretch) -->
        <div class="mx-10 mt-8 pt-10 pb-8 flex items-end justify-between">
          <div class="flex flex-col items-start relative w-[25%] pl-2">
             <span class="text-[10.5px] text-[#74777c] mb-1">Prepared By</span>
             <span class="text-[11.5px] text-[#1a1c1c] font-medium z-10 relative bg-[#FFFFFF] pr-2">${company.name}</span>
             <div class="font-signature text-4xl text-[#192C27] mt-2 -ml-2 -mb-2 relative z-10 transform -rotate-2">
               ${branch.signatureValue ? `<img src="${branch.signatureValue.startsWith('http') || branch.signatureValue.startsWith('data:') ? branch.signatureValue : `${baseUrl}/${branch.signatureValue.replace(/^\/+/, '')}`}" style="max-height: 40px;"/>` : 'Authorised'}
             </div>
          </div>

          <div class="text-center w-[40%] pb-[14px]">
             <p class="font-serif text-[15px] text-[#1a1c1c] leading-[1.6]">
               Thank you for your business.<br/>
               We look forward to being a part of<br/>
               your beautiful journey.
             </p>
             <div class="w-8 h-[1.5px] bg-[#9D7E6C] mx-auto mt-4"></div>
          </div>

          <div class="w-[35%] flex justify-end items-center pr-2 pb-2">
             <div class="h-[75px] w-[1.5px] bg-[#9D7E6C] mr-5 opacity-40"></div>
             ${branch.upiId ? `
             <div class="border border-[#9D7E6C] p-[4px] rounded-sm mr-5 shrink-0 bg-white">
               <img src="${qrCodeUrl}" alt="Payment QR Code" class="w-[72px] h-[72px] block" />
             </div>
             ` : ''}
             <div class="flex flex-col relative w-[130px] pt-1">
                <span class="text-[11px] font-bold tracking-[0.08em] pb-[2px] uppercase text-[#1a1c1c] leading-tight">PAYMENT QR</span>
                <span class="text-[10px] font-medium tracking-[0.05em] uppercase text-[#74777c] leading-tight mt-[2px]">SCAN TO PAY</span>
                
                <svg class="w-[140px] h-5 text-[#9D7E6C] mt-2 block -ml-2" viewBox="0 0 140 20" fill="none" stroke="currentColor">
                   <path d="M2 16 L125 16 Q135 16, 137 5 M132 8 L137 5 L140 10" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
             </div>
          </div>
        </div>

        <div class="bg-[#1B1C1D] px-12 py-[16px] flex items-center justify-center border-t border-[#9D7E6C]/20 w-full mt-4">
           <span class="text-[#9D7E6C] text-[10px] uppercase tracking-[0.3em] font-medium opacity-80 flex items-center gap-3">
              <span class="w-8 h-[1px] bg-[#9D7E6C]/40"></span>
              BillTea By Indux Technology
              <span class="w-8 h-[1px] bg-[#9D7E6C]/40"></span>
           </span>
        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction('window.tailwind !== undefined && document.querySelectorAll("style").length > 0', { timeout: 3000 }).catch(() => {});
      await page.waitForFunction('Array.from(document.images).every(img => img.complete)', { timeout: 4000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 500)); // wait for tailwind to apply
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' }
      });
      
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
