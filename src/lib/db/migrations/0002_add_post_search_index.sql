ALTER TABLE posts 
ADD COLUMN search_vector tsvector;

UPDATE posts
SET search_vector  = to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(excerpt, ''));

CREATE INDEX idx_posts_search
ON posts
USING GIN (search_vector);

CREATE FUNCTION posts_search_triger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector
  ('english', coalesce(NEW.title, '') || ' ' || coalesce(NEW.content, '') || ' ' || coalesce(NEW.excerpt, ''));
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvectorupdate
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION posts_search_trigger();