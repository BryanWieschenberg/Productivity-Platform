from fastapi_users_db_sqlmodel import SQLModelBaseOAuthAccount


class OAuthAccount(SQLModelBaseOAuthAccount, table=True):
    __tablename__ = "oauth_accounts"
