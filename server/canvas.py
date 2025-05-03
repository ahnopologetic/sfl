from typing import Any, Dict, List, Optional
import uuid

from openai import OpenAI
from pydantic import BaseModel
import requests

from supabase_client import get_supabase_client


class CanvasAPI:
    """Client for interacting with the Canvas LMS API."""

    def __init__(self, canvas_url: str, api_key: str):
        """
        Initialize the Canvas API client.

        Args:
            canvas_url: Base URL for the Canvas instance (e.g., 'https://canvas.instructure.com')
            api_key: Canvas API key for authentication
        """
        self.base_url = canvas_url.rstrip("/")
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    def _make_request(
        self,
        endpoint: str,
        method: str = "GET",
        params: Optional[Dict[str, Any]] = None,
    ) -> Any:
        """
        Make a request to the Canvas API.

        Args:
            endpoint: API endpoint to call (without the base URL)
            method: HTTP method to use
            params: Query parameters to include in the request

        Returns:
            JSON response from the API
        """
        url = f"{self.base_url}/api/v1/{endpoint.lstrip('/')}"

        try:
            response = requests.request(
                method=method, url=url, headers=self.headers, params=params
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Canvas API request failed: {str(e)}")

    def get_active_courses(self) -> List[Dict[str, Any]]:
        """
        Get a list of active courses for the current user.

        Returns:
            List of course objects containing course details
        """
        params = {
            "enrollment_state": "active",
            "include[]": ["term", "total_students"],
            "per_page": 100,
        }

        return self._make_request("courses", params=params)

    def get_course_syllabus(self, course_id: int) -> Dict[str, Any]:
        """
        Get the syllabus for a specific course.

        Args:
            course_id: Canvas course ID

        Returns:
            Course object containing the syllabus_body field with HTML content
        """
        params = {"include[]": ["syllabus_body"]}

        return self._make_request(f"courses/{course_id}", params=params)


async def list_active_courses(canvas_url: str, api_key: str) -> List[Dict[str, Any]]:
    """
    List all active courses for the authenticated user.

    Args:
        canvas_url: Base URL for the Canvas instance
        api_key: Canvas API key for authentication

    Returns:
        List of active courses with relevant details
    """
    if not canvas_url or not api_key:
        return []

    canvas = CanvasAPI(canvas_url, api_key)
    courses = canvas.get_active_courses()

    # Format the response to include only relevant information
    formatted_courses = []
    for course in courses:
        formatted_courses.append(
            {
                "id": course.get("id"),
                "name": course.get("name"),
                "code": course.get("course_code"),
                "term": course.get("term", {}).get("name")
                if course.get("term")
                else None,
                "start_date": course.get("start_at"),
                "end_date": course.get("end_at"),
                "students_count": course.get("total_students"),
            }
        )

    return formatted_courses


async def get_course_syllabus(
    canvas_url: str, api_key: str, course_id: int
) -> Dict[str, Any]:
    """
    Get the syllabus for a specific course.

    Args:
        canvas_url: Base URL for the Canvas instance
        api_key: Canvas API key for authentication
        course_id: Canvas course ID

    Returns:
        Dictionary containing course details and syllabus HTML content
    """
    if not canvas_url or not api_key:
        return {"error": "Missing Canvas URL or API key"}

    canvas = CanvasAPI(canvas_url, api_key)
    course = canvas.get_course_syllabus(course_id)

    return {
        "id": course.get("id"),
        "name": course.get("name"),
        "code": course.get("course_code"),
        "syllabus_html": course.get("syllabus_body", ""),
    }


class CourseTopic(BaseModel):
    topics: list[str]


def extract_topics_from_course_syllabus(
    course_name: str,
    course_syllabus_html: str,
) -> List[CourseTopic]:
    """
    Extract topics from the course syllabus HTML content.

    """

    client = OpenAI()
    prompt = f"""
    Extract topics from the course syllabus HTML content.
    Be sure to extract only "interesting" topics from the syllabus.
    Up to 3 topics per course.

    Example output:
    - Topic 1 in Course 1
    - Topic 2 in Course 1
    - Topic 1 in Course 2
    - Topic 2 in Course 2
    - Topic 1 in Course 3
    - Topic 2 in Course 3
    """
    response = client.responses.parse(
        model="gpt-4o-mini",
        input=[
            {"role": "system", "content": prompt},
            {
                "role": "user",
                "content": f"Course Name: {course_name}\nCourse Syllabus HTML: {course_syllabus_html}",
            },
        ],
        text_format=CourseTopic,
    )
    return response.output_parsed.topics


def curate_course_topics(user_id: uuid.UUID) -> List[CourseTopic]:
    """
    Curate the course topics to include only the most relevant topics.
    """
    # Get all courses for the user
    import asyncio

    topics = []

    supabase = get_supabase_client()
    user_profile = (
        supabase.table("profiles").select("*").eq("id", user_id).execute().data[0]
    )
    if not user_profile:
        raise Exception("User profile not found")
    if not user_profile.get("canvas_url") or not user_profile.get("canvas_api_key"):
        raise Exception("Canvas URL or API key not found")

    courses = asyncio.run(
        list_active_courses(user_profile["canvas_url"], user_profile["canvas_api_key"])
    )
    for course in courses:
        print(f"Getting syllabus for {course['name']}")
        course_syllabus = asyncio.run(
            get_course_syllabus(
                user_profile["canvas_url"], user_profile["canvas_api_key"], course["id"]
            )
        )
        print(f"Extracting topics from {course['name']}")
        course_topics = extract_topics_from_course_syllabus(
            course["name"], course_syllabus["syllabus_html"]
        )
        print(course_topics)
        topics.extend(course_topics)
    # TODO: save course topics to the database

    supabase.table("curated_topics").insert(
        [
            {
                "user_id": str(user_id),
                "topic": topic,
            }
            for topic in topics
        ]
    ).execute()

    return topics
