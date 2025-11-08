# 🎯 Step-by-Step Example: Adding Criteria 4.1.1

## Let's add "Infrastructure and Learning Resources" criteria

### Step 1: Run the Helper Script

```bash
python add_criteria.py
```

### Step 2: Manual Implementation

#### A. Update Criteria Validator

Add to `validation/criteria/criteria_validator.py`:

```python
"4.1.1": {
    "name": "Infrastructure and Learning Resources", 
    "database_model": "response_4_1_1",
    "required_fields": [
        "facility_name",
        "facility_type", 
        "capacity",
        "area_sqft",
        "year_established",
        "current_status"
    ],
    "validation_rules": {
        "capacity": "positive_number",
        "year_established": "within_last_decade",
        "area_sqft": "positive_number"
    }
}
```

#### B. Update Database Configuration

Add to both functions in `config/database.py`:

```python
"4.1.1": {"table": "response_4_1_1", "code": "040101"}
```

#### C. Create Database Table

```sql
CREATE TABLE response_4_1_1 (
    sl_no INT PRIMARY KEY AUTO_INCREMENT,
    facility_name VARCHAR(500) NOT NULL,
    facility_type ENUM('Classroom', 'Laboratory', 'Library', 'Sports', 'Other') NOT NULL,
    capacity INT NOT NULL,
    area_sqft DECIMAL(10,2),
    year_established YEAR NOT NULL,
    current_status ENUM('Active', 'Under Renovation', 'Inactive') DEFAULT 'Active',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### D. Insert Sample Data

```sql
INSERT INTO response_4_1_1 (facility_name, facility_type, capacity, area_sqft, year_established, current_status) VALUES
('Computer Lab 1', 'Laboratory', 60, 1200.50, 2020, 'Active'),
('Main Library', 'Library', 200, 3000.00, 2015, 'Active'), 
('Auditorium', 'Other', 500, 5000.00, 2018, 'Active');
```

### Step 3: Test the New Criteria

```python
# Test script
from validation.criteria.criteria_validator import CriteriaValidator

validator = CriteriaValidator()

# Sample database record
record = {
    'sl_no': '1',
    'facility_name': 'Computer Lab 1',
    'facility_type': 'Laboratory',
    'capacity': 60,
    'area_sqft': 1200.50,
    'year_established': '2020',
    'current_status': 'Active'
}

# Sample document text
document_text = """
Infrastructure Report - Computer Lab 1
======================================

Facility Details:
- Name: Computer Lab 1
- Type: Laboratory 
- Student Capacity: 60
- Total Area: 1200.50 sq ft
- Year Established: 2020
- Current Status: Active and operational

The lab is equipped with modern computers and networking equipment,
serving the Computer Science department effectively.
"""

# Validate
result = validator.validate_criteria_document("4.1.1", record, document_text)

print(f"✅ Validation Result:")
print(f"   📊 Confidence: {result['confidence_score']:.3f}")
print(f"   🎯 Decision: {result['decision']}")
print(f"   📝 Analysis: {result.get('ai_analysis', {}).get('validation_analysis', 'N/A')}")
```

### Step 4: Test via API

```bash
# Test the new criteria via API
curl -X POST "http://localhost:8000/validate-record" \
  -F "file=@infrastructure_report.pdf" \
  -F "criteria_code=4.1.1" \  
  -F "record_id=1"
```

## 🎉 That's it! 

Your new criteria is now:
- ✅ Configured in the validation system
- ✅ Connected to the database  
- ✅ Ready for document validation
- ✅ Available via API endpoints

## 📚 Quick Reference

### Common Field Types:
- `name`, `title`, `description` → VARCHAR(500)
- `year`, `academic_year` → YEAR  
- `amount`, `cost`, `budget` → DECIMAL(12,2)
- `date`, `deadline` → DATE
- `status` → ENUM with specific values
- `count`, `number`, `capacity` → INT

### Validation Rules:
- `positive_number` → Must be > 0
- `within_assessment_period` → Must be within last 5 years
- `valid_year` → Must be reasonable year
- `valid_email` → Email format validation
- `required_field` → Cannot be empty

### Testing Checklist:
- ✅ Database connection works
- ✅ Records can be fetched
- ✅ Validation logic executes  
- ✅ AI analysis completes
- ✅ API endpoints respond
- ✅ Confidence scores are reasonable