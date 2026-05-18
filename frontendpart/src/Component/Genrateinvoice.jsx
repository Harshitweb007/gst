import React, { useState } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import { API_URL } from '../config/api';

function InvoiceGenerator() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: '0073',
    date: '29/11/2025',
    time: '13:11 HRS',
    vendorCode: '',
    dateTimePrepare: '29/11/2025',
    dateTimeRemoval: '29/11/2025',
    partyChNo: '01002253',
    partyChDate: '27/11/2025',
    poNo: 'PO NO.-2043',
    poDate: '27/11/2025',
    transport: '',
    vehicleNo: '',
    apxWeight: '0.00',
    customerName: 'NIDHI AUTO PVT LTD.',
    customerAddress1: 'PLOT NO. 10',
    customerAddress2: 'SCTOR-24',
    customerAddress3: 'FARIDABAD',
    customerState: 'Haryana',
    customerStateCode: '06',
    customerGST: '06AABCN8112G1ZR',
    customerPAN: 'AABCN8112G',
    eWayNo: '',
    cartons: '',
    freight: '0.00',
    cuttingCharges: '0.00'
  });

  const [items, setItems] = useState([
    {
      id: 1,
      sno: '1',
      description: 'PUNCH\n(AFTER WIRE\nCUT)\n(TOOL-CARRI\nER OP-30\n11400113)',
      pl: '634.90',
      th: '100.00',
      hrs: '45.35',
      set: '0.50',
      totalHrs: '45.85',
      hsnSac: '-',
      qty: '1.00',
      rate: '125.000',
      amount: '5,731.25'
    }
  ]);

  const [taxRates, setTaxRates] = useState({
    cgst: 9.0,
    sgst: 9.0,
    igst: 0.0
  });

  const calculateTotals = () => {
    const taxableAmount = items.reduce((sum, item) => {
      const amount = parseFloat(item.amount.replace(/,/g, '') || 0);
      return sum + amount;
    }, 0);
    
    const cgstAmount = (taxableAmount * taxRates.cgst) / 100;
    const sgstAmount = (taxableAmount * taxRates.sgst) / 100;
    const igstAmount = (taxableAmount * taxRates.igst) / 100;
    const freight = parseFloat(invoiceData.freight) || 0;
    const cutting = parseFloat(invoiceData.cuttingCharges) || 0;
    const grandTotal = taxableAmount + cgstAmount + sgstAmount + igstAmount + freight + cutting;
    const roundOff = Math.round(grandTotal) - grandTotal;
    const finalTotal = Math.round(grandTotal);

    return { taxableAmount, cgstAmount, sgstAmount, igstAmount, grandTotal, roundOff, finalTotal };
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';
    let words = '';
    if (num >= 10000000) { words += numberToWords(Math.floor(num / 10000000)) + ' Crore '; num %= 10000000; }
    if (num >= 100000) { words += numberToWords(Math.floor(num / 100000)) + ' Lakh '; num %= 100000; }
    if (num >= 1000) { words += numberToWords(Math.floor(num / 1000)) + ' Thousand '; num %= 1000; }
    if (num >= 100) { words += ones[Math.floor(num / 100)] + ' Hundred '; num %= 100; }
    if (num >= 20) { words += tens[Math.floor(num / 10)] + ' '; num %= 10; }
    if (num >= 10) { words += teens[num - 10] + ' '; return words.trim(); }
    if (num > 0) { words += ones[num] + ' '; }
    return words.trim();
  };

  const addItem = () => {
    setItems([...items, {
      id: items.length + 1,
      sno: (items.length + 1).toString(),
      description: '',
      pl: '0.00',
      th: '0.00',
      hrs: '0.00',
      set: '0.00',
      totalHrs: '0.00',
      hsnSac: '-',
      qty: '1.00',
      rate: '0.000',
      amount: '0.00'
    }]);
  };

  const saveInvoice = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again");
      return;
    }

    const payload = {
      invoiceNo: invoiceData.invoiceNo,
      date: invoiceData.date,
      customerName: invoiceData.customerName,
      customerGST: invoiceData.customerGST,
      customerPAN: invoiceData.customerPAN,
      items,
      totals,
      totalAmount: totals.finalTotal
    };

    const res = await fetch(`${API_URL}/api/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed");

    alert("✅ Invoice saved successfully");
  } catch (err) {
    console.error(err);
    alert("❌ Failed to save invoice");
  }
};

  const removeItem = (id) => {
    if (items.length > 1) {
      const newItems = items.filter(item => item.id !== id);
      // Re-number the items
      const renumberedItems = newItems.map((item, index) => ({
        ...item,
        sno: (index + 1).toString()
      }));
      setItems(renumberedItems);
    }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // If quantity or rate changes, recalculate amount
        if (field === 'qty' || field === 'rate') {
          const qty = parseFloat(updated.qty || 0);
          const rate = parseFloat(updated.rate || 0);
          const calcAmount = (qty * rate).toFixed(2);
          updated.amount = parseFloat(calcAmount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        }
        
        return updated;
      }
      return item;
    }));
  };

  const totals = calculateTotals();
  const amountInWords = numberToWords(totals.finalTotal) + ' Only';
  const totalQty = items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-[210mm] mx-auto bg-white">
        
        {/* PRINT LAYOUT - EXACT MATCH */}
        <div className="hidden print:block" style={{padding: '10mm', fontFamily: 'Arial, sans-serif'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', border: '2px solid black', marginBottom: '0'}}>
            <tbody>
              {/* Row 1: GST/PAN - TAX INVOICE - State */}
              <tr>
                <td style={{border: '1px solid black', padding: '8px 10px', width: '30%', fontSize: '9px', verticalAlign: 'top'}}>
                  <div style={{fontWeight: 'bold'}}>GST No. : 06BMKPR0166F1Z1</div>
                  <div style={{fontWeight: 'bold'}}>PAN No : BMKPR0166F</div>
                </td>
                <td style={{border: '1px solid black', padding: '4px 10px', width: '40%', textAlign: 'center', verticalAlign: 'middle'}}>
                  <div style={{fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '2px'}}>TAX INVOICE</div>
                  <div style={{fontSize: '9px', marginBottom: '2px'}}>(Invoice Under GST Rule-7,Section-31)</div>
                  <div style={{fontSize: '10px', fontWeight: 'bold'}}>Original for Recipient</div>
                </td>
                <td style={{border: '1px solid black', padding: '8px 10px', width: '30%', fontSize: '9px', textAlign: 'right', verticalAlign: 'top'}}>
                  <div style={{fontWeight: 'bold'}}>State : Haryana</div>
                  <div style={{fontWeight: 'bold'}}>State Code : 06</div>
                </td>
              </tr>

              {/* Row 2: Company Name and Address */}
              <tr>
                <td colSpan="3" style={{border: '1px solid black', padding: '6px 10px', textAlign: 'center'}}>
                  <div style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '2px'}}>M.G TOOLS</div>
                  <div style={{fontSize: '9px'}}>HOUSE NO. 1269-A, GALI NO. 6, PARVATIYA</div>
                  <div style={{fontSize: '9px', marginBottom: '2px'}}>COLONY, FARIDABAD - 121005, HARYANA</div>
                  <div style={{fontSize: '9px'}}>Ph. No. : 8287969270 Email : mgtool73@gmail.com</div>
                </td>
              </tr>

              {/* Row 3: Customer Details & Invoice Details */}
              <tr>
                <td colSpan="2" style={{border: '1px solid black', padding: '8px 10px', width: '55%', verticalAlign: 'top', fontSize: '9px'}}>
                  <div style={{fontWeight: 'bold', marginBottom: '4px'}}>CUSTOMER'S NAME & ADDRESS</div>
                  <div style={{fontWeight: 'bold', fontSize: '10px'}}>{invoiceData.customerName}</div>
                  <div>{invoiceData.customerAddress1}</div>
                  <div>{invoiceData.customerAddress2}</div>
                  <div style={{marginBottom: '4px'}}>{invoiceData.customerAddress3}</div>
                  <div><span style={{fontWeight: 'bold'}}>GST No.</span> : {invoiceData.customerGST}</div>
                  <div><span style={{fontWeight: 'bold'}}>PAN No.</span> : {invoiceData.customerPAN}</div>
                  <div><span style={{fontWeight: 'bold'}}>State</span> : {invoiceData.customerState} <span style={{fontWeight: 'bold'}}>State Code :</span> {invoiceData.customerStateCode}</div>
                </td>
                <td style={{border: '1px solid black', padding: '8px 10px', width: '45%', verticalAlign: 'top', fontSize: '9px'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <tbody>
                      <tr><td style={{paddingBottom: '3px'}}><b>INVOICE NO.:</b></td><td style={{paddingBottom: '3px'}}>{invoiceData.invoiceNo}</td></tr>
                      <tr><td style={{paddingBottom: '3px'}}><b>Date :</b></td><td style={{paddingBottom: '3px'}}>{invoiceData.date}</td><td style={{textAlign: 'right', paddingBottom: '3px'}}>{invoiceData.time}</td></tr>
                      <tr><td style={{paddingBottom: '3px'}}><b>Vendor Code :</b></td><td colSpan="2" style={{paddingBottom: '3px'}}>{invoiceData.vendorCode}</td></tr>
                      <tr><td colSpan="3" style={{paddingBottom: '3px'}}><b>Date / Time of Prepare :</b> {invoiceData.dateTimePrepare}</td></tr>
                      <tr><td colSpan="3" style={{paddingBottom: '3px'}}><b>Date /Time of Removal :</b> {invoiceData.dateTimeRemoval}</td></tr>
                      <tr><td style={{paddingBottom: '3px'}}><b>Party Ch. No. :</b></td><td style={{paddingBottom: '3px'}}>{invoiceData.partyChNo}</td><td style={{textAlign: 'right', paddingBottom: '3px'}}>{invoiceData.partyChDate}</td></tr>
                      <tr><td colSpan="2" style={{paddingBottom: '3px'}}><b>PO No. & Date :</b> {invoiceData.poNo}</td><td style={{textAlign: 'right', paddingBottom: '3px'}}>{invoiceData.poDate}</td></tr>
                      <tr><td style={{paddingBottom: '3px'}}><b>Transport :</b></td><td colSpan="2" style={{paddingBottom: '3px'}}>{invoiceData.transport}</td></tr>
                      <tr><td style={{paddingBottom: '3px'}}><b>Vehicle No. :</b></td><td colSpan="2" style={{paddingBottom: '3px'}}>{invoiceData.vehicleNo}</td></tr>
                      <tr><td style={{paddingBottom: '3px'}}><b>Apx Weight :</b></td><td colSpan="2" style={{paddingBottom: '3px'}}>{invoiceData.apxWeight}</td></tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* Row 4: Items Table */}
              <tr>
                <td colSpan="3" style={{border: '1px solid black', padding: '0'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr style={{fontSize: '9px', fontWeight: 'bold', textAlign: 'center'}}>
                        <th style={{border: '1px solid black', padding: '4px 2px', width: '4%'}}>S.NO.</th>
                        <th style={{border: '1px solid black', padding: '4px 2px', width: '20%'}}>DESCRIPTION OF GOODS</th>
                        <th style={{border: '1px solid black', padding: '4px 2px', width: '7%'}}>PL</th>
                        <th style={{border: '1px solid black', padding: '4px 2px', width: '7%'}}>TH</th>
                        <th style={{border: '1px solid black', padding: '4px 2px', width: '7%'}}>HRS</th>
                        <th style={{border: '1px solid black', padding: '4px 2px', width: '6%'}}>SET</th>
                        <th style={{border: '1px solid black', padding: '4px 2px', width: '8%'}}>Total HRS</th>
                        <th style={{border: '1px solid black', padding: '4px 2px', width: '9%'}}>HSN / SAC</th>
                        <th style={{border: '1px solid black', padding: '4px 2px', width: '6%'}}>QTY</th>
                        <th style={{border: '1px solid black', padding: '4px 2px', width: '10%'}}>RATE</th>
                        <th style={{border: '1px solid black', padding: '4px 2px', width: '12%'}}>AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id} style={{fontSize: '8px'}}>
                          <td style={{border: '1px solid black', padding: '4px 2px', textAlign: 'center'}}>{item.sno}</td>
                          <td style={{border: '1px solid black', padding: '4px 4px', fontSize: '7px', whiteSpace: 'pre-line', lineHeight: '1.3'}}>{item.description}</td>
                          <td style={{border: '1px solid black', padding: '4px 2px', textAlign: 'right'}}>{item.pl}</td>
                          <td style={{border: '1px solid black', padding: '4px 2px', textAlign: 'right'}}>{item.th}</td>
                          <td style={{border: '1px solid black', padding: '4px 2px', textAlign: 'right'}}>{item.hrs}</td>
                          <td style={{border: '1px solid black', padding: '4px 2px', textAlign: 'right'}}>{item.set}</td>
                          <td style={{border: '1px solid black', padding: '4px 2px', textAlign: 'right'}}>{item.totalHrs}</td>
                          <td style={{border: '1px solid black', padding: '4px 2px', textAlign: 'center'}}>{item.hsnSac}</td>
                          <td style={{border: '1px solid black', padding: '4px 2px', textAlign: 'right'}}>{item.qty}</td>
                          <td style={{border: '1px solid black', padding: '4px 2px', textAlign: 'right'}}>{item.rate}</td>
                          <td style={{border: '1px solid black', padding: '4px 2px', textAlign: 'right'}}>{item.amount}</td>
                        </tr>
                      ))}
                      <tr style={{fontSize: '9px', fontWeight: 'bold'}}>
                        <td colSpan="2" style={{border: '1px solid black', padding: '4px 4px'}}>JOB WORK ONLY</td>
                        <td colSpan="6" style={{border: '1px solid black', padding: '4px 2px'}}></td>
                        <td colSpan="2" style={{border: '1px solid black', padding: '4px 2px', textAlign: 'right'}}>TOTAL : {totalQty.toFixed(2)}</td>
                        <td style={{border: '1px solid black', padding: '4px 2px', textAlign: 'right'}}>{totals.taxableAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* Row 5: Bottom Section */}
              <tr>
                <td colSpan="2" style={{border: '1px solid black', padding: '8px 10px', width: '55%', verticalAlign: 'top', fontSize: '9px'}}>
                  <div style={{marginBottom: '4px'}}><b>E-Way Form No. :</b> {invoiceData.eWayNo}</div>
                  <div style={{marginBottom: '8px'}}><b>No. of Cartons :</b> {invoiceData.cartons}</div>
                  <div style={{marginBottom: '2px', fontWeight: 'bold'}}>Total Invoice Value (in words) Rs.</div>
                  <div style={{fontWeight: 'bold', fontSize: '10px', marginBottom: '10px'}}>{amountInWords}</div>
                  <div style={{marginBottom: '1px'}}><b>Bank :</b> AU SMALL FINANCE BANK</div>
                  <div style={{marginBottom: '1px'}}><b>Branch :</b> NIT 5 FARIDABAD</div>
                  <div style={{marginBottom: '1px'}}><b>A/c No :</b> 2302246753549563</div>
                  <div><b>IFSC Code :</b> AUBL0002467</div>
                </td>
                <td style={{border: '1px solid black', padding: '8px 10px', width: '45%', verticalAlign: 'top', fontSize: '9px'}}>
                  <table style={{width: '100%'}}>
                    <tbody>
                      <tr><td style={{paddingBottom: '2px'}}>Freight</td><td style={{textAlign: 'right', paddingBottom: '2px'}}>{invoiceData.freight}</td></tr>
                      <tr><td style={{paddingBottom: '2px'}}>Cutting / Other Charges</td><td style={{textAlign: 'right', paddingBottom: '2px'}}>{invoiceData.cuttingCharges}</td></tr>
                      <tr><td style={{paddingBottom: '2px'}}>Taxable Amount</td><td style={{textAlign: 'right', paddingBottom: '2px'}}>{totals.taxableAmount.toFixed(2)}</td></tr>
                      <tr><td style={{paddingBottom: '2px'}}>CGST @ {taxRates.cgst}%</td><td style={{textAlign: 'right', paddingBottom: '2px'}}>{totals.cgstAmount.toFixed(2)}</td></tr>
                      <tr><td style={{paddingBottom: '2px'}}>SGST @ {taxRates.sgst}%</td><td style={{textAlign: 'right', paddingBottom: '2px'}}>{totals.sgstAmount.toFixed(2)}</td></tr>
                      <tr><td style={{paddingBottom: '2px'}}>IGST @ {taxRates.igst}%</td><td style={{textAlign: 'right', paddingBottom: '2px'}}>{totals.igstAmount.toFixed(2)}</td></tr>
                      <tr><td style={{paddingBottom: '4px'}}>Round off</td><td style={{textAlign: 'right', paddingBottom: '4px'}}>{totals.roundOff.toFixed(2)}</td></tr>
                      <tr style={{fontWeight: 'bold', borderTop: '1px solid black'}}><td style={{paddingTop: '4px'}}>Grand Total (Rs.)</td><td style={{textAlign: 'right', paddingTop: '4px'}}>{totals.finalTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td></tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* Row 6: Terms & Declaration */}
              <tr>
                <td colSpan="3" style={{border: '1px solid black', padding: '8px 10px', fontSize: '7.5px'}}>
                  <div style={{marginBottom: '6px'}}>
                    <div style={{fontWeight: 'bold', marginBottom: '2px'}}>TERMS & CONDITIONS :</div>
                    <div>1. Interest @18% P.A. will be charged extra on all the bills outstanding if payment made after due date.</div>
                    <div>2. Our Responsibility ceases as the goods leave our premises</div>
                    <div>3. All Disputes subject to FARIDABAD Jurisdiction only</div>
                  </div>
                  <div style={{marginBottom: '6px'}}><b>Tax Payable on Reverse Charges :</b> N. A.</div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div style={{width: '60%'}}>
                      <div style={{fontWeight: 'bold', marginBottom: '2px'}}>DECLARATION :</div>
                      <div>Certified that Particulrars given above are true & correct under GST Act 2017 and amount indicated represent the price actualy charged and that there is no flow of additional consideration directly or indirectly from buyer.</div>
                    </div>
                    <div style={{width: '35%', textAlign: 'right', fontSize: '9px'}}>
                      <div style={{marginBottom: '30px'}}>Authorised Signatory</div>
                      <div style={{fontWeight: 'bold'}}>For M.G TOOLS</div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SCREEN FORM */}
        <div className="print:hidden p-6">
          <div className="flex gap-3">
 

</div>
<div className="flex flex-wrap gap-4 mb-6 sticky top-4 z-10 bg-gray-100 p-4 rounded-xl shadow-md">
  <button
    onClick={saveInvoice}
    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition shadow-lg"
  >
    💾 Save Invoice
  </button>

  <button
    onClick={() => window.print()}
    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg"
  >
    <Download size={18} />
    Download PDF
  </button>

  <button 
    onClick={() => window.print()} 
    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg transition duration-300 rounded-xl"
  >
    <Download size={20} /> Print Invoice
  </button>
</div>


          {/* Invoice Details */}
          <div className="bg-white border border-gray-300 rounded-lg shadow p-4 mb-4">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Invoice Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Invoice No.</label>
                <input 
                  type="text" 
                  value={invoiceData.invoiceNo} 
                  onChange={(e) => setInvoiceData({...invoiceData, invoiceNo: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
                <input 
                  type="text" 
                  value={invoiceData.date} 
                  onChange={(e) => setInvoiceData({...invoiceData, date: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="DD/MM/YYYY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Time</label>
                <input 
                  type="text" 
                  value={invoiceData.time} 
                  onChange={(e) => setInvoiceData({...invoiceData, time: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="HH:MM HRS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Vendor Code</label>
                <input 
                  type="text" 
                  value={invoiceData.vendorCode} 
                  onChange={(e) => setInvoiceData({...invoiceData, vendorCode: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Date/Time of Prepare</label>
                <input 
                  type="text" 
                  value={invoiceData.dateTimePrepare} 
                  onChange={(e) => setInvoiceData({...invoiceData, dateTimePrepare: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="DD/MM/YYYY HH:MM HRS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Date/Time of Removal</label>
                <input 
                  type="text" 
                  value={invoiceData.dateTimeRemoval} 
                  onChange={(e) => setInvoiceData({...invoiceData, dateTimeRemoval: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">PO No.</label>
                <input 
                  type="text" 
                  value={invoiceData.poNo} 
                  onChange={(e) => setInvoiceData({...invoiceData, poNo: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">PO Date</label>
                <input 
                  type="text" 
                  value={invoiceData.poDate} 
                  onChange={(e) => setInvoiceData({...invoiceData, poDate: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="DD/MM/YYYY"
                />
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-white border border-gray-300 rounded-lg shadow p-4 mb-4">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Customer Name</label>
                <input 
                  type="text" 
                  value={invoiceData.customerName} 
                  onChange={(e) => setInvoiceData({...invoiceData, customerName: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Customer GST No.</label>
                <input 
                  type="text" 
                  value={invoiceData.customerGST} 
                  onChange={(e) => setInvoiceData({...invoiceData, customerGST: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Address Line 1</label>
                <input 
                  type="text" 
                  value={invoiceData.customerAddress1} 
                  onChange={(e) => setInvoiceData({...invoiceData, customerAddress1: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Address Line 2</label>
                <input 
                  type="text" 
                  value={invoiceData.customerAddress2} 
                  onChange={(e) => setInvoiceData({...invoiceData, customerAddress2: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Address Line 3</label>
                <input 
                  type="text" 
                  value={invoiceData.customerAddress3} 
                  onChange={(e) => setInvoiceData({...invoiceData, customerAddress3: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">State</label>
                <input 
                  type="text" 
                  value={invoiceData.customerState} 
                  onChange={(e) => setInvoiceData({...invoiceData, customerState: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">State Code</label>
                <input 
                  type="text" 
                  value={invoiceData.customerStateCode} 
                  onChange={(e) => setInvoiceData({...invoiceData, customerStateCode: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">PAN No.</label>
                <input 
                  type="text" 
                  value={invoiceData.customerPAN} 
                  onChange={(e) => setInvoiceData({...invoiceData, customerPAN: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white border border-gray-300 rounded-lg shadow p-4 mb-4">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h2 className="text-xl font-semibold">Items</h2>
              <button 
                onClick={addItem} 
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300"
              >
                <Plus size={18} /> Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-300">#</th>
                    <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-300">Description</th>
                    <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-300">PL</th>
                    <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-300">TH</th>
                    <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-300">HRS</th>
                    <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-300">SET</th>
                    <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-300">Total HRS</th>
                    <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-300">HSN/SAC</th>
                    <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-300">Qty</th>
                    <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-300">Rate</th>
                    <th className="p-3 text-left font-semibold text-gray-700 border-r border-gray-300">Amount</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 border-r border-gray-300">{index + 1}</td>
                      <td className="p-3 border-r border-gray-300">
                        <textarea 
                          value={item.description} 
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)} 
                          className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent" 
                          rows="3"
                        />
                      </td>
                      <td className="p-3 border-r border-gray-300">
                        <input 
                          type="number" 
                          step="0.01" 
                          value={item.pl} 
                          onChange={(e) => updateItem(item.id, 'pl', e.target.value)} 
                          className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="p-3 border-r border-gray-300">
                        <input 
                          type="number" 
                          step="0.01" 
                          value={item.th} 
                          onChange={(e) => updateItem(item.id, 'th', e.target.value)} 
                          className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="p-3 border-r border-gray-300">
                        <input 
                          type="number" 
                          step="0.01" 
                          value={item.hrs} 
                          onChange={(e) => updateItem(item.id, 'hrs', e.target.value)} 
                          className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="p-3 border-r border-gray-300">
                        <input 
                          type="number" 
                          step="0.01" 
                          value={item.set} 
                          onChange={(e) => updateItem(item.id, 'set', e.target.value)} 
                          className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="p-3 border-r border-gray-300">
                        <input 
                          type="number" 
                          step="0.01" 
                          value={item.totalHrs} 
                          onChange={(e) => updateItem(item.id, 'totalHrs', e.target.value)} 
                          className="w-24 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="p-3 border-r border-gray-300">
                        <input 
                          type="text" 
                          value={item.hsnSac} 
                          onChange={(e) => updateItem(item.id, 'hsnSac', e.target.value)} 
                          className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="p-3 border-r border-gray-300">
                        <input 
                          type="number" 
                          step="0.01" 
                          value={item.qty} 
                          onChange={(e) => updateItem(item.id, 'qty', e.target.value)} 
                          className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="p-3 border-r border-gray-300">
                        <input 
                          type="number" 
                          step="0.001" 
                          value={item.rate} 
                          onChange={(e) => updateItem(item.id, 'rate', e.target.value)} 
                          className="w-24 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="p-3 border-r border-gray-300 font-medium">{item.amount}</td>
                      <td className="p-3">
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800 transition duration-300"
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white border border-gray-300 rounded-lg shadow p-4 mb-4">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Additional Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Party Ch. No.</label>
                <input 
                  type="text" 
                  value={invoiceData.partyChNo} 
                  onChange={(e) => setInvoiceData({...invoiceData, partyChNo: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Party Ch. Date</label>
                <input 
                  type="text" 
                  value={invoiceData.partyChDate} 
                  onChange={(e) => setInvoiceData({...invoiceData, partyChDate: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="DD/MM/YYYY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Transport</label>
                <input 
                  type="text" 
                  value={invoiceData.transport} 
                  onChange={(e) => setInvoiceData({...invoiceData, transport: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Vehicle No.</label>
                <input 
                  type="text" 
                  value={invoiceData.vehicleNo} 
                  onChange={(e) => setInvoiceData({...invoiceData, vehicleNo: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Apx Weight</label>
                <input 
                  type="text" 
                  value={invoiceData.apxWeight} 
                  onChange={(e) => setInvoiceData({...invoiceData, apxWeight: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">E-Way Form No.</label>
                <input 
                  type="text" 
                  value={invoiceData.eWayNo} 
                  onChange={(e) => setInvoiceData({...invoiceData, eWayNo: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">No. of Cartons</label>
                <input 
                  type="text" 
                  value={invoiceData.cartons} 
                  onChange={(e) => setInvoiceData({...invoiceData, cartons: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Freight</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={invoiceData.freight} 
                  onChange={(e) => setInvoiceData({...invoiceData, freight: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Cutting/Other Charges</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={invoiceData.cuttingCharges} 
                  onChange={(e) => setInvoiceData({...invoiceData, cuttingCharges: e.target.value})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Tax Configuration */}
          <div className="bg-white border border-gray-300 rounded-lg shadow p-4 mb-4">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Tax Configuration</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">CGST %</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={taxRates.cgst} 
                  onChange={(e) => setTaxRates({...taxRates, cgst: parseFloat(e.target.value)})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">SGST %</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={taxRates.sgst} 
                  onChange={(e) => setTaxRates({...taxRates, sgst: parseFloat(e.target.value)})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">IGST %</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={taxRates.igst} 
                  onChange={(e) => setTaxRates({...taxRates, igst: parseFloat(e.target.value)})} 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-blue-300">Invoice Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Taxable Amount:</span>
                <span className="font-semibold">₹{totals.taxableAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">CGST ({taxRates.cgst}%):</span>
                <span className="font-semibold">₹{totals.cgstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">SGST ({taxRates.sgst}%):</span>
                <span className="font-semibold">₹{totals.sgstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">IGST ({taxRates.igst}%):</span>
                <span className="font-semibold">₹{totals.igstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Freight:</span>
                <span className="font-semibold">₹{invoiceData.freight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Cutting/Other Charges:</span>
                <span className="font-semibold">₹{invoiceData.cuttingCharges}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Round Off:</span>
                <span className="font-semibold">₹{totals.roundOff.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t-2 border-blue-300 pt-3">
                <span>Grand Total:</span>
                <span>₹{totals.finalTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="text-sm text-gray-600 mt-2 p-2 bg-white rounded border border-gray-200">
                <span className="font-medium text-gray-700">In Words: </span> {amountInWords}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            background: white;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default InvoiceGenerator;
