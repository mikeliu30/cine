-- 3. 节点表
CREATE TABLE IF NOT EXISTS nodes (
  id VARCHAR(100) PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  shot_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'idle',
  prompt TEXT,
  model VARCHAR(50),
  seed BIGINT,
  parent_node_id VARCHAR(100),
  image_path TEXT,
  video_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nodes_project ON nodes(project_id);
CREATE INDEX IF NOT EXISTS idx_nodes_status ON nodes(status);

CREATE TRIGGER nodes_updated_at
  BEFORE UPDATE ON nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
