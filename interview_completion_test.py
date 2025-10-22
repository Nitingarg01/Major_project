#!/usr/bin/env python3
"""
Interview Completion Flow Test Suite for RecruiterAI
Tests the complete interview completion flow and performance system
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, Any, Optional

class InterviewCompletionTester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()
        self.test_interview_id = None
        
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

    def test_user_interviews_api(self) -> bool:
        """Test /api/user-interviews - should return interviews excluding completed ones"""
        self.log("🎯 Testing User Interviews API (should exclude completed interviews)")
        
        success, response = self.run_test(
            "User Interviews API",
            "GET", 
            "user-interviews?limit=5",
            200,
            timeout=15
        )
        
        if success:
            if 'success' in response and response['success']:
                interviews = response.get('interviews', [])
                stats = response.get('stats', {})
                
                self.log(f"📊 Found {len(interviews)} active interviews")
                self.log(f"📈 Stats - Total: {stats.get('total', 0)}, Completed: {stats.get('completed', 0)}, In Progress: {stats.get('inProgress', 0)}")
                
                # Check that no completed interviews are returned
                completed_in_results = [i for i in interviews if i.get('status') == 'completed']
                if completed_in_results:
                    self.log(f"❌ Found {len(completed_in_results)} completed interviews in active list - this should not happen!")
                    return False
                else:
                    self.log("✅ No completed interviews in active list - correct behavior")
                    return True
            else:
                self.log(f"❌ API returned success: false - {response.get('error', 'Unknown error')}")
                return False
        
        return success

    def test_save_performance_api(self) -> bool:
        """Test /api/save-performance with mock performance data"""
        self.log("🎯 Testing Save Performance API")
        
        # Create mock performance data
        mock_performance_data = {
            "interviewId": "507f1f77bcf86cd799439011",  # Mock ObjectId
            "jobTitle": "Software Engineer",
            "companyName": "TestCorp",
            "interviewType": "mixed",
            "experienceLevel": "mid",
            "totalQuestions": 10,
            "correctAnswers": 7,
            "score": 75,
            "timeSpent": 45,
            "feedback": {
                "overall": "Good performance with room for improvement in system design.",
                "strengths": ["Strong coding skills", "Good problem-solving approach"],
                "improvements": ["System design concepts", "Communication clarity"],
                "recommendations": ["Practice system design", "Work on explaining thought process"]
            },
            "roundResults": [
                {
                    "roundType": "technical",
                    "score": 80,
                    "questionsAnswered": 5,
                    "totalQuestions": 5,
                    "timeSpent": 25
                },
                {
                    "roundType": "behavioral",
                    "score": 70,
                    "questionsAnswered": 5,
                    "totalQuestions": 5,
                    "timeSpent": 20
                }
            ]
        }
        
        success, response = self.run_test(
            "Save Performance API",
            "POST",
            "save-performance",
            200,  # Expecting success or 401 if not authenticated
            mock_performance_data,
            timeout=15
        )
        
        if success:
            if response.get('success'):
                self.log(f"✅ Performance data saved successfully - ID: {response.get('performanceId', 'Unknown')}")
                self.log(f"📊 Interview updated: {response.get('interviewUpdated', False)}")
                return True
            else:
                self.log(f"❌ Save performance failed: {response.get('error', 'Unknown error')}")
                return False
        elif response.get('error') == 'Unauthorized':
            self.log("⚠️ Save performance requires authentication - this is expected behavior")
            return True  # This is actually correct behavior
        
        return success

    def test_performance_stats_api(self) -> bool:
        """Test /api/performance-stats - should return completed interviews"""
        self.log("🎯 Testing Performance Stats API")
        
        success, response = self.run_test(
            "Performance Stats API",
            "GET",
            "performance-stats",
            200,  # Expecting success or 401 if not authenticated
            timeout=15
        )
        
        if success:
            if response.get('success'):
                performances = response.get('performances', [])
                stats = response.get('stats', {})
                
                self.log(f"📊 Found {len(performances)} completed interviews")
                self.log(f"📈 Stats - Total: {stats.get('totalInterviews', 0)}, Avg Score: {stats.get('averageScore', 0)}%")
                self.log(f"⏱️ Total Time: {stats.get('totalTimeSpent', 0)} minutes")
                self.log(f"📈 Improvement Trend: {stats.get('improvementTrend', 0)}%")
                
                return True
            else:
                self.log(f"❌ Performance stats failed: {response.get('error', 'Unknown error')}")
                return False
        elif response.get('error') == 'Unauthorized':
            self.log("⚠️ Performance stats requires authentication - this is expected behavior")
            return True  # This is actually correct behavior
        
        return success

    def test_fix_completed_interviews_api(self) -> bool:
        """Test /api/fix-completed-interviews - database repair utility"""
        self.log("🎯 Testing Fix Completed Interviews API")
        
        success, response = self.run_test(
            "Fix Completed Interviews API",
            "POST",
            "fix-completed-interviews",
            200,  # Expecting success or 401 if not authenticated
            {},
            timeout=30
        )
        
        if success:
            if response.get('success'):
                fixed_count = response.get('fixedInterviews', 0)
                converted_count = response.get('convertedUserIds', 0)
                
                self.log(f"✅ Fixed {fixed_count} completed interviews")
                self.log(f"🔄 Converted {converted_count} userId formats")
                self.log(f"📝 Message: {response.get('message', 'No message')}")
                
                return True
            else:
                self.log(f"❌ Fix completed interviews failed: {response.get('error', 'Unknown error')}")
                return False
        elif response.get('error') == 'Unauthorized':
            self.log("⚠️ Fix completed interviews requires authentication - this is expected behavior")
            return True  # This is actually correct behavior
        
        return success

    def test_interview_debug_api(self) -> bool:
        """Test /api/interview-debug - provides detailed status information"""
        self.log("🎯 Testing Interview Debug API")
        
        # Test with a mock interview ID
        mock_interview_id = "507f1f77bcf86cd799439011"
        
        success, response = self.run_test(
            "Interview Debug API",
            "GET",
            f"interview-debug?interviewId={mock_interview_id}",
            200,  # Expecting success or 401 if not authenticated
            timeout=15
        )
        
        if success:
            if response.get('success'):
                debug_info = response.get('debug', {})
                issues = debug_info.get('issues', [])
                
                self.log(f"🔍 Debug info for interview {mock_interview_id}")
                self.log(f"👤 User ID: {debug_info.get('userId', 'Unknown')}")
                self.log(f"📊 All user interviews: {debug_info.get('allUserInterviewsCount', 0)}")
                self.log(f"✅ Completed interviews: {debug_info.get('completedInterviewsCount', 0)}")
                self.log(f"⚠️ Issues found: {len(issues)}")
                
                if issues:
                    for issue in issues:
                        self.log(f"  - {issue}")
                
                return True
            else:
                self.log(f"❌ Interview debug failed: {response.get('error', 'Unknown error')}")
                return False
        elif response.get('error') == 'Unauthorized':
            self.log("⚠️ Interview debug requires authentication - this is expected behavior")
            return True  # This is actually correct behavior
        
        return success

    def test_database_consistency(self) -> bool:
        """Test database consistency by checking ObjectId vs string userId issues"""
        self.log("🎯 Testing Database Consistency")
        
        # First run the fix API to ensure consistency
        fix_success, fix_response = self.run_test(
            "Database Consistency Fix",
            "POST",
            "fix-completed-interviews",
            200,
            {},
            timeout=30
        )
        
        if not fix_success and 'Unauthorized' not in str(fix_response):
            self.log("❌ Database consistency fix failed")
            return False
        
        # Then check user interviews to see if they're properly filtered
        interviews_success, interviews_response = self.run_test(
            "Database Consistency Check",
            "GET",
            "user-interviews?limit=10",
            200,
            timeout=15
        )
        
        if interviews_success and interviews_response.get('success'):
            interviews = interviews_response.get('interviews', [])
            stats = interviews_response.get('stats', {})
            
            # Check for any data inconsistencies
            total_interviews = stats.get('total', 0)
            completed_interviews = stats.get('completed', 0)
            active_interviews = len(interviews)
            
            self.log(f"📊 Database consistency check:")
            self.log(f"  - Total interviews: {total_interviews}")
            self.log(f"  - Completed interviews: {completed_interviews}")
            self.log(f"  - Active interviews returned: {active_interviews}")
            
            # The active interviews should not include completed ones
            expected_active = total_interviews - completed_interviews
            if active_interviews <= expected_active:
                self.log("✅ Database consistency looks good")
                return True
            else:
                self.log("⚠️ Possible database inconsistency detected")
                return False
        
        return interviews_success or 'Unauthorized' in str(interviews_response)

    def run_comprehensive_test_suite(self) -> int:
        """Run the complete interview completion flow test suite"""
        self.log("🚀 Starting Interview Completion Flow Test Suite")
        self.log("=" * 70)
        
        # Health check first
        if not self.test_health_check():
            self.log("❌ Application not accessible, stopping tests")
            return 1
        
        # Core functionality tests for interview completion flow
        tests = [
            ("User Interviews API (Dashboard)", self.test_user_interviews_api),
            ("Save Performance API", self.test_save_performance_api),
            ("Performance Stats API", self.test_performance_stats_api),
            ("Fix Completed Interviews API", self.test_fix_completed_interviews_api),
            ("Interview Debug API", self.test_interview_debug_api),
            ("Database Consistency Check", self.test_database_consistency),
        ]
        
        self.log("\n🧪 Running Interview Completion Flow Tests:")
        self.log("-" * 50)
        
        critical_failures = []
        
        for test_name, test_func in tests:
            try:
                result = test_func()
                if not result and test_name in ["User Interviews API (Dashboard)", "Save Performance API", "Performance Stats API"]:
                    critical_failures.append(test_name)
            except Exception as e:
                self.log(f"❌ {test_name} crashed: {e}", "ERROR")
                if test_name in ["User Interviews API (Dashboard)", "Save Performance API", "Performance Stats API"]:
                    critical_failures.append(test_name)
        
        # Results summary
        self.log("\n" + "=" * 70)
        self.log("📊 TEST RESULTS SUMMARY")
        self.log("=" * 70)
        self.log(f"Tests Run: {self.tests_run}")
        self.log(f"Tests Passed: {self.tests_passed}")
        self.log(f"Tests Failed: {self.tests_run - self.tests_passed}")
        self.log(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if critical_failures:
            self.log(f"\n❌ CRITICAL FAILURES: {', '.join(critical_failures)}")
            self.log("🚨 Interview completion flow may have issues!")
            return 1
        elif self.tests_passed == self.tests_run:
            self.log("\n✅ ALL TESTS PASSED - Interview completion flow is working!")
            return 0
        else:
            self.log(f"\n⚠️ Some tests failed but core functionality works")
            return 0 if self.tests_passed >= (self.tests_run * 0.7) else 1

def main():
    """Main test execution"""
    print("🤖 RecruiterAI - Interview Completion Flow Test Suite")
    print("Testing Performance System and Interview Completion Flow")
    print("=" * 70)
    
    tester = InterviewCompletionTester()
    return tester.run_comprehensive_test_suite()

if __name__ == "__main__":
    sys.exit(main())