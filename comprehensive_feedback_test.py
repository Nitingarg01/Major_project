#!/usr/bin/env python3
"""
Comprehensive Backend Test for Feedback Generation Fix
Tests the Next.js interview application API endpoints for feedback generation
"""

import requests
import json
import sys
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
import os
import time

class FeedbackAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_data_ids = []  # Track created test data for cleanup
        
        # MongoDB connection for direct database operations
        self.mongo_client = MongoClient('mongodb+srv://gargn4034:N1i2t3i4n5@cluster0.67w57ax.mongodb.net/Cluster0?retryWrites=true&w=majority&appName=Cluster0')
        self.db = self.mongo_client.get_database()

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED {details}")
        else:
            print(f"❌ {name}: FAILED {details}")

    def create_test_interview(self, status="completed", include_answers=True):
        """Create test interview data directly in MongoDB"""
        interview_id = ObjectId()
        
        # Create interview document
        interview_doc = {
            "_id": interview_id,
            "companyName": "TestCorp",
            "jobTitle": "Software Engineer",
            "userId": "test-user-id",
            "status": status,
            "skills": ["JavaScript", "React", "Node.js"],
            "createdAt": datetime.now()
        }
        
        if status == "completed":
            interview_doc["completedAt"] = datetime.now()
        
        self.db.interviews.insert_one(interview_doc)
        
        # Create questions document
        questions = [
            {"id": "q1", "question": "What is React?", "category": "technical"},
            {"id": "q2", "question": "Explain closures in JavaScript?", "category": "technical"},
            {"id": "q3", "question": "Tell me about a challenge you faced?", "category": "behavioral"}
        ]
        
        questions_doc = {
            "interviewId": str(interview_id),
            "questions": questions,
            "completedAt": datetime.now(),
            "answersCount": 3 if include_answers else 0
        }
        
        if include_answers:
            # Create answers in object format (the format that was causing issues)
            answers = [
                {
                    "questionIndex": 0,
                    "answer": "React is a JavaScript library for building user interfaces. It uses a virtual DOM for efficient updates.",
                    "timestamp": datetime.now()
                },
                {
                    "questionIndex": 1,
                    "answer": "Closures allow inner functions to access variables from outer scopes even after the outer function returns.",
                    "timestamp": datetime.now()
                },
                {
                    "questionIndex": 2,
                    "answer": "I faced a performance issue with database queries and solved it by implementing proper indexing and query optimization.",
                    "timestamp": datetime.now()
                }
            ]
            questions_doc["answers"] = answers
        
        self.db.questions.insert_one(questions_doc)
        
        # Track for cleanup
        self.test_data_ids.append(str(interview_id))
        
        return str(interview_id)

    def cleanup_test_data(self):
        """Clean up all test data"""
        for interview_id in self.test_data_ids:
            try:
                self.db.interviews.delete_one({"_id": ObjectId(interview_id)})
                self.db.questions.delete_one({"interviewId": interview_id})
            except Exception as e:
                print(f"⚠️ Cleanup warning for {interview_id}: {e}")
        
        self.test_data_ids.clear()
        print(f"🧹 Cleaned up {len(self.test_data_ids)} test records")

    def test_successful_feedback_generation(self):
        """Test 1: Successful feedback generation flow"""
        print("\n🧪 Test 1: Successful Feedback Generation")
        
        # Create completed interview with answers
        interview_id = self.create_test_interview(status="completed", include_answers=True)
        
        try:
            # Test POST /api/fast-feedback
            response = requests.post(
                f"{self.base_url}/api/fast-feedback",
                json={"interviewId": interview_id},
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                success = (
                    data.get("success") == True and
                    "insights" in data and
                    "overallScore" in data["insights"] and
                    "parameterScores" in data["insights"]
                )
                self.log_test("Successful feedback generation", success, 
                            f"Score: {data.get('insights', {}).get('overallScore', 'N/A')}")
                
                # Test GET /api/fast-feedback (check status)
                get_response = requests.get(
                    f"{self.base_url}/api/fast-feedback?interviewId={interview_id}",
                    timeout=10
                )
                
                if get_response.status_code == 200:
                    get_data = get_response.json()
                    feedback_ready = get_data.get("feedbackReady", False)
                    self.log_test("Feedback status check", feedback_ready, 
                                f"Ready: {feedback_ready}")
                else:
                    self.log_test("Feedback status check", False, 
                                f"Status: {get_response.status_code}")
            else:
                self.log_test("Successful feedback generation", False, 
                            f"Status: {response.status_code}, Response: {response.text[:200]}")
                
        except Exception as e:
            self.log_test("Successful feedback generation", False, f"Exception: {str(e)}")

    def test_interview_not_completed(self):
        """Test 2: Interview not completed yet"""
        print("\n🧪 Test 2: Interview Not Completed")
        
        # Create interview with status 'in-progress'
        interview_id = self.create_test_interview(status="in-progress", include_answers=True)
        
        try:
            response = requests.post(
                f"{self.base_url}/api/fast-feedback",
                json={"interviewId": interview_id},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            expected_status = 400
            success = response.status_code == expected_status
            
            if success:
                data = response.json()
                has_correct_error = "not completed yet" in data.get("error", "").lower()
                success = success and has_correct_error
            
            self.log_test("Interview not completed error", success, 
                        f"Status: {response.status_code}, Expected: {expected_status}")
                
        except Exception as e:
            self.log_test("Interview not completed error", False, f"Exception: {str(e)}")

    def test_no_answers_submitted(self):
        """Test 3: Interview completed but no answers submitted"""
        print("\n🧪 Test 3: No Answers Submitted")
        
        # Create completed interview without answers
        interview_id = self.create_test_interview(status="completed", include_answers=False)
        
        try:
            response = requests.post(
                f"{self.base_url}/api/fast-feedback",
                json={"interviewId": interview_id},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            expected_status = 404
            success = response.status_code == expected_status
            
            if success:
                data = response.json()
                has_correct_error = "no answers" in data.get("error", "").lower()
                success = success and has_correct_error
            
            self.log_test("No answers submitted error", success, 
                        f"Status: {response.status_code}, Expected: {expected_status}")
                
        except Exception as e:
            self.log_test("No answers submitted error", False, f"Exception: {str(e)}")

    def test_invalid_interview_id(self):
        """Test 4: Invalid interview ID"""
        print("\n🧪 Test 4: Invalid Interview ID")
        
        test_cases = [
            ("invalid-id", "Invalid ObjectId format"),
            ("507f1f77bcf86cd799439011", "Non-existent but valid ObjectId"),
            ("", "Empty interview ID"),
        ]
        
        for invalid_id, description in test_cases:
            try:
                response = requests.post(
                    f"{self.base_url}/api/fast-feedback",
                    json={"interviewId": invalid_id},
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                # Should return 400 or 404
                success = response.status_code in [400, 404]
                self.log_test(f"Invalid ID ({description})", success, 
                            f"Status: {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Invalid ID ({description})", False, f"Exception: {str(e)}")

    def test_malformed_requests(self):
        """Test 5: Malformed request data"""
        print("\n🧪 Test 5: Malformed Request Data")
        
        test_cases = [
            ({}, "Empty request body"),
            ({"wrongField": "value"}, "Missing interviewId field"),
            ({"interviewId": None}, "Null interviewId"),
            ({"interviewId": 123}, "Numeric interviewId"),
        ]
        
        for payload, description in test_cases:
            try:
                response = requests.post(
                    f"{self.base_url}/api/fast-feedback",
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                # Should return 400
                success = response.status_code == 400
                self.log_test(f"Malformed request ({description})", success, 
                            f"Status: {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Malformed request ({description})", False, f"Exception: {str(e)}")

    def test_setanswers_api(self):
        """Test 6: Test setanswers API that creates the data format"""
        print("\n🧪 Test 6: SetAnswers API")
        
        # Create interview without answers
        interview_id = self.create_test_interview(status="in-progress", include_answers=False)
        
        try:
            # Test submitting answers
            answers_data = [
                {"answer": "React is a JavaScript library for building user interfaces"},
                {"answer": "Closures allow functions to access outer scope variables"},
                {"answer": "I solved a performance issue by optimizing database queries"}
            ]
            
            response = requests.post(
                f"{self.base_url}/api/setanswers",
                json={"data": answers_data, "id": interview_id},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = (
                    data.get("status") == 200 and
                    data.get("answersCount") == 3 and
                    "Answers uploaded successfully" in data.get("message", "")
                )
            
            self.log_test("SetAnswers API", success, 
                        f"Status: {response.status_code}")
            
            # Now test if feedback generation works with these answers
            if success:
                time.sleep(1)  # Brief pause
                feedback_response = requests.post(
                    f"{self.base_url}/api/fast-feedback",
                    json={"interviewId": interview_id},
                    headers={"Content-Type": "application/json"},
                    timeout=30
                )
                
                feedback_success = feedback_response.status_code == 200
                self.log_test("Feedback after SetAnswers", feedback_success, 
                            f"Status: {feedback_response.status_code}")
                
        except Exception as e:
            self.log_test("SetAnswers API", False, f"Exception: {str(e)}")

    def test_answer_format_compatibility(self):
        """Test 7: Different answer formats compatibility"""
        print("\n🧪 Test 7: Answer Format Compatibility")
        
        # Test with different answer formats
        formats = [
            ("Object format", [
                {"questionIndex": 0, "answer": "Answer 1", "timestamp": datetime.now()},
                {"questionIndex": 1, "answer": "Answer 2", "timestamp": datetime.now()},
                {"questionIndex": 2, "answer": "Answer 3", "timestamp": datetime.now()}
            ]),
            ("String format", ["Answer 1", "Answer 2", "Answer 3"]),
            ("Mixed format", [
                "Direct string answer",
                {"answer": "Object with answer property"},
                {"questionIndex": 2, "answer": "Full object format", "timestamp": datetime.now()}
            ])
        ]
        
        for format_name, answers in formats:
            interview_id = ObjectId()
            
            try:
                # Create interview
                interview_doc = {
                    "_id": interview_id,
                    "companyName": "TestCorp",
                    "jobTitle": "Software Engineer",
                    "status": "completed",
                    "completedAt": datetime.now()
                }
                self.db.interviews.insert_one(interview_doc)
                
                # Create questions with specific answer format
                questions_doc = {
                    "interviewId": str(interview_id),
                    "questions": [
                        {"id": "q1", "question": "Question 1"},
                        {"id": "q2", "question": "Question 2"},
                        {"id": "q3", "question": "Question 3"}
                    ],
                    "answers": answers,
                    "completedAt": datetime.now()
                }
                self.db.questions.insert_one(questions_doc)
                
                # Test feedback generation
                response = requests.post(
                    f"{self.base_url}/api/fast-feedback",
                    json={"interviewId": str(interview_id)},
                    headers={"Content-Type": "application/json"},
                    timeout=30
                )
                
                success = response.status_code == 200
                self.log_test(f"Answer format ({format_name})", success, 
                            f"Status: {response.status_code}")
                
                # Cleanup
                self.db.interviews.delete_one({"_id": interview_id})
                self.db.questions.delete_one({"interviewId": str(interview_id)})
                
            except Exception as e:
                self.log_test(f"Answer format ({format_name})", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all test scenarios"""
        print("🚀 Starting Comprehensive Feedback API Tests")
        print("=" * 60)
        
        try:
            # Test server availability
            response = requests.get(f"{self.base_url}/api/fast-feedback", timeout=5)
            print(f"✅ Server is accessible at {self.base_url}")
        except Exception as e:
            print(f"❌ Server not accessible: {e}")
            return False
        
        # Run all test scenarios
        self.test_successful_feedback_generation()
        self.test_interview_not_completed()
        self.test_no_answers_submitted()
        self.test_invalid_interview_id()
        self.test_malformed_requests()
        self.test_setanswers_api()
        self.test_answer_format_compatibility()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED! Feedback generation fix is working correctly.")
            return True
        else:
            print(f"⚠️ {self.tests_run - self.tests_passed} tests failed. Review the issues above.")
            return False

    def __del__(self):
        """Cleanup on destruction"""
        try:
            self.cleanup_test_data()
            if hasattr(self, 'mongo_client'):
                self.mongo_client.close()
        except:
            pass

def main():
    """Main test execution"""
    tester = FeedbackAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return 1
    finally:
        tester.cleanup_test_data()

if __name__ == "__main__":
    sys.exit(main())