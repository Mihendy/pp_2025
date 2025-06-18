from pydantic import BaseModel


class FileInfoResponse(BaseModel):
    BaseFileName: str
    Size: int
    OwnerId: int
    UserId: int
    Version: str
    UserCanWrite: bool
    UserFriendlyName: str
