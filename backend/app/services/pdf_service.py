import fitz  # PyMuPDF
import os

class PdfService:
    @staticmethod
    def extract_text_from_pdf(filepath: str) -> str:
        """
        Extracts plain text from a PDF file using PyMuPDF (fitz).
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"PDF file not found at path: {filepath}")
        
        doc = fitz.open(filepath)
        extracted_text = ""
        for page in doc:
            extracted_text += page.get_text("text") + "\n"
        
        doc.close()
        return extracted_text.strip()

pdf_service = PdfService()
