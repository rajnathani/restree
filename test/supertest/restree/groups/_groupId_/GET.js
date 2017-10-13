exports.handler = function(req,res) {
	res.status(200).send("Fetched group " + req.params.groupId);
}
