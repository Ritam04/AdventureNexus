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
            content = content.replace('authClerkTokenMiddleware', 'firebaseAuthMiddleware')
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed imports in {filepath}")
