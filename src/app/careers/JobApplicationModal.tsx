'use client';

import React, { useState } from 'react';
import { IoMdClose } from "react-icons/io";

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    type: string;
  } | null;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({ isOpen, onClose, job }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    resume: null as File | null,
    coverLetter: '',
    additionalInfo: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Create form data for file upload
      const form = new FormData();
      form.append('jobTitle', job?.title || '');
      form.append('jobType', job?.type || '');
      form.append('name', formData.name);
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      form.append('linkedin', formData.linkedin);
      form.append('github', formData.github);
      form.append('coverLetter', formData.coverLetter);
      form.append('additionalInfo', formData.additionalInfo);
      
      if (formData.resume) {
        form.append('resume', formData.resume);
      }

      // Send to API endpoint
      const response = await fetch('/api/apply', {
        method: 'POST',
        body: form
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          onClose();
          setFormData({
            name: '',
            email: '',
            phone: '',
            linkedin: '',
            github: '',
            resume: null,
            coverLetter: '',
            additionalInfo: ''
          });
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      
      <div className="relative bg-black border border-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <IoMdClose size={24} />
        </button>
        
        <h2 className="font-voyager-thin text-[36px] mb-2">Apply for {job.title}</h2>
        <p className="font-aeonik-thin text-gray-400 mb-8">{job.type}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-aeonik-regular text-[16px] mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:border-blue-600 transition-colors font-aeonik-thin"
              />
            </div>
            
            <div>
              <label className="block font-aeonik-regular text-[16px] mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:border-blue-600 transition-colors font-aeonik-thin"
              />
            </div>
            
            <div>
              <label className="block font-aeonik-regular text-[16px] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:border-blue-600 transition-colors font-aeonik-thin"
              />
            </div>
            
            <div>
              <label className="block font-aeonik-regular text-[16px] mb-2">
                LinkedIn Profile
              </label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:border-blue-600 transition-colors font-aeonik-thin"
              />
            </div>
            
            <div>
              <label className="block font-aeonik-regular text-[16px] mb-2">
                GitHub Profile
              </label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleInputChange}
                placeholder="https://github.com/..."
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:border-blue-600 transition-colors font-aeonik-thin"
              />
            </div>
            
            <div>
              <label className="block font-aeonik-regular text-[16px] mb-2">
                Resume/CV *
              </label>
              <input
                type="file"
                name="resume"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                required
                className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:border-blue-600 transition-colors font-aeonik-thin file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
              />
            </div>
          </div>
          
          <div>
            <label className="block font-aeonik-regular text-[16px] mb-2">
              Cover Letter *
            </label>
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              required
              rows={6}
              placeholder="Tell us why you're interested in this role and what makes you a great fit..."
              className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:border-blue-600 transition-colors font-aeonik-thin"
            />
          </div>
          
          <div>
            <label className="block font-aeonik-regular text-[16px] mb-2">
              Additional Information
            </label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              rows={4}
              placeholder="Anything else you'd like us to know?"
              className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg focus:border-blue-600 transition-colors font-aeonik-thin"
            />
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 border transition duration-500 cursor-pointer ease-in-out rounded-xl h-10 px-8 py-2 ${
                isSubmitting 
                  ? 'border-gray-600 text-gray-600 cursor-not-allowed' 
                  : 'border-white hover:bg-blue-600 hover:border-blue-600'
              }`}
            >
              <p className="text-sm font-graebenbach-mono-regular">
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
              </p>
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-600 text-gray-400 transition duration-500 cursor-pointer ease-in-out hover:text-white hover:border-white rounded-xl h-10 px-8 py-2"
            >
              <p className="text-sm font-graebenbach-mono-regular">CANCEL</p>
            </button>
          </div>
          
          {submitStatus === 'success' && (
            <p className="text-green-500 text-center font-aeonik-regular">
              Application submitted successfully! We'll be in touch soon.
            </p>
          )}
          
          {submitStatus === 'error' && (
            <p className="text-red-500 text-center font-aeonik-regular">
              Error submitting application. Please try again or email us at contact@untitledtrading.com.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default JobApplicationModal;