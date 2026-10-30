import React, { useState, useRef, useEffect } from 'react';
import { ContactConfig, SocialConfig } from '../../data/content.schema';
import { SectionHeading } from '../common/SectionHeading';
import { GlassCard } from '../common/GlassCard';
import confetti from 'canvas-confetti';
import {
  Send,
  Mail,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { soundEngine } from '../../audio/soundEngine';

const BRAND_SVGS = {
  github:
    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  instagram:
    'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  linkedin:
    'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.72a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z',
  facebook:
    'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
};

interface ContactSectionProps {
  contact: ContactConfig;
  social: SocialConfig;
  contactButtons: {
    email: { value: string; isDemo: boolean };
    linkedin: { value: string; isDemo: boolean };
    github: { value: string; isDemo: boolean };
  };
  className?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contact,
  social: _social,
  contactButtons,
  className = '',
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Please enter your name';
    if (!formData.email.trim()) {
      errs.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) errs.message = 'Please enter your message';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;
    if (formData.honeypot) return;
    if (!validate()) return;

    setStatus('submitting');
    setErrorMessage('');
    soundEngine.play('state');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          // Kavya's own key from web3forms.com (messages go to the email it was created with)
          access_key: 'YOUR_WEB3FORMS_ACCESS_KEY',
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success !== false) {
        setStatus('success');
        setErrorMessage('');
        soundEngine.play('state');
        setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
        setErrors({});
        if (!prefersReducedMotion) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#FFFFFF', '#E8484F', '#F5A3A6'],
          });
        }
      } else {
        console.log(data);
        setStatus('error');
        setErrorMessage(data.message || 'Something went wrong, please try again');
      }
    } catch (err) {
      console.log(err);
      setStatus('error');
      setErrorMessage('Something went wrong, please try again');
    }
  };

  return (
    <section
      id="contact"
      ref={containerRef}
      aria-label="Contact"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: prefersReducedMotion
          ? 'none'
          : 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`w-full max-w-[1200px] [@media(min-width:1600px)]:max-w-[min(1360px,88vw)] mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 lg:py-24 scroll-mt-24 ${className}`}
    >
      {/* 06 "Let's *talk*" - Big Centered Headline */}
      <SectionHeading
        index="06"
        label="Contact"
        title="Let's *talk*"
        subtitle={contact.subtext || "Feel free to reach out for internship opportunities, project collaborations, or discussions."}
        align="center"
      />

      {/* Two-Column Layout: Contact Options Left, Form Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Cols 1-5): Contact Options */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard
            variant="default"
            radius="large"
            hoverEffect={false}
            className="p-6 sm:p-8 md:p-10 flex flex-col"
          >
            {/* Paragraph and direct contact description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-[#C9C9CF]">
                <span>Get in touch</span>
                <span className="w-8 h-px bg-white/15" />
              </div>

              <h3 className="text-2xl font-semibold tracking-[-0.02em] text-[#F5F5F7]">
                Direct Contact
              </h3>

              <p className="text-[16px] text-[#B4B4BA] leading-relaxed">
                Whether you're looking to discuss an internship, technical project, or just say hello, I'd love to connect.
              </p>
            </div>

            {/* Primary Action: 56px high Full Capsule White Email Button (24px separation below paragraph) */}
            <div className="mt-[24px]">
              <a
                href={`mailto:${contactButtons.email.value}`}
                aria-label={`Send email to ${contactButtons.email.value}`}
                className="apple-button-white-3d w-full h-[56px] inline-flex items-center justify-center gap-3 px-8 rounded-full text-white font-semibold text-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Mail className="w-5 h-5 text-white shrink-0" />
                <span>Send an email</span>
              </a>

              {/* Centered email text row: exactly 14px below the primary button */}
              <div className="mt-[14px] flex items-center justify-center gap-2 text-[13px] font-sans text-[#C9C9CF] px-1 select-all">
                <span className="whitespace-nowrap">{contactButtons.email.value}</span>
              </div>
            </div>

            {/* Secondary Direct Channels: LinkedIn & GitHub (16px below email row)
                52px high capsules, side by side, equal width, 12px gap */}
            <div className="mt-[16px] grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <a
                href={`https://${contactButtons.linkedin.value}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open LinkedIn profile"
                className="apple-glass-chip apple-glass-chip-interactive w-full h-[52px] px-5 rounded-full flex items-center justify-between text-[14px] font-medium text-[#F5F5F7] transition-[background-color,border-color,box-shadow,filter] duration-[180ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <div className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white/80 shrink-0">
                    <path d={BRAND_SVGS.linkedin} />
                  </svg>
                  <span>LinkedIn</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/60 shrink-0" />
              </a>

              <a
                href={`https://${contactButtons.github.value}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open GitHub profile"
                className="apple-glass-chip apple-glass-chip-interactive w-full h-[52px] px-5 rounded-full flex items-center justify-between text-[14px] font-medium text-[#F5F5F7] transition-[background-color,border-color,box-shadow,filter] duration-[180ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <div className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white/80 shrink-0">
                    <path d={BRAND_SVGS.github} />
                  </svg>
                  <span>GitHub</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/60 shrink-0" />
              </a>
            </div>

            {/* Response Time (with a faint divider above), only when set */}
            {contact.responseTime && (
              <>
                <div className="my-[24px] w-full h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />
                <div className="flex items-center gap-2 text-[13px] font-sans font-medium text-[#C9C9CF]">
                  <Clock className="w-4 h-4 text-white/70 shrink-0" />
                  <span>{contact.responseTime}</span>
                </div>
              </>
            )}
          </GlassCard>
        </div>

        {/* Right Column (Cols 6-12): The Message Form in GlassCard */}
        <div className="lg:col-span-7">
          <GlassCard
            variant="default"
            radius="large"
            hoverEffect={false}
            className="p-6 sm:p-8 md:p-10 space-y-6"
          >
            <h3 className="text-2xl font-semibold tracking-[-0.02em] text-[#F5F5F7]">
              Send a direct message
            </h3>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="contact-name"
                    className="block text-[13px] font-sans font-medium text-[#C9C9CF]"
                  >
                    Your name <span className="text-white/50">*</span>
                  </label>
                  <input
                    id="contact-name"
                    autoComplete="name"
                    type="text"
                    required
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className={`w-full px-4 py-3 rounded-[16px] bg-white/[0.05] border ${
                      errors.name ? 'border-[#FF6B6B]/60 focus:border-[#FF6B6B]' : 'border-white/[0.12] focus:border-white/30'
                    } text-white placeholder-[#8E8E93] text-[16px] focus:outline-none focus:ring-2 ${
                      errors.name ? 'focus:ring-[#FF6B6B]/40' : 'focus:ring-white/50'
                    } transition-colors`}
                  />
                  {errors.name && (
                    <p id="contact-name-error" className="text-[13px] text-[#FF6B6B] font-sans font-medium" role="alert">{errors.name}</p>
                  )}
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="contact-email"
                    className="block text-[13px] font-sans font-medium text-[#C9C9CF]"
                  >
                    Your email <span className="text-white/50">*</span>
                  </label>
                  <input
                    id="contact-email"
                    autoComplete="email"
                    type="email"
                    required
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@example.com"
                    className={`w-full px-4 py-3 rounded-[16px] bg-white/[0.05] border ${
                      errors.email ? 'border-[#FF6B6B]/60 focus:border-[#FF6B6B]' : 'border-white/[0.12] focus:border-white/30'
                    } text-white placeholder-[#8E8E93] text-[16px] focus:outline-none focus:ring-2 ${
                      errors.email ? 'focus:ring-[#FF6B6B]/40' : 'focus:ring-white/50'
                    } transition-colors`}
                  />
                  {errors.email && (
                    <p id="contact-email-error" className="text-[13px] text-[#FF6B6B] font-sans font-medium" role="alert">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-2">
                <label
                  htmlFor="contact-subject"
                  className="block text-[13px] font-sans font-medium text-[#C9C9CF]"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Project Inquiry / Internship Opportunity"
                  className="w-full px-4 py-3 rounded-[16px] bg-white/[0.05] border border-white/[0.12] focus:border-white/30 text-white placeholder-[#8E8E93] text-[16px] focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
                />
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <label
                  htmlFor="contact-message"
                  className="block text-[13px] font-sans font-medium text-[#C9C9CF]"
                >
                  Message <span className="text-white/50">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  aria-invalid={errors.message ? 'true' : 'false'}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Hi Kavya, I'd like to talk about..."
                  className={`w-full px-4 py-3 rounded-[20px] bg-white/[0.05] border ${
                    errors.message ? 'border-[#FF6B6B]/60 focus:border-[#FF6B6B]' : 'border-white/[0.12] focus:border-white/30'
                  } text-white placeholder-[#8E8E93] text-[16px] focus:outline-none focus:ring-2 ${
                    errors.message ? 'focus:ring-[#FF6B6B]/40' : 'focus:ring-white/50'
                  } transition-colors resize-none`}
                />
                {errors.message && (
                  <p id="contact-message-error" className="text-[13px] text-[#FF6B6B] font-sans font-medium" role="alert">{errors.message}</p>
                )}
              </div>

              {/* Submit Action: Full Capsule Button */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="apple-button-white-3d w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 h-[52px] rounded-full text-white font-semibold text-[15px] tracking-[-0.01em] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {status === 'submitting' ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send message</span>
                      <Send className="w-4 h-4 text-white shrink-0" />
                    </>
                  )}
                </button>

                {status === 'success' && (
                  <p className="text-[13px] font-sans font-medium text-[#C9C9CF]">
                    Message sent
                  </p>
                )}

                {status === 'error' && (
                  <p className="text-[13px] font-sans font-medium text-[#C9C9CF]">
                    {errorMessage || 'Something went wrong, please try again'}
                  </p>
                )}
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};
