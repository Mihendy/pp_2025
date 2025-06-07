from pydantic import BaseModel


class FileInfoResponse(BaseModel):
    BaseFileName: str
    Size: int
    OwnerId: str
    UserId: str
    Version: str
    UserCanWrite: bool
    UserFriendlyName: str
