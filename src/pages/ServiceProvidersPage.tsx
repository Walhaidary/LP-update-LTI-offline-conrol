import React, { useState, useEffect } from 'react';
import { Search, Printer } from 'lucide-react';
import { ServiceProviderTabs } from '../components/layout/ServiceProviderTabs';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../lib/auth';
import { PrintableRegistration } from '../components/registration/PrintableRegistration';

interface ServiceProvidersPageProps {
  user: UserProfile;
  onLogout: () => void;
}

export function ServiceProvidersPage({ user }: ServiceProvidersPageProps) {
  const [activeTab, setActiveTab] = useState('registrations');
  const [formData, setFormData] = useState({
    lti_sto: '',
    destination_state: '',
    destination_locality: '',
    transporter: '',
    vehicle: '',
    driver_name: '',
    driver_phone: '',
    capacity: '',
    remarks2: ''
  });
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ltiOptions, setLTIOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [showPrintable, setShowPrintable] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'registered') {
      loadRegistrations();
    }
  }, [activeTab]);

  useEffect(() => {
    loadLTIOptions();
  }, []);

  const loadLTIOptions = async () => {
    try {
      setIsLoading(true);
      
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('vendor_code')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!userProfile?.vendor_code) {
        setLTIOptions([]);
        return;
      }

      const { data, error: searchError } = await supabase
        .from('lti_sto')
        .select('lti_number, transporter_name, destination_location, transporter_code')
        .eq('transporter_code', userProfile.vendor_code)
        .order('lti_number', { ascending: false });

      if (searchError) throw searchError;

      const uniqueOptions = data?.reduce((acc: any[], curr) => {
        if (!acc.find(item => item.lti_number === curr.lti_number)) {
          acc.push(curr);
        }
        return acc;
      }, []) || [];

      setLTIOptions(uniqueOptions);
    } catch (err) {
      console.error('Error loading LTI options:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('vendor_code')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('shipments_updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (userProfile?.vendor_code) {
        query = query.eq('vendor_code', userProfile.vendor_code);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setRegistrations(data || []);
    } catch (err) {
      console.error('Error loading registrations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load registrations');
    }
  };

  const handleLTISelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLTI = ltiOptions.find(option => option.lti_number === e.target.value);
    if (selectedLTI) {
      setFormData(prev => ({
        ...prev,
        lti_sto: selectedLTI.lti_number,
        transporter: selectedLTI.transporter_name,
        destination_state: selectedLTI.destination_location,
        vendor_code: selectedLTI.transporter_code
      }));
    }
  };

  const generateSerialNumber = async (): Promise<string> => {
    const { data: maxPk } = await supabase
      .from('shipments_updates')
      .select('pk')
      .order('pk', { ascending: false })
      .limit(1)
      .single();

    const pk = (maxPk?.pk || 0) + 1;
    return `SHP-${pk.toString().padStart(7, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const serialNumber = await generateSerialNumber();
      const { data: nextVersion, error: versionError } = await supabase
        .rpc('get_next_version', { p_serial_number: serialNumber });

      if (versionError) throw versionError;

      const { data: maxPk } = await supabase
        .from('shipments_updates')
        .select('pk')
        .order('pk', { ascending: false })
        .limit(1)
        .single();

      const nextPk = (maxPk?.pk || 0) + 1;

      const selectedLTI = ltiOptions.find(option => option.lti_number === formData.lti_sto);
      const vendorCode = selectedLTI?.transporter_code || null;

      const { data: newRegistration, error: insertError } = await supabase
        .from('shipments_updates')
        .insert([{
          pk: nextPk,
          line_number: '010',
          serial_number: serialNumber,
          transporter: formData.transporter,
          driver_name: formData.driver_name,
          driver_phone: formData.driver_phone,
          vehicle: formData.vehicle,
          values: '',
          capacity: formData.capacity,
          total: 0,
          updated_by: user.id,
          version: nextVersion || 1,
          destination_state: formData.destination_state,
          destination_locality: formData.destination_locality,
          remarks2: formData.remarks2,
          lti_sto: formData.lti_sto,
          vendor_code: vendorCode
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess('Truck registration created successfully');
      setSubmittedData({
        ...newRegistration,
        updated_by: user.id
      });
      setFormData({
        lti_sto: '',
        destination_state: '',
        destination_locality: '',
        transporter: '',
        vehicle: '',
        driver_name: '',
        driver_phone: '',
        capacity: '',
        remarks2: ''
      });
      loadRegistrations();
    } catch (err) {
      console.error('Error creating registration:', err);
      setError(err instanceof Error ? err.message : 'Failed to create registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = (registration: any) => {
    setSelectedRegistration(registration);
    setShowPrintable(true);
  };

  if (showPrintable && (submittedData || selectedRegistration)) {
    return (
      <PrintableRegistration
        data={submittedData || selectedRegistration}
        onClose={() => {
          setShowPrintable(false);
          setSubmittedData(null);
          setSelectedRegistration(null);
        }}
      />
    );
  }

  const renderRegistrationsForm = () => (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-medium mb-6">New Truck Registration</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg flex justify-between items-center">
          <span>{success}</span>
          <button
            onClick={() => setShowPrintable(true)}
            className="flex items-center gap-2 px-3 py-1 text-green-700 hover:bg-green-100 rounded transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Registration
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ... rest of the form remains the same ... */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">STO/LTI Number</label>
            <select
              value={formData.lti_sto}
              onChange={handleLTISelect}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select STO/LTI Number</option>
              {ltiOptions.map((option) => (
                <option key={option.lti_number} value={option.lti_number}>
                  {option.lti_number} - {option.transporter_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Transporter Name</label>
            <input
              type="text"
              value={formData.transporter}
              onChange={(e) => setFormData({ ...formData, transporter: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Destination State</label>
            <input
              type="text"
              value={formData.destination_state}
              onChange={(e) => setFormData({ ...formData, destination_state: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Destination Locality</label>
            <input
              type="text"
              value={formData.destination_locality}
              onChange={(e) => setFormData({ ...formData, destination_locality: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Driver Name</label>
            <input
              type="text"
              value={formData.driver_name}
              onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Driver Cell Number</label>
            <input
              type="tel"
              value={formData.driver_phone}
              onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Truck Plate Number</label>
            <input
              type="text"
              value={formData.vehicle}
              onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Remarks</label>
          <textarea
            value={formData.remarks2}
            onChange={(e) => setFormData({ ...formData, remarks2: e.target.value })}
            className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary resize-y"
            rows={3}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Registering...
              </>
            ) : (
              'Register Truck'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderRegisteredTrucks = () => (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Serial Number</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">STO/LTI</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Driver</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Vehicle</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Transporter</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Destination</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {registrations.map((reg) => (
            <tr key={reg.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <button
                  onClick={() => handlePrint(reg)}
                  className="p-1 text-gray-500 hover:text-primary transition-colors"
                  title="Print Loading Authorization"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </td>
              <td className="px-6 py-4 text-sm">{reg.serial_number}</td>
              <td className="px-6 py-4 text-sm">{reg.lti_sto}</td>
              <td className="px-6 py-4 text-sm">{reg.driver_name}</td>
              <td className="px-6 py-4 text-sm">{reg.vehicle}</td>
              <td className="px-6 py-4 text-sm">{reg.transporter}</td>
              <td className="px-6 py-4 text-sm">
                {reg.destination_state}, {reg.destination_locality}
              </td>
              <td className="px-6 py-4 text-sm">{reg.status || 'Pending'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <ServiceProviderTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 p-8 bg-gray-50">
        {activeTab === 'registrations' ? renderRegistrationsForm() : renderRegisteredTrucks()}
      </div>
    </>
  );
}