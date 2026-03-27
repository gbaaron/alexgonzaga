const Airtable = require('airtable');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const params = event.queryStringParameters || {};
        const category = params.category;
        const sort = params.sort || 'newest';
        const status = params.status || 'Active';

        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

        // Build filter formula
        const filters = [];
        filters.push(`{Status} = '${status.replace(/'/g, "\\'")}'`);

        if (category) {
            filters.push(`{Category} = '${category.replace(/'/g, "\\'")}'`);
        }

        let filterFormula = '';
        if (filters.length === 1) {
            filterFormula = filters[0];
        } else {
            filterFormula = `AND(${filters.join(', ')})`;
        }

        // Build sort configuration
        let sortConfig = [];
        switch (sort) {
            case 'price-asc':
                sortConfig = [{ field: 'Price', direction: 'asc' }];
                break;
            case 'price-desc':
                sortConfig = [{ field: 'Price', direction: 'desc' }];
                break;
            case 'newest':
            default:
                sortConfig = [{ field: 'CreatedDate', direction: 'desc' }];
                break;
        }

        const allRecords = [];
        await base('MerchProducts').select({
            filterByFormula: filterFormula,
            sort: sortConfig
        }).eachPage((records, fetchNextPage) => {
            allRecords.push(...records);
            fetchNextPage();
        });

        const products = allRecords.map(record => ({
            id: record.id,
            name: record.fields.Name,
            description: record.fields.Description || null,
            price: record.fields.Price || 0,
            comparePrice: record.fields.ComparePrice || null,
            image: record.fields.Image || null,
            images: record.fields.Images || null,
            category: record.fields.Category || null,
            sizes: record.fields.Sizes || null,
            colors: record.fields.Colors || null,
            stock: record.fields.Stock || 0,
            status: record.fields.Status,
            badge: record.fields.Badge || null
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ products })
        };
    } catch (error) {
        console.error('Get merch error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch products' })
        };
    }
};
