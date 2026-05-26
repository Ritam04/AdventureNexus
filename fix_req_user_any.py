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
            
            # (req as any).user?.firebaseUid
            content = content.replace("req.user?.firebaseUid", "(req as any).user?.firebaseUid")
            # If there's a standalone req.user, like req.user._id
            content = content.replace("req.user.", "(req as any).user.")
            
            # Only fix if it's not already (req as any)
            content = content.replace("(req as any).user?.firebaseUid", "(req as any).user?.firebaseUid")
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed req.user cast in {filepath}")
