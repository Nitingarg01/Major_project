#!/usr/bin/env python3
"""
Backend API Test Suite for AI Interview Platform
Tests DSA interview creation and Emergent LLM integration
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, Any, Optional

class AIInterviewTester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.interview_id = None
        self.session = requests.Session()
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def run_test(self, name: str, method: str, endpoint: str, 
                 expected_status: int, data: Optional[Dict] = None, 
                 timeout: int = 30) -> tuple[bool, Dict]:
        """Run a single API test with enhanced error handling"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers, timeout=timeout)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                if response.text:
                    self.log(f"Response: {response.text[:200]}...", "ERROR")
                    
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
                
            return success, response_data
            
        except requests.exceptions.Timeout:
            self.log(f"❌ {name} - Request timed out after {timeout}s", "FAIL")
            return False, {"error": "timeout"}
        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}", "FAIL")
            return False, {"error": str(e)}
    
    def test_health_check(self) -> bool:
        """Test if the application is running"""
        try:
            response = requests.get(self.base_url, timeout=10)
            if response.status_code == 200:
                self.log("✅ Application is running and accessible")
                return True
            else:
                self.log(f"⚠️ Application returned status {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Application health check failed: {e}")
            return False
    
    def test_create_dsa_interview(self) -> bool:
        """Test creating a DSA interview - the main focus of this test"""
        self.log("🎯 Testing DSA Interview Creation (Main Test)")
        
        interview_data = {
            "id": "test-user-123",
            "jobDesc": "Software Engineer position focusing on algorithms and data structures. Candidate should demonstrate strong problem-solving skills and coding proficiency.",
            "skills": ["JavaScript", "Python", "Data Structures", "Algorithms", "Problem Solving"],
            "companyName": "TechCorp",
            "jobTitle": "Software Engineer",
            "experienceLevel": "mid",
            "interviewType": "dsa",  # This is the key test - DSA interviews were failing
            "projectContext": ["Built scalable web applications", "Implemented complex algorithms"],
            "workExDetails": ["3 years of software development experience", "Led algorithm optimization projects"]
        }
        
        success, response = self.run_test(
            "Create DSA Interview",
            "POST", 
            "create-interview",
            201,
            interview_data,
            timeout=60  # Longer timeout for LLM generation
        )
        
        if success and 'id' in response:
            self.interview_id = str(response['id'])
            self.log(f"✅ DSA Interview created successfully with ID: {self.interview_id}")
            self.log(f"📊 Questions generated: {response.get('questionsCount', 'Unknown')}")
            self.log(f"🎯 Service used: {response.get('service', 'Unknown')}")
            return True
        else:
            self.log("❌ DSA Interview creation failed")
            return False
    
    def test_create_mixed_interview(self) -> bool:
        """Test creating a mixed interview type"""
        interview_data = {
            "id": "test-user-456", 
            "jobDesc": "Full-stack developer role requiring technical, behavioral, and coding skills.",
            "skills": ["React", "Node.js", "MongoDB", "System Design"],
            "companyName": "StartupXYZ",
            "jobTitle": "Full Stack Developer",
            "experienceLevel": "senior",
            "interviewType": "mixed"
        }
        
        success, response = self.run_test(
            "Create Mixed Interview",
            "POST",
            "create-interview", 
            201,
            interview_data,
            timeout=90  # Even longer for mixed interviews
        )
        
        return success
    
    def test_emergent_llm_health(self) -> bool:
        """Test Emergent LLM service health"""
        if not self.interview_id:
            self.log("⚠️ Skipping Emergent LLM test - no interview ID available")
            return False
            
        test_data = {
            "interviewId": self.interview_id,
            "regenerate": False
        }
        
        success, response = self.run_test(
            "Emergent LLM Question Generation",
            "POST",
            "emergent-generate-questions",
            200,
            test_data,
            timeout=60
        )
        
        if success:
            self.log(f"✅ Emergent LLM generated {response.get('questionsCount', 0)} questions")
            if 'breakdown' in response:
                self.log(f"📊 Question breakdown: {response['breakdown']}")
        
        return success
    
    def test_question_regeneration(self) -> bool:
        """Test question regeneration functionality"""
        if not self.interview_id:
            self.log("⚠️ Skipping regeneration test - no interview ID available")
            return False
            
        regenerate_data = {
            "interviewId": self.interview_id,
            "regenerate": True
        }
        
        success, response = self.run_test(
            "Question Regeneration",
            "POST",
            "emergent-generate-questions",
            200,
            regenerate_data,
            timeout=60
        )
        
        return success
    
    def test_invalid_interview_creation(self) -> bool:
        """Test error handling for invalid interview data"""
        invalid_data = {
            "id": "test-user-invalid",
            # Missing required fields intentionally
            "jobDesc": "",
            "skills": [],
            "companyName": ""
        }
        
        success, response = self.run_test(
            "Invalid Interview Creation",
            "POST",
            "create-interview",
            400,  # Expecting bad request
            invalid_data
        )
        
        return success
    
    def test_missing_interview_id(self) -> bool:
        """Test error handling for missing interview ID"""
        success, response = self.run_test(
            "Missing Interview ID",
            "POST",
            "emergent-generate-questions",
            400,  # Expecting bad request
            {}
        )
        
        return success
    
    def test_interview_session_start(self) -> bool:
        """Test starting an interview session"""
        if not self.interview_id:
            self.log("⚠️ Skipping session start test - no interview ID available")
            return False
            
        session_data = {
            "interviewId": self.interview_id,
            "userId": "test-user-123"
        }
        
        success, response = self.run_test(
            "Start Interview Session",
            "POST",
            "interview-session",
            200,
            session_data
        )
        
        return success
    
    def run_comprehensive_test_suite(self) -> int:
        """Run the complete test suite"""
        self.log("🚀 Starting AI Interview Platform Backend Tests")
        self.log("=" * 60)
        
        # Health check first
        if not self.test_health_check():
            self.log("❌ Application not accessible, stopping tests")
            return 1
        
        # Core functionality tests
        tests = [
            ("DSA Interview Creation", self.test_create_dsa_interview),
            ("Mixed Interview Creation", self.test_create_mixed_interview), 
            ("Emergent LLM Integration", self.test_emergent_llm_health),
            ("Question Regeneration", self.test_question_regeneration),
            ("Interview Session Start", self.test_interview_session_start),
            ("Invalid Data Handling", self.test_invalid_interview_creation),
            ("Missing ID Handling", self.test_missing_interview_id),
        ]
        
        self.log("\n🧪 Running Core Functionality Tests:")
        self.log("-" * 40)
        
        critical_failures = []
        
        for test_name, test_func in tests:
            try:
                result = test_func()
                if not result and test_name in ["DSA Interview Creation", "Emergent LLM Integration"]:
                    critical_failures.append(test_name)
            except Exception as e:
                self.log(f"❌ {test_name} crashed: {e}", "ERROR")
                if test_name in ["DSA Interview Creation", "Emergent LLM Integration"]:
                    critical_failures.append(test_name)
        
        # Results summary
        self.log("\n" + "=" * 60)
        self.log("📊 TEST RESULTS SUMMARY")
        self.log("=" * 60)
        self.log(f"Tests Run: {self.tests_run}")
        self.log(f"Tests Passed: {self.tests_passed}")
        self.log(f"Tests Failed: {self.tests_run - self.tests_passed}")
        self.log(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if critical_failures:
            self.log(f"\n❌ CRITICAL FAILURES: {', '.join(critical_failures)}")
            self.log("🚨 DSA interview functionality may still be broken!")
            return 1
        elif self.tests_passed == self.tests_run:
            self.log("\n✅ ALL TESTS PASSED - DSA interviews are working!")
            return 0
        else:
            self.log(f"\n⚠️ Some tests failed but core DSA functionality works")
            return 0 if self.tests_passed >= (self.tests_run * 0.7) else 1

def main():
    """Main test execution"""
    print("🤖 AI Interview Platform - Backend API Test Suite")
    print("Testing DSA Round Fixes and Emergent LLM Integration")
    print("=" * 70)
    
    tester = AIInterviewTester()
    return tester.run_comprehensive_test_suite()

if __name__ == "__main__":
    sys.exit(main())