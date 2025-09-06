import requests
import sys
import json
import time
from datetime import datetime

class RecruiterAIFocusedTester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.created_interview_id = None
        self.performance_results = {}

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, timeout=30):
        """Run a single API test with performance tracking"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        start_time = time.time()
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = self.session.delete(url, json=data, headers=headers, timeout=timeout)

            end_time = time.time()
            response_time = end_time - start_time
            
            # Store performance data
            self.performance_results[name] = {
                'response_time': response_time,
                'status_code': response.status_code,
                'success': response.status_code == expected_status
            }

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code} - Time: {response_time:.2f}s")
                if response.content:
                    try:
                        response_data = response.json()
                        print(f"Response: {json.dumps(response_data, indent=2)[:400]}...")
                        return success, response_data
                    except:
                        print(f"Response: {response.text[:400]}...")
                        return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code} - Time: {response_time:.2f}s")
                print(f"Response: {response.text[:500]}")

            return success, response

        except Exception as e:
            end_time = time.time()
            response_time = end_time - start_time
            print(f"❌ Failed - Error: {str(e)} - Time: {response_time:.2f}s")
            self.performance_results[name] = {
                'response_time': response_time,
                'status_code': 0,
                'success': False,
                'error': str(e)
            }
            return False, None

    def test_homepage_navigation(self):
        """Test homepage and navigation (5 mins)"""
        print("\n🌐 Testing Homepage & Navigation")
        print("=" * 50)
        
        # Test main homepage
        self.run_test(
            "Homepage Load",
            "GET",
            "",
            200
        )
        
        # Test create page
        self.run_test(
            "Create Page Load",
            "GET", 
            "create",
            200
        )
        
        # Test dashboard page (might require auth)
        self.run_test(
            "Dashboard Page Load",
            "GET",
            "dashboard", 
            200  # Try for success, might get redirect
        )

    def test_company_intelligence_api(self):
        """Test Company Intelligence API (10 mins) - Focus on performance"""
        print("\n🏢 Testing Company Intelligence API Performance")
        print("=" * 50)
        
        companies_to_test = ["Google", "Microsoft", "Amazon", "Apple", "UnknownCompany123"]
        
        for company in companies_to_test:
            print(f"\n📊 Testing company intelligence for: {company}")
            
            # Test POST method
            success, response = self.run_test(
                f"Company Intelligence POST - {company}",
                "POST",
                "api/company-intelligence",
                200,
                data={
                    "companyName": company,
                    "jobTitle": "Senior Software Engineer"
                },
                timeout=10  # 10 second timeout as per requirement
            )
            
            # Check response time requirement (should be under 8 seconds, optimally ~4s)
            if company in self.performance_results:
                response_time = self.performance_results[f"Company Intelligence POST - {company}"]["response_time"]
                if response_time > 8:
                    print(f"⚠️ WARNING: Response time {response_time:.2f}s exceeds 8s requirement!")
                elif response_time <= 4:
                    print(f"🚀 EXCELLENT: Response time {response_time:.2f}s meets optimized target!")
                else:
                    print(f"✅ GOOD: Response time {response_time:.2f}s within acceptable range")
            
            # Test GET method
            self.run_test(
                f"Company Intelligence GET - {company}",
                "GET",
                f"api/company-intelligence?company={company}&jobTitle=Senior Software Engineer",
                200,
                timeout=10
            )
            
            time.sleep(1)  # Brief pause between requests

    def test_interview_creation_flow(self):
        """Test Interview Creation Flow (20 mins) - Complete form testing"""
        print("\n🚀 Testing Interview Creation Flow")
        print("=" * 50)
        
        # Test complete interview creation with all required fields
        interview_data = {
            "jobDesc": "Design and build scalable systems for millions of users. Work with distributed architectures, microservices, and cloud technologies. Lead technical decisions and mentor junior developers.",
            "skills": ["React", "Python", "System Design", "AWS"],
            "companyName": "Google",
            "jobTitle": "Senior Software Engineer",
            "experienceLevel": "senior",
            "interviewType": "mixed",  # Test Mixed HARD type
            "projectContext": ["Built e-commerce platform handling 1M+ users", "Designed microservices architecture"],
            "workExDetails": ["5 years at tech startup", "Led team of 8 developers"]
        }
        
        success, response = self.run_test(
            "Complete Interview Creation (HARD Mode)",
            "POST",
            "api/create-interview",
            201,
            data=interview_data,
            timeout=60  # Longer timeout for question generation
        )
        
        if success and isinstance(response, dict) and 'id' in response:
            self.created_interview_id = str(response['id'])
            print(f"✅ Interview created with ID: {self.created_interview_id}")
            
            # Verify HARD difficulty marking
            if 'difficultyLevel' in response:
                difficulty = response.get('difficultyLevel', '').upper()
                if difficulty == 'HARD':
                    print("✅ Questions correctly marked as HARD difficulty")
                else:
                    print(f"⚠️ Expected HARD difficulty, got: {difficulty}")
            
            # Check question count and points
            if 'questionsCount' in response:
                count = response['questionsCount']
                print(f"📝 Generated {count} questions")
                
            if 'averagePoints' in response:
                avg_points = response['averagePoints']
                if avg_points >= 40:
                    print(f"✅ High points for HARD questions: {avg_points}")
                else:
                    print(f"⚠️ Expected high points (40+), got: {avg_points}")
        
        # Test form validation - missing required fields
        self.run_test(
            "Form Validation - Missing Fields",
            "POST",
            "api/create-interview",
            400,
            data={
                "companyName": "Google"
                # Missing other required fields
            }
        )
        
        # Test form validation - empty skills
        self.run_test(
            "Form Validation - Empty Skills",
            "POST", 
            "api/create-interview",
            400,
            data={
                "jobDesc": "Test job description",
                "skills": [],  # Empty skills array
                "companyName": "Google"
            }
        )

    def test_llm_api_integration(self):
        """Test LLM API Integration (15 mins) - Focus on Groq, Gemini, HuggingFace"""
        print("\n🤖 Testing LLM API Integration")
        print("=" * 50)
        
        if not self.created_interview_id:
            print("⚠️ No interview ID available, creating one for LLM testing...")
            # Create a quick interview for testing
            quick_interview = {
                "jobDesc": "Software Engineer position",
                "skills": ["JavaScript", "React"],
                "companyName": "Google",
                "jobTitle": "Software Engineer",
                "experienceLevel": "mid",
                "interviewType": "technical"
            }
            
            success, response = self.run_test(
                "Quick Interview for LLM Testing",
                "POST",
                "api/create-interview", 
                201,
                data=quick_interview,
                timeout=30
            )
            
            if success and isinstance(response, dict) and 'id' in response:
                self.created_interview_id = str(response['id'])
        
        if self.created_interview_id:
            # Test free LLM questions generation
            success, response = self.run_test(
                "Free LLM Questions Generation",
                "POST",
                "api/free-llm-questions",
                200,
                data={
                    "interviewId": self.created_interview_id,
                    "regenerate": False
                },
                timeout=45  # Longer timeout for LLM processing
            )
            
            if success and isinstance(response, dict):
                # Check for HARD difficulty marking
                if 'questions' in response:
                    questions = response['questions']
                    hard_questions = [q for q in questions if q.get('difficulty') == 'hard']
                    print(f"📊 Generated {len(questions)} total questions, {len(hard_questions)} marked as HARD")
                    
                    # Check for high points (40-50 for HARD)
                    high_point_questions = [q for q in questions if q.get('points', 0) >= 40]
                    print(f"💎 {len(high_point_questions)} questions with high points (40+)")
                    
                    # Check for longer time limits (10-15 mins for HARD)
                    long_time_questions = [q for q in questions if q.get('timeLimit', 0) >= 10]
                    print(f"⏱️ {len(long_time_questions)} questions with extended time limits (10+ mins)")
                
                # Check provider breakdown
                if 'breakdown' in response and 'providers' in response['breakdown']:
                    providers = response['breakdown']['providers']
                    print(f"🔧 LLM Providers used: {providers}")
                    
                    # Verify Groq is primary
                    if 'groq' in providers:
                        print("✅ Groq API integration working")
                    else:
                        print("⚠️ Groq API not detected in providers")
            
            # Test ObjectId validation (should reject non-ObjectId formats)
            self.run_test(
                "ObjectId Validation - Invalid Format",
                "POST",
                "api/free-llm-questions",
                400,
                data={
                    "interviewId": "invalid-id-format",
                    "regenerate": False
                }
            )
            
            # Test regeneration
            self.run_test(
                "LLM Questions Regeneration",
                "POST", 
                "api/free-llm-questions",
                200,
                data={
                    "interviewId": self.created_interview_id,
                    "regenerate": True
                },
                timeout=45
            )

    def test_company_search_autofill(self):
        """Test Company Search Autofill (10 mins) - SimpleCompanyAutofill component"""
        print("\n🔍 Testing Company Search Autofill")
        print("=" * 50)
        
        search_queries = ["goog", "micro", "amaz", "apple", "netflix"]
        
        for query in search_queries:
            success, response = self.run_test(
                f"Company Search - '{query}'",
                "POST",
                "api/company-search",
                200,
                data={"query": query},
                timeout=10
            )
            
            if success and isinstance(response, dict):
                if 'companies' in response:
                    companies = response['companies']
                    print(f"📋 Found {len(companies)} suggestions for '{query}'")
                    
                    # Check if suggestions are relevant
                    for company in companies[:3]:  # Show first 3
                        if 'name' in company:
                            print(f"  - {company['name']}")
                else:
                    print(f"⚠️ No companies field in response for '{query}'")
            
            time.sleep(0.5)  # Brief pause between searches
        
        # Test edge cases
        self.run_test(
            "Company Search - Too Short Query",
            "POST",
            "api/company-search", 
            400,
            data={"query": "a"}  # Too short
        )
        
        self.run_test(
            "Company Search - Empty Query",
            "POST",
            "api/company-search",
            400, 
            data={"query": ""}
        )

    def test_error_handling_and_fallbacks(self):
        """Test API error handling and fallbacks"""
        print("\n⚠️ Testing Error Handling & Fallbacks")
        print("=" * 50)
        
        # Test missing interview ID
        self.run_test(
            "Missing Interview ID",
            "POST",
            "api/free-llm-questions",
            400,
            data={}
        )
        
        # Test invalid company name
        self.run_test(
            "Invalid Company Intelligence",
            "POST", 
            "api/company-intelligence",
            400,
            data={}  # Missing companyName
        )
        
        # Test malformed requests
        self.run_test(
            "Malformed Interview Creation",
            "POST",
            "api/create-interview",
            400,
            data={"invalid": "data"}
        )

    def print_performance_summary(self):
        """Print detailed performance analysis"""
        print("\n📊 PERFORMANCE ANALYSIS SUMMARY")
        print("=" * 60)
        
        # Company Intelligence Performance
        company_tests = [k for k in self.performance_results.keys() if "Company Intelligence" in k]
        if company_tests:
            print("\n🏢 Company Intelligence API Performance:")
            for test in company_tests:
                result = self.performance_results[test]
                time_str = f"{result['response_time']:.2f}s"
                status = "✅" if result['success'] else "❌"
                
                # Performance rating
                if result['response_time'] <= 4:
                    rating = "🚀 EXCELLENT"
                elif result['response_time'] <= 8:
                    rating = "✅ GOOD"
                else:
                    rating = "⚠️ SLOW"
                
                print(f"  {status} {test}: {time_str} - {rating}")
        
        # Overall statistics
        total_tests = len(self.performance_results)
        successful_tests = sum(1 for r in self.performance_results.values() if r['success'])
        avg_response_time = sum(r['response_time'] for r in self.performance_results.values()) / total_tests if total_tests > 0 else 0
        
        print(f"\n📈 Overall Performance:")
        print(f"  Success Rate: {successful_tests}/{total_tests} ({(successful_tests/total_tests)*100:.1f}%)")
        print(f"  Average Response Time: {avg_response_time:.2f}s")
        
        # Performance requirements check
        company_intel_times = [r['response_time'] for k, r in self.performance_results.items() 
                              if "Company Intelligence" in k and r['success']]
        if company_intel_times:
            max_company_time = max(company_intel_times)
            avg_company_time = sum(company_intel_times) / len(company_intel_times)
            
            print(f"\n🎯 Company Intelligence Requirements Check:")
            print(f"  Max Response Time: {max_company_time:.2f}s (Requirement: <8s)")
            print(f"  Avg Response Time: {avg_company_time:.2f}s (Target: ~4s)")
            
            if max_company_time <= 8:
                print("  ✅ Performance requirement MET")
            else:
                print("  ❌ Performance requirement FAILED")

def main():
    print("🚀 RecruiterAI FOCUSED END-TO-END TESTING")
    print("=" * 70)
    print("Focus: HARD Question Generation, Company Intelligence, Performance")
    print("=" * 70)
    
    # Setup
    tester = RecruiterAIFocusedTester("http://localhost:3000")
    
    # Execute test plan as per review request
    print("\n⏱️ STARTING 5-PHASE TEST PLAN")
    
    # Phase 1: Homepage & Navigation (5 mins)
    tester.test_homepage_navigation()
    
    # Phase 2: Company Intelligence API (10 mins) 
    tester.test_company_intelligence_api()
    
    # Phase 3: Interview Creation Flow (20 mins)
    tester.test_interview_creation_flow()
    
    # Phase 4: LLM API Integration Testing (15 mins)
    tester.test_llm_api_integration()
    
    # Phase 5: Company Search Autofill (10 mins)
    tester.test_company_search_autofill()
    
    # Additional: Error Handling
    tester.test_error_handling_and_fallbacks()
    
    # Print comprehensive results
    print(f"\n📊 FINAL TEST RESULTS SUMMARY:")
    print("=" * 50)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.created_interview_id:
        print(f"✅ Created interview ID for testing: {tester.created_interview_id}")
    
    # Performance analysis
    tester.print_performance_summary()
    
    # Final assessment
    success_rate = (tester.tests_passed/tester.tests_run) if tester.tests_run > 0 else 0
    if success_rate >= 0.8:
        print("\n🎉 EXCELLENT: RecruiterAI platform performing well!")
        return 0
    elif success_rate >= 0.6:
        print("\n✅ GOOD: Most features working, some issues to address")
        return 0
    else:
        print("\n⚠️ NEEDS ATTENTION: Multiple issues detected")
        return 1

if __name__ == "__main__":
    sys.exit(main())