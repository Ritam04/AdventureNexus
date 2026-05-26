import os

directories = ['frontend/src']

for root, _, files in os.walk(directories[0]):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Use import.meta.env.VITE_BACKEND_URL
            env_var = "(import.meta.env.VITE_BACKEND_URL || 'https://adventure-nexus-backend.onrender.com')"
            content = content.replace("'https://adventure-nexus-backend.onrender.com'", env_var)
            content = content.replace('"https://adventure-nexus-backend.onrender.com"', env_var)
            content = content.replace('`https://adventure-nexus-backend.onrender.com', f'`${{{env_var}}}')
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")
