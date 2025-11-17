-- Webhook Configuration Table
CREATE TABLE webhook_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Webhook Details
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  secret_key TEXT NOT NULL, -- HMAC secret for signature verification
  
  -- Event Subscriptions
  events JSONB NOT NULL DEFAULT '["order.created", "order.updated", "order.completed"]'::jsonb,
  
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  retry_enabled BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  
  -- Headers (custom headers to send with webhook)
  custom_headers JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id),
  last_triggered_at TIMESTAMPTZ,
  
  CONSTRAINT valid_url CHECK (url ~* '^https?://'),
  CONSTRAINT valid_events CHECK (jsonb_array_length(events) > 0)
);

-- Webhook Delivery Logs
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_config_id UUID NOT NULL REFERENCES webhook_configs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Event Information
  event_type VARCHAR(100) NOT NULL,
  event_id UUID NOT NULL, -- Reference to the order/entity that triggered this
  
  -- Request Details
  request_url TEXT NOT NULL,
  request_method VARCHAR(10) DEFAULT 'POST',
  request_headers JSONB,
  request_body JSONB NOT NULL,
  request_signature TEXT, -- HMAC signature sent
  
  -- Response Details
  response_status INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  
  -- Delivery Status
  status VARCHAR(50) NOT NULL, -- 'pending', 'success', 'failed', 'retrying'
  attempt_number INTEGER DEFAULT 1,
  error_message TEXT,
  
  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'success', 'failed', 'retrying'))
);

-- Indexes
CREATE INDEX idx_webhook_configs_org ON webhook_configs(organization_id);
CREATE INDEX idx_webhook_configs_active ON webhook_configs(organization_id, is_active);
CREATE INDEX idx_webhook_logs_config ON webhook_logs(webhook_config_id);
CREATE INDEX idx_webhook_logs_event ON webhook_logs(event_type, event_id);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status, next_retry_at);
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at DESC);

-- Updated timestamp trigger
CREATE TRIGGER update_webhook_configs_updated_at
  BEFORE UPDATE ON webhook_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Webhook configs: Only restaurant admins can manage
CREATE POLICY "Restaurant admins can view webhook configs"
  ON webhook_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.organization_id = webhook_configs.organization_id
      AND admin_users.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Restaurant admins can insert webhook configs"
  ON webhook_configs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.organization_id = webhook_configs.organization_id
      AND admin_users.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Restaurant admins can update webhook configs"
  ON webhook_configs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.organization_id = webhook_configs.organization_id
      AND admin_users.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Restaurant admins can delete webhook configs"
  ON webhook_configs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.organization_id = webhook_configs.organization_id
      AND admin_users.role IN ('owner', 'admin')
    )
  );

-- Webhook logs: Read-only for restaurant admins
CREATE POLICY "Restaurant admins can view webhook logs"
  ON webhook_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.organization_id = webhook_logs.organization_id
      AND admin_users.role IN ('owner', 'admin', 'staff')
    )
  );

-- Service role can insert webhook logs (system-generated)
CREATE POLICY "Service role can insert webhook logs"
  ON webhook_logs FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE webhook_configs IS 'Webhook configurations for each restaurant to integrate with their CRM/external systems';
COMMENT ON TABLE webhook_logs IS 'Delivery logs for all webhook attempts including retries';
