from botocore.exceptions import ClientError
import logging

from config import S3_CLIENT

logging.basicConfig(
    format='%(levelname)s:     %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)


def create_bucket_if_not_exists(bucket_name):
    try:
        S3_CLIENT.head_bucket(Bucket=bucket_name)
        logger.info(f'Бакет "{bucket_name}" существует.')
    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            try:
                logger.info(f'Бакет "{bucket_name}" не существует. Создаю бакет...')
                S3_CLIENT.create_bucket(Bucket=bucket_name, CreateBucketConfiguration={
                    'LocationConstraint': 'us-east-1'
                })
                logger.info(f'Бакет "{bucket_name}" успешно создан.')
            except ClientError as e:
                logger.error(f"Ошибка создания бакета {bucket_name}: {e}")
            else:
                logger.error(f"Ошибка при проверке бакета {bucket_name}: {e}")
