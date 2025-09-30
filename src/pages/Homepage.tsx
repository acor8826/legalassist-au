import React, { useState } from 'react';
import {
  FileText,
  MessageSquare,
  Shield,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Upload,
  Brain,
  Scale,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ✅ React Router navigation

export default function Homepage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/'); // ✅ Always redirects to root
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Scale className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">LegalAssist AU</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-600 hover:text-slate-900"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
                <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 transition-colors">How It Works</a>
                <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
                <button
                  onClick={handleGetStarted}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-fit"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Navigate Legal Challenges with
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> AI-Powered</span> Confidence
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Empowering unrepresented litigants across Australia with intelligent document management,
                  AI-assisted legal writing, and comprehensive case organization tools.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Start Your Case Today
                  <ArrowRight className="inline ml-2 h-5 w-5" />
                </button>
                <button className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all duration-300">
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">10,000+</div>
                  <div className="text-sm text-slate-600">Cases Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">95%</div>
                  <div className="text-sm text-slate-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">24/7</div>
                  <div className="text-sm text-slate-600">AI Support</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Brain className="h-8 w-8 text-blue-600" />
                    <h3 className="text-lg font-semibold">AI Legal Assistant</h3>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-700 italic">
                      "Based on your case details, I recommend filing a Statement of Claim
                      under Section 82 of the Competition and Consumer Act 2010..."
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">Contract Dispute</div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">High Confidence</div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-full shadow-lg animate-pulse">
                <FileText className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-400 to-blue-500 text-white p-3 rounded-full shadow-lg animate-pulse">
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-slate-900">Everything You Need to Win Your Case</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge AI with Australian legal expertise
              to give you the tools professional lawyers use.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Upload className="h-8 w-8" />,
                title: "Smart Document Upload",
                description: "Drag and drop your legal documents. Our AI automatically categorizes and extracts key information.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Brain className="h-8 w-8" />,
                title: "AI Legal Writing Assistant",
                description: "Get help drafting submissions, responses, and legal arguments tailored to Australian law.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: <FileText className="h-8 w-8" />,
                title: "Evidence Organization",
                description: "Automatically organize your documentary evidence with timeline views and relevance scoring.",
                color: "from-green-500 to-teal-500"
              },
              {
                icon: <MessageSquare className="h-8 w-8" />,
                title: "24/7 Chat Support",
                description: "Ask questions about your case anytime. Get instant guidance on procedures and next steps.",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Secure & Confidential",
                description: "Bank-level encryption ensures your sensitive legal documents are always protected.",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "Legal Templates",
                description: "Access hundreds of Australian legal templates and forms specific to your case type.",
                color: "from-yellow-500 to-orange-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group p-8 rounded-2xl border border-slate-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-slate-900">Simple Steps to Legal Success</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our streamlined process makes complex legal work manageable, even without legal training.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Your Documents",
                description: "Simply drag and drop all your legal documents, emails, contracts, and evidence into our secure platform."
              },
              {
                step: "02",
                title: "AI Analysis & Organization",
                description: "Our AI reviews your documents, identifies key issues, and organizes everything into a clear case structure."
              },
              {
                step: "03",
                title: "Get Legal Guidance",
                description: "Receive AI-powered suggestions for next steps, draft documents, and build your strongest possible case."
              }
            ].map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ArrowRight className="h-6 w-6 text-blue-300 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold">Ready to Take Control of Your Legal Case?</h2>
            <p className="text-xl opacity-90 leading-relaxed">
              Join thousands of Australians who have successfully managed their legal matters
              with our AI-powered platform. Start your free trial today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
                Schedule Demo
              </button>
            </div>

            <div className="flex justify-center items-center space-x-6 pt-8 text-sm opacity-75">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Scale className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-semibold">LegalAssist AU</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empowering unrepresented litigants across Australia with AI-powered legal assistance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>Features</div>
                <div>Pricing</div>
                <div>Templates</div>
                <div>API</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>Help Center</div>
                <div>Contact Us</div>
                <div>Legal Resources</div>
                <div>Community</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Disclaimer</div>
                <div>Security</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>© 2025 LegalAssist AU. All rights reserved. Not a law firm. Not a substitute for legal advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
