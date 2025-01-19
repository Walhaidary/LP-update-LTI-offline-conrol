import React, { useRef, useState, useEffect } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database';

type ShipmentUpdate = Database['public']['Tables']['shipments_updates']['Row'];

interface BarcodeScannerProps {
  onShipmentsFound: (shipments: ShipmentUpdate[]) => void;
}

export function BarcodeScanner({ onShipmentsFound }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  // Cleanup function to properly stop all camera resources
  const cleanupCamera = async () => {
    if (readerRef.current) {
      try {
        await readerRef.current.stopAsyncDecode();
        readerRef.current.reset();
        readerRef.current = null;
      } catch (err) {
        // Silently handle cleanup errors
      }
    }

    // Ensure video tracks are stopped
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    // Initialize the barcode reader
    readerRef.current = new BrowserMultiFormatReader();

    // Cleanup on unmount
    return () => {
      cleanupCamera();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Prefer back camera
        } 
      });
      stream.getTracks().forEach(track => track.stop()); // Release the camera
      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      setHasPermission(false);
      setError('Camera permission denied. Please grant access to your camera and try again.');
      return false;
    }
  };

  const handleSerialNumber = async (serialNumber: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('shipments_updates')
        .select('*')
        .eq('serial_number', serialNumber)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      if (!data || data.length === 0) {
        throw new Error('No shipments found with this serial number');
      }

      onShipmentsFound(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shipment data');
    } finally {
      setIsScanning(false);
    }
  };

  const startScanning = async () => {
    try {
      setError(null);
      
      // Check camera permission first
      const hasAccess = await checkCameraPermission();
      if (!hasAccess) return;

      await cleanupCamera(); // Ensure previous instances are cleaned up
      setIsScanning(true);

      if (!videoRef.current) return;
      readerRef.current = new BrowserMultiFormatReader();

      // Get available video devices
      const videoInputDevices = await readerRef.current.listVideoInputDevices();
      
      // Prefer back camera if available
      const selectedDevice = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      ) || videoInputDevices[0];

      if (!selectedDevice) {
        throw new Error('No camera found');
      }

      // Start continuous scanning
      await readerRef.current.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current,
        (result, err) => {
          if (err) return; // Ignore intermittent scanning errors
          if (result) {
            const serialNumber = result.getText();
            handleSerialNumber(serialNumber);
            stopScanning();
          }
        }
      );
    } catch (err) {
      setError('Failed to start camera. Please ensure camera permissions are granted and try again.');
      setIsScanning(false);
      await cleanupCamera();
    }
  };

  const stopScanning = async () => {
    setIsScanning(false);
    await cleanupCamera();
  };

  const handleManualInput = () => {
    const serialNumber = prompt('Enter serial number manually:');
    if (serialNumber) {
      handleSerialNumber(serialNumber);
    }
  };

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <div className="flex gap-3">
          <button
            onClick={startScanning}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Camera className="w-5 h-5" />
            Scan Barcode
          </button>
          
          <button
            onClick={handleManualInput}
            className="flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Manual Input
          </button>
        </div>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full max-w-md h-64 bg-black rounded-lg"
            playsInline // Important for iOS
          />
          <button
            onClick={stopScanning}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}
    </div>
  );
}