import hmac
import hashlib


def email_create_hmac_sha256(secret_key, email):
    # Convert inputs to bytes if they're not already
    secret_key_bytes = (
        secret_key.encode("utf-8") if isinstance(secret_key, str) else secret_key
    )
    email_bytes = email.encode("utf-8") if isinstance(email, str) else email

    # Create the HMAC
    hmac_obj = hmac.new(secret_key_bytes, email_bytes, hashlib.sha256)

    # Get the hexadecimal representation of the HMAC
    hmac_hex = hmac_obj.hexdigest()

    return hmac_hex


secret_key = "skgbUMWM5uHW9TfuSIK94E4jCpF6vG5kjgG2i0HOpSHB_pHBM_hTqtE-pAcAVt349D"
email = "Alexys52@gmail.com"

result = email_create_hmac_sha256(secret_key, email)
print(f"HMAC-SHA256: {result}")
