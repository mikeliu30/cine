-- 5. RLS 策略
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

-- Projects 策略
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_id);

-- Nodes 策略
CREATE POLICY "Users can manage nodes in own projects"
  ON nodes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = nodes.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Edges 策略
CREATE POLICY "Users can manage edges in own projects"
  ON edges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = edges.project_id
      AND projects.owner_id = auth.uid()
    )
  );
