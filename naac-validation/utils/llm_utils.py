import json
from typing import Dict, Any, List, Optional, Union
import logging
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
from langchain.prompts import PromptTemplate

from config.settings import settings

logger = logging.getLogger(__name__)

class LLMValidator:
    """LLM-based document validation using Groq"""
    
    def __init__(self):
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        
        self.llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name="mixtral-8x7b-32768",  # Good balance of speed and accuracy
            temperature=0.1,  # Low temperature for consistent results
            max_tokens=4096
        )
        
        # Load confidence factors from validation rules
        self.validation_rules = settings.load_validation_rules()
        self.confidence_factors = self.validation_rules.get("confidence_factors", {})
    
    def validate_document_content(self, data_row: Dict[str, Any], 
                                 extracted_text: str, 
                                 document_type: str = "sanction_letter") -> Dict[str, Any]:
        """
        Use LLM to validate if document content matches provided data
        
        Args:
            data_row: Dictionary with expected data (project_name, pi_name, etc.)
            extracted_text: Text extracted from document
            document_type: Type of document being validated
        
        Returns:
            Dictionary with validation results and confidence score
        """
        try:
            # Create validation prompt
            prompt = self._create_validation_prompt(data_row, extracted_text, document_type)
            
            # Get LLM response
            messages = [
                SystemMessage(content=self._get_system_prompt(document_type)),
                HumanMessage(content=prompt)
            ]
            
            response = self.llm.invoke(messages)
            
            # Parse LLM response
            parsed_response = self._parse_llm_response(response.content)
            
            # Calculate confidence score
            confidence_score = self._calculate_confidence_score(parsed_response, data_row)
            
            return {
                "llm_response": parsed_response,
                "confidence_score": confidence_score,
                "decision": self._make_decision(confidence_score),
                "matches": parsed_response.get("matches", {}),
                "mismatches": parsed_response.get("mismatches", []),
                "extracted_data": parsed_response.get("extracted_data", {})
            }
            
        except Exception as e:
            logger.error(f"Error in LLM validation: {str(e)}")
            return {
                "error": str(e),
                "confidence_score": 0.0,
                "decision": "REJECT"
            }
    
    def _get_system_prompt(self, document_type: str) -> str:
        """Get system prompt based on document type"""
        base_prompt = """You are a document validation expert specializing in NAAC accreditation documents. 
Your task is to carefully analyze documents and extract specific information to verify accuracy."""
        
        document_prompts = {
            "sanction_letter": """Focus on finding:
- Project/grant name or title
- Principal Investigator (PI) or researcher name
- Sanctioned amount or funding amount
- Year of sanction or project duration
- Funding agency or organization name
- Any approval or sanction details""",
            
            "mou": """Focus on finding:
- Parties involved in the agreement
- Purpose or scope of collaboration
- Duration or validity period
- Date of signing
- Key terms and conditions""",
            
            "invoice": """Focus on finding:
- Vendor or supplier name
- Invoice amount
- Invoice date
- Description of goods/services
- Payment terms"""
        }
        
        specific_prompt = document_prompts.get(document_type, document_prompts["sanction_letter"])
        
        return f"{base_prompt}\n\n{specific_prompt}\n\nProvide your analysis in structured JSON format."
    
    def _create_validation_prompt(self, data_row: Dict[str, Any], 
                                extracted_text: str, 
                                document_type: str) -> str:
        """Create validation prompt for LLM"""
        
        template = PromptTemplate(
            input_variables=["expected_data", "document_text", "document_type"],
            template="""
DOCUMENT VALIDATION TASK:

Expected Data from Template:
{expected_data}

Document Text to Analyze:
{document_text}

Document Type: {document_type}

Please analyze the document and provide a JSON response with the following structure:
{{
    "matches": {{
        "project_name": {{"found": true/false, "extracted_value": "value from document", "confidence": 0.0-1.0}},
        "pi_name": {{"found": true/false, "extracted_value": "value from document", "confidence": 0.0-1.0}},
        "amount": {{"found": true/false, "extracted_value": "value from document", "confidence": 0.0-1.0}},
        "year": {{"found": true/false, "extracted_value": "value from document", "confidence": 0.0-1.0}},
        "funding_agency": {{"found": true/false, "extracted_value": "value from document", "confidence": 0.0-1.0}}
    }},
    "mismatches": [
        "List of specific mismatches found (if any)"
    ],
    "extracted_data": {{
        "key_information": "Any additional relevant information found"
    }},
    "document_quality": {{"readable": true/false, "complete": true/false, "confidence": 0.0-1.0}}
}}

Instructions:
1. Look for exact matches first, then similar/partial matches
2. Be case-insensitive but note variations
3. For amounts, accept reasonable formatting variations (₹5,00,000 vs 500000 vs 5 lakhs)
4. For years, accept different date formats
5. For names, accept variations in spelling or formatting
6. Provide confidence scores based on how certain you are about each match
7. List specific mismatches if data doesn't align
"""
        )
        
        # Format expected data nicely
        expected_data_str = json.dumps(data_row, indent=2)
        
        return template.format(
            expected_data=expected_data_str,
            document_text=extracted_text[:4000],  # Limit text length
            document_type=document_type
        )
    
    def _parse_llm_response(self, response_text: str) -> Dict[str, Any]:
        """Parse LLM response into structured format"""
        try:
            # Try to extract JSON from response
            # Sometimes LLM adds extra text before/after JSON
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                # Fallback: try to parse entire response as JSON
                return json.loads(response_text)
                
        except json.JSONDecodeError as e:
            logger.warning(f"Could not parse LLM response as JSON: {str(e)}")
            # Return a basic structure with the raw response
            return {
                "matches": {},
                "mismatches": ["Could not parse LLM response"],
                "extracted_data": {"raw_response": response_text},
                "parse_error": str(e)
            }
    
    def _calculate_confidence_score(self, parsed_response: Dict[str, Any], 
                                  expected_data: Dict[str, Any]) -> float:
        """Calculate overall confidence score based on matches"""
        
        matches = parsed_response.get("matches", {})
        confidence_factors = self.confidence_factors.get("exact_match", {})
        penalties = self.confidence_factors.get("penalties", {})
        
        total_score = 0.0
        max_possible_score = 0.0
        
        # Calculate score based on field matches
        for field, weight in confidence_factors.items():
            max_possible_score += weight
            
            if field in matches:
                match_data = matches[field]
                if isinstance(match_data, dict) and match_data.get("found", False):
                    field_confidence = match_data.get("confidence", 0.5)
                    total_score += weight * field_confidence
        
        # Apply penalties
        mismatches = parsed_response.get("mismatches", [])
        if mismatches:
            penalty = len(mismatches) * penalties.get("contradictory_info", -0.1)
            total_score += penalty
        
        # Document quality penalty
        doc_quality = parsed_response.get("document_quality", {})
        if not doc_quality.get("readable", True):
            total_score += penalties.get("poor_document_quality", -0.2)
        
        # Normalize score
        if max_possible_score > 0:
            normalized_score = total_score / max_possible_score
        else:
            normalized_score = 0.0
        
        # Ensure score is between 0 and 1
        return max(0.0, min(1.0, normalized_score))
    
    def _make_decision(self, confidence_score: float) -> str:
        """Make decision based on confidence score"""
        if confidence_score >= settings.CONFIDENCE_ACCEPT_THRESHOLD:
            return "ACCEPT"
        elif confidence_score >= settings.CONFIDENCE_FLAG_THRESHOLD:
            return "FLAG_FOR_REVIEW"
        else:
            return "REJECT"
    
    def extract_structured_data(self, text: str, data_fields: List[str]) -> Dict[str, Any]:
        """
        Use LLM to extract structured data from unstructured text
        
        Args:
            text: Unstructured text to analyze
            data_fields: List of fields to extract
        
        Returns:
            Dictionary with extracted structured data
        """
        try:
            prompt = f"""
Extract the following information from this text:
Fields to extract: {', '.join(data_fields)}

Text:
{text[:3000]}

Provide response in JSON format:
{{
    "extracted_fields": {{
        "field_name": {{"value": "extracted_value", "confidence": 0.0-1.0}}
    }},
    "additional_info": "Any other relevant information found"
}}
"""
            
            messages = [
                SystemMessage(content="You are an expert at extracting structured information from documents."),
                HumanMessage(content=prompt)
            ]
            
            response = self.llm.invoke(messages)
            return self._parse_llm_response(response.content)
            
        except Exception as e:
            logger.error(f"Error in structured data extraction: {str(e)}")
            return {"error": str(e)}
    
    def get_llm_info(self) -> Dict[str, Any]:
        """Get LLM configuration information"""
        return {
            "model": "mixtral-8x7b-32768",
            "api_configured": bool(settings.GROQ_API_KEY),
            "confidence_thresholds": {
                "accept": settings.CONFIDENCE_ACCEPT_THRESHOLD,
                "flag": settings.CONFIDENCE_FLAG_THRESHOLD
            }
        }