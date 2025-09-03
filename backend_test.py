import requests
import sys
from datetime import datetime
import json

class AIInterviewAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.content:
                    try:
                        response_data = response.json()
                        print(f"Response: {json.dumps(response_data, indent=2)[:200]}...")
                    except:
                        print(f"Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:500]}")

            return success, response

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_api_endpoints(self):
        """Test various API endpoints"""
        
        # Test auth endpoints
        print("\n🔐 Testing Authentication APIs")
        
        # Test auth callback (should exist for NextAuth)
        self.run_test(
            "Auth API Check",
            "GET",
            "api/auth/providers",
            200
        )
        
        # Test create interview API
        print("\n📝 Testing Interview Creation APIs")
        
        self.run_test(
            "Create Interview API",
            "POST",
            "api/create-interview",
            200,  # or 401 if auth required
            data={
                "company": "Google",
                "position": "Software Engineer",
                "skills": ["JavaScript", "React"],
                "experience": "2-3 years"
            }
        )
        
        # Test generate questions API
        self.run_test(
            "Generate Questions API",
            "POST",
            "api/generate-questions",
            200,  # or 401 if auth required
            data={
                "company": "Google",
                "position": "Software Engineer",
                "round": "technical"
            }
        )
        
        # Test resume parsing API
        print("\n📄 Testing Resume Parsing APIs")
        
        self.run_test(
            "Parse Resume API",
            "POST",
            "api/parse-resume",
            200,  # or 401 if auth required
            data={
                "resumeText": "Sample resume content with JavaScript and React skills"
            }
        )
        
        # Test performance analysis API
        print("\n📊 Testing Performance Analysis APIs")
        
        self.run_test(
            "Analyze Performance API",
            "POST",
            "api/analyze-performance",
            200,  # or 401 if auth required
            data={
                "answers": ["Sample answer 1", "Sample answer 2"],
                "questions": ["Question 1", "Question 2"]
            }
        )

    def test_page_accessibility(self):
        """Test if main pages are accessible"""
        print("\n🌐 Testing Page Accessibility")
        
        # Test main pages
        pages = [
            ("Home Page", ""),
            ("Login Page", "login"),
            ("Signup Page", "signup"),
            ("Create Interview", "create")
        ]
        
        for page_name, path in pages:
            self.run_test(
                f"{page_name} Accessibility",
                "GET",
                path,
                200
            )

def main():
    print("🚀 Starting AI Interview Platform API Testing")
    print("=" * 50)
    
    # Setup
    tester = AIInterviewAPITester("http://localhost:3000")
    
    # Test page accessibility first
    tester.test_page_accessibility()
    
    # Test API endpoints
    tester.test_api_endpoints()
    
    # Print results
    print(f"\n📊 Test Results:")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())