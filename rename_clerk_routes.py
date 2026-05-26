import os
import re

directories = ['Backend/src']

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
    (r'\bclerkUserId\b', 'firebaseUid'),
    (r'\bClerkUserId\b', 'FirebaseUid'),
    (r'\bclerkUser\b', 'firebaseUser'),
    (r'\bClerkUser\b', 'FirebaseUser'),
    (r'\bclerkId\b', 'firebaseUid'),
    (r'\bClerkId\b', 'FirebaseUid'),
    (r'\bclerkData\b', 'firebaseData'),
    (r'\bclerk_', 'firebase_'),
    (r'\bclerk\b', 'firebase'),
    (r'\bClerk\b', 'Firebase'),
]

for d in directories:
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if not content:
                        continue

                    original_content = content
                    for pattern, replacement in replacements:
                        content = re.sub(pattern, replacement, content)
                    
                    if content != original_content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Updated {filepath}")
                except Exception as e:
                    print(f"Error {filepath}: {e}")
