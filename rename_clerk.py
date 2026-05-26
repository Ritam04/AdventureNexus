import os
import glob
import re

directories = ['frontend/src', 'Backend/src', 'admin']

replacements = [
    (r'\bclerkUserId\b', 'firebaseUid'),
    (r'\bClerkUserId\b', 'FirebaseUid'),
    (r'\bclerkUser\b', 'firebaseUser'),
    (r'\bClerkUser\b', 'FirebaseUser'),
    (r'\bclerkId\b', 'firebaseUid'),
    (r'\bClerkId\b', 'FirebaseUid'),
    (r'\bclerkData\b', 'firebaseData'),
]

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                for pattern, replacement in replacements:
                    content = re.sub(pattern, replacement, content)
                
                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated {filepath}")
