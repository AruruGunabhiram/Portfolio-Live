import { useState } from 'react';
import type { FormEvent } from 'react';
import Lottie from 'lottie-react';
import { Button } from './Button';
import { isBrowser } from '../../utils';
import loadingAnimation from '../../../public/lottie/loading.json';
import successAnimation from '../../../public/lottie/success.json';

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export const ContactForm = () => {
  const [formState, setFormState] = useState<FormState>('idle');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isBrowser) return;

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setFormState('error');
      setTimeout(() => setFormState('idle'), 3000);
      return;
    }

    setFormState('loading');

    // Simulate API call (replace with actual submission logic)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setFormState('success');

      // Reset form after success
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setFormState('idle');
      }, 3000);
    } catch {
      setFormState('error');
      setTimeout(() => setFormState('idle'), 3000);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {formState === 'success' ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-32 h-32">
            <Lottie
              animationData={successAnimation}
              loop={false}
              autoplay={true}
            />
          </div>
          <p className="mt-4 text-xl font-semibold text-geek-accent dark:text-dark-accent">
            Message sent successfully!
          </p>
          <p className="mt-2 text-gray-400">
            Thank you for reaching out. I'll get back to you soon.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={formState === 'loading'}
              className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-geek-accent dark:focus:ring-dark-accent
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-white placeholder-gray-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={formState === 'loading'}
              className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-geek-accent dark:focus:ring-dark-accent
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-white placeholder-gray-500"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              disabled={formState === 'loading'}
              rows={6}
              className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-geek-accent dark:focus:ring-dark-accent
                       disabled:opacity-50 disabled:cursor-not-allowed resize-none
                       text-white placeholder-gray-500"
              placeholder="Your message..."
            />
          </div>

          {formState === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-500 text-sm">
                Please fill in all fields correctly.
              </p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              variant="primary"
              disabled={formState === 'loading'}
              className="flex-1"
            >
              {formState === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span>Sending</span>
                  <div className="w-6 h-6">
                    <Lottie
                      animationData={loadingAnimation}
                      loop={true}
                      autoplay={true}
                    />
                  </div>
                </span>
              ) : (
                'Send Message'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
