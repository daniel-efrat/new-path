import fs from 'fs';
import path from 'path';

const inputJson = path.resolve(process.cwd(), 'docs', 'sentences.json');
const migrationsDir = path.resolve(process.cwd(), 'supabase', 'migrations');
const outputSql = path.resolve(migrationsDir, '11_create_designation_statements.sql');

function esc(value: string): string {
  return value.replace(/'/g, "''");
}

function main() {
  if (!fs.existsSync(inputJson)) {
    console.error(`Input not found: ${inputJson}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(inputJson, 'utf8');
  const occupations = JSON.parse(raw) as Array<{
    serialNumber: number;
    title: string;
    description: string;
    designationStatements: { 'serial-number': number; statement: string }[];
  }>;

  const header = `-- Create designation_statements table and populate from docs/sentences.json\n` +
`DO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'designation_statements') THEN\n    CREATE TABLE designation_statements (\n      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n      occupation_serial INT NOT NULL,\n      occupation_title TEXT NOT NULL,\n      occupation_description TEXT,\n      statement_serial INT NOT NULL CHECK (statement_serial >= 1 AND statement_serial <= 50),\n      statement TEXT NOT NULL\n    );\n  END IF;\nEND $$;\n\n-- Useful index\nDO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_designation_statements_occupation_serial') THEN\n    CREATE INDEX idx_designation_statements_occupation_serial ON designation_statements(occupation_serial);\n  END IF;\nEND $$;\n\n-- Enable RLS and allow read for everyone\nDO $$\nBEGIN\n  EXECUTE 'ALTER TABLE designation_statements ENABLE ROW LEVEL SECURITY';\nEXCEPTION WHEN OTHERS THEN\nEND $$;\n\nDO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Designation statements are viewable by everyone') THEN\n    CREATE POLICY "Designation statements are viewable by everyone"\n    ON designation_statements FOR SELECT USING (true);\n  END IF;\nEND $$;\n\n`;

  const values: string[] = [];
  for (const occ of occupations) {
    for (const s of occ.designationStatements) {
      values.push(`(${occ.serialNumber}, '${esc(occ.title)}', '${esc(occ.description ?? '')}', ${s['serial-number']}, '${esc(s.statement)}')`);
    }
  }

  const chunks: string[] = [];
  const chunkSize = 500; // avoid overly long single statement
  for (let i = 0; i < values.length; i += chunkSize) {
    const slice = values.slice(i, i + chunkSize).join(',\n  ');
    chunks.push(`INSERT INTO designation_statements (occupation_serial, occupation_title, occupation_description, statement_serial, statement)\nVALUES\n  ${slice};`);
  }

  const sql = header + chunks.join('\n\n');
  fs.writeFileSync(outputSql, sql, 'utf8');
  console.log(`Wrote migration: ${outputSql} with ${values.length} rows.`);
}

main();
