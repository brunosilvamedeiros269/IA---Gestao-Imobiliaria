-- Migration: Create Lead Notes Table for CRM Module
-- Desc: Creates a lightweight table to store activity history, follow-ups, and notes for each lead in the CRM

CREATE TABLE IF NOT EXISTS public.lead_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    broker_id UUID NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes from their agency" ON public.lead_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users_profile
            WHERE users_profile.id = auth.uid()
            AND users_profile.agency_id = lead_notes.agency_id
        )
    );

CREATE POLICY "Users can insert notes for their agency" ON public.lead_notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users_profile
            WHERE users_profile.id = auth.uid()
            AND users_profile.agency_id = lead_notes.agency_id
        )
    );

CREATE POLICY "Broker can update own notes" ON public.lead_notes
    FOR UPDATE USING (
        broker_id = auth.uid()
    );

CREATE POLICY "Broker can delete own notes" ON public.lead_notes
    FOR DELETE USING (
        broker_id = auth.uid()
    );
