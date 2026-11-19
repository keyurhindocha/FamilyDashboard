#!/usr/bin/env python3
"""Rebuild apps-script/Index.html from web/index.html, so the two board pages never drift.

Usage: python3 tools/sync-apps-script-page.py
"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
web = (root / 'web' / 'index.html').read_text()

page = web.replace('<meta name="viewport" content="width=device-width, initial-scale=1">\n', '<base target="_top">\n', 1)
# Served by Apps Script: the key comes from the template, no link box needed.
page, n = re.subn(r"// ===== PASTE YOUR BOARD LINK.*?var API_URL = CFG \? CFG\.api : '';",
                  "var BOARD_KEY = '<?= boardKey ?>';\nvar API_URL = '';", page, count=1, flags=re.S)
assert n == 1, 'board link block not found'
page, n = re.subn(r"\n// First run: ask for the board link\..*?if \(!CFG\) showSetup\(\);\n", "\n", page, count=1, flags=re.S)
assert n == 1, 'setup block not found'
(root / 'apps-script' / 'Index.html').write_text(page)
print('apps-script/Index.html updated')
