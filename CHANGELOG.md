# @almadar/skills

## 1.4.0

### Minor Changes

- Add orchestrated tools to kflow-orbitals and kflow-orbital-fixing skills
  - Added `generate_schema_orchestrated` to kflow-orbitals allowedTools
  - Added `fix_schema_orchestrated` to kflow-orbital-fixing allowedTools
  - Updated Tool Workflow section to guide agents on when to use orchestrated vs per-orbital generation
  - Orchestrated tools provide complexity-based provider routing (~67% cost reduction)
