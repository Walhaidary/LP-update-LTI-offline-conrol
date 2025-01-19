import React, { useEffect, useRef } from 'react';
import { BrowserQRCodeSvgWriter } from '@zxing/browser';
import { supabase } from '../../lib/supabase';

interface PrintableRegistrationProps {
  data: {
    serial_number: string;
    lti_sto: string;
    destination_state: string;
    destination_locality: string;
    transporter: string;
    driver_name: string;
    driver_phone: string;
    vehicle: string;
    capacity: string;
    remarks2: string;
    updated_by: string;
  };
  onClose: () => void;
}

export function PrintableRegistration({ data, onClose }: PrintableRegistrationProps) {
  const [creatorName, setCreatorName] = React.useState<string>('');
  const qrCodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.print();
  }, []);

  // Generate QR code when component mounts
  useEffect(() => {
    if (qrCodeRef.current) {
      const writer = new BrowserQRCodeSvgWriter();
      qrCodeRef.current.innerHTML = ''; // Clear previous content
      writer.writeToDom(qrCodeRef.current, data.serial_number, 100, 100);
    }
  }, [data.serial_number]);

  // Fetch creator's name when component mounts
  useEffect(() => {
    const fetchCreatorName = async () => {
      if (data.updated_by) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', data.updated_by)
          .single();
        
        if (profile) {
          setCreatorName(profile.full_name);
        }
      }
    };

    fetchCreatorName();
  }, [data.updated_by]);

  return (
    <div className="fixed inset-0 bg-white p-8 print:p-4">
      {/* Print close button - hidden when printing */}
      <button 
        onClick={onClose}
        className="fixed top-4 right-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover print:hidden"
      >
        Close
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Truck Loading Authorization</h1>
          <h2 className="text-2xl font-bold mb-6 font-arabic">تفويض تحميل قاطرة</h2>
          <p className="text-gray-500">
            Registration Date: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Registration Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">Serial Number</label>
                <p className="font-medium">{data.serial_number}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600">STO/LTI Number</label>
                <p className="font-medium">{data.lti_sto}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Transporter</label>
                <p className="font-medium">{data.transporter}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Destination Details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">State</label>
                <p className="font-medium">{data.destination_state}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Locality</label>
                <p className="font-medium">{data.destination_locality}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Driver Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">Name</label>
                <p className="font-medium">{data.driver_name}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Phone Number</label>
                <p className="font-medium">{data.driver_phone}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Vehicle Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">Plate Number</label>
                <p className="font-medium">{data.vehicle}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Capacity</label>
                <p className="font-medium">{data.capacity}</p>
              </div>
            </div>
          </div>
        </div>

        {data.remarks2 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Remarks</h2>
            <p className="p-4 bg-gray-50 rounded-lg">{data.remarks2}</p>
          </div>
        )}

        <div className="mt-12 pt-8 border-t grid grid-cols-2 gap-8">
          <div>
            <p className="font-medium mb-4">Created By:</p>
            <div className="border-b border-gray-400 h-10 flex items-end pb-2">
              {creatorName}
            </div>
          </div>
          <div>
            <p className="font-medium mb-4">Office Signature:</p>
            <div className="border-b border-gray-400 h-10"></div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="mt-8 flex flex-col items-center justify-center">
          <div ref={qrCodeRef} className="mb-2"></div>
          <p className="text-sm text-gray-500">{data.serial_number}</p>
        </div>
      </div>
    </div>
  );
}