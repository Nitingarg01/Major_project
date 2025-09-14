#!/usr/bin/env python3
"""
Interview Platform Fixes Test Suite
Tests the specific fixes implemented for DSA question count and mixed interview enhancement
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, Any, Optional

class InterviewFixesTester:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.dsa_interview_id = None
        self.mixed_interview_id = None
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def run_test(self, name: str, method: str, endpoint: str, 
                 expected_status: int, data: Optional[Dict] = None, 
                 timeout: int = 60) -> tuple[bool, Dict]:
        """Run a single API test with enhanced error handling"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers, timeout=timeout)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                if response.text:
                    self.log(f"Response: {response.text[:300]}...", "ERROR")
                    
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
    
    def test_dsa_only_interview_creation(self) -> bool:
        """Test DSA-only interview creation - should generate exactly 2 questions"""
        self.log("🎯 Testing DSA-Only Interview Creation (Fix #1)")
        
        interview_data = {
            "jobDesc": "Software Engineer position focusing on algorithms and data structures. Strong coding skills required.",
            "skills": ["JavaScript", "Python", "Data Structures", "Algorithms", "Problem Solving"],
            "companyName": "Google",
            "jobTitle": "Software Engineer",
            "experienceLevel": "mid",
            "interviewType": "dsa",  # DSA-only interview
            "projectContext": ["Built algorithmic solutions", "Optimized data structures"],
            "workExDetails": ["3 years of software development", "Strong in competitive programming"]
        }
        
        success, response = self.run_test(
            "Create DSA-Only Interview",
            "POST", 
            "api/create-interview",
            201,
            interview_data,
            timeout=90
        )
        
        if success and 'id' in response:
            self.dsa_interview_id = str(response['id'])
            questions_count = response.get('questionsCount', 0)
            
            self.log(f"✅ DSA Interview created with ID: {self.dsa_interview_id}")
            self.log(f"📊 Questions generated: {questions_count}")
            
            # Verify exactly 2 questions were generated
            if questions_count == 2:
                self.log("✅ DSA Fix #1 VERIFIED: Exactly 2 questions generated", "PASS")
                return True
            else:
                self.log(f"❌ DSA Fix #1 FAILED: Expected 2 questions, got {questions_count}", "FAIL")
                return False
        else:
            self.log("❌ DSA Interview creation failed", "FAIL")
            return False
    
    def test_mixed_interview_creation(self) -> bool:
        """Test mixed interview creation - should include all 4 rounds with proper distribution"""
        self.log("🔄 Testing Mixed Interview Creation (Fix #2)")
        
        interview_data = {
            "jobDesc": "Full-stack developer role requiring technical, behavioral, coding, and analytical skills.",
            "skills": ["React", "Node.js", "MongoDB", "System Design", "Leadership"],
            "companyName": "Microsoft",
            "jobTitle": "Senior Full Stack Developer",
            "experienceLevel": "senior",
            "interviewType": "mixed",  # Mixed interview with all rounds
            "projectContext": ["Led full-stack projects", "Designed scalable systems"],
            "workExDetails": ["5 years full-stack development", "Team leadership experience"]
        }
        
        success, response = self.run_test(
            "Create Mixed Interview",
            "POST",
            "api/create-interview", 
            201,
            interview_data,
            timeout=120  # Longer timeout for mixed interviews
        )
        
        if success and 'id' in response:
            self.mixed_interview_id = str(response['id'])
            questions_count = response.get('questionsCount', 0)
            question_distribution = response.get('questionDistribution', {})
            
            self.log(f"✅ Mixed Interview created with ID: {self.mixed_interview_id}")
            self.log(f"📊 Total questions generated: {questions_count}")
            self.log(f"📈 Question distribution: {question_distribution}")
            
            # Verify total questions (should be 16)
            if questions_count == 16:
                self.log("✅ Mixed Fix #2a VERIFIED: Total 16 questions generated", "PASS")
                
                # Verify distribution (6 Technical + 4 Behavioral + 4 Aptitude + 2 DSA)
                expected_distribution = {
                    'technical': 6,
                    'behavioral': 4,
                    'aptitude': 4,
                    'dsa': 2
                }
                
                distribution_correct = True
                for category, expected_count in expected_distribution.items():
                    actual_count = question_distribution.get(category, 0)
                    if actual_count == expected_count:
                        self.log(f"✅ {category.capitalize()}: {actual_count}/{expected_count} ✓", "PASS")
                    else:
                        self.log(f"❌ {category.capitalize()}: {actual_count}/{expected_count} ✗", "FAIL")
                        distribution_correct = False
                
                if distribution_correct:
                    self.log("✅ Mixed Fix #2b VERIFIED: All 4 rounds with correct distribution", "PASS")
                    return True
                else:
                    self.log("❌ Mixed Fix #2b FAILED: Incorrect question distribution", "FAIL")
                    return False
            else:
                self.log(f"❌ Mixed Fix #2a FAILED: Expected 16 questions, got {questions_count}", "FAIL")
                return False
        else:
            self.log("❌ Mixed Interview creation failed", "FAIL")
            return False
    
    def test_groq_question_generation_api(self) -> bool:
        """Test the Groq question generation API directly"""
        self.log("🤖 Testing Groq Question Generation API (Fix #3)")
        
        if not self.dsa_interview_id:
            self.log("⚠️ Skipping Groq API test - no DSA interview ID available")
            return False
            
        test_data = {
            "interviewId": self.dsa_interview_id,
            "regenerate": False
        }
        
        success, response = self.run_test(
            "Groq Generate Questions API",
            "POST",
            "api/groq-generate-questions",
            200,
            test_data,
            timeout=90
        )
        
        if success:
            questions_count = response.get('questionsCount', 0)
            questions = response.get('questions', [])
            metadata = response.get('metadata', {})
            
            self.log(f"✅ Groq API generated {questions_count} questions")
            self.log(f"📊 Metadata: {metadata}")
            
            # Verify DSA questions have correct time limits (45 minutes)
            dsa_questions = [q for q in questions if q.get('category') == 'dsa']
            time_limits_correct = True
            
            for dsa_q in dsa_questions:
                time_limit = dsa_q.get('timeLimit', 0)
                if time_limit == 45:
                    self.log(f"✅ DSA Question time limit: {time_limit} minutes ✓", "PASS")
                else:
                    self.log(f"❌ DSA Question time limit: {time_limit} minutes (expected 45) ✗", "FAIL")
                    time_limits_correct = False
            
            if time_limits_correct:
                self.log("✅ Fix #4 VERIFIED: DSA questions have 45-minute time limits", "PASS")
                return True
            else:
                self.log("❌ Fix #4 FAILED: Incorrect time limits for DSA questions", "FAIL")
                return False
        else:
            self.log("❌ Groq question generation failed", "FAIL")
            return False
    
    def test_time_allocation_verification(self) -> bool:
        """Test time allocation for different question types"""
        self.log("⏰ Testing Time Allocation (Fix #4)")
        
        if not self.mixed_interview_id:
            self.log("⚠️ Skipping time allocation test - no mixed interview ID available")
            return False
            
        # Generate questions for mixed interview to check time allocation
        test_data = {
            "interviewId": self.mixed_interview_id,
            "regenerate": False
        }
        
        success, response = self.run_test(
            "Mixed Interview Time Allocation",
            "POST",
            "api/groq-generate-questions",
            200,
            test_data,
            timeout=90
        )
        
        if success:
            questions = response.get('questions', [])
            time_allocation_correct = True
            
            for question in questions:
                category = question.get('category', '')
                time_limit = question.get('timeLimit', 0)
                
                if category == 'dsa':
                    expected_time = 45
                else:
                    expected_time = 5
                
                if time_limit == expected_time:
                    self.log(f"✅ {category.capitalize()} question: {time_limit} min ✓", "PASS")
                else:
                    self.log(f"❌ {category.capitalize()} question: {time_limit} min (expected {expected_time}) ✗", "FAIL")
                    time_allocation_correct = False
            
            if time_allocation_correct:
                self.log("✅ Fix #4 VERIFIED: Correct time allocation for all question types", "PASS")
                return True
            else:
                self.log("❌ Fix #4 FAILED: Incorrect time allocation", "FAIL")
                return False
        else:
            self.log("❌ Time allocation test failed", "FAIL")
            return False
    
    def test_fallback_scenarios(self) -> bool:
        """Test fallback question generation scenarios"""
        self.log("🛡️ Testing Fallback Scenarios (Fix #5)")
        
        # Test with invalid company name to trigger fallback
        fallback_data = {
            "jobDesc": "Test position for fallback scenario",
            "skills": ["JavaScript", "React"],
            "companyName": "NonExistentCompany123",
            "jobTitle": "Test Engineer",
            "experienceLevel": "entry",
            "interviewType": "dsa"
        }
        
        success, response = self.run_test(
            "Fallback DSA Interview",
            "POST",
            "api/create-interview",
            201,
            fallback_data,
            timeout=60
        )
        
        if success:
            questions_count = response.get('questionsCount', 0)
            if questions_count == 2:
                self.log("✅ Fix #5 VERIFIED: Fallback generates exactly 2 DSA questions", "PASS")
                return True
            else:
                self.log(f"❌ Fix #5 FAILED: Fallback generated {questions_count} questions (expected 2)", "FAIL")
                return False
        else:
            self.log("❌ Fallback scenario test failed", "FAIL")
            return False
    
    def run_comprehensive_fixes_test(self) -> int:
        """Run the complete test suite for interview fixes"""
        self.log("🚀 Starting Interview Platform Fixes Test Suite")
        self.log("=" * 70)
        self.log("Testing Fixes:")
        self.log("1. DSA Question Count Fix (exactly 2 questions)")
        self.log("2. Mixed Interview Enhancement (all 4 rounds)")
        self.log("3. Question Distribution (6+4+4+2=16 total)")
        self.log("4. Time Allocation (DSA=45min, others=5min)")
        self.log("5. Fallback Scenarios")
        self.log("=" * 70)
        
        # Health check first
        if not self.test_health_check():
            self.log("❌ Application not accessible, stopping tests")
            return 1
        
        # Core fix tests
        tests = [
            ("DSA-Only Interview (Fix #1)", self.test_dsa_only_interview_creation),
            ("Mixed Interview (Fix #2)", self.test_mixed_interview_creation),
            ("Groq API Integration (Fix #3)", self.test_groq_question_generation_api),
            ("Time Allocation (Fix #4)", self.test_time_allocation_verification),
            ("Fallback Scenarios (Fix #5)", self.test_fallback_scenarios),
        ]
        
        self.log("\n🧪 Running Fix Verification Tests:")
        self.log("-" * 50)
        
        critical_failures = []
        
        for test_name, test_func in tests:
            try:
                result = test_func()
                if not result:
                    critical_failures.append(test_name)
            except Exception as e:
                self.log(f"❌ {test_name} crashed: {e}", "ERROR")
                critical_failures.append(test_name)
        
        # Results summary
        self.log("\n" + "=" * 70)
        self.log("📊 INTERVIEW FIXES TEST RESULTS")
        self.log("=" * 70)
        self.log(f"Tests Run: {self.tests_run}")
        self.log(f"Tests Passed: {self.tests_passed}")
        self.log(f"Tests Failed: {self.tests_run - self.tests_passed}")
        self.log(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if critical_failures:
            self.log(f"\n❌ FAILED FIXES: {', '.join(critical_failures)}")
            self.log("🚨 Some interview fixes are not working correctly!")
            return 1
        elif self.tests_passed == self.tests_run:
            self.log("\n✅ ALL FIXES VERIFIED - Interview platform fixes are working!")
            self.log("🎉 DSA interviews generate exactly 2 questions")
            self.log("🎉 Mixed interviews include all 4 rounds with proper distribution")
            self.log("🎉 Time allocation is correct (DSA=45min, others=5min)")
            self.log("🎉 Fallback scenarios work properly")
            return 0
        else:
            self.log(f"\n⚠️ Some fixes need attention")
            return 0 if self.tests_passed >= (self.tests_run * 0.8) else 1

def main():
    """Main test execution"""
    print("🎯 Interview Platform Fixes - Comprehensive Test Suite")
    print("Testing DSA Question Count & Mixed Interview Enhancement Fixes")
    print("=" * 80)
    
    tester = InterviewFixesTester()
    return tester.run_comprehensive_fixes_test()

if __name__ == "__main__":
    sys.exit(main())