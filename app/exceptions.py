from typing import Optional, Dict, Any


class ImageException(Exception):
    def __init__(self, message: Optional[str] = None, tags: Optional[Dict[str, Any]] = None, extras: Optional[Dict[str, Any]] = None) -> None:
        self.message = message
        self.tags = tags or {}
        self.extras = extras or {}
        super(ImageException, self).__init__(message)


class NotFoundError(ImageException):
    def __init__(self, resource_type: str, resource_id: str) -> None:
        message = f"Type '{resource_type.title()}' with an id value of '{resource_id}' could not be found."
        tags = {
            'source': 'document api',
            'type': type(self).__name__
        }
        extras = {
            'type': resource_type,
            'id': resource_id
        }
        super(NotFoundError, self).__init__(message, tags, extras)
