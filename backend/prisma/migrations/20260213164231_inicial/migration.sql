BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[rooms] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [capacity] INT NOT NULL,
    [location] NVARCHAR(1000) NOT NULL,
    [equipment] NVARCHAR(1000) NOT NULL,
    [image_url] NVARCHAR(1000),
    [observations] NVARCHAR(1000),
    [available_days] NVARCHAR(1000) NOT NULL,
    [available_start] VARCHAR(5) NOT NULL,
    [available_end] VARCHAR(5) NOT NULL,
    [is_blocked] BIT NOT NULL CONSTRAINT [rooms_is_blocked_df] DEFAULT 0,
    [block_reason] NVARCHAR(1000),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [rooms_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    CONSTRAINT [rooms_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[bookings] (
    [id] NVARCHAR(1000) NOT NULL,
    [room_id] NVARCHAR(1000) NOT NULL,
    [full_name] NVARCHAR(1000) NOT NULL,
    [area] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000),
    [reason] NVARCHAR(1000) NOT NULL,
    [date] DATE NOT NULL,
    [start_time] VARCHAR(5) NOT NULL,
    [end_time] VARCHAR(5) NOT NULL,
    [observations] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [bookings_status_df] DEFAULT 'pending',
    [created_at] DATETIME2 NOT NULL CONSTRAINT [bookings_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [approved_by] NVARCHAR(1000),
    [approved_at] DATETIME2,
    [rejected_by] NVARCHAR(1000),
    [rejected_at] DATETIME2,
    [rejection_reason] NVARCHAR(1000),
    [cancellation_token] NVARCHAR(1000),
    CONSTRAINT [bookings_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [bookings_cancellation_token_key] UNIQUE NONCLUSTERED ([cancellation_token])
);

-- CreateTable
CREATE TABLE [dbo].[audit_logs] (
    [id] NVARCHAR(1000) NOT NULL,
    [booking_id] NVARCHAR(1000) NOT NULL,
    [action] NVARCHAR(1000) NOT NULL,
    [performed_by] NVARCHAR(1000) NOT NULL,
    [performed_at] DATETIME2 NOT NULL CONSTRAINT [audit_logs_performed_at_df] DEFAULT CURRENT_TIMESTAMP,
    [details] NVARCHAR(1000),
    CONSTRAINT [audit_logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[admins] (
    [id] NVARCHAR(1000) NOT NULL,
    [username] NVARCHAR(1000) NOT NULL,
    [password_hash] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [is_active] BIT NOT NULL CONSTRAINT [admins_is_active_df] DEFAULT 1,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [admins_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [admins_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [admins_username_key] UNIQUE NONCLUSTERED ([username]),
    CONSTRAINT [admins_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [bookings_room_id_date_idx] ON [dbo].[bookings]([room_id], [date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [bookings_status_idx] ON [dbo].[bookings]([status]);

-- AddForeignKey
ALTER TABLE [dbo].[bookings] ADD CONSTRAINT [bookings_room_id_fkey] FOREIGN KEY ([room_id]) REFERENCES [dbo].[rooms]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[audit_logs] ADD CONSTRAINT [audit_logs_booking_id_fkey] FOREIGN KEY ([booking_id]) REFERENCES [dbo].[bookings]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
