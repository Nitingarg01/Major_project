import requests
import sys
from datetime import datetime
import json
import time

class EnhancedInterviewAPITester:
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
                        print(f"Response: {json.dumps(response_data, indent=2)[:300]}...")
                        return success, response_data
                    except:
                        print(f"Response: {response.text[:300]}...")
                        return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:500]}")

            return success, response

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_enhanced_interview_creation(self):
        """Test the enhanced interview creation with company intelligence"""
        print("\n🚀 Testing Enhanced Interview Creation with Company Intelligence")
        
        # Test with Google (should trigger company intelligence)
        success, response = self.run_test(
            "Enhanced Create Interview API (Google)",
            "POST",
            "api/create-interview",
            201,  # Expected success
            data={
                "jobDesc": "We are looking for a skilled software engineer with experience in React, Node.js, and system design. You will work on large-scale distributed systems.",
                "skills": ["JavaScript", "React", "Node.js", "System Design", "MongoDB"],
                "companyName": "Google",
                "jobTitle": "Senior Software Engineer",
                "experienceLevel": "senior",
                "interviewType": "mixed",
                "projectContext": ["Built scalable e-commerce platform", "Designed microservices architecture"],
                "workExDetails": ["5 years at tech startup", "Led team of 4 developers"]
            }
        )
        
        if success and isinstance(response, dict) and 'id' in response:
            self.created_interview_id = response['id']
            print(f"✅ Enhanced interview created with ID: {self.created_interview_id}")
            return True
        return False

    def test_company_intelligence_api(self):
        """Test company intelligence endpoints"""
        print("\n🏢 Testing Company Intelligence API")
        
        # Test company search suggestions
        self.run_test(
            "Company Search Suggestions",
            "GET",
            "api/company-suggestions?query=Google",
            200
        )
        
        # Test company intelligence data
        self.run_test(
            "Company Intelligence Data",
            "GET",
            "api/company-intelligence?company=Google",
            200
        )

    def test_interview_overview_page(self):
        """Test interview overview page functionality"""
        print("\n📋 Testing Interview Overview Page")
        
        if self.created_interview_id:
            # Test interview details API
            success, response = self.run_test(
                "Interview Details API",
                "GET",
                f"api/interview/{self.created_interview_id}",
                200
            )
            
            # Test questions generation API
            self.run_test(
                "Questions Generation API",
                "GET",
                f"api/interview/{self.created_interview_id}/questions",
                200
            )

    def test_enhanced_interview_flow(self):
        """Test the enhanced interview flow with round management"""
        print("\n🎯 Testing Enhanced Interview Flow")
        
        if self.created_interview_id:
            # Test interview session initialization
            self.run_test(
                "Initialize Interview Session",
                "POST",
                f"api/interview/{self.created_interview_id}/initialize",
                200,
                data={
                    "userId": "test-user-id",
                    "companyName": "Google",
                    "jobTitle": "Senior Software Engineer",
                    "interviewType": "mixed"
                }
            )
            
            # Test round management
            self.run_test(
                "Get Interview Rounds",
                "GET",
                f"api/interview/{self.created_interview_id}/rounds",
                200
            )

    def test_enhanced_feedback_system(self):
        """Test the enhanced feedback system with company insights"""
        print("\n📊 Testing Enhanced Feedback System")
        
        if self.created_interview_id:
            # Test feedback generation with company intelligence
            self.run_test(
                "Generate Enhanced Feedback",
                "POST",
                f"api/interview/{self.created_interview_id}/feedback",
                200,
                data={
                    "answers": [
                        "I would design a distributed system using microservices architecture",
                        "My experience includes working with React and Node.js for 5 years",
                        "I handle conflicts by listening to all perspectives and finding common ground"
                    ],
                    "timeSpent": 1800,
                    "companyName": "Google",
                    "jobTitle": "Senior Software Engineer"
                }
            )
            
            # Test company-specific insights
            self.run_test(
                "Company-Specific Insights",
                "GET",
                f"api/interview/{self.created_interview_id}/insights",
                200
            )

    def test_streaming_ai_responses(self):
        """Test streaming AI responses for real-time feedback"""
        print("\n🤖 Testing Streaming AI Responses")
        
        # Test streaming response API
        success, response = self.run_test(
            "Stream AI Response",
            "POST",
            "api/stream-response",
            200,
            data={
                "question": "How would you design a system like Google Search?",
                "userAnswer": "I would use a distributed architecture with web crawlers, indexing systems, and ranking algorithms. The system would need to handle billions of queries with low latency.",
                "expectedAnswer": "A search engine requires web crawling, indexing, ranking algorithms, and distributed storage systems.",
                "difficulty": "hard",
                "companyContext": "Google"
            }
        )

    def test_api_ninja_integration(self):
        """Test API Ninja integration for company data"""
        print("\n🥷 Testing API Ninja Integration")
        
        # Test company logo/data fetching
        self.run_test(
            "Fetch Company Data (API Ninja)",
            "GET",
            "api/company-data?company=Google",
            200
        )

    def test_error_handling(self):
        """Test error handling and edge cases"""
        print("\n⚠️ Testing Error Handling")
        
        # Test invalid interview ID
        self.run_test(
            "Invalid Interview ID",
            "GET",
            "api/interview/invalid-id",
            404
        )
        
        # Test missing required fields
        self.run_test(
            "Missing Required Fields",
            "POST",
            "api/create-interview",
            400,
            data={
                "companyName": "Google"
                # Missing other required fields
            }
        )

def main():
    print("🚀 Starting Enhanced AI Interview Platform Testing")
    print("=" * 70)
    print("Testing Features: Company Intelligence, Enhanced Flow, Advanced Feedback")
    print("=" * 70)
    
    # Setup
    tester = EnhancedInterviewAPITester("http://localhost:3000")
    
    # Test enhanced interview creation
    creation_success = tester.test_enhanced_interview_creation()
    
    # Test company intelligence features
    tester.test_company_intelligence_api()
    
    # Test interview overview functionality
    if creation_success:
        tester.test_interview_overview_page()
        tester.test_enhanced_interview_flow()
        tester.test_enhanced_feedback_system()
    
    # Test streaming and API integrations
    tester.test_streaming_ai_responses()
    tester.test_api_ninja_integration()
    
    # Test error handling
    tester.test_error_handling()
    
    # Print results
    print(f"\n📊 Enhanced Test Results Summary:")
    print("=" * 50)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.created_interview_id:
        print(f"✅ Created interview ID for further testing: {tester.created_interview_id}")
    
    if tester.tests_passed >= tester.tests_run * 0.8:  # 80% success rate
        print("🎉 Enhanced features are working well!")
        return 0
    else:
        print("⚠️ Some enhanced features need attention.")
        return 1

if __name__ == "__main__":
    sys.exit(main())