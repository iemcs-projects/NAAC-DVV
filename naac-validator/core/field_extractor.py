import re
from validation.criteria_validator import CriteriaValidator

class FieldExtractor:
    def __init__(self, criteria_code):
        self.criteria_code = criteria_code
        self.validator = CriteriaValidator()
        self.required_fields = self.validator.get_required_fields(criteria_code)
    
    def extract_fields_from_text(self, text):
        """Extract required fields from OCR text based on criteria"""
        extracted_data = {}
        
        for field in self.required_fields:
            if field == "name_of_project":
                extracted_data[field] = self._extract_project_name(text)
            elif field == "name_of_principal_investigator":
                extracted_data[field] = self._extract_pi_name(text)
            elif field == "amount_sanctioned":
                extracted_data[field] = self._extract_amount(text)
            elif field == "year_of_award":
                extracted_data[field] = self._extract_year(text)
            elif field == "name_of_funding_agency":
                extracted_data[field] = self._extract_funding_agency(text)
            # New field types for additional criteria
            elif field in ["workshop_name", "activity_name", "title_of_activity"]:
                extracted_data[field] = self._extract_activity_name(text)
            elif field in ["participants", "student_count", "no_of_teacher", "no_of_student"]:
                extracted_data[field] = self._extract_count(text)
            elif field in ["date_from", "date_to"]:
                extracted_data[field] = self._extract_date(text)
            elif field in ["teacher_name", "participant_name"]:
                extracted_data[field] = self._extract_person_name(text)
            elif field in ["book_chapter_title", "paper_title", "conference_title"]:
                extracted_data[field] = self._extract_title(text)
            elif field in ["award_name", "awarding_body"]:
                extracted_data[field] = self._extract_award_info(text)
            elif field in ["collaborating_agency", "scheme_name", "publisher_name", "institution_name"]:
                extracted_data[field] = self._extract_organization(text)
            elif field in ["duration", "activities_list"]:
                extracted_data[field] = self._extract_description(text)
            elif field in ["year_of_collaboration", "year_of_mou", "activity_year"]:
                extracted_data[field] = self._extract_year(text)
        
        return extracted_data
    
    def _extract_project_name(self, text):
        """Extract project name from text - try multiple patterns"""
        patterns = [
            r'Project Title:\s*([^\n]+)',  # "Project Title: ..."
            r'project titled\s*\n?\s*["\']([^"\']+)["\']',  # 'project titled "..."'
            r'project titled\s+([^\n.,]+)',  # without quotes
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                result = match.group(1).strip()
                # Normalize smart quotes
                result = result.replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'")
                # Remove leading/trailing quotes and whitespace
                result = re.sub(r'^[\'"\s]+|[\'"\s]+$', '', result)
                # Remove stray internal quotes
                result = result.replace('"', '').replace("'", '')
                print(f"Extracted project name: {result}")
                return result.strip()
        return ""

    def _extract_pi_name(self, text):
        """Extract PI name from text - try multiple patterns"""
        patterns = [
            r'Researcher Name:\s*([^\n]+)',  # Format 1: "Researcher Name: ..."
            r'that\s+(Dr\.\s*[^\n,]+?)\s+from',  # Format 2: "that Dr. ... from"
            r'that\s+(Dr\.\s*[A-Za-z\s.]+?),',  # Format 3: "that Dr. John Doe," - capture until comma
            r'Principal Investigator:\s*([^\n]+)',  # Common variant
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip()
        return ""
    
    def _extract_amount(self, text):
        """Extract amount from text - handle Lakhs and Crores"""
        patterns = [
            (r'Amount\s*\(in Lakhs\):\s*[₹n]?\s*(\d+\.?\d*)', False),  # Format 1: "Amount (in Lakhs): n2.50"
            (r'amount of\s+[₹n]?\s*(\d+\.?\d*)\s*Crore', True),  # Format 2: "amount of n 4.00 Crore(s)"
            (r'amount of\s+[₹n]?\s*(\d+\.?\d*)\s*Lakh', False),  # Format 2: Lakhs variant
            (r'[₹₹n]\s*(\d+\.?\d*)\s*Crore', True),  # Flexible: "₹4.00 Crore(s)"
            (r'[₹₹n]\s*(\d+\.?\d*)\s*Lakh', False),  # Format 3: "₹6.00 Lakhs"
        ]
        for pattern, is_crores in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amount = float(match.group(1))
                # Convert Crores to Lakhs (1 Crore = 100 Lakhs)
                if is_crores:
                    amount = amount * 100
                return str(amount)
        return ""
    
    def _extract_year(self, text):
        """Extract year from text - try multiple patterns"""
        patterns = [
            r'Approval Year:\s*(\d{4})',  # Format 1: "Approval Year: 2024"
            r'in the year\s+(\d{4})',  # Format 2: "in the year 2024"
            r'Award Year:\s*(\d{4})',  # Common variant
            r'year\s+(\d{4})',  # Generic year mention
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ""
    
    def _extract_funding_agency(self, text):
        """Extract funding agency from text - try multiple patterns"""
        patterns = [
            r'Sponsoring Agency:\s*([^\n]+)',  # Format 1: "Sponsoring Agency: ..."
            r'funding agency\s+([A-Z]{2,})',  # Format 2: "funding agency UGC"
            r'funded by\s+([A-Z]{2,})',  # Format 3: "funded by UGC"
            r'Funding Agency:\s*([^\n]+)',  # Common variant
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ""
    
    def _extract_activity_name(self, text):
        """Extract activity/workshop/title name from text"""
        patterns = [
            r'Workshop Name:\s*([^\n]+)',
            r'Activity Name:\s*([^\n]+)',
            r'Title:\s*([^\n]+)',
            r'workshop\s*[:\-]\s*([^\n]+)',
            r'activity\s*[:\-]\s*([^\n]+)',
            r'title\s*[:\-]\s*([^\n]+)'
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ""
    
    def _extract_count(self, text):
        """Extract participant/student/teacher counts"""
        patterns = [
            r'Participants:\s*(\d+)',
            r'Students?:\s*(\d+)', 
            r'Teachers?:\s*(\d+)',
            r'Count:\s*(\d+)',
            r'Number:\s*(\d+)',
            r'(\d+)\s*participants',
            r'(\d+)\s*students?',
            r'(\d+)\s*teachers?'
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ""
    
    def _extract_date(self, text):
        """Extract dates from text"""
        patterns = [
            r'Date:\s*([0-9\-\/]+)',
            r'From:\s*([0-9\-\/]+)',
            r'To:\s*([0-9\-\/]+)',
            r'([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})',
            r'([0-9]{4}[\/\-][0-9]{1,2}[\/\-][0-9]{1,2})'
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ""
    
    def _extract_person_name(self, text):
        """Extract person names (teacher, participant, etc.)"""
        patterns = [
            r'Teacher:\s*([^\n]+)',
            r'Participant:\s*([^\n]+)',
            r'Name:\s*([^\n]+)',
            r'([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ""
    
    def _extract_title(self, text):
        """Extract titles (book, paper, conference, etc.)"""
        patterns = [
            r'Title:\s*([^\n]+)',
            r'Paper Title:\s*([^\n]+)',
            r'Book Title:\s*([^\n]+)',
            r'Conference:\s*([^\n]+)',
            r'Chapter:\s*([^\n]+)',
            r'"([^"]+)"'
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip().strip('"')
        return ""
    
    def _extract_award_info(self, text):
        """Extract award names and awarding bodies"""
        patterns = [
            r'Award:\s*([^\n]+)',
            r'Recognition:\s*([^\n]+)',
            r'Awarded by:\s*([^\n]+)',
            r'Body:\s*([^\n]+)',
            r'awarded\s+([^\n]+)',
            r'recognition\s+([^\n]+)'
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ""
    
    def _extract_organization(self, text):
        """Extract organization/agency/institution names"""
        patterns = [
            r'Agency:\s*([^\n]+)',
            r'Institution:\s*([^\n]+)',
            r'Organization:\s*([^\n]+)',
            r'Publisher:\s*([^\n]+)',
            r'Scheme:\s*([^\n]+)',
            r'([A-Z][A-Z][A-Z]+)',  # Acronyms like NSS, NCC, etc.
            r'([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ""
    
    def _extract_description(self, text):
        """Extract longer descriptions (duration, activities list, etc.)"""
        patterns = [
            r'Duration:\s*([^\n]+)',
            r'Activities:\s*([^\n\.]+)',
            r'Description:\s*([^\n\.]+)',
            r'(\d+\s*(?:days?|months?|years?))',
            r'([^\n]{20,100})'  # Generic longer text
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ""