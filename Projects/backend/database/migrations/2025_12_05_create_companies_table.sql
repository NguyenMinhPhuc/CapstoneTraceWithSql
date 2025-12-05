USE [CapstoneTrack]
GO

/****** Object:  Table [dbo].[companies]    Script Date: 05/12/2025 22:12:42 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[companies](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[address] [nvarchar](500) NULL,
	[phone] [nvarchar](20) NULL,
	[email] [nvarchar](255) NULL,
	[contact_person] [nvarchar](255) NOT NULL,
	[contact_phone] [nvarchar](20) NULL,
	[website] [nvarchar](255) NULL,
	[description] [nvarchar](max) NULL,
	[is_active] [bit] NOT NULL,
	[created_at] [datetime2](7) NOT NULL,
	[updated_at] [datetime2](7) NOT NULL,
	[rowversion_col] [timestamp] NOT NULL,
	[company_type] [nvarchar](250) NULL,
	[manager_name] [nvarchar](250) NULL,
	[manager_phone] [varchar](50) NULL,
	[external_id] [nvarchar](100) NULL,
 CONSTRAINT [PK__companie__3213E83F10FA35D1] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[companies] ADD  CONSTRAINT [DF__companies__is_ac__542C7691]  DEFAULT ((1)) FOR [is_active]
GO

ALTER TABLE [dbo].[companies] ADD  CONSTRAINT [DF__companies__creat__55209ACA]  DEFAULT (sysutcdatetime()) FOR [created_at]
GO

ALTER TABLE [dbo].[companies] ADD  CONSTRAINT [DF__companies__updat__5614BF03]  DEFAULT (sysutcdatetime()) FOR [updated_at]
GO


