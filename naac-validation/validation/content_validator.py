"""
NAAC Content Validation using LLM
Validates extracted document content against expected criteria data
"""
import logging
import json
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

try:
    from langchain_groq import ChatGroq
    from langchain.schema import HumanMessage, SystemMessage
    from langchain.prompts import PromptTemplate
    LANGCHAIN_AVAILABLE = True
except ImportError as e:
    LANGCHAIN_AVAILABLE = False
    logger.warning(f"LangChain not available: {e}")

from config.settings import settings

class NAACContentValidator:
    """Validates document content against NAAC criteria using LLM"""
    
    def __init__(self):
        if not LANGCHAIN_AVAILABLE:
            raise ValueError("LangChain dependencies required for content validation")
        
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY not configured")
        
        self.llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name="llama-3.1-8b-instant",  # Updated to supported model
            temperature=0.1,
            max_tokens=4096
        )
        
        # Load validation rules
        try:
            self.validation_rules = settings.load_validation_rules()
            self.confidence_factors = self.validation_rules.get("confidence_factors", {})
        except Exception as e:
            logger.warning(f"Could not load validation rules: {str(e)}")
            self.validation_rules = {}
            self.confidence_factors = {}

    def validate_with_database_record(self, criteria_code: str, database_record: Dict[str, Any], 
                                    extracted_text: str, ai_instructions: str) -> Dict[str, Any]:
        """
        Validate document against database record using AI instructions
        
        Args:
            criteria_code: NAAC criteria code
            database_record: Database record to validate against
            extracted_text: Text extracted from document
            ai_instructions: Detailed instructions for AI validation
            
        Returns:
            Dictionary with validation results
        """
        
        if not extracted_text or not extracted_text.strip():
            return {
                "is_valid": False,
                "decision": "REJECT",
                "confidence_score": 0.0,
                "error": "No text extracted from document",
                "details": {}
            }
        
        try:
            # Create enhanced prompt with AI instructions
            validation_prompt = self._create_database_validation_prompt(
                criteria_code, database_record, extracted_text, ai_instructions
            )
            
            # Get AI analysis
            response = self.llm.invoke([HumanMessage(content=validation_prompt)])
            analysis = self._parse_llm_response(response.content)
            
            # Calculate confidence score using AI analysis and database comparison
            confidence_score = self._calculate_database_confidence(
                database_record, extracted_text, analysis
            )
            
            # Make validation decision
            decision = self._make_decision(confidence_score)
            
            result = {
                "is_valid": decision in ["ACCEPT", "FLAG_FOR_REVIEW"],
                "decision": decision,
                "confidence_score": confidence_score,
                "criteria_code": criteria_code,
                "ai_analysis": analysis,
                "database_comparison": self._compare_with_database(database_record, extracted_text),
                "validation_timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"Database validation completed for {criteria_code}: {decision} (confidence: {confidence_score:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"Database validation failed for {criteria_code}: {str(e)}")
            return {
                "is_valid": False,
                "decision": "REJECT",
                "confidence_score": 0.0,
                "error": f"Validation error: {str(e)}",
                "criteria_code": criteria_code
            }

    def validate_document(self, expected_data: Dict[str, Any], 
                         extracted_text: str, 
                         document_type: str = "sanction_letter") -> Dict[str, Any]:
        """
        Main validation method for NAAC documents
        
        Args:
            expected_data: Expected data from Excel template
            extracted_text: Text extracted from document (via OCR)
            document_type: Type of NAAC document
            
        Returns:
            Validation result with confidence score and decision
        """
        try:
            # Create validation prompt
            prompt = self._create_validation_prompt(expected_data, extracted_text, document_type)
            
            # Get LLM response
            messages = [
                SystemMessage(content=self._get_system_prompt(document_type)),
                HumanMessage(content=prompt)
            ]
            
            response = self.llm.invoke(messages)
            
            # Parse and analyze response
            parsed_response = self._parse_llm_response(response.content)
            confidence_score = self._calculate_confidence_score(parsed_response, expected_data)
            
            return {
                "is_valid": confidence_score >= settings.CONFIDENCE_FLAG_THRESHOLD,
                "decision": self._make_decision(confidence_score),
                "confidence_score": confidence_score,
                "matches": parsed_response.get("matches", {}),
                "mismatches": parsed_response.get("mismatches", []),
                "extracted_data": parsed_response.get("extracted_data", {}),
                "document_quality": parsed_response.get("document_quality", {}),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Content validation failed: {str(e)}")
            return {
                "is_valid": False,
                "decision": "REJECT",
                "confidence_score": 0.0,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

    def _get_system_prompt(self, document_type: str) -> str:
        """Get system prompt based on NAAC document type"""
        
        base_prompt = """You are a NAAC (National Assessment and Accreditation Council) document validation expert. 
Your task is to analyze documents submitted for accreditation and verify their authenticity and accuracy against provided data."""
        
        document_prompts = {
            "sanction_letter": """Focus on extracting and validating:
- Project/Grant title or name
- Principal Investigator (PI) name and designation
- Sanctioned/Approved amount (in any currency format)
- Year of sanction or project duration
- Funding agency/organization name
- Sanction/Approval number or reference
- Project duration or validity period""",
            
            "publication": """Focus on extracting and validating:
- Paper/Article title
- Author names and affiliations
- Journal name and details
- Publication year and volume/issue
- DOI or other identifiers
- Impact factor or indexing details""",
            
            "patent": """Focus on extracting and validating:
- Patent title
- Inventor names
- Patent number
- Filing date and grant date
- Patent office/authority
- Classification details""",
            
            "consultancy": """Focus on extracting and validating:
- Consultancy project title
- Client/Organization name
- Consultant names
- Project amount/value
- Duration and completion details
- Nature of consultancy work""",
            
            "mou": """Focus on extracting and validating:
- Parties/Organizations involved
- Purpose and scope of collaboration
- Duration and validity period
- Date of signing
- Key deliverables or commitments""",
            
            "award": """Focus on extracting and validating:
- Award title or name
- Recipient name and designation
- Awarding organization
- Award category
- Year of award
- Citation or recognition details"""
        }
        
        specific_prompt = document_prompts.get(document_type, document_prompts["sanction_letter"])
        
        return f"{base_prompt}\n\n{specific_prompt}\n\nAnalyze the document carefully and provide structured JSON output with your findings."

    def _create_validation_prompt(self, expected_data: Dict[str, Any], 
                                 extracted_text: str, 
                                 document_type: str) -> str:
        """Create detailed validation prompt"""
        
        template = PromptTemplate(
            input_variables=["expected_data", "document_text", "document_type"],
            template="""
NAAC DOCUMENT VALIDATION TASK

Expected Information (from Excel template):
{expected_data}

Document Text (extracted via OCR):
{document_text}

Document Type: {document_type}

Please analyze this document and provide a comprehensive JSON response with this exact structure:

{{
    "matches": {{
        "project_name": {{
            "found": true/false,
            "extracted_value": "actual value found in document",
            "expected_value": "value from template", 
            "similarity_score": 0.0-1.0,
            "notes": "explanation of match/mismatch"
        }},
        "pi_name": {{
            "found": true/false,
            "extracted_value": "actual value found",
            "expected_value": "value from template",
            "similarity_score": 0.0-1.0,
            "notes": "explanation"
        }},
        "amount": {{
            "found": true/false,
            "extracted_value": "actual amount found",
            "expected_value": "expected amount",
            "similarity_score": 0.0-1.0,
            "notes": "explanation (consider different formats like ₹5,00,000 vs 500000 vs 5 lakhs)"
        }},
        "year": {{
            "found": true/false,
            "extracted_value": "actual year/date found",
            "expected_value": "expected year",
            "similarity_score": 0.0-1.0,
            "notes": "explanation"
        }},
        "funding_agency": {{
            "found": true/false,
            "extracted_value": "actual agency/organization found",
            "expected_value": "expected agency",
            "similarity_score": 0.0-1.0,
            "notes": "explanation"
        }}
    }},
    "mismatches": [
        "List of specific contradictions or inconsistencies found",
        "Any suspicious or questionable information"
    ],
    "extracted_data": {{
        "additional_information": "Any other relevant details found in document",
        "document_authenticity_indicators": "Signs of authenticity like letterhead, signatures, etc.",
        "completeness": "Assessment of document completeness"
    }},
    "document_quality": {{
        "readable": true/false,
        "complete": true/false,
        "authentic_appearance": true/false,
        "professional_format": true/false,
        "confidence": 0.0-1.0
    }}
}}

VALIDATION GUIDELINES:
1. Be thorough in matching - look for exact matches, partial matches, and variations
2. Consider different formats for amounts (₹5,00,000 = 500000 = 5 lakhs)
3. Accept reasonable variations in names and titles
4. Look for contextual clues that support authenticity
5. Note any red flags or inconsistencies
6. Provide similarity scores based on how close the match is
7. Be case-insensitive but note formatting differences
"""
        )
        
        # Format expected data nicely
        expected_data_str = json.dumps(expected_data, indent=2, ensure_ascii=False)
        
        # Limit text length for API
        text_limit = 3000
        if len(extracted_text) > text_limit:
            extracted_text = extracted_text[:text_limit] + "\n...[Text truncated for analysis]"
        
        return template.format(
            expected_data=expected_data_str,
            document_text=extracted_text,
            document_type=document_type
        )

    def _parse_llm_response(self, response_text: str) -> Dict[str, Any]:
        """Parse LLM JSON response"""
        try:
            # Extract JSON from response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                # No JSON found
                return {
                    "matches": {},
                    "mismatches": ["Could not parse LLM response"],
                    "extracted_data": {"raw_response": response_text},
                    "document_quality": {"readable": False, "confidence": 0.0}
                }
                
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parse error: {str(e)}")
            return {
                "matches": {},
                "mismatches": ["Invalid response format from LLM"],
                "extracted_data": {"raw_response": response_text, "parse_error": str(e)},
                "document_quality": {"readable": False, "confidence": 0.0}
            }

    def _calculate_confidence_score(self, parsed_response: Dict[str, Any], 
                                  expected_data: Dict[str, Any]) -> float:
        """Calculate overall confidence score"""
        
        matches = parsed_response.get("matches", {})
        
        # Field weights (customizable)
        field_weights = {
            "project_name": 0.25,
            "pi_name": 0.20,
            "amount": 0.20,
            "year": 0.15,
            "funding_agency": 0.20
        }
        
        total_score = 0.0
        total_weight = 0.0
        
        # Calculate weighted score based on matches
        for field, weight in field_weights.items():
            if field in matches:
                match_info = matches[field]
                if match_info.get("found", False):
                    similarity = match_info.get("similarity_score", 0.0)
                    total_score += weight * similarity
                total_weight += weight
        
        # Apply penalties
        mismatches = parsed_response.get("mismatches", [])
        mismatch_penalty = len(mismatches) * 0.1
        
        doc_quality = parsed_response.get("document_quality", {})
        quality_penalty = 0.0
        
        if not doc_quality.get("readable", True):
            quality_penalty += 0.2
        if not doc_quality.get("authentic_appearance", True):
            quality_penalty += 0.15
        if not doc_quality.get("complete", True):
            quality_penalty += 0.1
        
        # Final score calculation
        base_score = total_score / total_weight if total_weight > 0 else 0.0
        final_score = base_score - mismatch_penalty - quality_penalty
        
        return max(0.0, min(1.0, final_score))

    def _make_decision(self, confidence_score: float) -> str:
        """Make validation decision based on confidence score"""
        if confidence_score >= settings.CONFIDENCE_ACCEPT_THRESHOLD:
            return "ACCEPT"
        elif confidence_score >= settings.CONFIDENCE_FLAG_THRESHOLD:
            return "FLAG_FOR_REVIEW"
        else:
            return "REJECT"

    def validate_criteria_specific(self, criteria: str, expected_data: Dict[str, Any], 
                                  extracted_text: str) -> Dict[str, Any]:
        """
        Validate document for specific NAAC criteria
        
        Args:
            criteria: NAAC criteria (e.g., "2.1.1", "3.2.2")
            expected_data: Expected data
            extracted_text: Extracted text
        """
        
        # Map criteria to document types
        criteria_mapping = {
            "2.1.1": "sanction_letter",  # Research projects
            "2.2.1": "publication",      # Publications
            "3.1.1": "consultancy",      # Consultancy projects
            "3.2.2": "mou",             # MOUs/Collaborations
            "4.1.2": "patent",          # Patents
            "5.1.1": "award"            # Awards/Recognition
        }
        
        document_type = criteria_mapping.get(criteria, "sanction_letter")
        
        # Add criteria-specific context
        result = self.validate_document(expected_data, extracted_text, document_type)
        result["naac_criteria"] = criteria
        result["document_type"] = document_type
        
        return result

    def _create_database_validation_prompt(self, criteria_code: str, database_record: Dict[str, Any], 
                                         extracted_text: str, ai_instructions: str) -> str:
        """Create validation prompt for database record comparison"""
        
        prompt = f"""
{ai_instructions}

DATABASE RECORD TO VALIDATE:
{json.dumps(database_record, indent=2)}

EXTRACTED DOCUMENT TEXT:
{extracted_text}

TASK:
Compare the extracted document text with the database record for NAAC criteria {criteria_code}.
Provide a detailed analysis and confidence score.

RESPONSE FORMAT (JSON):
{{
    "confidence_score": <float 0.0-1.0>,
    "field_matches": {{
        "field_name": {{"found": true/false, "similarity": <float>, "notes": "explanation"}}
    }},
    "overall_assessment": "detailed explanation",
    "concerns": ["list of any concerns or discrepancies"],
    "strengths": ["list of supporting evidence found"],
    "recommendation": "ACCEPT/FLAG_FOR_REVIEW/REJECT"
}}
"""
        return prompt

    def _calculate_database_confidence(self, database_record: Dict[str, Any], 
                                     extracted_text: str, analysis: Dict[str, Any]) -> float:
        """Calculate confidence score based on database comparison and AI analysis"""
        
        ai_confidence = analysis.get("confidence_score", 0.0)
        if not isinstance(ai_confidence, (int, float)):
            ai_confidence = 0.5
        
        # Get field matches from AI analysis
        field_matches = analysis.get("field_matches", {})
        
        if not field_matches:
            return max(0.0, min(1.0, ai_confidence * 0.8))  # Reduce confidence if no field analysis
        
        # Calculate field match score
        match_scores = []
        for field, match_info in field_matches.items():
            if isinstance(match_info, dict):
                similarity = match_info.get("similarity", 0.0)
                found = match_info.get("found", False)
                if found and isinstance(similarity, (int, float)):
                    match_scores.append(similarity)
        
        # Combine AI confidence with field match scores
        if match_scores:
            field_avg = sum(match_scores) / len(match_scores)
            final_confidence = (ai_confidence * 0.6) + (field_avg * 0.4)
        else:
            final_confidence = ai_confidence * 0.7  # Reduce if no specific field matches
        
        # Apply penalties for concerns
        concerns = analysis.get("concerns", [])
        if concerns:
            penalty = min(0.3, len(concerns) * 0.1)
            final_confidence *= (1 - penalty)
        
        return max(0.0, min(1.0, final_confidence))

    def _compare_with_database(self, database_record: Dict[str, Any], extracted_text: str) -> Dict[str, Any]:
        """Compare extracted text with database record fields"""
        
        comparison = {
            "field_analysis": {},
            "text_coverage": 0.0,
            "missing_fields": [],
            "found_fields": []
        }
        
        if not extracted_text:
            return comparison
        
        text_lower = extracted_text.lower()
        fields_found = 0
        total_fields = 0
        
        for field, value in database_record.items():
            if field in ['id', 'sl_no', 'criteria_code', 'session', 'submitted_at']:
                continue  # Skip system fields
                
            total_fields += 1
            
            if value and str(value).strip():
                value_str = str(value).lower()
                # Simple text matching
                if value_str in text_lower:
                    fields_found += 1
                    comparison["found_fields"].append(field)
                    comparison["field_analysis"][field] = {
                        "found": True,
                        "value": str(value),
                        "match_type": "exact"
                    }
                else:
                    # Try partial matching for names/titles
                    words = value_str.split()
                    if len(words) > 1 and any(word in text_lower for word in words if len(word) > 3):
                        fields_found += 0.5
                        comparison["found_fields"].append(field)
                        comparison["field_analysis"][field] = {
                            "found": True,
                            "value": str(value),
                            "match_type": "partial"
                        }
                    else:
                        comparison["missing_fields"].append(field)
                        comparison["field_analysis"][field] = {
                            "found": False,
                            "value": str(value),
                            "match_type": "none"
                        }
            else:
                comparison["missing_fields"].append(field)
        
        comparison["text_coverage"] = fields_found / total_fields if total_fields > 0 else 0.0
        
        return comparison

    def get_validator_info(self) -> Dict[str, Any]:
        """Get validator configuration information"""
        return {
            "model": "llama-3.1-8b-instant",
            "langchain_available": LANGCHAIN_AVAILABLE,
            "api_configured": bool(settings.GROQ_API_KEY),
            "confidence_thresholds": {
                "accept": settings.CONFIDENCE_ACCEPT_THRESHOLD,
                "flag": settings.CONFIDENCE_FLAG_THRESHOLD
            },
            "supported_document_types": [
                "sanction_letter", "publication", "patent", 
                "consultancy", "mou", "award"
            ],
            "validation_modes": ["legacy", "database_record"]
        }