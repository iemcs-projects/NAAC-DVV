# Database table models for different criteria

class Response_3_1_1:
    """Model for criteria 3.1.1 - Research Grants"""
    table_name = "response_3_1_1"
    fields = [
        "id",
        "name_of_project", 
        "name_of_principal_investigator",
        "name_of_funding_agency",
        "amount_sanctioned",
        "year_of_award"
    ]

class Response_3_2_1:
    """Model for criteria 3.2.1 - Publications"""
    table_name = "response_3_2_1"
    fields = [
        "id",
        "paper_title",
        "author_names", 
        "journal_name",
        "year_of_publication"
    ]

class CriteriaModels:
    @staticmethod
    def get_table_name(criteria_code):
        """Get table name for criteria code"""
        return f"response_{criteria_code.replace('.', '_')}"
    
    @staticmethod
    def get_model_fields(criteria_code):
        """Get fields for specific criteria"""
        models = {
            "3.1.1": Response_3_1_1.fields,
            "3.2.1": Response_3_2_1.fields
        }
        return models.get(criteria_code, [])