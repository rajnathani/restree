exports.handler = function(req,res) {
	res.status(200).send("Suspended member " + req.params.memberId + " from group " + req.params.groupId);
}