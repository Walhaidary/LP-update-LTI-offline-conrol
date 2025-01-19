import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { FormField } from '../common/FormField';
import { supabase } from '../../lib/supabase';
import { Notification } from '../common/Notification';

interface ServiceProvider {
  id: string;
  name: string;
  vendor_code: string;
  type: 'transporter' | 'partner' | 'other';
  email: string;
  phone: string;
  remarks: string | null;
}

export function ServiceProviderManager() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    vendor_code: '',
    type: 'transporter',
    email: '',
    phone: '',
    remarks: ''
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('service_providers')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setProviders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service providers');
    } finally {
      setIsLoading(false);
    }
  };

  const checkVendorCode = async (vendorCode: string): Promise<boolean> => {
    const { count, error } = await supabase
      .from('service_providers')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_code', vendorCode);

    if (error) {
      console.error('Error checking vendor code:', error);
      return false;
    }

    return count ? count > 0 : false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Check if vendor code already exists
      const exists = await checkVendorCode(formData.vendor_code);
      if (exists) {
        setError('A service provider with this vendor code already exists');
        return;
      }

      const { error: insertError } = await supabase
        .from('service_providers')
        .insert([formData]);

      if (insertError) throw insertError;

      setSuccess('Service provider created successfully');
      setFormData({
        name: '',
        vendor_code: '',
        type: 'transporter',
        email: '',
        phone: '',
        remarks: ''
      });
      loadProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service provider');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-medium mb-4">Add Service Provider</h2>

        {error && <Notification type="error" message={error} />}
        {success && <Notification type="success" message={success} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Service Provider Name"
              description="Enter the service provider's name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required
            />

            <FormField
              label="Vendor Code"
              description="Enter the vendor code (must be unique)"
              value={formData.vendor_code}
              onChange={(value) => setFormData({ ...formData, vendor_code: value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <p className="text-sm text-gray-500">Select the service provider type</p>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                required
              >
                <option value="transporter">Transporter</option>
                <option value="partner">Partner</option>
                <option value="other">Other</option>
              </select>
            </div>

            <FormField
              label="Email"
              description="Enter contact email address"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              required
            />

            <FormField
              label="Phone Number"
              description="Enter contact phone number"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Remarks</label>
            <p className="text-sm text-gray-500">Additional notes or comments</p>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary resize-y"
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
          >
            <Plus className="w-4 h-4" />
            Add Service Provider
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Vendor Code</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {providers.map((provider) => (
              <tr key={provider.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{provider.name}</td>
                <td className="px-6 py-4 text-sm">{provider.vendor_code}</td>
                <td className="px-6 py-4 text-sm capitalize">{provider.type}</td>
                <td className="px-6 py-4 text-sm">{provider.email}</td>
                <td className="px-6 py-4 text-sm">{provider.phone}</td>
                <td className="px-6 py-4 text-sm">{provider.remarks || '-'}</td>
              </tr>
            ))}
            {providers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No service providers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}