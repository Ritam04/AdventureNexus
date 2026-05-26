import os
import re

directories = ['frontend/src', 'Backend/src', 'admin']

replacements = [
    (r'\brecipientClerkUserId\b', 'recipientFirebaseUid'),
    (r'\bsenderClerkUserId\b', 'senderFirebaseUid'),
    (r'\btargetClerkUserId\b', 'targetFirebaseUid'),
    (r'\bfollowerClerkUserId\b', 'followerFirebaseUid'),
    (r'\brequestingUserClerkId\b', 'requestingUserFirebaseUid'),
    (r'\buserClerkUserId\b', 'userFirebaseUid'),
    (r'\bCLERK_', 'FIREBASE_'),
    (r'\bclerkAuth\b', 'firebaseAuth'),
    (r'Clerk ID', 'Firebase UID'),
    (r'Clerk User IDs', 'Firebase UIDs'),
    (r'\bclerkUserIds\b', 'firebaseUids'),
    (r'\bclerk_', 'firebase_'),
    (r'\bclerk\b', 'firebase'),
    (r'\bClerk\b', 'Firebase'),
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
