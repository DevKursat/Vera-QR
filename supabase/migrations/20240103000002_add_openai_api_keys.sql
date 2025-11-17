-- Add OpenAI API Key support for each organization
-- This allows each restaurant to use their own OpenAI API key instead of a global one

-- Add openai_api_key column to organization_settings table
ALTER TABLE organization_settings 
ADD COLUMN IF NOT EXISTS openai_api_key TEXT;

-- Add comment for documentation
COMMENT ON COLUMN organization_settings.openai_api_key IS 
'Optional: Organization-specific OpenAI API key. If not set, falls back to platform default (env variable).';

-- Create index for faster lookups (encrypted keys are nullable)
CREATE INDEX IF NOT EXISTS idx_org_settings_has_openai_key 
ON organization_settings(organization_id) 
WHERE openai_api_key IS NOT NULL;
