-- Insert sample rubrics
INSERT INTO dbo.rubrics
  (name, rubric_type, description, total_score, is_active)
VALUES
  ('Supervisor Rubric 1', 'supervisor', 'Standard supervisor evaluation rubric', 100.00, 1),
  ('Supervisor Rubric 2', 'supervisor', 'Advanced supervisor evaluation rubric', 100.00, 1),
  ('Council Rubric 1', 'council', 'Standard council evaluation rubric', 100.00, 1),
  ('Council Rubric 2', 'council', 'Advanced council evaluation rubric', 100.00, 1);