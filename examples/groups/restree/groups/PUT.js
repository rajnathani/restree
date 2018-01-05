exports.handler = async function(req,res) {
	if (res.locals.ranSecurityMiddleware) {
		res.status(500, 'Metadata Error: Shouldn\'t have run security middleware');
	} else {
		res.status(200).send('Created a group');
	}
};
