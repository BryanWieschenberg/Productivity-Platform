from typing import Any, Optional
from httpx_oauth.clients.google import GoogleOAuth2 as _GoogleOAuth2
from httpx_oauth.clients.github import GitHubOAuth2
from httpx_oauth.exceptions import GetIdEmailError
from httpx import AsyncClient, HTTPError

from app.config import settings


class GoogleOAuth2(_GoogleOAuth2):
    async def get_id_email(self, token: str) -> tuple[str, Optional[str]]:
        async with self.get_httpx_client() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={**self.request_headers, "Authorization": f"Bearer {token}"},
            )
            if response.status_code >= 400:
                raise GetIdEmailError(response=response)
            data: dict[str, Any] = response.json()
            return data["id"], data.get("email")


google_oauth_client = GoogleOAuth2(
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
)
github_oauth_client = GitHubOAuth2(
    client_id=settings.github_client_id,
    client_secret=settings.github_client_secret,
)


async def fetch_oauth_username(provider: str, access_token: str) -> str | None:
    try:
        async with AsyncClient() as client:
            if provider == "google":
                resp = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                if resp.is_success:
                    data = resp.json()
                    return data.get("name") or data.get("given_name")
            elif provider == "github":
                resp = await client.get(
                    "https://api.github.com/user",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/vnd.github+json",
                    },
                )
                if resp.is_success:
                    data = resp.json()
                    return data.get("login") or data.get("name")
    except HTTPError:
        pass
    
    return None
