-- 20260728000007_checkpoint_geofence.sql

ALTER TABLE checkpoints
ALTER COLUMN latitude DROP NOT NULL,
ALTER COLUMN longitude DROP NOT NULL;

ALTER TABLE checkpoints
ADD COLUMN requires_geofence BOOLEAN DEFAULT false;
