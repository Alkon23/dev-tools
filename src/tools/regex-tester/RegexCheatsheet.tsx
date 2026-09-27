interface CheatRow {
  description: string;
  expression: string;
}

interface CheatSection {
  rows: readonly CheatRow[];
  title: string;
}

const CHEAT_SECTIONS: readonly CheatSection[] = [
  {
    title: 'Characters',
    rows: [
      { expression: '.', description: 'Any character except a line break' },
      { expression: '\\d', description: 'Digit' },
      { expression: '\\D', description: 'Non-digit' },
      { expression: '\\w', description: 'Letter, digit, or underscore' },
      { expression: '\\W', description: 'Not a word character' },
      { expression: '\\s', description: 'Whitespace' },
      { expression: '\\S', description: 'Non-whitespace' },
    ],
  },
  {
    title: 'Character sets',
    rows: [
      { expression: '[abc]', description: 'Any listed character' },
      { expression: '[^abc]', description: 'Any unlisted character' },
      { expression: '[a-z]', description: 'Character in a range' },
      { expression: '\\p{L}', description: 'Unicode letter (u or v mode)' },
    ],
  },
  {
    title: 'Quantifiers',
    rows: [
      { expression: '*', description: 'Zero or more' },
      { expression: '+', description: 'One or more' },
      { expression: '?', description: 'Zero or one' },
      { expression: '{n}', description: 'Exactly n times' },
      { expression: '{n,}', description: 'At least n times' },
      { expression: '{n,m}', description: 'Between n and m times' },
      { expression: '*?', description: 'Lazy quantifier' },
    ],
  },
  {
    title: 'Boundaries',
    rows: [
      { expression: '^', description: 'Start of input or line with m' },
      { expression: '$', description: 'End of input or line with m' },
      { expression: '\\b', description: 'Word boundary' },
      { expression: '\\B', description: 'Not a word boundary' },
    ],
  },
  {
    title: 'Groups and assertions',
    rows: [
      { expression: '(abc)', description: 'Capturing group' },
      { expression: '(?<name>abc)', description: 'Named capturing group' },
      { expression: '(?:abc)', description: 'Non-capturing group' },
      { expression: 'a|b', description: 'Alternation' },
      { expression: '(?=abc)', description: 'Positive lookahead' },
      { expression: '(?!abc)', description: 'Negative lookahead' },
      { expression: '(?<=abc)', description: 'Positive lookbehind' },
      { expression: '(?<!abc)', description: 'Negative lookbehind' },
      { expression: '\\1', description: 'Numbered backreference' },
      { expression: '\\k<name>', description: 'Named backreference' },
    ],
  },
  {
    title: 'Escaping',
    rows: [
      { expression: '\\.', description: 'Literal period' },
      { expression: '\\\\', description: 'Literal backslash' },
      { expression: '\\n', description: 'Line feed' },
      { expression: '\\t', description: 'Tab' },
      { expression: '\\u{1F600}', description: 'Unicode code point (u or v mode)' },
    ],
  },
];

const FLAGS: readonly CheatRow[] = [
  { expression: 'g', description: 'Find every match' },
  { expression: 'i', description: 'Ignore letter case' },
  { expression: 'm', description: '^ and $ match line boundaries' },
  { expression: 's', description: '. also matches line breaks' },
  { expression: 'y', description: 'Match only at lastIndex' },
  { expression: 'u', description: 'Unicode code-point mode' },
  { expression: 'v', description: 'Unicode sets mode' },
];

function CheatTable({ rows, label }: { rows: readonly CheatRow[]; label: string }) {
  return (
    <table className="regex-cheat-table" aria-label={label}>
      <thead>
        <tr>
          <th scope="col">Expression</th>
          <th scope="col">Meaning</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${label}-${row.expression}`}>
            <td><code>{row.expression}</code></td>
            <td>{row.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function RegexCheatsheet() {
  return (
    <aside className="tool-card regex-cheatsheet" aria-labelledby="regex-cheatsheet-title">
      <div className="regex-cheatsheet-heading">
        <span className="section-index">REFERENCE</span>
        <h2 id="regex-cheatsheet-title">JavaScript regex cheatsheet</h2>
        <p>Common expressions accepted by the browser RegExp engine.</p>
      </div>

      <section className="regex-cheat-section">
        <h3>Flags</h3>
        <CheatTable rows={FLAGS} label="Regular expression flags" />
      </section>

      {CHEAT_SECTIONS.map((section) => (
        <section className="regex-cheat-section" key={section.title}>
          <h3>{section.title}</h3>
          <CheatTable rows={section.rows} label={section.title} />
        </section>
      ))}

      <a
        className="regex-mdn-link"
        href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions"
        rel="noreferrer"
        target="_blank"
      >
        Read the MDN regular expressions guide
      </a>
    </aside>
  );
}
