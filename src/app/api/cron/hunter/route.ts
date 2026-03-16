import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { executeHunterJob } from '@/app/(backoffice)/hunter/hunter-actions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    const supabase = await createClient();
    
    // Get all agencies with active hunter configs
    const { data: agencies, error: agenciesError } = await supabase
        .from('agencies')
        .select('id');

    if (agenciesError) {
        return NextResponse.json({ error: agenciesError.message }, { status: 500 });
    }

    const results = [];
    for (const agency of agencies) {
        console.log(`Cron: Iniciando Hunter para agência ${agency.id}`);
        const result = await executeHunterJob(agency.id);
        results.push({ agencyId: agency.id, result });
    }

    return NextResponse.json({ 
        message: 'Hunter IA Cron Job finalizado com sucesso.',
        processed: results.length,
        details: results
    });
}
