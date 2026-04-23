'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Footer from '@/components/footer';

import {
  User,
  MessageCircle,
  MapPin,
  Upload,
  X,
  CheckCircle,
  Bus,
  Camera,
  AlertCircle
} from 'lucide-react';
import PhoneInput from '@/components/PhoneInput';
import { API_ENDPOINTS } from '@/config/api';

export default function VehicleRegistrationPage() {
  const [formData, setFormData] = useState({
    driverName: '',
    whatsappNo: '',
    busLocation: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PHONE_REGEX = /^(?:\+94|0)?[0-9]{9,10}$/;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.driverName || !formData.whatsappNo || !formData.busLocation) {
      setErrorMessage('Please fill in all required fields.');
      setSubmitStatus('error');
      return;
    }

    if (!PHONE_REGEX.test(formData.whatsappNo)) {
      setErrorMessage('Please enter a valid WhatsApp number.');
      setSubmitStatus('error');
      return;
    }

    if (images.length === 0) {
      setErrorMessage('Please upload at least one image of your bus.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Create FormData for file upload
      const data = new FormData();
      data.append('driverName', formData.driverName);
      data.append('whatsappNo', formData.whatsappNo);
      data.append('busLocation', formData.busLocation);
      images.forEach((image) => {
        data.append('busImages', image); // Must match field name in route
      });

      const response = await fetch(API_ENDPOINTS.VEHICLE_REGISTRATIONS, {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit registration');
      }

      setSubmitStatus('success');
      setFormData({ driverName: '', whatsappNo: '', busLocation: '' });
      setImages([]);
      setPreviews([]);
    } catch (err: any) {
      console.error('Registration error:', err);
      setSubmitStatus('error');
      setErrorMessage(err.message || 'An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <main className="min-h-screen bg-[#fafafa]">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-blue-600/5 -z-10" />
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-bold mb-6 animate-fade-in">
            <Bus size={18} />
            <span>Partner with Senu Tours</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            Bus <span className="text-green-600">Registration</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Register your bus with Senu Tours and join our premium fleet. We connect professional drivers with high-quality travel opportunities.
          </p>
        </div>
      </section>

      <section className="pb-32">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="md:flex">
              {/* Sidebar Info */}
              <div className="md:w-1/3 bg-green-600 p-8 md:p-12 text-white flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-6">Why join us?</h3>
                  <ul className="space-y-6">
                    <li className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <CheckCircle size={18} />
                      </div>
                      <p className="text-sm font-medium opacity-90">Consistent bookings from verified customers.</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <CheckCircle size={18} />
                      </div>
                      <p className="text-sm font-medium opacity-90">Professional dispatch and support system.</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <CheckCircle size={18} />
                      </div>
                      <p className="text-sm font-medium opacity-90">Fair pricing and on-time payments.</p>
                    </li>
                  </ul>
                </div>

                <div className="mt-12 pt-12 border-t border-white/10">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Support Hotline</p>
                  <p className="text-xl font-black">071 789 0046</p>
                </div>
              </div>

              {/* Form Section */}
              <div className="md:w-2/3 p-8 md:p-12">
                {submitStatus === 'success' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center animate-scale-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Received!</h2>
                    <p className="text-gray-600 mb-8">
                      Thank you for registering. Our team will review your application and contact you via WhatsApp shortly.
                    </p>
                    <button
                      onClick={() => setSubmitStatus('idle')}
                      className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all"
                    >
                      Register Another Vehicle
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                      {/* Driver Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <User size={16} className="text-green-600" />
                          Driver Full Name *
                        </label>
                        <input
                          type="text"
                          name="driverName"
                          value={formData.driverName}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all placeholder:text-gray-400 font-medium"
                          required
                        />
                      </div>

                      {/* WhatsApp No */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <MessageCircle size={16} className="text-green-600" />
                          WhatsApp Number *
                        </label>
                        <PhoneInput
                          value={formData.whatsappNo}
                          onChange={(val) => setFormData(p => ({ ...p, whatsappNo: val }))}
                          label="WhatsApp Number"
                        />
                      </div>

                      {/* Bus Location */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <MapPin size={16} className="text-green-600" />
                          Location of Bus *
                        </label>
                        <input
                          type="text"
                          name="busLocation"
                          value={formData.busLocation}
                          onChange={handleInputChange}
                          placeholder="e.g. Colombo, Kandy, Galle"
                          className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all placeholder:text-gray-400 font-medium"
                          required
                        />
                      </div>

                      {/* Image Upload */}
                      <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Camera size={16} className="text-green-600" />
                          Bus Images *
                        </label>

                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="group relative cursor-pointer"
                        >
                          <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center transition-all group-hover:border-green-500 group-hover:bg-green-50/30">
                            <Upload className="mx-auto text-gray-400 mb-4 group-hover:text-green-600 transition-colors" size={32} />
                            <p className="text-sm font-bold text-gray-700 mb-1">Click to upload bus images</p>
                            <p className="text-xs text-gray-500">Upload high-quality front, side, and interior photos (Max 10MB each)</p>
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            multiple
                            accept="image/*"
                            className="hidden"
                          />
                        </div>

                        {/* Previews */}
                        {previews.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {previews.map((preview, index) => (
                              <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm animate-scale-in">
                                <Image
                                  src={preview}
                                  alt={`Bus preview ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                  }}
                                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center transition-all hover:bg-red-600 shadow-lg backdrop-blur-md z-10 scale-100 active:scale-90"
                                >
                                  <X size={16} strokeWidth={3} />
                                </button>

                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {submitStatus === 'error' && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3 animate-shake">
                        <AlertCircle size={18} />
                        {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-green-600 text-white font-black text-lg shadow-xl shadow-green-600/20 hover:bg-green-700 hover:shadow-green-600/40 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Register My Vehicle'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.4s ease-out forwards; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </main>
  );
}
