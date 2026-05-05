CREATE TABLE IF NOT EXISTS public.categories (
  name TEXT PRIMARY KEY
);

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS product_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON public.categories FOR SELECT
  USING (product_count > 0);

CREATE POLICY "Admin full access categories" ON public.categories
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

-- Backfill from products (Safe update and insert)
WITH product_stats AS (
  SELECT category, MAX(image_urls[1]) as img, COUNT(*) as cnt
  FROM public.products
  WHERE is_visible = true AND deleted_at IS NULL
  GROUP BY category
)
UPDATE public.categories c
SET product_count = p.cnt, image_url = p.img
FROM product_stats p
WHERE c.name = p.category;

INSERT INTO public.categories (name, slug, image_url, product_count)
SELECT 
  category, 
  REPLACE(LOWER(category), ' ', '-'),
  MAX(image_urls[1]),
  COUNT(*)
FROM public.products p
WHERE is_visible = true AND deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM public.categories c WHERE c.name = p.category)
GROUP BY category;

-- Trigger Function to maintain product_count and auto-create categories
CREATE OR REPLACE FUNCTION public.update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    IF (OLD.is_visible = true AND OLD.deleted_at IS NULL) THEN
      UPDATE public.categories SET product_count = product_count - 1 WHERE name = OLD.category;
    END IF;
    RETURN OLD;
  END IF;

  IF (TG_OP = 'INSERT') THEN
    IF (NEW.is_visible = true AND NEW.deleted_at IS NULL) THEN
      UPDATE public.categories SET product_count = product_count + 1 WHERE name = NEW.category;
      IF NOT FOUND THEN
        INSERT INTO public.categories (name, slug, product_count, image_url)
        VALUES (NEW.category, REPLACE(LOWER(NEW.category), ' ', '-'), 1, NEW.image_urls[1]);
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF (TG_OP = 'UPDATE') THEN
    -- Active product changed category
    IF (OLD.is_visible = true AND OLD.deleted_at IS NULL AND NEW.is_visible = true AND NEW.deleted_at IS NULL) THEN
      IF (OLD.category != NEW.category) THEN
        UPDATE public.categories SET product_count = product_count - 1 WHERE name = OLD.category;
        
        UPDATE public.categories SET product_count = product_count + 1 WHERE name = NEW.category;
        IF NOT FOUND THEN
          INSERT INTO public.categories (name, slug, product_count, image_url)
          VALUES (NEW.category, REPLACE(LOWER(NEW.category), ' ', '-'), 1, NEW.image_urls[1]);
        END IF;
      END IF;
    -- Product became inactive
    ELSIF (OLD.is_visible = true AND OLD.deleted_at IS NULL AND (NEW.is_visible = false OR NEW.deleted_at IS NOT NULL)) THEN
      UPDATE public.categories SET product_count = product_count - 1 WHERE name = OLD.category;
    -- Product became active
    ELSIF ((OLD.is_visible = false OR OLD.deleted_at IS NOT NULL) AND NEW.is_visible = true AND NEW.deleted_at IS NULL) THEN
      UPDATE public.categories SET product_count = product_count + 1 WHERE name = NEW.category;
      IF NOT FOUND THEN
        INSERT INTO public.categories (name, slug, product_count, image_url)
        VALUES (NEW.category, REPLACE(LOWER(NEW.category), ' ', '-'), 1, NEW.image_urls[1]);
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_category_product_count
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_category_product_count();
