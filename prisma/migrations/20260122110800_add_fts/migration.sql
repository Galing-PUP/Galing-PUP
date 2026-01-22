-- prisma/migrations/20260122_add_fts_search_vector.sql
CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE documents ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION refresh_document_search_vector(doc_id integer)
RETURNS void AS $$
BEGIN
  UPDATE documents d
  SET search_vector =
    setweight(to_tsvector('english', coalesce(d.title, '')), 'A') ||
    setweight(
      to_tsvector(
        'english',
        coalesce(
          (SELECT string_agg(a.full_name, ' ')
           FROM document_authors da
           JOIN authors a ON a.author_id = da.author_id
           WHERE da.document_id = doc_id),
          ''
        )
      ),
      'B'
    ) ||
    setweight(
      to_tsvector(
        'english',
        coalesce(
          (SELECT string_agg(k.keyword_text, ' ')
           FROM document_keywords dk
           JOIN keywords k ON k.keyword_id = dk.keyword_id
           WHERE dk.document_id = doc_id),
          ''
        )
      ),
      'C'
    )
  WHERE d.document_id = doc_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_document_search_vector_from_documents()
RETURNS trigger AS $$
BEGIN
  PERFORM refresh_document_search_vector(NEW.document_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_document_search_vector_from_relations()
RETURNS trigger AS $$
DECLARE
  target_id integer := COALESCE(NEW.document_id, OLD.document_id);
BEGIN
  PERFORM refresh_document_search_vector(target_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS documents_search_vector_documents ON documents;
CREATE TRIGGER documents_search_vector_documents
AFTER INSERT OR UPDATE OF title ON documents
FOR EACH ROW EXECUTE FUNCTION refresh_document_search_vector_from_documents();

DROP TRIGGER IF EXISTS documents_search_vector_authors ON document_authors;
CREATE TRIGGER documents_search_vector_authors
AFTER INSERT OR UPDATE OR DELETE ON document_authors
FOR EACH ROW EXECUTE FUNCTION refresh_document_search_vector_from_relations();

DROP TRIGGER IF EXISTS documents_search_vector_keywords ON document_keywords;
CREATE TRIGGER documents_search_vector_keywords
AFTER INSERT OR UPDATE OR DELETE ON document_keywords
FOR EACH ROW EXECUTE FUNCTION refresh_document_search_vector_from_relations();

SELECT refresh_document_search_vector(d.document_id) FROM documents d;

CREATE INDEX IF NOT EXISTS documents_search_vector_idx ON documents USING GIN (search_vector);