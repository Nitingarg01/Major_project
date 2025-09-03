import requests
import sys
from datetime import datetime
import json
import time

class AIInterviewAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.created_interview_id = None

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
                response = self.session.delete(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.content:
                    try:
                        response_data = response.json()
                        print(f"Response: {json.dumps(response_data, indent=2)[:200]}...")
                        return success, response_data
                    except:
                        print(f"Response: {response.text[:200]}...")
                        return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:500]}")

            return success, response

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_page_accessibility(self):
        """Test if main pages are accessible"""
        print("\n🌐 Testing Page Accessibility")
        
        # Test main pages including forgot-password
        pages = [
            ("Home Page", ""),
            ("Login Page", "login"),
            ("Signup Page", "signup"),
            ("Create Interview", "create"),
            ("Forgot Password Page", "forgot-password"),
            ("Reset Password Page", "reset-password?token=test")
        ]
        
        for page_name, path in pages:
            self.run_test(
                f"{page_name} Accessibility",
                "GET",
                path,
                200
            )

    def test_auth_endpoints(self):
        """Test authentication related endpoints"""
        print("\n🔐 Testing Authentication APIs")
        
        # Test auth providers
        self.run_test(
            "Auth Providers API",
            "GET",
            "api/auth/providers",
            200
        )

    def test_one_click_interview_creation(self):
        """Test the one-click interview creation feature"""
        print("\n🚀 Testing One-Click Interview Creation")
        
        # Test with proper required fields
        success, response = self.run_test(
            "One-Click Create Interview API",
            "POST",
            "api/create-interview",
            401,  # Expected 401 since we're not authenticated
            data={
                "id": "test-user-id",
                "jobDesc": "We are looking for a skilled software engineer with experience in React and Node.js",
                "skills": ["JavaScript", "React", "Node.js"],
                "companyName": "Google",
                "jobTitle": "Software Engineer",
                "experienceLevel": "mid",
                "interviewType": "technical",
                "projectContext": ["Built e-commerce platform"],
                "workExDetails": ["2 years at startup"]
            }
        )
        
        if success and isinstance(response, dict) and 'id' in response:
            self.created_interview_id = response['id']
            print(f"✅ Interview created with ID: {self.created_interview_id}")

    def test_delete_interview(self):
        """Test the delete interview functionality"""
        print("\n🗑️ Testing Delete Interview Feature")
        
        # Test delete without authentication (should fail)
        self.run_test(
            "Delete Interview API (Unauthenticated)",
            "DELETE",
            "api/delete-interview",
            401,  # Expected 401 since we're not authenticated
            data={
                "interviewId": "test-interview-id"
            }
        )

    def test_streaming_ai_feedback(self):
        """Test the streaming AI feedback feature"""
        print("\n🤖 Testing Streaming AI Feedback")
        
        # Test streaming response API
        success, response = self.run_test(
            "Stream Response API",
            "POST",
            "api/stream-response",
            200,
            data={
                "question": "What is React?",
                "userAnswer": "React is a JavaScript library for building user interfaces",
                "expectedAnswer": "React is a popular JavaScript library developed by Facebook for building user interfaces, particularly for web applications.",
                "difficulty": "easy"
            }
        )
        
        if success:
            print("✅ Streaming API endpoint is accessible")

    def test_generate_questions_api(self):
        """Test the generate questions API"""
        print("\n❓ Testing Generate Questions API")
        
        self.run_test(
            "Generate Questions API",
            "POST",
            "api/generate-questions",
            400,  # Expected 400 since we need interview ID
            data={
                "company": "Google",
                "position": "Software Engineer",
                "round": "technical"
            }
        )

    def test_resume_parsing(self):
        """Test resume parsing functionality"""
        print("\n📄 Testing Resume Parsing")
        
        # Test with wrong content type (should expect multipart/form-data)
        self.run_test(
            "Parse Resume API",
            "POST",
            "api/parse-resume",
            400,  # Expected 400 for wrong content type
            data={
                "resumeText": "Sample resume content"
            }
        )

    def test_performance_analysis(self):
        """Test performance analysis API"""
        print("\n📊 Testing Performance Analysis")
        
        self.run_test(
            "Analyze Performance API",
            "POST",
            "api/analyze-performance",
            400,  # Expected 400 since interview ID is required
            data={
                "answers": ["Sample answer"],
                "questions": ["Sample question"]
            }
        )

def main():
    print("🚀 Starting AI Interview Platform API Testing")
    print("=" * 60)
    print("Testing Features: Forgot Password, Delete Interview, One-Click Creation, Streaming AI")
    print("=" * 60)
    
    # Setup
    tester = AIInterviewAPITester("http://localhost:3000")
    
    # Test page accessibility first (including forgot password pages)
    tester.test_page_accessibility()
    
    # Test authentication endpoints
    tester.test_auth_endpoints()
    
    # Test specific features mentioned in review request
    tester.test_one_click_interview_creation()
    tester.test_delete_interview()
    tester.test_streaming_ai_feedback()
    
    # Test other API endpoints
    tester.test_generate_questions_api()
    tester.test_resume_parsing()
    tester.test_performance_analysis()
    
    # Print results
    print(f"\n📊 Test Results Summary:")
    print("=" * 40)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the details above.")
        print("\nNote: Some failures are expected due to authentication requirements.")
        return 1

if __name__ == "__main__":
    sys.exit(main())