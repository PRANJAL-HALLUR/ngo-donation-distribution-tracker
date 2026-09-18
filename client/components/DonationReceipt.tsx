import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Donation } from '@/context/DonationContext';
import { Download, Printer } from 'lucide-react';

interface DonationReceiptProps {
  donation: Donation;
  ngoName: string;
  donorName?: string;
  donorEmail?: string;
}

export function DonationReceipt({ donation, ngoName, donorName, donorEmail }: DonationReceiptProps) {
  const donationDate = donation.created_at ? new Date(donation.created_at) : new Date();
  const dName = donorName || (donation as any).donorName || 'Donor';
  const dEmail = donorEmail || (donation as any).donorEmail || 'Registered Donor';
  const paymentMethod = (donation as any).paymentMethod || 'Online (Razorpay)';
  const txnId = donation.razorpay_order_id || (donation as any).transactionId || donation.id;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptContent = generateReceiptText(donation, ngoName, dName, dEmail, paymentMethod, txnId);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
    element.setAttribute('download', `receipt_${donation.id.slice(0, 8)}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="shadow-lg border-0 print:shadow-none print:border print:border-slate-300">
      <CardHeader>
        <CardTitle className="text-center">Donation Receipt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-3xl font-bold text-slate-900">FundHub</h1>
          <p className="text-slate-600">Transparent NGO Donation Platform</p>
        </div>

        {/* Receipt Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 font-semibold">Receipt ID</p>
            <p className="text-slate-900 font-mono">{donation.id}</p>
          </div>
          <div>
            <p className="text-slate-500 font-semibold">Date</p>
            <p className="text-slate-900">
              {donationDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Donor Information */}
        <div className="space-y-3">
          <p className="font-semibold text-slate-900">Donor Information</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Name</p>
              <p className="text-slate-900">{dName}</p>
            </div>
            <div>
              <p className="text-slate-500">Email</p>
              <p className="text-slate-900">{dEmail}</p>
            </div>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Donation Details */}
        <div className="space-y-3">
          <p className="font-semibold text-slate-900">Donation Details</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <p className="text-slate-500">NGO</p>
              <p className="text-slate-900 font-semibold">{ngoName}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-slate-500">Category / Type</p>
              <p className="text-slate-900 font-semibold">{donation.type || 'General'}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-slate-500">Amount Donated</p>
              <p className="text-slate-900 font-bold text-base">
                ₹{Number(donation.amount).toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-normal">({donation.currency || 'INR'})</span>
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-slate-500">Payment Method</p>
              <p className="text-slate-900 font-semibold capitalize">{paymentMethod}</p>
            </div>
            {txnId && (
              <div className="flex justify-between">
                <p className="text-slate-500">Transaction ID</p>
                <p className="text-slate-900 font-mono text-xs">{txnId}</p>
              </div>
            )}
            <div className="flex justify-between">
              <p className="text-slate-500">Status</p>
              <p className="text-green-600 font-semibold capitalize">{donation.status}</p>
            </div>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Tax Information */}
        <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-2">
          <p className="font-semibold text-slate-900">Tax Exemption Information (Section 80G)</p>
          <p className="text-slate-700 leading-relaxed text-xs">
            This donation is eligible for tax deduction under <strong>Section 80G</strong> of the Indian Income Tax Act. Please retain this digital receipt for tax filing.
          </p>
          <p className="text-slate-600 font-mono text-xs">
            80G Reg No: 80G/{ngoName.substring(0, 3).toUpperCase()}/{donation.id.slice(0, 6).toUpperCase()}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center border-t pt-6">
          <p className="text-xs text-slate-500">
            Thank you for your generous contribution to {ngoName}!
          </p>
          <p className="text-xs text-slate-400 mt-2">
            This is an automated verified receipt from FundHub.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center pt-4 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function generateReceiptText(
  donation: Donation,
  ngoName: string,
  dName: string,
  dEmail: string,
  paymentMethod: string,
  txnId: string
): string {
  const donationDate = donation.created_at ? new Date(donation.created_at) : new Date();

  return `
FUNDHUB DONATION RECEIPT
========================

Receipt ID: ${donation.id}
Date: ${donationDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}

DONOR INFORMATION
=================
Name: ${dName}
Email: ${dEmail}

DONATION DETAILS
================
NGO: ${ngoName}
Type: ${donation.type || 'General'}
Amount: ₹${Number(donation.amount).toLocaleString('en-IN')} (${donation.currency || 'INR'})
Payment Method: ${paymentMethod}
Status: ${donation.status}
Transaction ID: ${txnId}

TAX EXEMPTION INFORMATION
=========================
Eligible for 50% tax deduction under Section 80G of the Indian Income Tax Act.
80G Reg No: 80G/${ngoName.substring(0, 3).toUpperCase()}/${donation.id.slice(0, 6).toUpperCase()}

Thank you for your generous contribution!
Verified by FundHub Cloud Platform.
  `.trim();
}
