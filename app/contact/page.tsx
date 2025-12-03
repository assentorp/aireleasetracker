'use client';

import { Header } from '../../components/Header';
import { getLatestRelease } from '../../lib/timeline-data';

export default function Contact() {
  const latestRelease = getLatestRelease();

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <Header
        currentPage="contact"
        latestRelease={latestRelease}
      />

      {/* Contact Content */}
      <section className="flex justify-center px-4 md:px-8 py-8 sm:py-16 min-h-screen" aria-label="Contact">
        <div className="w-full max-w-[640px] space-y-8">
          {/* Header */}
          <div>
            <h2 className="text-xl md:text-3xl font-medium text-white mb-8">Contact</h2>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* About */}
            <div>
              <p className="text-sm md:text-base text-gray-300 mb-4">
                Built by <span className="font-meidum text-white">Peter Assentorp</span>, a design engineer passionate about AI technology.
              </p>
              <p className="text-sm md:text-base text-gray-300">
                This tracker helps developers, researchers, and AI enthusiasts stay up-to-date with the rapidly evolving landscape of AI model releases from major companies like OpenAI, Anthropic, Google, Meta, xAI, DeepSeek, and Mistral.
              </p>
            </div>

            {/* Email */}
            <div className="pt-6">
              <div className="text-base text-gray-400 mb-1">Get in touch</div>
              <a
                href="mailto:pa@tosider.dk"
                className="text-base text-white hover:text-gray-300 transition-colors"
              >
                pa@tosider.dk
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
