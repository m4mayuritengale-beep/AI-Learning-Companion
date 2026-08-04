import json
import os
import time
import logging
from typing import List, Dict, Any
from google import genai
from google.genai import types
from app.config import settings

logger = logging.getLogger("app")

class GeminiAiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.model_name = getattr(settings, "GEMINI_MODEL", None) or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.client = None
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error("Failed to initialize Google GenAI Client: %s", str(e))
                self.client = None

    def _call_gemini_api(self, prompt: str, system_instruction: str = "", max_retries: int = 2) -> str:
        """
        Executes Google Gemini API request using google-genai Python SDK with retry strategy and fallbacks.
        """
        if not self.api_key or not self.client:
            logger.warning("GEMINI_API_KEY is not configured. Utilizing intelligent fallback response.")
            return f"[AI Tutor Note]: (Set GEMINI_API_KEY in .env for live Gemini output)\n\nBased on your query: {prompt[:100]}...\n\nHere is a comprehensive breakdown of the core concepts, practical applications, and step-by-step guidance."

        config = None
        if system_instruction:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction
            )

        for attempt in range(max_retries + 1):
            try:
                logger.info("Executing Gemini API Call using model '%s' (Attempt %d/%d)...", self.model_name, attempt + 1, max_retries + 1)
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=config
                )
                if response and response.text:
                    logger.info("Gemini API call succeeded.")
                    return response.text
                
                logger.warning("Gemini API returned empty response text.")
                return "AI did not return content."
            except Exception as e:
                logger.error("Gemini API Connection Error on attempt %d: %s", attempt + 1, str(e))
                if attempt < max_retries:
                    time.sleep(1 * (attempt + 1))  # Exponential backoff pause
                else:
                    return f"[AI Service Offline]: Temporary network error contacting Gemini API. Fallback analysis for '{prompt[:60]}...'"

        return "AI service unavailable."

    def generate_tutor_response(self, user_message: str, chat_history: List[Dict[str, str]] = None) -> str:
        system_instruction = (
            "You are an AI Study Companion and Socratic Tutor. "
            "Help the student understand concepts deeply by giving clear explanations, analogies, "
            "and encouraging follow-up questions. Be supportive, concise, and structured."
        )
        
        context_prompt = ""
        if chat_history:
            context_prompt += "Previous Conversation:\n"
            for msg in chat_history[-6:]:
                context_prompt += f"{msg.get('sender', 'user').capitalize()}: {msg.get('message')}\n"
        
        context_prompt += f"\nStudent Query: {user_message}"
        return self._call_gemini_api(context_prompt, system_instruction)

    def explain_concept(self, concept: str, depth: str = "beginner") -> str:
        prompt = (
            f"Explain the concept '{concept}' at a {depth} depth level for a student. "
            f"Break it down into: 1. Core Definition, 2. Simple Real-world Analogy, "
            f"3. Key Takeaways, and 4. Recommended Next Topics to Study."
        )
        return self._call_gemini_api(prompt, "You are an expert educator.")

    def summarize_pdf_text(self, text: str) -> str:
        prompt = (
            f"Summarize the following study document in a structured study guide format.\n"
            f"Include:\n- Key Concepts\n- Executive Summary\n- Important Definitions\n- 5 Revision Questions\n\n"
            f"Document Text:\n{text[:8000]}"
        )
        return self._call_gemini_api(prompt, "You are a professional study note summarizer.")

    def generate_quiz(self, topic: str, num_questions: int = 5) -> List[Dict[str, Any]]:
        prompt = (
            f"Generate a quiz on the topic '{topic}' with {num_questions} multiple-choice questions. "
            f"Return ONLY valid JSON array with NO markdown wrapping. Format:\n"
            f"[\n"
            f"  {{\n"
            f'    "question_text": "Question here?",\n'
            f'    "options": ["Option A", "Option B", "Option C", "Option D"],\n'
            f'    "correct_answer": "Option A",\n'
            f'    "explanation": "Why Option A is correct"\n'
            f"  }}\n"
            f"]"
        )
        raw_response = self._call_gemini_api(prompt, "You are an automated quiz generator. Output ONLY raw JSON.")
        
        cleaned = raw_response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            quiz_data = json.loads(cleaned)
            if isinstance(quiz_data, list):
                return quiz_data
        except Exception:
            logger.warning("Failed to parse Gemini JSON output for quiz. Utilizing fallback quiz array.")

        return [
            {
                "question_text": f"What is a fundamental principle of {topic}?",
                "options": ["Abstraction & Data Modeling", "Hardcoded Loops", "Manual Memory Leaks", "Single-threaded Deadlocks"],
                "correct_answer": "Abstraction & Data Modeling",
                "explanation": "Abstraction allows modular, high-level system design without exposing implementation details."
            },
            {
                "question_text": f"Which technique improves scalability when studying {topic}?",
                "options": ["Decomposition into sub-problems", "Ignoring edge cases", "Avoid reading docs", "Single point of failure"],
                "correct_answer": "Decomposition into sub-problems",
                "explanation": "Breaking complex subjects down into smaller modules enhances recall and computational efficiency."
            },
            {
                "question_text": f"How should you evaluate your mastery of {topic}?",
                "options": ["Continuous quiz testing and feedback loops", "Guessing randomly", "Skipping practice", "Static memorization"],
                "correct_answer": "Continuous quiz testing and feedback loops",
                "explanation": "Active retrieval practice strengthens long-term memory retention."
            }
        ]

    def generate_learning_path(self, goal: str, current_skill_level: str) -> Dict[str, Any]:
        prompt = (
            f"Create a personalized step-by-step learning roadmap for a student whose goal is '{goal}' "
            f"and current skill level is '{current_skill_level}'.\n"
            f"Return ONLY valid JSON with format:\n"
            f"{{\n"
            f'  "title": "Roadmap Title",\n'
            f'  "goal": "{goal}",\n'
            f'  "steps": [\n'
            f'    {{\n'
            f'      "step_number": 1,\n'
            f'      "title": "Phase 1 Title",\n'
            f'      "description": "Description of what to study",\n'
            f'      "estimated_weeks": 2,\n'
            f'      "topics": ["Topic 1", "Topic 2"]\n'
            f'    }}\n'
            f'  ]\n'
            f"}}"
        )
        raw_response = self._call_gemini_api(prompt, "You are a learning path advisor. Output ONLY raw JSON.")
        
        cleaned = raw_response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            path_data = json.loads(cleaned)
            if "steps" in path_data:
                return path_data
        except Exception:
            logger.warning("Failed to parse Gemini JSON output for learning path. Utilizing fallback roadmap.")

        return {
            "title": f"Mastery Pathway: {goal}",
            "goal": goal,
            "steps": [
                {
                    "step_number": 1,
                    "title": "Foundational Concepts & Core Architecture",
                    "description": f"Build a strong understanding of fundamental concepts for {goal}.",
                    "estimated_weeks": 2,
                    "topics": ["Core Definitions", "Syntax & Design Patterns", "Basic Problem Solving"]
                },
                {
                    "step_number": 2,
                    "title": "Intermediate Modules & Practical Projects",
                    "description": "Apply learning through hands-on exercises and real-world scenarios.",
                    "estimated_weeks": 3,
                    "topics": ["Module Integration", "State Management", "API Consumption"]
                },
                {
                    "step_number": 3,
                    "title": "Advanced Mastery & Portfolio Building",
                    "description": "Optimize performance, security, and publish portfolio project.",
                    "estimated_weeks": 3,
                    "topics": ["Performance Tuning", "AI Engine Integration", "Deployment & CI/CD"]
                }
            ]
        }

ai_service = GeminiAiService()
