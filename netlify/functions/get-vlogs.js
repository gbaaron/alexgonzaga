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
        const mood = params.mood;
        const search = params.search;
        const featured = params.featured;
        const sort = params.sort || 'newest';
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 12;

        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

        // Build filter formula
        const filters = [];
        if (featured === 'true') {
            filters.push(`{Featured} = TRUE()`);
        }
        if (category) {
            filters.push(`{Category} = '${category.replace(/'/g, "\\'")}'`);
        }
        if (mood) {
            filters.push(`{Mood} = '${mood.replace(/'/g, "\\'")}'`);
        }
        if (search) {
            filters.push(`OR(SEARCH(LOWER('${search.replace(/'/g, "\\'")}'), LOWER({Title})), SEARCH(LOWER('${search.replace(/'/g, "\\'")}'), LOWER({Description})))`);
        }

        let filterFormula = '';
        if (filters.length === 1) {
            filterFormula = filters[0];
        } else if (filters.length > 1) {
            filterFormula = `AND(${filters.join(', ')})`;
        }

        // Build sort configuration
        let sortConfig = [];
        switch (sort) {
            case 'oldest':
                sortConfig = [{ field: 'PublishDate', direction: 'asc' }];
                break;
            case 'popular':
                sortConfig = [{ field: 'Views', direction: 'desc' }];
                break;
            case 'newest':
            default:
                sortConfig = [{ field: 'PublishDate', direction: 'desc' }];
                break;
        }

        // Fetch all matching records
        const selectConfig = { sort: sortConfig };
        if (filterFormula) {
            selectConfig.filterByFormula = filterFormula;
        }

        const allRecords = [];
        await base('Vlogs').select(selectConfig).eachPage((records, fetchNextPage) => {
            allRecords.push(...records);
            fetchNextPage();
        });

        // Paginate results
        const totalRecords = allRecords.length;
        const totalPages = Math.ceil(totalRecords / limit);
        const startIndex = (page - 1) * limit;
        const paginatedRecords = allRecords.slice(startIndex, startIndex + limit);

        const vlogs = paginatedRecords.map(record => {
            // Extract thumbnail URL from Airtable attachment array or plain URL string
            const thumbField = record.fields.Thumbnail || null;
            let thumbnail = null;
            if (Array.isArray(thumbField) && thumbField.length > 0) {
                thumbnail = thumbField[0].url || thumbField[0];
            } else if (typeof thumbField === 'string') {
                thumbnail = thumbField;
            }

            return {
                id: record.id,
                title: record.fields.Title || null,
                description: record.fields.Description || null,
                thumbnail,
                videoUrl: record.fields.VideoUrl || null,
                youtubeUrl: record.fields.YouTubeURL || record.fields.YoutubeUrl || record.fields.YoutubeURL || record.fields.VideoUrl || null,
                youtubeId: record.fields.YouTubeID || record.fields.YoutubeId || null,
                category: record.fields.Category || null,
                mood: record.fields.Mood || null,
                duration: record.fields.Duration || null,
                views: record.fields.ViewCount || record.fields.Views || 0,
                likes: record.fields.Likes || 0,
                publishDate: record.fields.PublishDate || null,
                featured: !!record.fields.Featured
            };
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                vlogs,
                pagination: {
                    page,
                    limit,
                    totalRecords,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            })
        };
    } catch (error) {
        console.error('Get vlogs error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch vlogs' })
        };
    }
};
