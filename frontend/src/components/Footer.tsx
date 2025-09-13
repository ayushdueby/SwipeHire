export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gradient">SwipeHire</h3>
            <p className="text-sm text-gray-600">
              Skills-first job matching that connects talent with opportunities through intelligent swiping.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/jobs" className="text-sm text-gray-600 hover:text-gray-900">
                  Browse Jobs
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/features" className="text-sm text-gray-600 hover:text-gray-900">
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                  About
                </a>
              </li>
              <li>
                <a href="/blog" className="text-sm text-gray-600 hover:text-gray-900">
                  Blog
                </a>
              </li>
              <li>
                <a href="/careers" className="text-sm text-gray-600 hover:text-gray-900">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-sm text-gray-600 hover:text-gray-900">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2024 SwipeHire. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
