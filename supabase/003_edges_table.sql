-- 4. 边表
CREATE TABLE IF NOT EXISTS edges (
  id VARCHAR(100) PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  source_node_id VARCHAR(100) REFERENCES nodes(id) ON DELETE CASCADE,
  target_node_id VARCHAR(100) REFERENCES nodes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_edges_project ON edges(project_id);
CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_node_id);
