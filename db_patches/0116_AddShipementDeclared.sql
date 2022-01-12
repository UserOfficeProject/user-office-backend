DO
$DO$
BEGIN
  IF register_patch('AddShipementDeclared.sql', 'Jekabs Karklins', 'Add new column is_shipment_declared to scheduled_events table', '2022-01-12') THEN
  BEGIN

    -- add is_shipment_declared column to scheduled_events table
    ALTER TABLE "scheduled_events"
    ADD COLUMN IF NOT EXISTS "is_shipment_declared" BOOLEAN DEFAULT false;

  END;
  END IF;
END;
$DO$
LANGUAGE plpgsql;
