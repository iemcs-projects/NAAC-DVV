import json
from datetime import datetime

class JSONOutput:
    def __init__(self):
        pass
    
    def generate_validation_report(self, criteria_code, validation_results, failed_page=None):
        """Generate final validation JSON report"""
        report = {
            "criteria_code": criteria_code,
            "timestamp": datetime.now().isoformat(),
            "total_pages": len(validation_results),
            "validation_summary": {
                "passed": 0,
                "failed": 0,
                "overall_status": "PASS"
            },
            "page_results": validation_results,
            "failed_page": failed_page
        }
        
        # Calculate summary
        for result in validation_results:
            if result["is_valid"]:
                report["validation_summary"]["passed"] += 1
            else:
                report["validation_summary"]["failed"] += 1
        
        if report["validation_summary"]["failed"] > 0:
            report["validation_summary"]["overall_status"] = "FAIL"
        
        return report
    
    def save_json_report(self, data, filename):
        """Save JSON data to file"""
        try:
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"Report saved to: {filename}")
        except Exception as e:
            print(f"Error saving report: {e}")