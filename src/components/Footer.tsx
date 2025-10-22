'use client'
import React from 'react'
import Link from 'next/link'
import { Github, Linkedin, Mail, Code, Heart } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
<<<<<<< HEAD
            <h3 className="text-lg font-bold text-gray-900">AI Interview App</h3>
=======
            <h3 className="text-lg font-bold text-gray-900">Interview AI</h3>
>>>>>>> e191508 (Initial commit)
            <p className="text-sm text-gray-600">
              Practice for interviews and ace the real ones with AI-powered mock interviews.
            </p>
            <div className="flex space-x-4">
              <Link href="https://github.com" target="_blank" className="text-gray-400 hover:text-gray-500">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="https://www.linkedin.com/in/chirag-gupta-528294217/" target="_blank" className="text-gray-400 hover:text-gray-500">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="mailto:contact@aiinterview.com" className="text-gray-400 hover:text-gray-500">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Technical Interviews</li>
              <li>Behavioral Assessment</li>
              <li>DSA Challenges</li>
              <li>Aptitude Tests</li>
              <li>AI Feedback</li>
              <li>Camera Monitoring</li>
            </ul>
          </div>

          {/* Interview Types */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Interview Types</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Entry Level</li>
              <li>Mid Level</li>
              <li>Senior Level</li>
              <li>Company Specific</li>
              <li>Multi-Round</li>
              <li>Mixed Format</li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-gray-900">About Us</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
              </li>
              <li>
                <Link href="https://www.linkedin.com/in/chirag-gupta-528294217/" target="_blank" className="hover:text-gray-900">Contact</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>by developers, for developers</span>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-2 text-sm text-gray-500">
              <Code className="w-4 h-4" />
<<<<<<< HEAD
              <span>&copy; 2024 AI Interview App. All rights reserved.</span>
=======
              <span>&copy; 2024 Interview AI. All rights reserved.</span>
>>>>>>> e191508 (Initial commit)
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer