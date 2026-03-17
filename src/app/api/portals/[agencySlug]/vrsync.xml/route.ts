import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { agencySlug: string } }
) {
    const { agencySlug } = await (params as any) // Await params in Next.js 15
    console.log('XML FEED REQUEST - Slug:', agencySlug)
    const supabase = await createClient()

    // 1. Buscar a agência pelo slug para obter o ID e Nome
    const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .select('id, name')
        .eq('slug', agencySlug)
        .single()

    if (agencyError || !agency) {
        console.error('Agency not found for slug:', agencySlug, agencyError)
        return new NextResponse('Agency not found', { status: 404 })
    }
    console.log('Agency found:', agency.name)

    // 2. Buscar imóveis ativos desta agência
    const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('agency_id', agency.id)
        .eq('status', 'active')

    if (propertiesError) {
        return new NextResponse('Error fetching properties', { status: 500 })
    }

    // 3. Gerar o XML no padrão VR-Sync
    // Nota: Usamos CDATA para campos de texto que podem conter caracteres especiais
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ListingDataFeed xmlns="http://www.vivareal.com/schemas/1.0/VRSync" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xsi:schemaLocation="http://www.vivareal.com/schemas/1.0/VRSync http://xml.vivareal.com/vrsync.xsd">
    <Header>
        <Provider>${agency.name}</Provider>
        <Email>contato@${agencySlug}.com.br</Email>
        <ContactName>${agency.name}</ContactName>
        <PublishDate>${new Date().toISOString()}</PublishDate>
    </Header>
    <Listings>
        ${properties.map(p => `
        <Listing>
            <ListingID>${p.id}</ListingID>
            <Title><![CDATA[${p.title}]]></Title>
            <TransactionType>${p.listing_type === 'sale' ? 'For Sale' : 'For Rent'}</TransactionType>
            <DetailViewUrl>https://antigravity.imob/${agencySlug}/imovel/${p.id}</DetailViewUrl>
            <Media>
                ${(p.photos || []).map((photo: string) => `
                <Item medium="image" caption="Foto do Imóvel">${photo}</Item>
                `).join('')}
            </Media>
            <Details>
                <PropertyType>${p.property_type}</PropertyType>
                <Description><![CDATA[${p.description || ''}]]></Description>
                <ListPrice currency="BRL">${p.price}</ListPrice>
                <LivingArea unit="square metres">${p.useful_area || 0}</LivingArea>
                <Bedrooms>${p.bedrooms || 0}</Bedrooms>
                <Bathrooms>${p.bathrooms || 0}</Bathrooms>
                <Garage>${p.parking_spots || 0}</Garage>
                <Features>
                    ${(p.amenities || []).map((amenity: string) => `
                    <Feature>${amenity}</Feature>
                    `).join('')}
                </Features>
            </Details>
            <Location displayAddress="All">
                <Country>Brasil</Country>
                <State>${p.address_state || ''}</State>
                <City>${p.address_city || ''}</City>
                <Neighborhood>${p.address_neighborhood || ''}</Neighborhood>
                <Address>${p.address_street || ''}</Address>
                <StreetNumber>${p.address_number || ''}</StreetNumber>
                <PostalCode>${p.address_zipcode || ''}</PostalCode>
            </Location>
            <ContactInfo>
                <Name>${agency.name}</Name>
                <Email>contato@${agencySlug}.com.br</Email>
            </ContactInfo>
        </Listing>
        `).join('')}
    </Listings>
</ListingDataFeed>`

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
    })
}
