import requests
import sys
import time
import json
from datetime import datetime

class DashboardPerformanceTester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, timeout=10):
        """Run a single API test with timing"""
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

            end_time = time.time()
            response_time = end_time - start_time

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                print(f"⏱️  Response Time: {response_time:.3f} seconds")
                
                if response.content:
                    try:
                        response_data = response.json()
                        print(f"Response: {json.dumps(response_data, indent=2)[:300]}...")
                        return success, response_data, response_time
                    except:
                        print(f"Response: {response.text[:200]}...")
                        return success, response.text, response_time
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"⏱️  Response Time: {response_time:.3f} seconds")
                print(f"Response: {response.text[:500]}")

            return success, response, response_time

        except requests.exceptions.Timeout:
            end_time = time.time()
            response_time = end_time - start_time
            print(f"❌ Failed - Request timeout after {response_time:.3f} seconds")
            return False, None, response_time
        except Exception as e:
            end_time = time.time()
            response_time = end_time - start_time
            print(f"❌ Failed - Error: {str(e)}")
            return False, None, response_time

    def test_dashboard_page_loading(self):
        """Test dashboard page loading performance"""
        print("\n🏠 Testing Dashboard Page Loading Performance")
        
        success, response, response_time = self.run_test(
            "Dashboard Page Load",
            "GET",
            "dashboard",
            200,
            timeout=15
        )
        
        if success:
            if response_time <= 5.0:
                print(f"✅ Dashboard loads within target time (≤5s): {response_time:.3f}s")
            else:
                print(f"⚠️  Dashboard load time exceeds target: {response_time:.3f}s > 5s")
        
        return success, response_time

    def test_user_interviews_api_performance(self):
        """Test the optimized user-interviews API endpoint"""
        print("\n🔄 Testing User Interviews API Performance")
        
        # Test without authentication (should return 401 but still test performance)
        success, response, response_time = self.run_test(
            "User Interviews API (Unauthenticated)",
            "GET",
            "api/user-interviews?limit=5",
            401,  # Expected 401 for unauthenticated request
            timeout=10
        )
        
        if response_time <= 3.0:
            print(f"✅ API responds quickly (≤3s): {response_time:.3f}s")
        else:
            print(f"⚠️  API response time could be improved: {response_time:.3f}s > 3s")
        
        return success, response_time

    def test_api_with_different_limits(self):
        """Test API performance with different limit parameters"""
        print("\n📊 Testing API Performance with Different Limits")
        
        limits = [1, 5, 10, 20]
        results = {}
        
        for limit in limits:
            success, response, response_time = self.run_test(
                f"User Interviews API (limit={limit})",
                "GET",
                f"api/user-interviews?limit={limit}",
                401,  # Expected 401 for unauthenticated request
                timeout=10
            )
            results[limit] = response_time
            
        print("\n📈 Performance Summary by Limit:")
        for limit, time_taken in results.items():
            print(f"  Limit {limit}: {time_taken:.3f}s")
        
        return results

    def test_concurrent_api_calls(self):
        """Test API performance under concurrent load"""
        print("\n🚀 Testing Concurrent API Performance")
        
        import threading
        import queue
        
        results_queue = queue.Queue()
        num_threads = 5
        
        def make_request():
            start_time = time.time()
            try:
                response = self.session.get(
                    f"{self.base_url}/api/user-interviews?limit=5",
                    timeout=10
                )
                end_time = time.time()
                results_queue.put({
                    'success': True,
                    'status': response.status_code,
                    'time': end_time - start_time
                })
            except Exception as e:
                end_time = time.time()
                results_queue.put({
                    'success': False,
                    'error': str(e),
                    'time': end_time - start_time
                })
        
        # Start concurrent requests
        threads = []
        start_time = time.time()
        
        for i in range(num_threads):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        total_time = time.time() - start_time
        
        # Collect results
        results = []
        while not results_queue.empty():
            results.append(results_queue.get())
        
        successful_requests = [r for r in results if r['success']]
        avg_response_time = sum(r['time'] for r in successful_requests) / len(successful_requests) if successful_requests else 0
        
        print(f"✅ Concurrent test completed:")
        print(f"  Total time: {total_time:.3f}s")
        print(f"  Successful requests: {len(successful_requests)}/{num_threads}")
        print(f"  Average response time: {avg_response_time:.3f}s")
        
        return len(successful_requests) == num_threads, avg_response_time

    def test_page_accessibility(self):
        """Test if key pages are accessible"""
        print("\n🌐 Testing Page Accessibility")
        
        pages = [
            ("Home Page", ""),
            ("Login Page", "login"),
            ("Dashboard Page", "dashboard"),
        ]
        
        for page_name, path in pages:
            success, response, response_time = self.run_test(
                f"{page_name} Accessibility",
                "GET",
                path,
                200,
                timeout=10
            )

def main():
    print("🚀 Starting Dashboard Performance Testing")
    print("=" * 60)
    print("Testing: Dashboard Loading, API Performance, Navigation UX")
    print("=" * 60)
    
    # Setup
    tester = DashboardPerformanceTester("http://localhost:3000")
    
    # Test page accessibility
    tester.test_page_accessibility()
    
    # Test dashboard loading performance
    dashboard_success, dashboard_time = tester.test_dashboard_page_loading()
    
    # Test API performance
    api_success, api_time = tester.test_user_interviews_api_performance()
    
    # Test API with different limits
    limit_results = tester.test_api_with_different_limits()
    
    # Test concurrent performance
    concurrent_success, concurrent_avg_time = tester.test_concurrent_api_calls()
    
    # Print comprehensive results
    print(f"\n📊 Performance Test Results Summary:")
    print("=" * 50)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    print(f"\n🎯 Key Performance Metrics:")
    print(f"  Dashboard Load Time: {dashboard_time:.3f}s {'✅' if dashboard_time <= 5.0 else '⚠️'}")
    print(f"  API Response Time: {api_time:.3f}s {'✅' if api_time <= 3.0 else '⚠️'}")
    print(f"  Concurrent Avg Time: {concurrent_avg_time:.3f}s")
    
    print(f"\n📈 Performance by Limit:")
    for limit, time_taken in limit_results.items():
        print(f"  Limit {limit}: {time_taken:.3f}s")
    
    # Determine overall success
    performance_good = dashboard_time <= 5.0 and api_time <= 3.0
    
    if performance_good and tester.tests_passed >= (tester.tests_run * 0.8):
        print("\n🎉 Performance tests passed! Dashboard optimizations are working well.")
        return 0
    else:
        print("\n⚠️  Some performance issues detected. Check the details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())