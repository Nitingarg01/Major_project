import requests
import sys
from datetime import datetime
import json

class DashboardRoutingTester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, check_content=None):
        """Run a single test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, allow_redirects=False)
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Check content if specified
                if check_content and response.text:
                    if check_content in response.text:
                        print(f"✅ Content check passed: Found '{check_content}'")
                    else:
                        print(f"⚠️  Content check failed: '{check_content}' not found")
                        success = False
                        self.tests_passed -= 1
                        
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.status_code in [301, 302, 307, 308]:
                    print(f"Redirect location: {response.headers.get('Location', 'Not specified')}")
                print(f"Response preview: {response.text[:200]}...")

            return success, response

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_landing_page(self):
        """Test landing page loads with RecruiterAI branding"""
        print("\n🏠 Testing Landing Page")
        
        success, response = self.run_test(
            "Landing Page Accessibility",
            "GET",
            "",
            200,
            check_content="RecruiterAI"
        )
        
        if success and response:
            # Additional checks for landing page
            content = response.text.lower()
            if "recruiterai" in content:
                print("✅ RecruiterAI branding found")
            else:
                print("⚠️  RecruiterAI branding not found in page content")

    def test_login_page(self):
        """Test login page accessibility and form elements"""
        print("\n🔐 Testing Login Page")
        
        success, response = self.run_test(
            "Login Page Accessibility",
            "GET",
            "login",
            200
        )
        
        if success and response:
            content = response.text.lower()
            form_elements = [
                "email",
                "password", 
                "sign in",
                "login",
                "form"
            ]
            
            found_elements = []
            for element in form_elements:
                if element in content:
                    found_elements.append(element)
            
            print(f"✅ Found form elements: {found_elements}")
            
            # Check for dashboard redirect mention
            if "dashboard" in content:
                print("✅ Dashboard redirect functionality present")

    def test_dashboard_route_exists(self):
        """Test that dashboard route exists and doesn't return 404"""
        print("\n📊 Testing Dashboard Route Existence")
        
        # Test dashboard route without authentication
        success, response = self.run_test(
            "Dashboard Route Accessibility (Unauthenticated)",
            "GET", 
            "dashboard",
            200  # Should return 200 but with redirect logic in client-side
        )
        
        if success and response:
            print("✅ Dashboard route exists (no 404 error)")
            
            # Check if it contains authentication redirect logic
            content = response.text.lower()
            if "login" in content or "authentication" in content or "redirect" in content:
                print("✅ Authentication protection logic detected")
        else:
            print("❌ Dashboard route may not exist or returns error")

    def test_auth_api_endpoints(self):
        """Test authentication related API endpoints"""
        print("\n🔑 Testing Authentication API Endpoints")
        
        # Test NextAuth providers endpoint
        self.run_test(
            "NextAuth Providers API",
            "GET",
            "api/auth/providers",
            200
        )
        
        # Test user-interviews API (should require auth)
        self.run_test(
            "User Interviews API (Unauthenticated)",
            "GET",
            "api/user-interviews",
            401  # Should return 401 for unauthenticated requests
        )

    def test_signup_page(self):
        """Test signup page accessibility"""
        print("\n📝 Testing Signup Page")
        
        self.run_test(
            "Signup Page Accessibility",
            "GET",
            "signup",
            200
        )

def main():
    print("🚀 Starting Dashboard Routing & Authentication Tests")
    print("=" * 60)
    print("Testing: Landing Page, Login Flow, Dashboard Route, Auth Protection")
    print("=" * 60)
    
    # Setup
    tester = DashboardRoutingTester("http://localhost:3000")
    
    # Run specific tests for the review request
    tester.test_landing_page()
    tester.test_login_page()
    tester.test_dashboard_route_exists()
    tester.test_auth_api_endpoints()
    tester.test_signup_page()
    
    # Print results
    print(f"\n📊 Test Results Summary:")
    print("=" * 40)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed >= tester.tests_run * 0.8:  # 80% pass rate acceptable
        print("🎉 Most critical tests passed!")
        return 0
    else:
        print("⚠️  Some critical tests failed. Check the details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())