-- Add foreign key relationships between expenses and related tables

-- First, ensure the category column exists in expenses table
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'expenses' 
        AND column_name = 'category_id'
    ) THEN
        -- Add category_id column
        ALTER TABLE expenses ADD COLUMN category_id UUID;
        
        -- Copy existing category names to a temporary table
        CREATE TEMP TABLE temp_categories AS
        SELECT DISTINCT category as name FROM expenses WHERE category IS NOT NULL;
        
        -- Insert categories into categories table if they don't exist
        INSERT INTO categories (category)
        SELECT name FROM temp_categories
        ON CONFLICT (category) DO NOTHING;
        
        -- Update expenses table with category_id
        UPDATE expenses e
        SET category_id = c.id
        FROM categories c
        WHERE e.category = c.category;
        
        -- Drop temporary table
        DROP TABLE temp_categories;
        
        -- Add foreign key constraint
        ALTER TABLE expenses
        ADD CONSTRAINT fk_expenses_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL;
        
        -- Drop old category column
        ALTER TABLE expenses DROP COLUMN category;
    END IF;
END $$;

-- Now handle locations relationship
DO $$ BEGIN
    -- Create locations table if it doesn't exist
    CREATE TABLE IF NOT EXISTS locations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        location VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS on locations
    ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies for locations
    DROP POLICY IF EXISTS "locations_select_policy" ON locations;
    CREATE POLICY "locations_select_policy" 
    ON locations FOR SELECT 
    TO public
    USING (true);

    -- Add location_id to expenses if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'expenses' 
        AND column_name = 'location_id'
    ) THEN
        -- Add location_id column
        ALTER TABLE expenses ADD COLUMN location_id UUID;
        
        -- Copy existing location names to a temporary table
        CREATE TEMP TABLE temp_locations AS
        SELECT DISTINCT location as name FROM expenses WHERE location IS NOT NULL;
        
        -- Insert locations into locations table if they don't exist
        INSERT INTO locations (location)
        SELECT name FROM temp_locations
        ON CONFLICT (location) DO NOTHING;
        
        -- Update expenses table with location_id
        UPDATE expenses e
        SET location_id = l.id
        FROM locations l
        WHERE e.location = l.location;
        
        -- Drop temporary table
        DROP TABLE temp_locations;
        
        -- Add foreign key constraint
        ALTER TABLE expenses
        ADD CONSTRAINT fk_expenses_location
        FOREIGN KEY (location_id) REFERENCES locations(id)
        ON DELETE SET NULL;
        
        -- Drop old location column
        ALTER TABLE expenses DROP COLUMN location;
    END IF;
END $$; 