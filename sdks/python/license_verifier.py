"""
Python Ed25519 License Verifier for Open-Core Dual-Licensing Engine
Requirements: cryptography >= 41.0.0
"""

import base64
import json
import datetime
from typing import Dict, Any, Optional
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

class PythonLicenseVerifier:
    def __init__(self, public_key_pem: str):
        self.public_key = serialization.load_pem_public_key(public_key_pem.encode('utf-8'))

    def verify_license(self, license_key: str) -> Dict[str, Any]:
        try:
            parts = license_key.strip().split('.')
            if len(parts) != 2:
                return {"valid": False, "reason": "Invalid license key format."}

            payload_b64, signature_b64 = parts[0], parts[1]

            # Decode Base64URL
            payload_bytes = base64.urlsafe_b64decode(payload_b64 + '==')
            signature_bytes = base64.urlsafe_b64decode(signature_b64 + '==')

            # Verify Ed25519 Signature
            self.public_key.verify(signature_bytes, payload_b64.encode('utf-8'))

            # Parse Payload JSON
            payload = json.loads(payload_bytes.decode('utf-8'))

            expires_at = datetime.datetime.strptime(payload['expiresAt'], "%Y-%m-%d")
            now = datetime.datetime.utcnow()

            if now > expires_at:
                return {"valid": True, "active": False, "reason": f"License expired on {payload['expiresAt']}", "payload": payload}

            return {"valid": True, "active": True, "payload": payload}
        except Exception as e:
            return {"valid": False, "active": False, "reason": str(e)}

# Demo Usage
if __name__ == "__main__":
    print("Python Ed25519 License Verifier Module Loaded Successfully.")
