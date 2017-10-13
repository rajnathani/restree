exports.handler = function(req,res) {
	res.status(200).send("Deleted group " + req.params.groupId);
}
