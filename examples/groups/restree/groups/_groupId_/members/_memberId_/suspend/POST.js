exports.metadata = {
	runSecurityMiddleware: true
};

exports.handler = async function(req,res) {
	if (!res.locals.ranSecurityMiddleware) {
		res.status(500, 'Metadata Error: Should have run security middleware');
	} else {
		res.status(200).send('Suspended member ' + req.params.memberId + ' from group ' + req.params.groupId);		
	}
};
