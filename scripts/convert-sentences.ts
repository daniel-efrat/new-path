import fs from 'fs';
import path from 'path';

// Input and output paths
const inputPath = path.resolve(process.cwd(), 'docs', 'sentences.txt');
const outputPath = path.resolve(process.cwd(), 'docs', 'sentences.json');

function normalizeHeading(raw: string) {
  let heading = raw.trim();
  // Remove common numeric/emoji prefixes like "1.", "3)", "1️⃣" etc.
  // Fallback approach without Unicode property escapes: trim leading characters
  // until we hit a Hebrew (\u0590-\u05FF) or ASCII letter (A-Z/a-z).
  const isLetter = (ch: string) => {
    const code = ch.charCodeAt(0);
    const isAsciiLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
    const isHebrew = code >= 0x0590 && code <= 0x05FF;
    return isAsciiLetter || isHebrew;
  };
  let idx = 0;
  while (idx < heading.length && !isLetter(heading[idx])) idx++;
  return heading.slice(idx).trim();
}

function extractTitleAndDescription(headingLine: string, isRange52To60: boolean) {
  const heading = normalizeHeading(headingLine);
  let title = heading;
  let description = '';

  if (isRange52To60) {
    // In 52-60, description is on the next line starting with 'תחום:' (handled outside),
    // so here we only compute title from the heading (strip trailing dash if present)
    title = heading.replace(/[\-–—]$/,'').trim();
  } else {
    // Try parentheses in heading
    const parenMatch = heading.match(/^(.*?)[\s]*\((.*)\)\s*$/);
    if (parenMatch) {
      title = parenMatch[1].trim();
      description = parenMatch[2].trim();
    } else {
      // Fallback: split by dash
      const dashMatch = heading.match(/^(.*?)[\s]*[-–—][\s]*(.*)$/);
      if (dashMatch) {
        title = dashMatch[1].trim();
        description = dashMatch[2].trim();
      } else {
        title = heading.trim();
        description = '';
      }
    }
  }

  return { title, description };
}

function isTripleStar(line: string) {
  return line.trim() === '***';
}

function parseStatements(lines: string[], startIdx: number) {
  const statements: { serialNumber: number; statement: string }[] = [];
  let i = startIdx;
  while (i < lines.length && !isTripleStar(lines[i]) && statements.length < 50) {
    const line = lines[i].trim();
    // Match styles like "1. text" or "1) text"
    const m = line.match(/^(\d{1,2})[\.)]\s*(.+)$/);
    if (m) {
      const sn = parseInt(m[1], 10);
      const text = m[2].trim();
      if (text) {
        statements.push({ serialNumber: sn, statement: text });
      }
    }
    i++;
  }
  return { statements, nextIndex: i };
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(inputPath, 'utf8');
  const lines = raw.split(/\r?\n/);

  const occupations: Array<{
    serialNumber: number;
    title: string;
    description: string;
    designationStatements: { 'serial-number': number; statement: string }[];
  }> = [];

  let i = 0;
  let occIndex = 0;

  while (i < lines.length) {
    // find next ***
    while (i < lines.length && !isTripleStar(lines[i])) i++;
    if (i >= lines.length) break;

    // Expect heading after first ***
    i++;
    if (i >= lines.length) break;
    const headingLine = lines[i] ?? '';

    // Peek next lines: there may be a 'תחום:' description line before the second '***'
    let descFromNextLine = '';
    let j = i + 1;
    // If the next non-empty line starts with 'תחום:', capture it
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j < lines.length && /^\s*תחום\s*:/.test(lines[j])) {
      descFromNextLine = lines[j].replace(/^\s*תחום\s*:\s*/, '').trim();
      j++;
    }
    // Advance until we hit the second '***' separator
    while (j < lines.length && !isTripleStar(lines[j])) j++;
    if (j < lines.length && isTripleStar(lines[j])) j++;

    occIndex += 1; // 1-based serial number by order
    const isRange52To60 = occIndex >= 52 && occIndex <= 60;
    const extracted = extractTitleAndDescription(headingLine, isRange52To60);
    let title = extracted.title;
    let description = extracted.description;
    if (isRange52To60 && descFromNextLine) description = descFromNextLine;

    // Parse statements starting at j
    const parsed = parseStatements(lines, j);
    i = parsed.nextIndex;

    // Map to required key names
    const designationStatements = parsed.statements.map(s => ({ 'serial-number': s.serialNumber, statement: s.statement }));

    // If fewer than 50 statements were captured, try to continue scanning to accumulate until 50, skipping blanks
    if (designationStatements.length < 50) {
      while (i < lines.length && !isTripleStar(lines[i]) && designationStatements.length < 50) {
        const line = lines[i].trim();
        const m = line.match(/^(\d{1,2})[\.)]\s*(.+)$/);
        if (m) {
          const sn = parseInt(m[1], 10);
          const text = m[2].trim();
          if (text) designationStatements.push({ 'serial-number': sn, statement: text });
        }
        i++;
      }
    }

    occupations.push({
      serialNumber: occIndex,
      title,
      description,
      designationStatements,
    });
  }

  // Basic validation
  for (const occ of occupations) {
    if (occ.designationStatements.length !== 50) {
      console.warn(`Warning: occupation #${occ.serialNumber} has ${occ.designationStatements.length} statements (expected 50).`);
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(occupations, null, 2), 'utf8');
  console.log(`Wrote ${occupations.length} occupations to ${outputPath}`);
}

main();
