import React, { useState } from 'react';
import { X, HelpCircle, MessageCircle, Mail, Phone, FileText, ExternalLink } from 'lucide-react';

const HelpSupportModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('faq');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  const faqs = [
    {
      question: "How do I add new tables to my restaurant?",
      answer: "Go to Settings → Edit Setup → Tables section. Click 'Add Table' and specify the table label and seat count."
    },
    {
      question: "How can I modify menu items?",
      answer: "Navigate to Settings → Edit Setup → Menu section. You can add, edit, or delete menu items. Deleted items are soft-deleted to preserve order history."
    },
    {
      question: "Why can't I delete a table?",
      answer: "Tables with active orders cannot be deleted to maintain data integrity. Complete or cancel the order first."
    },
    {
      question: "How do I change notification settings?",
      answer: "Go to Profile → Notifications button to customize sound alerts and browser notifications for orders."
    },
    {
      question: "Can I export my sales data?",
      answer: "Yes! Use Profile → Export Data to generate PDF, CSV, or JSON reports for different date ranges."
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Support request submitted! We will get back to you within 24 hours.');
    setContactForm({ subject: '', message: '', priority: 'medium' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HelpCircle className="text-blue-500" size={24} />
            Help & Support
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'faq' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'contact' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
            }`}
          >
            Contact Support
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'resources' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
            }`}
          >
            Resources
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">{faq.question}</h4>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contact' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Support</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="text-blue-500" size={20} />
                    <span className="font-medium">Email Support</span>
                  </div>
                  <p className="text-sm text-gray-600">support@restaurant-pos.com</p>
                  <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="text-green-500" size={20} />
                    <span className="font-medium">Phone Support</span>
                  </div>
                  <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  <p className="text-xs text-gray-500 mt-1">Mon-Fri 9AM-6PM EST</p>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={contactForm.priority}
                    onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="medium">Medium - Feature request</option>
                    <option value="high">High - System issue</option>
                    <option value="urgent">Urgent - Critical bug</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                    rows={4}
                    placeholder="Describe your issue or question in detail..."
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} />
                  Send Support Request
                </button>
              </form>
            </div>
          )}

          {activeTab === 'resources' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources & Documentation</h3>
              
              <div className="space-y-3">
                <a
                  href="#"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-500" size={20} />
                    <div>
                      <div className="font-medium">User Manual</div>
                      <div className="text-sm text-gray-600">Complete guide to using the POS system</div>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-gray-400" />
                </a>
                
                <a
                  href="#"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-green-500" size={20} />
                    <div>
                      <div className="font-medium">Setup Guide</div>
                      <div className="text-sm text-gray-600">Step-by-step restaurant setup instructions</div>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-gray-400" />
                </a>
                
                <a
                  href="#"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-purple-500" size={20} />
                    <div>
                      <div className="font-medium">Video Tutorials</div>
                      <div className="text-sm text-gray-600">Watch how-to videos for common tasks</div>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-gray-400" />
                </a>
                
                <a
                  href="#"
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-orange-500" size={20} />
                    <div>
                      <div className="font-medium">Troubleshooting</div>
                      <div className="text-sm text-gray-600">Common issues and solutions</div>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-gray-400" />
                </a>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">System Information</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <div>Version: 1.0.0</div>
                  <div>Last Updated: {new Date().toLocaleDateString()}</div>
                  <div>Browser: {navigator.userAgent.split(' ')[0]}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpSupportModal;