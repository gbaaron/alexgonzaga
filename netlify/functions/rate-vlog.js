const Airtable = require('airtable');
const jwt = require('jsonwebtoken');

function verifyToken(event) {
    const auth = event.headers.authorization;
    if (!auth) return null;
    try {
        return jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET);
    } catch { return null; }
}

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

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const decoded = verifyToken(event);
    if (!decoded) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Authentication required' })
        };
    }

    try {
        const { vlogId, rating } = JSON.parse(event.body);

        if (!vlogId) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Vlog ID is required' }) };
        }

        const ratingNum = parseInt(rating);
        if (!ratingNum || ratingNum < 1 || ratingNum > 10) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Rating must be 1-10' }) };
        }

        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
        const userId = decoded.userId;
        const now = new Date().toISOString();

        // Check if user already rated this vlog
        const existing = [];
        await base('VlogRatings').select({
            filterByFormula: `AND({VlogID} = '${vlogId}', {UserID} = '${userId}')`
        }).eachPage((records, fetchNextPage) => {
            existing.push(...records);
            fetchNextPage();
        });

        if (existing.length > 0) {
            // Update existing rating
            await base('VlogRatings').update(existing[0].id, {
                Rating: ratingNum,
                RatedAt: now
            });
        } else {
            // Create new rating
            await base('VlogRatings').create({
                VlogID: vlogId,
                UserID: userId,
                Rating: ratingNum,
                RatedAt: now
            });
        }

        // Recalculate average rating for this vlog
        const allRatings = [];
        await base('VlogRatings').select({
            filterByFormula: `{VlogID} = '${vlogId}'`
        }).eachPage((records, fetchNextPage) => {
            allRatings.push(...records);
            fetchNextPage();
        });

        const ratingCount = allRatings.length;
        const avgRating = ratingCount > 0
            ? Math.round((allRatings.reduce((sum, r) => sum + (r.fields.Rating || 0), 0) / ratingCount) * 10) / 10
            : 0;

        // Cache the average on the Vlogs record
        try {
            await base('Vlogs').update(vlogId, {
                AvgRating: avgRating,
                RatingCount: ratingCount
            });
        } catch (e) {
            // Non-critical — the rating was still saved
            console.warn('Could not update cached avg on Vlogs table:', e.message);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                userRating: ratingNum,
                avgRating,
                ratingCount
            })
        };
    } catch (error) {
        console.error('Rate vlog error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to save rating' })
        };
    }
};
