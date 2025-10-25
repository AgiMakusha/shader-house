"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />
      
      <motion.main 
        className="relative z-10 flex min-h-dvh flex-col items-center justify-center p-6 py-12"
        initial={{ opacity: 0, y: 6 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
        }}
      >
        <div className="w-full max-w-4xl space-y-6">
          {/* Header */}
          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 
              className="text-4xl font-bold tracking-wider uppercase pixelized"
              style={{
                textShadow: `
                  0 0 10px rgba(100, 200, 100, 0.6),
                  0 0 20px rgba(80, 160, 80, 0.4),
                  2px 2px 0px rgba(0, 0, 0, 0.8)
                `,
                color: 'rgba(150, 250, 150, 0.95)',
              }}
            >
              Terms of Service
            </h1>
            <p className="text-sm" style={{ color: 'rgba(200, 240, 200, 0.7)' }}>
              Last Updated: October 25, 2025
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GameCard>
              <GameCardContent className="p-8 space-y-6">
                <div className="prose prose-invert max-w-none space-y-6">
                  {/* Introduction */}
                  <section>
                    <h2 
                      className="text-2xl font-bold mb-3 pixelized"
                      style={{ color: 'rgba(180, 220, 180, 0.95)' }}
                    >
                      1. Acceptance of Terms
                    </h2>
                    <p style={{ color: 'rgba(200, 240, 200, 0.8)' }}>
                      Welcome to Shader House! By accessing or using our platform, you agree to be bound by these Terms of Service. 
                      If you do not agree to these terms, please do not use our services.
                    </p>
                  </section>

                  {/* Account Registration */}
                  <section>
                    <h2 
                      className="text-2xl font-bold mb-3 pixelized"
                      style={{ color: 'rgba(180, 220, 180, 0.95)' }}
                    >
                      2. Account Registration
                    </h2>
                    <div className="space-y-3" style={{ color: 'rgba(200, 240, 200, 0.8)' }}>
                      <p>When you create an account with Shader House, you agree to:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Provide accurate, current, and complete information</li>
                        <li>Maintain the security of your account credentials</li>
                        <li>Notify us immediately of any unauthorized access</li>
                        <li>Be responsible for all activities under your account</li>
                        <li>Not create multiple accounts or impersonate others</li>
                      </ul>
                    </div>
                  </section>

                  {/* Developer Verification */}
                  <section>
                    <h2 
                      className="text-2xl font-bold mb-3 pixelized"
                      style={{ color: 'rgba(180, 220, 180, 0.95)' }}
                    >
                      3. Developer Verification & Indie Status
                    </h2>
                    <div className="space-y-3" style={{ color: 'rgba(200, 240, 200, 0.8)' }}>
                      <p>For developers registering as "Indie":</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>You attest that all information provided is accurate and truthful</li>
                        <li>You understand that indie status requires meeting specific criteria (team size ≤10, no major publisher, IP ownership)</li>
                        <li>Shader House reserves the right to verify your indie status</li>
                        <li>Providing false information may result in account suspension or termination</li>
                        <li>You may appeal verification decisions with additional evidence</li>
                      </ul>
                    </div>
                  </section>

                  {/* User Conduct */}
                  <section>
                    <h2 
                      className="text-2xl font-bold mb-3 pixelized"
                      style={{ color: 'rgba(180, 220, 180, 0.95)' }}
                    >
                      4. User Conduct
                    </h2>
                    <div className="space-y-3" style={{ color: 'rgba(200, 240, 200, 0.8)' }}>
                      <p>You agree not to:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Use the platform for any illegal or unauthorized purpose</li>
                        <li>Harass, abuse, or harm other users</li>
                        <li>Post spam, malware, or malicious content</li>
                        <li>Attempt to gain unauthorized access to our systems</li>
                        <li>Scrape, copy, or misuse platform content without permission</li>
                        <li>Violate any applicable laws or regulations</li>
                      </ul>
                    </div>
                  </section>

                  {/* Intellectual Property */}
                  <section>
                    <h2 
                      className="text-2xl font-bold mb-3 pixelized"
                      style={{ color: 'rgba(180, 220, 180, 0.95)' }}
                    >
                      5. Intellectual Property
                    </h2>
                    <div className="space-y-3" style={{ color: 'rgba(200, 240, 200, 0.8)' }}>
                      <p>
                        All content, features, and functionality on Shader House are owned by us or our licensors. 
                        You retain ownership of content you submit, but grant us a license to use, display, and distribute 
                        it on the platform.
                      </p>
                    </div>
                  </section>

                  {/* Privacy */}
                  <section>
                    <h2 
                      className="text-2xl font-bold mb-3 pixelized"
                      style={{ color: 'rgba(180, 220, 180, 0.95)' }}
                    >
                      6. Privacy & Data Protection
                    </h2>
                    <div className="space-y-3" style={{ color: 'rgba(200, 240, 200, 0.8)' }}>
                      <p>
                        Your privacy is important to us. We collect and process your data as described in our Privacy Policy. 
                        By using Shader House, you consent to our data practices, including:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Collection of account information and usage data</li>
                        <li>Use of cookies and similar technologies</li>
                        <li>Email communications about your account and platform updates</li>
                        <li>Secure storage of your data with industry-standard encryption</li>
                      </ul>
                    </div>
                  </section>

                  {/* Termination */}
                  <section>
                    <h2 
                      className="text-2xl font-bold mb-3 pixelized"
                      style={{ color: 'rgba(180, 220, 180, 0.95)' }}
                    >
                      7. Termination
                    </h2>
                    <div className="space-y-3" style={{ color: 'rgba(200, 240, 200, 0.8)' }}>
                      <p>
                        We reserve the right to suspend or terminate your account at any time for violations of these Terms. 
                        You may also delete your account at any time through your account settings.
                      </p>
                    </div>
                  </section>

                  {/* Disclaimer */}
                  <section>
                    <h2 
                      className="text-2xl font-bold mb-3 pixelized"
                      style={{ color: 'rgba(180, 220, 180, 0.95)' }}
                    >
                      8. Disclaimer of Warranties
                    </h2>
                    <div className="space-y-3" style={{ color: 'rgba(200, 240, 200, 0.8)' }}>
                      <p>
                        Shader House is provided "as is" without warranties of any kind. We do not guarantee that the 
                        platform will be uninterrupted, secure, or error-free.
                      </p>
                    </div>
                  </section>

                  {/* Limitation of Liability */}
                  <section>
                    <h2 
                      className="text-2xl font-bold mb-3 pixelized"
                      style={{ color: 'rgba(180, 220, 180, 0.95)' }}
                    >
                      9. Limitation of Liability
                    </h2>
                    <div className="space-y-3" style={{ color: 'rgba(200, 240, 200, 0.8)' }}>
                      <p>
                        To the maximum extent permitted by law, Shader House shall not be liable for any indirect, 
                        incidental, special, or consequential damages arising from your use of the platform.
                      </p>
                    </div>
                  </section>

                  {/* Changes to Terms */}
                  <section>
                    <h2 
                      className="text-2xl font-bold mb-3 pixelized"
                      style={{ color: 'rgba(180, 220, 180, 0.95)' }}
                    >
                      10. Changes to Terms
                    </h2>
                    <div className="space-y-3" style={{ color: 'rgba(200, 240, 200, 0.8)' }}>
                      <p>
                        We may update these Terms from time to time. We will notify you of significant changes via 
                        email or platform notification. Continued use of the platform after changes constitutes acceptance 
                        of the new Terms.
                      </p>
                    </div>
                  </section>

                  {/* Contact */}
                  <section>
                    <h2 
                      className="text-2xl font-bold mb-3 pixelized"
                      style={{ color: 'rgba(180, 220, 180, 0.95)' }}
                    >
                      11. Contact Us
                    </h2>
                    <div className="space-y-3" style={{ color: 'rgba(200, 240, 200, 0.8)' }}>
                      <p>
                        If you have questions about these Terms of Service, please contact us at:
                      </p>
                      <p className="font-semibold" style={{ color: 'rgba(200, 240, 200, 0.95)' }}>
                        support@shaderhouse.com
                      </p>
                    </div>
                  </section>
                </div>

                {/* Back Button */}
                <div className="pt-6 border-t" style={{ borderColor: 'rgba(200, 240, 200, 0.2)' }}>
                  <Link
                    href="/signup?role=developer"
                    className="inline-block px-6 py-3 rounded-lg font-medium text-sm transition-all"
                    style={{
                      background: 'rgba(100, 200, 100, 0.2)',
                      border: '1px solid rgba(200, 240, 200, 0.3)',
                      color: 'rgba(200, 240, 200, 0.9)',
                    }}
                  >
                    ← Back to Sign Up
                  </Link>
                </div>
              </GameCardContent>
            </GameCard>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}

