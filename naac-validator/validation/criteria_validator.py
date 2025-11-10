"""NAAC criteria metadata and minimal helpers for validation.

This file contains the canonical list of supported criteria and a small
set of helpers used by the extraction/validation pipeline. The implementation
is intentionally small: metadata + getters + a programmatic `add_criteria`.
"""

import re
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


class CriteriaValidator:
    """Lightweight criteria registry and helpers used by the validator.

    The class stores `criteria_requirements` (see examples below). Each
    criteria entry contains:
      - name: human readable description
      - database_model: model/table to compare against
      - required_fields: list[str] of expected fields
      - validation_rules: dict[field_name] -> rule_name (optional)
    """

    def __init__(self):
        # Core criteria definitions — extend here or use `add_criteria()`
        self.criteria_requirements: Dict[str, Dict[str, Any]] = {
            "2.1.1": {
                "name": "Number of teaching staff joined the institution during the last five years",
                "database_model": "response_2_1_1",
                "required_fields": ["programme_name", "year", "no_of_students"],
                "validation_rules": {"year": "within_assessment_period", "no_of_students": "positive_number"}
            },
            "3.1.1": {
                "name": "Grants received from Government and non-governmental agencies for research projects",
                "database_model": "response_3_1_1",
                "required_fields": [
                    "name_of_project",
                    "name_of_principal_investigator",
                    "name_of_funding_agency",
                    "amount_sanctioned",
                    "year_of_award",
                ],
                "validation_rules": {
                    "amount_sanctioned": "positive_number_crores",
                    "year_of_award": "within_assessment_period",
                },
            },
            "3.1.2": {
                "name": "Grants received from Government and non-governmental agencies for research projects (3.1.2)",
                "database_model": "response_3_1_2",
                "required_fields": [
                    "name_of_project",
                    "name_of_principal_investigator", 
                    "name_of_funding_agency",
                    "amount_sanctioned",
                    "year_of_award"
                ],
                "validation_rules": {
                    "amount_sanctioned": "positive_number_crores",
                    "year_of_award": "within_assessment_period"
                }
            },
            "3.1.3": {
                "name": "Number of research projects per teacher funded by government and non government agencies during the last five years",
                "database_model": "response_3_1_3",
                "required_fields": [
                    "workshop_name",
                    "participants",
                    "date_from",
                    "date_to"
                ],
                "validation_rules": {
                    "participants": "positive_number"
                }
            },
            "3.2.1": {
                "name": "Institution has created an ecosystem for innovations and has initiatives for creation and transfer of knowledge",
                "database_model": "response_3_2_1",
                "required_fields": ["paper_title", "author_names", "journal_name", "year_of_publication"],
                "validation_rules": {"year_of_publication": "within_assessment_period"},
            },
            "3.2.2": {
                "name": "Number of books and chapters in edited volumes/books published and papers published in national/ international conference proceedings per teacher during last five years",
                "database_model": "response_3_2_2",
                "required_fields": [
                    "teacher_name",
                    "book_chapter_title",
                    "paper_title", 
                    "conference_title",
                    "year_of_publication",
                    "publisher_name"
                ],
                "validation_rules": {
                    "year_of_publication": "within_assessment_period"
                }
            },
            "3.3.2": {
                "name": "Number of awards and recognitions received for extension activities from government / government recognised bodies during the last five years",
                "database_model": "response_3_3_2",
                "required_fields": [
                    "activity_name",
                    "award_name",
                    "awarding_body",
                    "year_of_award"
                ],
                "validation_rules": {
                    "year_of_award": "within_assessment_period"
                }
            },
            "3.3.3": {
                "name": "Number of extension and outreach programs conducted by the institution through NSS/NCC/Red cross/YRC etc., during the last five years",
                "database_model": "response_3_3_3",
                "required_fields": [
                    "activity_name",
                    "collaborating_agency",
                    "scheme_name",
                    "student_count",
                    "year"
                ],
                "validation_rules": {
                    "student_count": "positive_number",
                    "year": "within_assessment_period"
                }
            },
            "3.3.4": {
                "name": "Average percentage of students participating in extension activities at 3.3.3 above during last five years",
                "database_model": "response_3_3_4",
                "required_fields": [
                    "activity_name",
                    "activity_year",
                    "no_of_teacher",
                    "no_of_student",
                    "scheme_name"
                ],
                "validation_rules": {
                    "no_of_teacher": "positive_number",
                    "no_of_student": "positive_number",
                    "activity_year": "within_assessment_period"
                }
            },
            "3.4.1": {
                "name": "The Institution has several collaborations/linkages for Faculty exchange, Student exchange, Internship, Field trip, On-job training, research etc during the last five years",
                "database_model": "response_3_4_1",
                "required_fields": [
                    "title_of_activity",
                    "collaborating_agency",
                    "participant_name",
                    "year_of_collaboration",
                    "duration"
                ],
                "validation_rules": {
                    "year_of_collaboration": "within_assessment_period"
                }
            },
            "3.4.2": {
                "name": "Number of functional MoUs with institutions, other universities, industries, corporate houses etc. during the last five years",
                "database_model": "response_3_4_2",
                "required_fields": [
                    "institution_name",
                    "year_of_mou",
                    "duration",
                    "activities_list"
                ],
                "validation_rules": {
                    "year_of_mou": "within_assessment_period"
                }
            },
        }

    def get_required_fields(self, criteria_code: str) -> List[str]:
        """Return required field names for a criteria code."""
        return self.criteria_requirements.get(criteria_code, {}).get("required_fields", [])

    def get_criteria_info(self, criteria_code: Optional[str] = None) -> Dict[str, Any]:
        """Return criteria info or a summary of supported criteria."""
        if criteria_code:
            return self.criteria_requirements.get(criteria_code, {"error": "Criteria not found"})
        return {
            "supported_criteria": list(self.criteria_requirements.keys()),
            "total_criteria": len(self.criteria_requirements),
            "criteria_details": self.criteria_requirements,
        }

    def list_supported_criteria(self) -> List[Dict[str, Any]]:
        """Return a compact list of supported criteria for UI/display."""
        return [
            {
                "code": code,
                "name": info.get("name", ""),
                "required_fields": len(info.get("required_fields", [])),
                "database_model": info.get("database_model", ""),
            }
            for code, info in self.criteria_requirements.items()
        ]

    def add_criteria(self,
                     criteria_code: str,
                     name: str,
                     database_model: str,
                     required_fields: List[str],
                     validation_rules: Optional[Dict[str, str]] = None) -> bool:
        """Programmatically add a new criteria definition.

        Example:
            add_criteria(
                "4.1.1",
                "Research publications",
                "response_4_1_1",
                ["paper_title", "author", "year"],
                {"year": "within_assessment_period"}
            )
        """
        try:
            self.criteria_requirements[criteria_code] = {
                "name": name,
                "database_model": database_model,
                "required_fields": required_fields or [],
                "validation_rules": validation_rules or {},
            }
            return True
        except Exception as exc:  # pragma: no cover - defensive
            logger.error("Failed to add criteria %s: %s", criteria_code, str(exc))
            return False

    def _extract_year(self, value: Any) -> Optional[int]:
        """Extract a 4-digit year (2000-2099) from a value, or None."""
        if isinstance(value, (int, float)):
            try:
                return int(value)
            except Exception:
                return None
        s = str(value or "")
        if s.isdigit() and len(s) == 4:
            return int(s)
        m = re.search(r"\b(20\d{2})\b", s)
        return int(m.group(1)) if m else None

    def _extract_number(self, value: Any) -> float:
        """Extract a numeric value from strings like '2.5', '2,50,000', '2.5 crores'.

        Returns 0.0 on failure. Does not attempt currency/unit conversion beyond
        removing non-numeric characters except dot and minus.
        """
        if value is None:
            return 0.0
        try:
            if isinstance(value, (int, float)):
                return float(value)
            s = str(value)
            cleaned = re.sub(r"[^0-9.\-]", "", s)
            return float(cleaned) if cleaned else 0.0
        except Exception:
            return 0.0

    def _check_required_fields(self, data: Dict[str, Any], required_fields: List[str]) -> Dict[str, Any]:
        """Check presence of required fields and return a small report."""
        missing_fields = []
        present_fields = []
        for field in required_fields:
            if field in data and data[field] is not None and str(data[field]).strip() != "":
                present_fields.append(field)
            else:
                missing_fields.append(field)
        completion = (len(present_fields) / len(required_fields) * 100) if required_fields else 0
        return {
            "all_present": len(missing_fields) == 0,
            "missing_fields": missing_fields,
            "present_fields": present_fields,
            "completion_percentage": completion,
        }
