import requests
import sys
from datetime import datetime
import json
import time

class ActualInterviewAPITester:
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

    def test_create_interview(self):
        """Test interview creation API"""
        print("\n🚀 Testing Interview Creation")
        
        success, response = self.run_test(
            "Create Interview API",
            "POST",
            "api/create-interview",
            201,
            data={
                "jobDesc": "We are looking for a skilled software engineer with experience in React, Node.js, and system design.",
                "skills": ["JavaScript", "React", "Node.js", "System Design", "MongoDB"],
                "companyName": "Google",
                "jobTitle": "Senior Software Engineer",
                "experienceLevel": "senior",
                "interviewType": "mixed",
                "projectContext": ["Built scalable e-commerce platform"],
                "workExDetails": ["5 years at tech startup"]
            }
        )
        
        if success and isinstance(response, dict) and 'id' in response:
            self.created_interview_id = response['id']
            print(f"✅ Interview created with ID: {self.created_interview_id}")
            return True
        return False

    def test_generate_questions(self):
        """Test question generation APIs"""
        print("\n📝 Testing Question Generation")
        
        # Test basic question generation
        self.run_test(
            "Generate Questions API",
            "POST",
            "api/generate-questions",
            200,
            data={
                "jobDesc": "Software Engineer position requiring React and Node.js skills",
                "skills": ["React", "Node.js", "JavaScript"],
                "companyName": "Google",
                "jobTitle": "Software Engineer"
            }
        )
        
        # Test enhanced question generation
        self.run_test(
            "Enhanced Generate Questions API",
            "POST",
            "api/enhanced-generate-questions",
            200,
            data={
                "jobDesc": "Senior Software Engineer position",
                "skills": ["React", "Node.js", "System Design"],
                "companyName": "Google",
                "jobTitle": "Senior Software Engineer",
                "experienceLevel": "senior",
                "interviewType": "mixed"
            }
        )

    def test_interview_session(self):
        """Test interview session management"""
        print("\n🎯 Testing Interview Session")
        
        if self.created_interview_id:
            self.run_test(
                "Interview Session API",
                "POST",
                "api/interview-session",
                200,
                data={
                    "interviewId": self.created_interview_id,
                    "action": "start"
                }
            )

    def test_streaming_response(self):
        """Test streaming AI response"""
        print("\n🤖 Testing Streaming Response")
        
        self.run_test(
            "Stream Response API",
            "POST",
            "api/stream-response",
            200,
            data={
                "question": "How would you design a scalable web application?",
                "userAnswer": "I would use microservices architecture with load balancers and caching layers.",
                "expectedAnswer": "A scalable web application requires proper architecture design.",
                "difficulty": "medium"
            }
        )

    def test_set_answers(self):
        """Test answer submission"""
        print("\n📋 Testing Answer Submission")
        
        if self.created_interview_id:
            self.run_test(
                "Set Answers API",
                "POST",
                "api/setanswers",
                200,
                data={
                    "interviewId": self.created_interview_id,
                    "answers": [
                        "I would design a microservices architecture",
                        "My experience includes 5 years with React"
                    ],
                    "timeSpent": 1800
                }
            )

    def test_performance_analysis(self):
        """Test performance analysis"""
        print("\n📊 Testing Performance Analysis")
        
        if self.created_interview_id:
            self.run_test(
                "Analyze Performance API",
                "POST",
                "api/analyze-performance",
                200,
                data={
                    "interviewId": self.created_interview_id,
                    "answers": ["Good technical answer", "Clear communication"],
                    "timeSpent": 1800,
                    "companyName": "Google"
                }
            )

    def test_resume_apis(self):
        """Test resume-related APIs"""
        print("\n📄 Testing Resume APIs")
        
        # Test resume parsing (would need actual file upload in real scenario)
        # For now, just test the endpoint exists
        self.run_test(
            "Parse Resume API (no file)",
            "POST",
            "api/parse-resume",
            400,  # Expected to fail without file
            data={}
        )
        
        # Test resume analysis
        self.run_test(
            "Analyze Resume API",
            "POST",
            "api/analyze-resume",
            400,  # Expected to fail without proper data
            data={}
        )

    def test_user_stats(self):
        """Test user statistics"""
        print("\n👤 Testing User Stats")
        
        # This might require authentication, so expect 401 or similar
        success, response = self.run_test(
            "User Stats API",
            "GET",
            "api/user/stats",
            200  # Try for success first
        )
        
        # If it fails, that's expected without auth
        if not success:
            print("ℹ️ User stats API requires authentication (expected)")

    def test_delete_interview(self):
        """Test interview deletion"""
        print("\n🗑️ Testing Interview Deletion")
        
        if self.created_interview_id:
            self.run_test(
                "Delete Interview API",
                "DELETE",
                "api/delete-interview",
                200,
                data={
                    "interviewId": self.created_interview_id
                }
            )

def main():
    print("🚀 Starting Actual AI Interview Platform API Testing")
    print("=" * 70)
    print("Testing Existing API Endpoints")
    print("=" * 70)
    
    # Setup
    tester = ActualInterviewAPITester("http://localhost:3000")
    
    # Test core functionality
    creation_success = tester.test_create_interview()
    tester.test_generate_questions()
    
    if creation_success:
        tester.test_interview_session()
        tester.test_set_answers()
        tester.test_performance_analysis()
    
    # Test other APIs
    tester.test_streaming_response()
    tester.test_resume_apis()
    tester.test_user_stats()
    
    # Test deletion last
    if creation_success:
        tester.test_delete_interview()
    
    # Print results
    print(f"\n📊 Test Results Summary:")
    print("=" * 50)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.created_interview_id:
        print(f"✅ Created interview ID: {tester.created_interview_id}")
    
    if tester.tests_passed >= tester.tests_run * 0.7:  # 70% success rate
        print("🎉 Core APIs are working well!")
        return 0
    else:
        print("⚠️ Some APIs need attention.")
        return 1

if __name__ == "__main__":
    sys.exit(main())