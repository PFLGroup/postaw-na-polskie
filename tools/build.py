"""Postaw na Polskie: kopiuje serwis do dist/ bez materiałów roboczych.

Użycie (z katalogu projektu):  python tools/build.py
Publikacja: zawartość dist/ (albo repo, w którym .gitignore wyklucza _brief/ i _research/).
Po skopiowaniu sprawdza, czy w dist/ nie ma folderów roboczych ani ścieżek absolutnych do zasobów.
"""
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')
SKIP_DIRS = {'_brief', '_research', 'dist', 'tools', '.git', '.github', '.claude', 'node_modules', '__pycache__'}
SKIP_FILES = {'.gitignore', 'Thumbs.db', 'desktop.ini', '.DS_Store'}
SKIP_EXT = {'.md', '.py', '.ps1', '.log', '.bak', '.tmp'}


def main():
    if os.path.isdir(DIST):
        shutil.rmtree(DIST)
    n = 0
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
        rel = os.path.relpath(d, ROOT)
        for f in files:
            if f in SKIP_FILES or os.path.splitext(f)[1].lower() in SKIP_EXT:
                continue
            dst = os.path.join(DIST, rel, f)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(os.path.join(d, f), dst)
            n += 1
    bledy = []
    for d, _, files in os.walk(DIST):
        for f in files:
            if not f.endswith(('.html', '.css', '.js')):
                continue
            p = os.path.join(d, f)
            t = open(p, encoding='utf-8').read()
            for m in re.finditer(r'(?:href|src|action|data-thanks)="(/[^/"][^"]*)"|url\((/[^/)][^)]*)\)', t):
                bledy.append('%s: ścieżka absolutna %s' % (os.path.relpath(p, DIST), m.group(1) or m.group(2)))
            if '_brief/' in t and f.endswith('.html'):
                bledy.append('%s: odwołanie do _brief/' % os.path.relpath(p, DIST))
    print('dist/: %d plików' % n)
    if bledy:
        print('\n'.join(bledy))
        sys.exit(1)


if __name__ == '__main__':
    main()
