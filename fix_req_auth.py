import os
import re

directories = ['Backend/src']

for root, _, files in os.walk(directories[0]):
    for file in files:
        if file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # req.auth()?.userId -> req.user?.firebaseUid
            content = content.replace("req.auth()?.userId", "req.user?.firebaseUid")
            # req.auth() -> req.user
            content = content.replace("req.auth()", "req.user")
            # In case someone wrote req.auth.userId
            content = content.replace("req.auth?.userId", "req.user?.firebaseUid")
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed req.auth in {filepath}")
