/**
 * RSS Feed - Redirects to Substack
 *
 * All written content now lives on Substack. This endpoint redirects
 * to the canonical Substack RSS feed for subscribers.
 */

export const GET = () => {
	return new Response(null, {
		status: 301,
		headers: {
			'Location': 'https://0to1datascience.substack.com/feed'
		}
	})
}
