#!/usr/bin/env python3
"""
Apply fix for FixturesView.tsx data loading issue
Replaces response.data with response in fetchFixtures function
"""

import re

FILE_PATH = "apps/frontend/src/components/FixturesView.tsx"

def apply_fix():
    with open(FILE_PATH, 'r') as f:
        content = f.read()
    
    # Fix 1: Change condition check
    content = re.sub(
        r'if \(response && response\.data\)',
        'if (response && Array.isArray(response))',
        content
    )
    
    # Fix 2: Replace all response.data with response in the fetchFixtures function
    # This is a targeted replacement within the specific function
    lines = content.split('\n')
    in_fetch_fixtures = False
    fixed_lines = []
    
    for line in lines:
        if 'const fetchFixtures = async' in line:
            in_fetch_fixtures = True
        elif in_fetch_fixtures and line.strip().startswith('};'):
            in_fetch_fixtures = False
        
        if in_fetch_fixtures:
            # Replace response.data with response
            line = line.replace('setFixtures(response.data)', 'setFixtures(response)')
            line = line.replace('response.data\n', 'response\n')
            line = line.replace('response.data.', 'response.')
        
        fixed_lines.append(line)
    
    content = '\n'.join(fixed_lines)
    
    with open(FILE_PATH, 'w') as f:
        f.write(content)
    
    print(f"✅ Applied fix to {FILE_PATH}")

if __name__ == "__main__":
    apply_fix()
