#!/usr/bin/env python3
"""
Test script for NAAC 3.1.1 validation with the provided data
"""

# Sample database record (first record from your data)
database_record = {
    'id': '37',
    'sl_no': '1', 
    'criteria_code': '030301030101',
    'session': 2025,
    'year': 2025,
    'name_of_principal_investigator': 'Dr. John Doe',
    'department_of_principal_investigator': 'Computer Science',
    'duration_of_project': '24',
    'type': 'Government',
    'name_of_project': 'Advanced AI Research',
    'year_of_award': '2024',
    'amount_sanctioned': '2.50',
    'name_of_funding_agency': 'UGC'
}

# Sample extracted text (first certificate)
extracted_text_sample = """
Certificate of Research Grant
This is to certify that Dr. John Doe from the Department of Computer
Science has been awarded a research grant under the category
Government for the project titled "Advanced AI Research".
The project has been sanctioned with an amount of I 2.50 Crore(s) by
the funding agency UGC in the year 2024.
Issued as part of the official research funding records.
__________________________
Authorized Signatory
"""

def test_field_matching():
    """Test field matching logic"""
    print("=== Testing Field Matching Logic ===\n")
    
    text_lower = extracted_text_sample.lower()
    
    # Test PI name matching
    pi_name = database_record['name_of_principal_investigator'].lower()
    print(f"PI Name in DB: '{pi_name}'")
    print(f"Found in text: {pi_name in text_lower}")
    
    # Test department matching  
    dept = database_record['department_of_principal_investigator'].lower()
    print(f"Department in DB: '{dept}'")
    print(f"Found in text: {dept in text_lower}")
    
    # Test project name
    project = database_record['name_of_project'].lower()
    print(f"Project in DB: '{project}'") 
    print(f"Found in text: {project in text_lower}")
    
    # Test amount (crores format)
    amount = database_record['amount_sanctioned']
    import re
    amount_patterns = [
        f"i\\s*{amount}\\s*crore",
        f"₹\\s*{amount}\\s*crore", 
        f"amount.*{amount}",
        f"{amount}.*crore"
    ]
    amount_found = any(re.search(pattern, text_lower) for pattern in amount_patterns)
    print(f"Amount in DB: '{amount}' crores")
    print(f"Found in text: {amount_found}")
    
    # Test funding agency
    agency = database_record['name_of_funding_agency'].lower()
    print(f"Agency in DB: '{agency}'")
    print(f"Found in text: {agency in text_lower}")
    
    # Test grant type
    grant_type = database_record['type'].lower()
    print(f"Grant Type in DB: '{grant_type}'")
    print(f"Found in text: {grant_type in text_lower}")
    
    # Test year
    year = database_record['year_of_award']
    print(f"Year in DB: '{year}'")
    print(f"Found in text: {year in text_lower}")

def analyze_multiple_certificates():
    """Analyze how many certificates are in the full extracted text"""
    full_text = """Certificate of Research Grant\nThis is to certify that Dr. John Doe from the Department of Computer\nScience has been awarded a research grant under the category\nGovernment for the project titled \"Advanced AI Research\".\nThe project has been sanctioned with an amount of I 2.50 Crore(s) by\nthe funding agency UGC in the year 2024.\nIssued as part of the official research funding records.\n__________________________\nAuthorized Signatory\n\nCertificate of Research Grant\nThis is to certify that Dr. Sam Doe from the Department of ECE has\nbeen awarded a research grant under the category Non Government\nfor the project titled \"Advanced Semiconductor Research\".\nThe project has been sanctioned with an amount of I 2.50 Crore(s) by\nthe funding agency UGC in the year 2024.\nIssued as part of the official research funding records.\n__________________________\nAuthorized Signatory\n\nCertificate of Research Grant\nThis is to certify that Dr. Samnath Doe from the Department of ECE\nhas been awarded a research grant under the category Non\nGovernment for the project titled \"Advanced Microprocessor\nResearch\".\nThe project has been sanctioned with an amount of I 6.00 Crore(s) by\nthe funding agency UGC in the year 2024.\nIssued as part of the official research funding records.\n__________________________\nAuthorized Signatory\n\nCertificate of Research Grant\nThis is to certify that Dr. Samnath Doe from the Department of CSE\nhas been awarded a research grant under the category Non\nGovernment for the project titled \"Advanced AI Research\".\nThe project has been sanctioned with an amount of I 6.00 Crore(s) by\nthe funding agency UGC in the year 2024.\nIssued as part of the official research funding records.\n__________________________\nAuthorized Signatory\n\nCertificate of Research Grant\nThis is to certify that Dr. Samnath Nath Doe from the Department of\nCSE has been awarded a research grant under the category Non\nGovernment for the project titled \"Advanced AI Research\".\nThe project has been sanctioned with an amount of I 6.00 Crore(s) by\nthe funding agency UGC in the year 2024.\nIssued as part of the official research funding records.\n__________________________\nAuthorized Signatory\n\nCertificate of Research Grant\nThis is to certify that Dr. Samnath he Doe from the Department of\nElectronics has been awarded a research grant under the category\nNon Government for the project titled \"Advanced AI Research\".\nThe project has been sanctioned with an amount of I 6.00 Crore(s) by\nthe funding agency UGC in the year 2024.\nIssued as part of the official research funding records.\n__________________________\nAuthorized Signatory\n\nCertificate of Research Grant\nThis is to certify that Dr. HellNah Doe from the Department of\nElectronics has been awarded a research grant under the category\nGovernment for the project titled \"Advanced FlipFlop Research\".\nThe project has been sanctioned with an amount of I 6.00 Crore(s) by\nthe funding agency UGC in the year 2024.\nIssued as part of the official research funding records.\n__________________________\nAuthorized Signatory\n\nCertificate of Research Grant\nThis is to certify that Dr. HellNah Doe from the Department of\nComputer Science has been awarded a research grant under the\ncategory Non Government for the project titled \"Advanced Web3\nResearch\".\nThe project has been sanctioned with an amount of I 6.00 Crore(s) by\nthe funding agency UGC in the year 2024.\nIssued as part of the official research funding records.\n__________________________\nAuthorized Signatory\n"""
    
    print("\n=== Analysis of Full Document ===\n")
    
    # Count certificates
    certificate_count = full_text.count("Certificate of Research Grant")
    print(f"Number of certificates found: {certificate_count}")
    
    # Extract unique PIs
    import re
    pi_pattern = r"Dr\.\s+([A-Za-z\s]+)\s+from"
    pis = re.findall(pi_pattern, full_text)
    unique_pis = list(set(pis))
    print(f"Unique Principal Investigators: {len(unique_pis)}")
    for pi in unique_pis:
        print(f"  - {pi.strip()}")
    
    # Extract amounts
    amount_pattern = r"I\s+([\d.]+)\s+Crore"
    amounts = re.findall(amount_pattern, full_text)
    unique_amounts = list(set(amounts))
    print(f"Unique amounts: {unique_amounts}")
    
    print(f"\nThis document contains certificates for {certificate_count} grants")
    print("The validation system should be able to match each database record")
    print("against the corresponding certificate in this multi-certificate document.")

if __name__ == "__main__":
    test_field_matching()
    analyze_multiple_certificates()