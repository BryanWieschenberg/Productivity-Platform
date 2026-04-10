from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    is_prod: bool = False
    debug_sql: bool = False
    frontend_url: str = "http://localhost:5173"

    database_url: str

    secret: str
    reset_password_token_secret: str
    verification_token_secret: str
    
    resend_api_key: str
    groq_api_key: str
    
    google_client_id: str
    google_client_secret: str
    github_client_id: str
    github_client_secret: str
    
    rate_limit_per_minute: int = 60

    recaptcha_site_key: str
    recaptcha_secret_key: str
    recaptcha_min_score: float = 0.5

    @property
    def email_from(self) -> bool:
        return "AskJet <noreply@askjet.io>" if self.is_prod else "onboarding@resend.dev"
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
